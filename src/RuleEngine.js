const RequestError = require('qnode-error').RequestError;
const alasql = require('alasql');
const RuleTree = require('./RuleTree');


module.exports = class RuleEngine {

    init() {
        this._ruleTree = new RuleTree();
        this._ruleDb = this._initRuleDatabase();
        this._ruleRequestTable = this._ruleDb.tables.request;
    }

    _initRuleDatabase() {
        const r = new alasql.Database('rule');
        this._logger.debug('rule database is created');

        r.exec('create table request');
        this._logger.debug('request table is is created');

        return r;
    }

    put(rule) {
        this._ruleTree.put(rule);
    }

    _findMatchedRule(req) {
        this._logger.debug('request: %s', req);

        try {
            this._ruleRequestTable.data = [{
                url: req.url,
                charset: req.charset,
                protocol: req.protocol,
                ip: req.ip,
                path: req.path
            }];

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

    async mock(request, response) {
        const rule = this._findMatchedRule(request);
        if (!rule) {
            throw new RequestError('NO_RULE_MATCHES');
        }

        const ruleResponse = rule.response;
        RuleEngine.renderMockResponse(request, ruleResponse, response);

        let delay = RuleEngine.determineTimeToDelay(ruleResponse);
        if (delay) {
            return new Promise(resolve => setTimeout(resolve, delay));
        }
        return Promise.resolve();
    }


}