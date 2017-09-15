const RequestError = require('qnode-error').RequestError;
const RuleTree = require('./RuleTree');
const Template = require('./Template');

module.exports = class RuleEngine {

    constructor(name, config) {
        this._name = name;
        this._config = config;
    }

    init() {
        this._ruleTree = new RuleTree(this._name + 'RuleTree');

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
        this.prepareRule(rule);
        this._ruleTree.put(rule);
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

    static renderMockResponse(request, ruleResponse, responseToMock) {
        if (ruleResponse.header) Object.assign(responseToMock.header, ruleResponse.header);

        responseToMock.type = ruleResponse.type;
        responseToMock.status = ruleResponse.status;

        responseToMock.body = Template.render(ruleResponse.body, request);

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

    _filterRule(req, candidateRules) {
        return (candidateRules.length > 0) ? candidateRules[0] : null;
    }

    prepareRule() {
        // dummy
    }

    /**
     * return mocked response for incoming request.
     * 
     * it looks for matched rule, rendering mock response using the rule, and
     * executes hooks around the response.
     * 
     * @param {object} request 
     * @param {object} response 
     */
    async mock(request, response) {
        const rule = this.loadMatchedRule(request);

        const cb = rule.hook;

        if (cb && cb.needCallBefore) {
            await cb.callBefore();
        }

        await this._mockResponse(request, response, rule);

        if (cb && cb.needCallAfter) {
            await cb.callAfter();
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

        //TODO: be aware of how the hook delay interferes the response delay
        let delay = RuleEngine.determineTimeToDelay(ruleResponse);
        if (delay) {
            return new Promise(resolve => setTimeout(resolve, delay));
        }

        return Promise.resolve();
    }


}