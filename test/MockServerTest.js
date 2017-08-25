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

    it("resolveDomain()", function() {
        expect(MockServer.resolveDomain('localhost:12345')).toBe('localhost');
        expect(MockServer.resolveDomain('localhost')).toBe('localhost');
        expect(MockServer.resolveDomain('127.0.0.1:12345')).toBe('127.0.0.1');
        expect(MockServer.resolveDomain('127.0.0.1')).toBe('127.0.0.1');
    });

    it("getEngine(): engine not found", function() {
        const def = {
            port: 12345,
            vhosts: {
                test: {
                    name: 'test',
                    domains: ['test']
                }
            }
        };

        const r = new MockServer(def);
        Beans.render(r);
        r.init();
        r.prepare();

        try {
            r.getEngine('xxx');
            fail('exception is expected to raise');
        } catch (e) {
            expect(e.type.key).toBe('VHOST_NOT_FOUND');
        }
    });

    it("happy", function(done) {
        const host = '127.0.0.1';
        const vhosts = {};
        vhosts[host] = {
            name: host,
            domains: [host]
        }
        const def = { port: 12345, vhosts };

        const r = new MockServer(def);
        Beans.render(r);
        r.init();
        const server = r.start();

        const rule = { path: '/abc' };
        r.putRule(host, rule);

        supertest(server).get('/abc').expect(500).end(function(err, res) {
            if (err) {
                console.error(err);
                return done(err);
            }
            done();
        });
    });

    it("normalizeRequest(): normalize request", function() {
        const header = {};
        const body = {};

        const req = {
            header: header,
            method: 'POST',
            url: 'http://temp/query?a=b',
            path: 'http://temp/query',
            charset: 'UTF-8',
            query: 'a=b',
            protocol: 'HTTP',
            ip: '192.168.0.1',
            body: body
        };

        const r = MockServer.normalizeRequest(req);

        expect(r.header).toEqual(header);
        expect(r.method).toBe('post');
        expect(r.url).toBe('http://temp/query?a=b');
        expect(r.path).toBe('http://temp/query');
        expect(r.charset).toBe('utf-8');
        expect(r.query).toBe('a=b');
        expect(r.protocol).toBe('http');
        expect(r.ip).toBe('192.168.0.1');
        expect(r.body).toEqual(body);
    });

    it("prepare(): domain duplicated", function() {
        const def = {
            port: 12345,
            vhosts: {
                test1: {
                    domains: ['test1', 'dup']
                },
                test2: {
                    domains: ['test2', 'dup']
                }
            }
        };

        const r = new MockServer(def);
        Beans.render(r);
        r.init();

        try {
            r.prepare();
            fail('exception is expected to raise');
        } catch (e) {
            expect(e.message.indexOf('duplicated')).toBeTruthy();
        }
    });

});