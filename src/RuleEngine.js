const RequestError = require('./error/RequestError');
const alasql = require('alasql');
const Logger = require('json-log4js');
const RuleTree = require('./RuleTree');


class RuleEngine {

    constructor(name, definition) {
        this.name = name;
        this._definition = definition;
        this._logger = new Logger(name);
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


    static normalizeRequest(req) {
        return {
            header: req.header,
            method: req.method.toLowerCase(),
            //length: req.length,
            url: req.url,
            path: req.path,
            //type: req.type,
            charset: req.charset.toLowerCase(),
            query: req.query,
            protocol: req.protocol.toLowerCase(),
            ip: req.ip,
            body: req.body
        };
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

    static determineTimeToSleep(ruleResponse) {
        let sleep = ruleResponse.sleep + ruleResponse.sleepFix;
        if (sleep && sleep > 0) {
            return sleep;
        }
        return 0;
    }

    async mock(ctx, next) {
        const request = RuleEngine.normalizeRequest(ctx.request);
        const rule = this._findMatchedRule(request);
        if (!rule) {
            throw new RequestError('NO_RULE_MATCHES');
        }

        const ruleResponse = rule.response;
        const responseToMock = ctx.response;
        RuleEngine.renderMockResponse(request, ruleResponse, responseToMock);

        let sleep = RuleEngine.determineTimeToSleep(ruleResponse);
        if (sleep) {
            await new Promise(resolve => setTimeout(resolve, sleep));
        }
        await next();
    }


}

module.exports = RuleEngine;