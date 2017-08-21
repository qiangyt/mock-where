/* eslint no-undef: "off" */

const SRC = '../src';
const MockServer = require(`${SRC}/MockServer`);
const qnodeError = require('qnode-error');
const supertest = require('supertest');
const MissingParamError = qnodeError.MissingParamError;
const InternalError = qnodeError.InternalError;
const RequestError = qnodeError.RequestError;
const Beans = require('qnode-beans');
const finishTestcase = require('jasmine-supertest');

const Logger = require('qnode-log');

Logger.prototype.debug = function() {};
Logger.prototype.error = function() {};
Logger.prototype.info = function() {};
Logger.prototype.warn = function() {};

describe("MockServer test suite: ", function() {

    it("happy", function(done) {
        const def = {
            server: {
                port: 12345
            }
        };
        const r = new MockServer('mock', def);
        r.init();
        const server = r.start();

        const rule = { path: '/abc' };
        r.putRule(rule);

        supertest(server).get('/abc').expect(500).end(function(err, res) {
            if (err) {
                console.error(err);
                return done(err);
            }
            done();
        });
    });
});