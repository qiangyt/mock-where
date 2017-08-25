const RequestError = require('qnode-error').RequestError;
const BaseServer = require('./BaseServer');
const RuleEngine = require('./RuleEngine');
const Logger = require('qnode-log');

module.exports = class MockServer extends BaseServer {

    constructor(config) {
        super();
        this._name = 'mockServer_' + config.port;
        this._logger = new Logger(this._name);
        this._config = config;
    }

    prepare() {
        this._koa.use(this.mock.bind(this));

        this._engines = {};

        const vhostConfigs = this._config.vhosts;
        for (const vhostName in vhostConfigs) {
            const engine = new RuleEngine('ruleEngine_' + vhostName);

            const vhostConfig = vhostConfigs[vhostName];
            for (const domain of vhostConfig.domains) {
                if (this._engines[domain]) {
                    throw new Error(`${this._name}: duplicated domain: domain`);
                }
                this._engines[domain] = engine;
            }
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
            throw new RequestError('SERVICE_NOT_FOUND', domain);
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
        await engine.mock(request, response);

        await next();
    }
}