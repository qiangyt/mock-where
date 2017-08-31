const superagent = require('superagent');
const _ = require('underscore');


module.exports = class Callback {

    constructor(config) {
        this.beforeAsync = Callback.normalizeAsyncFlag(config.beforeAsync);
        this.before = Callback.normalizeList(config.before);
        this.on = Callback.normalizeList(config.on);
        this.afterAsync = Callback.normalizeAsyncFlag(config.beforeAsync);
        this.after = Callback.normalizeList(config.after);
    }

    static normalizeAsyncFlag(flag) {
        return (flag === undefined || flag === null) ? false : flag;
    }

    static normalizeList(list) {
        if (!list || !list.length) return [];
        return list.map(target => Callback.normalizeTarget(target));
    }

    static normalizeTarget(target) {
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

    needCallOn() {
        return this.on.length > 0;
    }

    callOn() {
        return this._callList(this.on);
    }

    needCallAfter() {
        return this.after.length > 0;
    }

    callAfter() {
        return this._callList(this.after);
    }

    _callList(list) {
        if (!list.length) return Promise.resolve();

        if (list.length === 1) return this._callOne(list[0]);

        let r;

        list.forEach(target => {
            if (!r) r = this._callOne(target);
            else r = r.then(() => this._callOne(target));
            return r;
        });

        return r;
    }

    _callOne(target) {
        let r = superagent(target.method, target.path);

        if (target.hasHeader) r = r.set(target.header);
        if (target.hasQuery) r = r.query(target.query);
        if (target.type) r = r.type(target.type);
        if (target.accept) r = r.accept(target.accept);
        if (target.body) r = r.send(target.body);
        if (target.retry && target.retry > 0) r = r.retry(target.retry);

        return r;
    }

};