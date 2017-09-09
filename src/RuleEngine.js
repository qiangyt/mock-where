const RequestError = require('qnode-error').RequestError;
const RuleTree = require('./RuleTree');


module.exports = class RuleEngine {

    constructor(name, config) {
        this._name = name;
        this._config = config;
    }

    init() {
        this._ruleTree = new RuleTree();

        this._initRules();
    }

    _initRules() {
        const rules = this._config.rules;
        for (const ruleName in rules) {
            const rule = rules[ruleName];
            this.put(rule);
        }
    }

    put(rule) {
        const r = this.prepareRule(rule);
        this._ruleTree.put(r);
    }

    _buildRequestData(req) {
        return {
            charset: req.charset,
            ip: req.ip,
            method: req.method,
            path: req.path,
            protocol: req.protocol,
            q: req.query,
            url: req.url
        };
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
                const msg = ruleResponse.template.func(request);
                responseToMock.body = msg;
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
        this._logger.debug('request: %s', request);
        const r = this._findMatchedRule(request);
        if (!r) {
            throw new RequestError('NO_RULE_MATCHES');
        }
        return r;
    }

    _findMatchedRule(request) {
        const candidateRules = this._ruleTree.match(request.method, request.path);
        this._logger.debug('candidate rules: %s', candidateRules);

        return this._filterRule(request, candidateRules);
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