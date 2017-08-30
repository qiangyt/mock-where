const MissingParamError = require('qnode-error').MissingParamError;
const RequestError = require('qnode-error').RequestError;


class Where {

    init() {
        this._mockServerManager = this._beans.load('MockServerManager');
    }

    async validate(ctx) {
        const req = ctx.request;

        const rule = req.body;
        this._logger.info('rule is requested: %s', rule);

        const domain = rule.domain;
        if (!domain) throw new MissingParamError('domain');
        
        const port = rule.port;
        if (!port) throw new MissingParamError('port');

        const mockServer = this._mockServerManager.get(port);
        if (!mockServer) throw new RequestError('MOCK_SERVER_NOT_FOUND', port);

        return { domain, rule, mockServer };
    }

    async execute(ctx, { domain, rule, mockServer }) {
        mockServer.putRule(domain, rule);
    }

}

Where.description = 'specifies how mock response when got specific request';
Where.method = 'post';

module.exports = Where;