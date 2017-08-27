const BaseServer = require('./BaseServer');
const Errors = require('qnode-error').Errors;
const BaseError = require('qnode-error').BaseError;
const Beans = require('qnode-beans');


module.exports = class ApiServer extends BaseServer {

    constructor() {
        super();
        this._existing = {};
    }

    init() {
        super.init();

        this._normalizeConfiguration();
        this._apiList = this._loadAllApi();
    }

    _normalizeConfiguration() {
        const cfg = this._config;

        cfg.port = cfg.port || 7000;
        cfg.root = cfg.root || '/api/';
    }

    prepare() {
        this._logger.debug(`registering api(s)`);

        for (const api of this._apiList) {
            this._koaRouter[api.method](api.path, async(ctx, next) => {
                const data = await api.instance.execute(ctx, next);
                ctx.body = BaseError.staticBuild(Errors.OK); //TODO: locale
                ctx.body.data = data;

                //await next();
            });
        }

        this._koa.use(this._koaRouter.routes());

        this._logger.debug('api(s) registered: %i', this._apiList.length);
    }

    _loadAllApi() {
        const log = this._logger;
        log.debug(`loading api(s)`);

        const r = [];
        r.push(this._loadApi('where'));

        log.info('-----------------------------------------------------------------------------------');
        for (let i = 0; i < r.length; i++) {
            const api = r[i];
            log.info(' %i. %s %s\t# %s', i, api.method.toUpperCase(), api.path, api.description);
        }
        log.info('-----------------------------------------------------------------------------------');
        log.debug('api(s) loaded: %i', r.length);

        return r;
    }

    _normalizePath(path, defaultPath) {
        let r = path || defaultPath;
        if ('/' === r.charAt(0)) r = path.substring(1);
        return this._config.root + r;
    }

    _loadApi(name) {
        if (this._existing[name]) {
            throw new Error(`duplicated api name: ${name}`);
        }

        const api = Beans.create(`./api/${name}`, `api_${name}`);
        const mod = api._module;
        if (!api.execute) {
            throw new Error(`execute() not defined in api: ${name}`);
        }

        this._existing[name] = api;

        mod.instance = api;
        mod.method = (mod.method || 'get').toLowerCase();
        mod.path = this._normalizePath(mod.path, name);

        return mod;
    }


}