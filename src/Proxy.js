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
            ctx.respond = false;
            resolve();
        });
    }

    static normalizeEnabledFlag(enabled) {
        return (enabled === undefined || enabled === null) ? false : enabled;
    }

    static buildProxyServer(options) {
        return HttpProxy.createProxyServer(options);
    }

    static normalizeOptions(options, ruleName) {
        if (!options.target) throw new Error('missing target option. rule name: ' + ruleName);
        return {
            enabled: Proxy.normalizeEnabledFlag(options.enabled),
            target: options.target
        };
    }

};