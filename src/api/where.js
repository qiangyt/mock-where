const Beans = require('node-beans').DEFAULT;
const MissingParamError = require('../error/MissingParamError');
const RequestError = require('../error/RequestError');


class Where {

    init() {
        this._mockServerManager = Beans.load('mockServerManager');
    }

    async execute(ctx, next) {
        const req = ctx.request;

        const rule = req.body;
        this._logger.info('rule is requested: %s', rule);

        const mockServerName = rule.server;
        if (!mockServerName) throw new MissingParamError('server');

        const mockServer = this._mockServerManager.get(mockServerName);
        if (!mockServer) throw new RequestError('MOCK_SERVER_NOT_FOUND', mockServerName);

        mockServer.putRule(rule);

        ctx.body = { code: 0 };

        await next();
    }

}

Where.description = 'specifies how mock response when got specific request';
Where.method = 'post';

module.exports = Where;