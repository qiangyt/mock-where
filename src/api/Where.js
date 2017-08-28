const MissingParamError = require('qnode-error').MissingParamError;
const RequestError = require('qnode-error').RequestError;


class Where {

    init() {
        this._mockServerManager = this._beans.load('MockServerManager');
    }

    async execute(ctx, next) {
        const req = ctx.request;

        const rule = req.body;
        this._logger.info('rule is requested: %s', rule);

        const port = rule.port;
        if (!port) throw new MissingParamError('port');

        const domain = rule.domain;
        if (!domain) throw new MissingParamError('domain');

        const mockServer = this._mockServerManager.get(port);
        if (!mockServer) throw new RequestError('MOCK_SERVER_NOT_FOUND', port);

        mockServer.putRule(domain, rule);

        ctx.body = { code: 0 };

        await next();
    }

}

Where.description = 'specifies how mock response when got specific request';
Where.method = 'post';

module.exports = Where;