/* eslint no-undef: "off" */

const SRC = '../src';
const MockServer = require(`${SRC}/MockServer`);
const supertest = require('supertest');
const Beans = require('qnode-beans').Beans;

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

    it("getEngine(): engine not found", async function() {
        const def = {
            port: 12345,
            vhosts: {
                test: {
                    record: false,
                    name: 'test',
                    domains: ['test']
                }
            }
        };

        const beans = new Beans();
        const r = new MockServer(def);
        await beans.renderThenInitBean(r);
        r.prepare();

        try {
            r.getEngine('xxx');
            failhere();
        } catch (e) {
            expect(e.type.key).toBe('VHOST_NOT_FOUND');
        }
    });

    it("start(): happy", async function(done) {
        const host = '127.0.0.1';
        const vhosts = {};
        vhosts[host] = {
            record: false,
            name: host,
            domains: [host]
        }
        const def = { port: 12345, vhosts };

        const beans = new Beans();
        const r = new MockServer(def);
        await beans.renderThenInitBean(r);

        const server = await r.start();
        expect(r.defaultDomain).toBe('127.0.0.1');

        const rule = { path: '/abc', body: 'hello' };
        r.putRule(host, rule);

        supertest(server).get('/abc').expect(200).end(function(err, res) {
            if (err) return done(err);
            expect(res.body).toBe('no object specified');
            done();
        });
    });

    it("start(): no default domain due to 2 more domains", async function() {
        const host1 = '127.0.0.1',
            host2 = '192.168.0.1';
        const vhosts = {};
        vhosts[host1] = {
            record: false,
            name: host1,
            domains: [host1, host2]
        }
        const def = { port: 12345, vhosts };

        const beans = new Beans();
        const r = new MockServer(def);
        await beans.renderThenInitBean(r);

        r.prepare();
        expect(r.defaultDomain).toBeUndefined();
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

    it("prepare(): domain duplicated", async function() {
        const def = {
            port: 12345,
            vhosts: {
                test1: {
                    record: false,
                    domains: ['test1', 'dup']
                },
                test2: {
                    record: false,
                    domains: ['test2', 'dup']
                }
            }
        };

        const beans = new Beans();
        const r = new MockServer(def);
        await beans.renderThenInitBean(r);

        try {
            r.prepare();
            failhere();
        } catch (e) {
            expect(e.message.indexOf('duplicated')).toBeTruthy();
        }
    });

});
