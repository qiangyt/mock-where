const RequestError = require('./error/RequestError');
const Errors = require('./error/Errors');
const MissingParamError = require('./error/MissingParamError');
const alasql = require('alasql');
const getLogger = require('./logger');
const resolveTemplateFunc = require('./Template');

class RuleEngine {

    constructor(name, config) {
        this.name = name;
        this._config = config;
        this._logger = getLogger(name);
        this._rules = {};
        this._ruleDb = this._initRuleDatabase();
    }

    _initRuleDatabase() {
        const r = new alasql.Database('rule');
        this._logger.debug('rule database is created');

        r.exec('create table request');
        this._logger.debug('request table is is created');

        return r;
    }

    put(newRule) {

        const name = newRule.name;
        if (!name) throw new MissingParamError('name');

        const c = newRule.criteria;
        if (!c) throw new MissingParamError('criteria');
        newRule.statement = `select * from request where ${c}`;

        const response = newRule.response;
        if (!response) throw new MissingParamError('response');

        response.status = response.status || (this._config.defaultStatus || 200);
        response.type = response.type || (this._config.defaultContentType || 'application/json');

        this._normalizeResponseContent(response);


        const oldRule = this._rules[name];
        this._rules[name] = newRule;
        if (oldRule) this._logger.info('replaced old rule, old: %s, new: %s', oldRule, newRule);
        else this._logger.info('created new rule: %s', newRule);
    }


    _normalizeResponseContent(response) {
        if (!response.template) return;
        if (response.body) throw new RequestError(ErrorCode.MULTIPLE_RESPONSE_CONTENTS_NOT_ALLOWED);
        this._normalizeTemplate(response);
    }

    _normalizeTemplate(response) {
        const template = response.template;

        let type;
        let text;
        const defaultType = this._config.defaultTemplateType || 'ejs';
        if (typeof template === 'string') {
            type = defaultType;
            text = template;
        } else {
            type = template.type || defaultType;
            text = template.text;
            if (!text) throw new MissingParamError('response.template.text');
        }

        response.template = {
            type,
            text,
            func: resolveTemplateFunc(type, text)
        };
    }


    _normalizeRequest(req) {
        return {
            header: req.header,
            method: req.method,
            //length: req.length,
            url: req.url,
            path: req.path,
            //type: req.type,
            charset: req.charset,
            query: req.query,
            protocol: req.protocol,
            ip: req.ip,
            body: req.body
        };
    }

    _findMatchedRule(req) {
        this._logger.debug('request: %s', req);

        //this.ruleDb.exec(`INSERT INTO request (header,method,url,path,charset,query,protocol,ip,body) VALUES (${req.header}),${req.method}),${req.url}),${req.path}),${req.charset}),${req.query}),${req.protocol}),${req.ip}),${req.body})`);
        const insertSql = `INSERT INTO request (method,url,path,charset,protocol,ip) VALUES ("${req.method}","${req.url}","${req.path}","${req.charset}","${req.protocol}","${req.ip}")`;
        this._ruleDb.exec(insertSql);

        for (const ruleName in this._rules) {
            const rule = this._rules[ruleName];

            const statement = rule.statement;
            this._logger.debug(`executing: ${statement}`);

            const matched = this._ruleDb.exec(statement);
            if (matched.length > 0) {
                this._logger.info('found matched rule: %s', rule);
                return rule;
            }
        }

        this._ruleDb.exec('truncate table request');

        return null;
    }


    async mock(ctx, next) {
        const request = this._normalizeRequest(ctx.request);
        const rule = this._findMatchedRule(request);
        if (!rule) throw new RequestError(Errors.NO_RULE_MATCHES);

        const ruleResponse = rule.response;
        const responseToMock = ctx.response;

        if (ruleResponse.header) Object.assign(responseToMock.header, ruleResponse.header);

        responseToMock.status = ruleResponse.status;

        if (ruleResponse.template) {
            try {
                responseToMock.message = ruleResponse.template.func(request);
            } catch (e) {
                throw new RequestError(Errors.FAILED_TO_GENERATE_RESPONSE_WITH_TEMPLATE, e.message);
            }
        } else {
            responseToMock.body = ruleResponse.body;
        }

        responseToMock.type = ruleResponse.type;

        //if (ruleResponse.redirect) responseToMock.redirect(ruleResponse.redirect);

        if (ruleResponse.sleep || ruleResponse.sleep > 10) {
            await new Promise(resolve => setTimeout(resolve, ruleResponse.sleep - 10));
        }

        await next();
    }


}

module.exports = RuleEngine;