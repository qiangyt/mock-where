const RuleRepository = require('../RuleRepository');
const logger = require('../logger');


module.exports = {
    description: 'specifies how mock response when got specific request',

    method: 'post',

    execute: async function(ctx, next) {
        const rule = ctx.request.body;
        logger.info('rule is requested: ' + JSON.stringify(rule));

        RuleRepository.instance.add(rule);

        ctx.body = { code: 0 };

        await next();
    }
};