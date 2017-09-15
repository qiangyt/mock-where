const Koa = require('koa');
const buddy = require('co-body');
const Http = require('http');
const PORT = 4001;

let seq = 0;

const koa = new Koa();

koa.use((ctx, next) => {
    const p = buddy.text(ctx, {
        encoding: 'utf-8',
        limit: '1mb'
    });

    return p.then(body => {
        ctx.request.body = body;
        return next();
    });
});

koa.use((ctx, next) => {
    console.log(`#${seq} ----------------------------------------------------`);

    const req = ctx.req;

    console.log(`${req.method} ${req.url} HTTP/${req.httpVersion}`);
    console.log();

    const rawHeaders = req.rawHeaders;
    for (let i = 0; i < rawHeaders.length;) {
        const name = rawHeaders[i++];
        const value = rawHeaders[i++];
        console.log(`${name}: ${value}`);
    }

    console.log();
    console.log(ctx.request.body);

    const res = ctx.response;
    res.body = '1';

    next();
});

Http.createServer(koa.callback()).listen(PORT, function(err) {
    if (err) console.error(err);
    else console.log('listening on ' + PORT);
});