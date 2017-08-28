const BaseServer = require('./BaseServer');
const Errors = require('qnode-error').Errors;
const BaseError = require('qnode-error').BaseError;
const Beans = require('qnode-beans');
const Path = require('path');


module.exports = class ApiServer extends BaseServer {

    init() {
        super.init();

        this._normalizeConfiguration();

        const apiFileList = this._findAllApiFiles();
        this._apiByPath = this._loadAllApi(apiFileList);
    }

    _normalizeConfiguration() {
        const cfg = this._config;

        cfg.port = cfg.port || 7000;
        cfg.rootPath = cfg.rootPath || '/';
        cfg.rootDir = cfg.rootDir || 'api';
    }

    prepare() {
        this._logger.debug(`registering api(s)`);

        for (const path in this._apiByPath) {
            const api = this._apiByPath[path];
            this._koaRouter[api.method](path, async(ctx, next) => {
                const data = await api.instance.execute(ctx, next);
                ctx.body = BaseError.staticBuild(Errors.OK); //TODO: locale
                ctx.body.data = data;

                //await next();
            });
        }

        this._koa.use(this._koaRouter.routes());

        this._logger.debug('api(s) registered: %i');
    }

    _findAllApiFiles() {
        return ['Where'];
    }

    _loadAllApi(apiFileList) {
        const log = this._logger;
        log.debug(`loading api(s)`);

        const apiList = apiFileList.map(apiFile => this._loadApi(apiFile));

        const r = {};

        log.info('-----------------------------------------------------------------------------------');
        for (let i = 0; i < apiList.length; i++) {
            const api = apiList[i];
            const path = api.path;
            if (r[path]) throw new Error(`duplicated api path: ${path}`);
            r[path] = api;

            log.info(' %i. %s %s\t# %s', i, api.method.toUpperCase(), path, api.description);
        }
        log.info('-----------------------------------------------------------------------------------');

        log.debug('api(s) loaded');

        return r;
    }

    _normalizeRootPath(path, defaultPath) {
        let r = path || defaultPath.toLowerCase();
        if ('/' === r.charAt(0)) r = path.substring(1);
        return this._config.rootPath + r;
    }

    _loadApi(relativeFile) {
        const file = Path.join(this._config.rootDir, relativeFile);
        const api = this._beans.create(file, relativeFile);
        const mod = api._module;
        if (!api.execute) {
            throw new Error(`execute() not defined in api: ${relativeFile}`);
        }

        mod.instance = api;
        mod.method = (mod.method || 'get').toLowerCase();
        mod.path = this._normalizeRootPath(mod.path, relativeFile);

        return mod;
    }


}