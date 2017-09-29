const RequestError = require('qnode-error').RequestError;
const BaseServer = require('qnode-rest').BaseServer;
const RuleEngine = require('./RuleEngineJs');

/**
 * A mock server is a HTTP(s) server listening on single specific port, 
 * has multiple domain/virtual-hosts.
 * 
 * It holds a map of rule engines mapped to domains, plays the entry point
 * that return mocked response for incoming request.
 */
module.exports = class MockServer extends BaseServer {

    constructor(config) {
        super();
        this._name = 'MockServer_' + config.port;
        this._config = config;
    }

    /**
     * Before started, build RuleEngines using vhosts configuration.
     * 
     * The resulted _engines holds the engine of map, map domain name to engine
     * instance. One engine may be mapped by multiple domains.
     * 
     * If there's 1 domain, then it is the default domain.
     * 
     */
    prepare() {
        this._koa.use(this.mock.bind(this));

        this._engines = {};

        const vhostConfigs = this._config.vhosts;
        let amountOfDomains = 0;

        for (const vhostName in vhostConfigs) {
            const vhostConfig = vhostConfigs[vhostName];

            const engine = new RuleEngine(this._name + '_RuleEngine', vhostConfig);
            this._beans.renderThenInitBean(engine, 'RuleEngine:' + vhostName);

            for (const domain of vhostConfig.domains) {
                if (this._engines[domain]) {
                    throw new Error(`${this._name}: duplicated domain: domain`);
                }
                this._engines[domain] = engine;
                amountOfDomains++;

                if (!this.defaultDomain) {
                    this.defaultDomain = domain;
                }

                this._logger.info(`virtual host: ${domain}`);
            }
        }

        if (amountOfDomains !== 1) {
            this.defaultDomain = undefined;
        }
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

    putRule(domain, rule) {
        const engine = this.getEngine(domain);
        engine.put(rule);
    }

    getEngine(domain) {
        const r = this._engines[domain];
        if (!r) {
            throw new RequestError('VHOST_NOT_FOUND', domain);
        }
        return r;
    }

    static resolveDomain(hostHeader) {
        const pos = hostHeader.indexOf(':');
        if (pos > 0) return hostHeader.substring(0, pos);
        return hostHeader;
    }

    async mock(ctx, next) {
        const request = MockServer.normalizeRequest(ctx.request);
        const domain = MockServer.resolveDomain(request.header.host);

        const engine = this.getEngine(domain);

        const response = ctx.response;
        await engine.mock(ctx, { request, response }, this._config.port);

        await next();
    }
}