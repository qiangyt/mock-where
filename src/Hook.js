const superagent = require('superagent');
const _ = require('underscore');
const MissingParamError = require('qnode-error').MissingParamError;
const Template = require('./Template');
const Package = require('../package.json');
const TemplateContext = require('./TemplateContext');

const HEADER_VALUE_USER_AGENT = 'mock-where/' + Package.version;

/**
 * Manages and execute hooks
 */
module.exports = class Hook {

    constructor(config, ruleName) {
        this.ruleName = ruleName;
        this.defaultBody = Template.buildDefault();
        this.before = Hook.normalizeList(config.before, this.defaultBody, ruleName);
        this.after = Hook.normalizeList(config.after, this.defaultBody, ruleName);
    }

    static normalizeEnabledFlag(enabled) {
        return (enabled === undefined || enabled === null) ? true : enabled;
    }

    static normalizeList(list, defaultBody, ruleName) {
        if (!list || !list.length) return [];
        return list.map(target => Hook.normalizeTarget(target, defaultBody, ruleName));
    }

    static normalizeTarget(target, defaultBody, ruleName) {
        if (!target.path) throw new MissingParamError('hook path');
        target.path = Template.normalizeContent(target.path, {}, ruleName);

        target.enabled = Hook.normalizeEnabledFlag(target.enabled);
        target.method = target.method || 'post';

        target.body = Template.normalizeContent(target.body || {}, defaultBody, ruleName);

        const header = target.header || {};
        for (let headerName in header) {
            const headerValue = header[headerName];
            delete header[headerName];
            header[headerName.toLowerCase()] = headerValue;
        }
        if (!header['user-agent']) {
            header['user-agent'] = HEADER_VALUE_USER_AGENT;
        }
        target.header = header;

        target.hasQuery = !_.isEmpty(target.query);
        if (target.hasQuery) {
            target.query = Template.normalizeContent(target.query, {}, ruleName);
        }

        return target;
    }

    needCallBefore() {
        return this.before.length > 0 && this.before.enabled;
    }

    callBefore(requestAndResponse) {
        return this._callList(this.before, requestAndResponse);
    }

    needCallAfter() {
        return this.after.length > 0 && this.after.enabled;
    }

    callAfter(requestAndResponse) {
        return this._callList(this.after, requestAndResponse);
    }

    _callList(list, requestAndResponse) {
        if (!list.length) return Promise.resolve();

        let r;
        if (list.length === 1) {
            r = this._callOne(list[0], requestAndResponse);
            r.seq = 0;
        } else {
            for (let i = 0; i < list.length; i++) {
                const target = list[i];
                if (!r) r = this._callOne(target, requestAndResponse);
                else r = r.then(() => this._callOne(target, requestAndResponse));
                r.seq = i;
            }
        }

        return r;
    }

    _callOne(target, requestAndResponse) {
        const context = TemplateContext.normalize({
            request: requestAndResponse.request,
            response: requestAndResponse.response
        });

        const path = Template.render(target.path, context);
        let agent = superagent[target.method](path);

        agent = agent.set(target.header);

        if (target.hasQuery) {
            const query = Template.render(target.query, context);
            agent = agent.query(query);
        }

        if (target.type) agent = agent.type(target.type);
        if (target.accept) agent = agent.accept(target.accept);

        if (target.body) {
            const body = Template.render(target.body, context);
            agent = agent.send(body);
        } else {
            agent = agent.send();
        }

        return agent;
    }

};