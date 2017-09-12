const superagent = require('superagent');
const _ = require('underscore');
const MissingParamError = require('qnode-error').MissingParamError;


/**
 * Manages and execute hooks
 */
module.exports = class Hook {

    constructor(config) {
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

        target.hasHeader = !_.isEmpty(target.header);

        target.hasQuery = !_.isEmpty(target.query);

        return target;
    }

    needCallBefore() {
        return this.before.length > 0;
    }

    callBefore() {
        return this._callList(this.before);
    }

    needCallAfter() {
        return this.after.length > 0;
    }

    callAfter() {
        return this._callList(this.after);
    }

    _callList(list) {
        if (!list.length) return Promise.resolve();

        let r;
        if (list.length === 1) {
            r = this._callOne(list[0]);
            r.seq = 0;
        } else {
            for (let i = 0; i < list.length; i++) {
                const target = list[i];
                if (!r) r = this._callOne(target);
                else r = r.then(() => this._callOne(target));
                r.seq = i;
            }
        }

        return r;
    }

    _callOne(target) {
        let agent = superagent[target.method](target.path);

        if (target.hasHeader) agent = agent.set(target.header);
        if (target.hasQuery) agent = agent.query(target.query);
        if (target.type) agent = agent.type(target.type);
        if (target.accept) agent = agent.accept(target.accept);
        if (target.body) agent = agent.send(target.body);

        return agent;
    }

};