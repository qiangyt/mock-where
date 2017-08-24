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
        for (let vhostName in vhostConfigs) {
            //TODO: const vhostConfig = vhostConfigs[vhostName];
            this._engines[vhostName] = new RuleEngine('ruleEngine_' + vhostName);
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

    putRule(vhostName, rule) {
        const engine = this._engines[vhostName];
        engine.put(rule);
    }

    async mock(ctx, next) {
        const host = ctx.host;

        const engine = this._engines[host];
        if (!engine) {
            throw RequestError('TODO');
        }

        const request = MockServer.normalizeRequest(ctx.request);
        const response = ctx.response;
        await engine.mock(request, response);

        await next();
    }
}