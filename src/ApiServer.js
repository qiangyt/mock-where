const BaseServer = require('./BaseServer');
const koaRouter = require('koa-router')();
const Errors = require('./error/Errors');
const logger = require('./logger');

class ApiServer extends BaseServer {

    constructor() {
        super();
        this.existing = {};
    }

    starting() {
        const apiList = [];
        apiList.push(this.loadApi('where'));

        logger.info(`${apiList.length} api(s) to be registered`);

        for (const api of apiList) {
            const path = `/api/${api.name}`;
            koaRouter[api.method](path, async(ctx, next) => {
                const data = await api.execute(ctx, next);
                ctx.body = Errors.OK.build(); //TODO: locale
                ctx.body.data = data;

                //await next();
            });
            logger.info(`${api.method.toUpperCase()} ${path}\t\t # ${api.description}`);
        }
        console.log();

        this.koa.use(koaRouter.routes());
    }

    loadApi(name) {
        if (this.existing[name]) throw new Error(`duplicated api name: ${name}`);

        const api = require(`./api/${name}`);
        if (!api.execute) throw new Error(`execute() not defined in api: ${name}`);

        this.existing[name] = api;

        api.name = name;
        api.method = api.method || 'get';

        return api;
    }


}

module.exports = ApiServer;