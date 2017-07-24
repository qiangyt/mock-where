const beans = require('../beans');

class Where {

    init() {
        this._ruleEngine = beans.load('ruleEngine');
    }

    async execute(ctx, next) {
        const rule = ctx.request.body;
        this._logger.info('rule is requested: %s', rule);

        this._ruleEngine.put(rule);

        ctx.body = { code: 0 };

        await next();
    }

}

Where.description = 'specifies how mock response when got specific request';
Where.method = 'post';

module.exports = Where;