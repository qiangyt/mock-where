/* eslint no-undef: "off" */

const SRC = '../src';
const BaseServer = require(`${SRC}/BaseServer`);
const qnodeError = require('qnode-error');
const supertest = require('supertest');
const RequestError = qnodeError.RequestError;
const Beans = require('qnode-beans');

function buildBaseServer(port) {
    const r = new BaseServer();
    Beans.render(r);
    r._config.port = port;
    r.prepare = function() {};
    r.init();
    return r;
}

describe("BaseServer test suite 2: ", function() {

    it("start(): 403", function(done) {
        const s = buildBaseServer(54321);
        s.prepare = function() {
            s._koa.use(async() => {
                throw new RequestError('NO_PERMISSION')
            });
        };

        supertest(s.start()).get('/').expect(403, done);
    });

    it("start(): port is not specified", function() {
        const s = buildBaseServer(undefined);
        try {
            s.start();
            failhere();
        } catch (e) {
            // empty
        }
    });
});