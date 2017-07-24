const BaseServer = require('./BaseServer');
const Errors = require('./error/Errors');
const beans = require('./beans');


class ApiServer extends BaseServer {

    _starting() {
        const apiList = this._loadAllApi();
        this._buildRoutes(apiList);
    }

    _buildRoutes(apiList) {
        this._logger.debug(`registering api(s)`);

        for (const api of apiList) {
            this._koaRouter[api.method](api.path, async(ctx, next) => {
                const data = await api.instance.execute(ctx, next);
                ctx.body = Errors.OK.build(); //TODO: locale
                ctx.body.data = data;

                //await next();
            });
        }

        this._koa.use(this._koaRouter.routes());

        this._logger.debug('%s api(s) registered', apiList.length);
    }

    _loadAllApi() {
        this._logger.debug(`loading api(s)`);

        this._existing = {};

        const r = [];
        r.push(this._loadApi('where'));

        this._logger.debug('%s api(s) loaded', r.length);

        return r;
    }

    _loadApi(name) {
        if (this._existing[name]) throw new Error(`duplicated api name: ${name}`);

        const api = beans.create(`./api/${name}`, `api_${name}`);
        const mod = api._module;
        if (!api.execute) throw new Error(`execute() not defined in api: ${name}`);

        this._existing[name] = api;

        mod.instance = api;
        mod.method = (mod.method || 'get').toLowerCase();
        mod.path = `/api/${name}`;

        this._logger.debug('%s %s\t\t # %s', mod.method.toUpperCase(), mod.path, mod.description);

        return mod;
    }


}

module.exports = ApiServer;