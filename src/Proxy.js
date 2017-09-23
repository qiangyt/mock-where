const HttpProxy = require('http-proxy');

/**
 * Manages and execute proxy
 */
module.exports = class Proxy {

    constructor(config, ruleName) {
        this.ruleName = ruleName;
        this._options = Proxy.normalizeOptions(config, ruleName);
        this._proxy = Proxy.buildProxyServer(this._options);
    }

    isEnabled() {
        return this._options.enabled;
    }

    async doProxy(ctx) {
        return new Promise(resolve => {
            /*this._proxy.web(ctx.req, ctx.res, { target: this._options.target }, function(err) {
                reject(err);
            });*/
            this._proxy.web(ctx.req, ctx.res, { target: this._options.target });
            resolve();
        });
    }

    static normalizeEnabledFlag(enabled) {
        return (enabled === undefined || enabled === null) ? false : enabled;
    }

    static buildProxyServer(options) {
        return HttpProxy.createProxyServer(options);
    }

    static normalizeOptions(config, ruleName) {
        const r = config;
        if (!r.target) throw new Error('missing target option. rule name: ' + ruleName);
        r.enabled = Proxy.normalizeEnabledFlag(r.enabled);
        return r;
    }

};