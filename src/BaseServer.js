const Koa = require('koa');
const BaseError = require('qnode-error').BaseError;
const Errors = require('qnode-error').Errors;
const koaLogger = require('koa-logger');
const koaBody = require('koa-body');
const Http = require('http');
const CreateKoaRouter = require('koa-router');

module.exports = class BaseServer {

    init() {
        this._initKoa();

        this._start();
    }

    _initKoa() {
        const koa = new Koa();
        koa.use((ctx, next) => next().catch(err => this.formatJsonError(ctx, err)));
        koa.use(koaLogger());
        koa.use(koaBody({
            jsonLimit: this._config.bodySizeLimit || '1kb'
        }));

        this._koa = koa;

        this._koaRouter = CreateKoaRouter();
    }

    formatJsonError(ctx, err) {
        this._logger.error(err);

        if (err instanceof BaseError) {
            ctx.body = err.build(); //TODO: locale

            const errType = err.type;
            if (errType === Errors.INTERNAL_ERROR) {
                ctx.status = 500;
            } else if (errType === Errors.API_NOT_FOUND ||
                errType === Errors.SERVICE_NOT_FOUND) {
                ctx.status = 404;
            } else if (errType === Errors.NO_PERMISSION ||
                errType === Errors.INVALID_AUTH_TOKEN ||
                errType === Errors.SESSION_NOT_FOUND ||
                errType === Errors.INVALID_SESSION ||
                errType === Errors.INVALID_AUTH_FORMAT ||
                errType === Errors.EXPIRED_AUTH_TOKEN) {
                ctx.status = 403;
            } else {
                ctx.status = 400;
            }
        } else {
            //TODO: other error such as 404
            ctx.body = BaseError.staticBuild(Errors.INTERNAL_ERROR, err.message); //TODO: locale
            ctx.status = 500;
        }

        // Emit the error if we really care
        //ctx.app.emit('error', err, ctx);
    }

    _start() {
        this._logger.debug('starting %s server', this._name);

        this._starting();

        const port = this._config.port;
        if (!port) throw new Error(`port NOT specified for ${this._name}`);
        Http.createServer(this._koa.callback()).listen(port);

        this._logger.info('%s server listening on %s', this._name, port);
    }

    _starting() {
        throw new Error('TODO');
    }
}