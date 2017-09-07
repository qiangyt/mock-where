const RequestError = require('qnode-error').RequestError;
const alasql = require('alasql');
const RuleTree = require('./RuleTree');


module.exports = class RuleEngine {

    constructor(name, config) {
        this._name = name;
        this._config = config;
    }

    init() {
        this._ruleTree = new RuleTree();

        this._initRules();

        this._ruleDb = this._initRuleDatabase();
        this._ruleRequestTable = this._ruleDb.tables.request;
    }

    _initRules() {
        const rules = this._config.rules;
        for (const ruleName in rules) {
            const rule = rules[ruleName];
            this.put(rule);
        }
    }

    /**
     * The rule database is a request database servers by alasql engine.
     * So far, the database is dynamic and stores only 1 row of request.
     */
    _initRuleDatabase() {
        // the alasql database name should be globally unique, otherwise,
        // the database data will interfere across rule engines
        const r = new alasql.Database(this._name /*, { cache: false }*/ );
        this._logger.debug('rule database is created');

        r.exec('create table request');
        this._logger.debug('request table is is created');

        return r;
    }

    put(rule) {
        this._ruleTree.put(rule);
    }

    /**
     * Find matched rule.
     * 
     * The matching procedure is:
     * 1) Find rule candidates in rule tree, by HTTP method and path
     * 2) Execute SQL statement defined in rule candidates, one by one, on request object, 
     *    the 1st rule that passed the SQL query is the winner.
     * 
     * @param {object} req 
     */
    _findMatchedRule(req) {
        this._logger.debug('request: %s', req);

        try {
            // Because we're inserting the current request into the global request
            // table, and the inserted is temporary data which will be erased
            // finally (see the tail of this method), to avoid multiple request
            // accessing the same one table to rase concurrency issues, we should
            // be careful not to do any asynchronous things before the inserted
            // temporary data is erased finally.
            // 
            // This works but not a good solution, because it stops any potential
            // performance/concurrency improvement which may be done by async execution.
            // So far I think we could replace this approach by belows:
            // 1. create table always per request
            // 2. modify alasql to support dynamic table
            // 3. use transaction to isolate un-committed data and rollback after done
            // 4. use 'SELECT directly on your JavaScript data' (https://github.com/agershun/alasql)
            // 
            this._ruleRequestTable.data = this._buildRequestTableData(req);

            const rules = this._ruleTree.match(req.method, req.path);
            this._logger.debug('candidate rules: %s', rules);

            for (const rule of rules) {
                const stmt = rule.statement;
                this._logger.debug(`executing: ${stmt}`);

                const matched = this._ruleDb.exec(stmt);
                if (matched.length > 0) {
                    this._logger.info('found matched rule: %s', rule);
                    return rule;
                }
            }

            return null;
        } finally {
            this._ruleRequestTable.data = [];
        }
    }

    _buildRequestTableData(req) {
        return [{
            charset: req.charset,
            ip: req.ip,
            method: req.method,
            path: req.path,
            protocol: req.protocol,
            q: req.query,
            url: req.url
        }];
    }

    /**
     * Render the response body as mock result.
     * 
     * It uses template to render response, or directly takes response body from rule
     * 
     * @param {object} request 
     * @param {object} ruleResponse 
     * @param {object} responseToMock 
     */
    static renderMockResponseBody(request, ruleResponse, responseToMock) {
        if (ruleResponse.template) {
            try {
                responseToMock.message = ruleResponse.template.func(request);
            } catch (e) {
                throw new RequestError('FAILED_TO_GENERATE_RESPONSE_WITH_TEMPLATE', e.message);
            }
        } else {
            responseToMock.body = ruleResponse.body;
        }
    }

    static renderMockResponse(request, ruleResponse, responseToMock) {
        if (ruleResponse.header) Object.assign(responseToMock.header, ruleResponse.header);

        responseToMock.type = ruleResponse.type;
        responseToMock.status = ruleResponse.status;

        RuleEngine.renderMockResponseBody(request, ruleResponse, responseToMock);

        //if (ruleResponse.redirect) responseToMock.redirect(ruleResponse.redirect);
    }

    static determineTimeToDelay(ruleResponse) {
        let delay = ruleResponse.delay + ruleResponse.delayFix;
        if (delay && delay > 0) {
            return delay;
        }
        return 0;
    }

    /**
     * looks for matched rule, raise error if matches nothing
     * @param {object} request 
     */
    loadMatchedRule(request) {
        const r = this._findMatchedRule(request);
        if (!r) {
            throw new RequestError('NO_RULE_MATCHES');
        }
        return r;
    }

    /**
     * return mocked response for incoming request.
     * 
     * it looks for matched rule, rendering mock response using the rule, and
     * executes callbacks around the response.
     * 
     * @param {object} request 
     * @param {object} response 
     */
    async mock(request, response) {
        const rule = this.loadMatchedRule(request);

        const cb = rule.callback;

        if (cb && cb.needCallBefore) {
            if (cb.beforeAsync) cb.callBefore();
            else await cb.callBefore();
        }

        if (cb && cb.needCallOn) {
            cb.callOn(); // always sync
        }

        await this._mockResponse(request, response, rule);

        if (cb && cb.needCallAfter) {
            if (cb.beforeAsync) cb.callAfter();
            else await cb.callAfter();
        }
    }

    /**
     * return mocked response, and, delay somewhile if configured
     * 
     * @param {object} request 
     * @param {object} response 
     * @param {object} rule 
     */
    async _mockResponse(request, response, rule) {
        const ruleResponse = rule.response;
        RuleEngine.renderMockResponse(request, ruleResponse, response);

        //TODO: be aware of how the callback delay interferes the response delay
        let delay = RuleEngine.determineTimeToDelay(ruleResponse);
        if (delay) {
            return new Promise(resolve => setTimeout(resolve, delay));
        }

        return Promise.resolve();
    }


}