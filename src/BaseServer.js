const Koa = require('koa');
const RequestError = require('./RequestError');
const Errors = require('./Errors');
const koaLogger = require('koa-logger');
const koaBody = require('koa-body');
const http = require('http');
const logger = require('./logger');


function formatJsonError(ctx, next) {
    return next().catch(err => {
        logger.error(err);

        if (err instanceof RequestError) {
            ctx.body = err.build(); //TODO: locale
            ctx.status = (err.errorType === Errors.INTERNAL_ERROR) ? 500 : 400;
        } else {
            //TODO: other error such as 404
            ctx.body = Errors.INTERNAL_ERROR.build(); //TODO: locale
            ctx.status = 500;
        }

        // Emit the error if we really care
        //ctx.app.emit('error', err, ctx);
    });
};

class BaseServer {

    constructor() {
        const koa = new Koa();
        koa.use(formatJsonError);
        koa.use(koaLogger());
        koa.use(koaBody({
            jsonLimit: '1kb'
        }));

        this.koa = koa;
    }

    start(port) {
        this.starting();

        http.createServer(this.koa.callback()).listen(port);
    }

    starting() {
        throw new Error('TODO');
    }
}


module.exports = BaseServer;