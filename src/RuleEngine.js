const RequestError = require('./error/RequestError');
const Errors = require('./error/Errors');
const MissingParamError = require('./error/MissingParamError');
const logger = require('./logger');
const alasql = require('alasql');

class RuleEngine {

    constructor() {
        this.rules = [];

        this.db = new alasql.Database('rule');
        this.db.exec('create table request');
        logger.info(alasql.databases.rule);
    }

    add(rule) {

        const name = rule.name;
        const criteria = rule.criteria;

        if (!name) throw new MissingParamError('name');

        if (!criteria) throw new MissingParamError('criteria');
        rule.statement = `select * from request where ${criteria}`;

        if (!rule.response) throw new MissingParamError('response');

        const oldRule = this.rules[name];
        if (oldRule) logger.info('replacing old rule: ' + JSON.stringify(oldRule));

        this.rules[name] = rule;

    }

    normalizeRequest(incomingRequest) {
        return {
            header: incomingRequest.header,
            method: incomingRequest.method,
            //length: incomingRequest.length,
            url: incomingRequest.url,
            path: incomingRequest.path,
            //type: incomingRequest.type,
            charset: incomingRequest.charset,
            query: incomingRequest.query,
            protocol: incomingRequest.protocol,
            ip: incomingRequest.ip,
            body: incomingRequest.body
        };
    }

    findMatchedRule(incomingRequest) {
        const req = this.normalizeRequest(incomingRequest);
        logger.info('request: ' + JSON.stringify(req));

        //this.db.exec(`INSERT INTO request (header,method,url,path,charset,query,protocol,ip,body) VALUES (${req.header}),${req.method}),${req.url}),${req.path}),${req.charset}),${req.query}),${req.protocol}),${req.ip}),${req.body})`);
        const insertSql = `INSERT INTO request (method,url,path,charset,protocol,ip) VALUES ("${req.method}","${req.url}","${req.path}","${req.charset}","${req.protocol}","${req.ip}")`;
        this.db.exec(insertSql);

        for (const ruleName in this.rules) {
            const rule = this.rules[ruleName];

            const statement = rule.statement;
            logger.info(`executing: ${statement}`);
            const matched = this.db.exec(statement);
            if (matched.length > 0) {
                logger.info('found matched rule: ' + rule.name);
                return rule;
            }
        }

        this.db.exec('truncate table request');

        return null;
    }


    async mock(ctx, next) {
        const rule = this.findMatchedRule(ctx.request);
        if (!rule) throw new RequestError(Errors.NO_RULE_MATCHES);

        logger.info('matched rule: ' + JSON.stringify(rule));

        const ruleResponse = rule.response;
        const responseToMock = ctx.response;

        if (ruleResponse.header) Object.assign(responseToMock.header, ruleResponse.header);

        responseToMock.status = ruleResponse.status ? ruleResponse.status : 200;
        if (ruleResponse.body) responseToMock.body = ruleResponse.body;

        if (ruleResponse.message) responseToMock.message = ruleResponse.message;

        if (ruleResponse.type) responseToMock.type = ruleResponse.type;

        if (ruleResponse.redirect) responseToMock.redirect(ruleResponse.redirect);

        if (ruleResponse.lastModified) responseToMock.lastModified = ruleResponse.lastModified;

        if (ruleResponse.etag) responseToMock.etag = ruleResponse.etag;

        await next();
    }


}

RuleEngine.instance = new RuleEngine();

module.exports = RuleEngine;