const superagent = require('superagent');
const _ = require('underscore');
const MissingParamError = require('qnode-error').MissingParamError;
const Template = require('./Template');

/**
 * Manages and execute hooks
 */
module.exports = class Hook {

    constructor(config, ruleName) {
        this.ruleName = ruleName;
        this.defaultBody = Template.buildDefault();
        this.before = Hook.normalizeList(config.before);
        this.after = Hook.normalizeList(config.after);
    }

    static normalizeList(list) {
        if (!list || !list.length) return [];
        return list.map(target => Hook.normalizeTarget(target));
    }

    static normalizeTarget(target) {
        if (!target.path) throw new MissingParamError('hook path');

        target.method = target.method || 'post';

        target.body = target.body || {};
        Template.normalizeContent(target.body, this.defaultBody, this.ruleName);

        target.hasHeader = !_.isEmpty(target.header);
        target.hasQuery = !_.isEmpty(target.query);

        return target;
    }

    needCallBefore() {
        return this.before.length > 0;
    }

    callBefore(requestAndResponse) {
        return this._callList(this.before, requestAndResponse);
    }

    needCallAfter() {
        return this.after.length > 0;
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
        let agent = superagent[target.method](target.path);

        if (target.hasHeader) agent = agent.set(target.header);
        if (target.hasQuery) agent = agent.query(target.query);
        if (target.type) agent = agent.type(target.type);
        if (target.accept) agent = agent.accept(target.accept);

        if (target.body) {
            const body = Template.render(target.body, requestAndResponse);
            agent = agent.send(body);
        }

        return agent;
    }

};