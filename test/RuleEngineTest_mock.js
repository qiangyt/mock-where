/* eslint no-undef: "off" */
const Beans = require('qnode-beans');
const _ = require('underscore');
const superagent = require('superagent');
const SuperAgentMocker = require('qnode-superagent-mocker');

const SRC = '../src';
const RuleEngine = require(`${SRC}/RuleEngine`);
const Template = require(`${SRC}/Template`);

function buildEngine(name, rules) {
    const beans = new Beans();
    const r = new RuleEngine(name, { rules });
    beans.renderThenInitBean(r, name);
    return r;
}

describe("RuleEngine test suite: ", function() {

    it("determineTimeToLatency(): latency", function() {
        expect(RuleEngine.determineTimeToLatency({ latency: 100, latencyFix: 10 })).toBe(110);
        expect(RuleEngine.determineTimeToLatency({ latency: -100, latencyFix: 10 })).toBe(0);
    });

    it("renderMockResponse(): render response", function() {
        const body = {
            object: 'hello'
        };
        const header = {};
        const type = 'application/json';
        const status = 200;
        const ruleResponse = {
            body: Template.normalizeContent(body, {}),
            header,
            type,
            status
        };

        const responseToMock = {
            header: {}
        };
        RuleEngine.renderMockResponse({ you: 'Yiting' }, ruleResponse, responseToMock);

        expect(responseToMock.body).toEqual('"hello"');
        expect(responseToMock.header).toEqual(header);
        expect(responseToMock.type).toBe(type);
        expect(responseToMock.status).toBe(status);
    });

    it("mock(): happy", function() {
        const rule = {
            path: '/ab',
            response: {
                latency: 100
            },
            hook: {
                before: [{
                    method: 'get',
                    path: '/before'
                }],
                after: [{
                    method: 'get',
                    path: '/after'
                }]
            }
        };

        const mocker = SuperAgentMocker(superagent);
        mocker.get('/before', function() {
            return { code: '0' };
        });
        mocker.get('/after', function() {
            return { code: '1' };
        });

        const re = buildEngine('test', { ab: rule });

        const request = {
            path: '/ab',
            method: 'get',
            url: 'https://host/ab',
            charset: 'utf-8',
            protocol: 'https',
            ip: '::1'
        };
        const response = {};

        const beginTime = new Date().getTime();

        return re.mock({}, { request, response }).then(() => {
            const duration = new Date().getTime() - beginTime;
            expect(duration).toBeLessThanOrEqual(1000);
        });
    });

    it("mock(): no rule matched", function() {
        const re = buildEngine('test', {});

        const request = {
            path: '/ab',
            method: 'get',
            url: 'https://host/ab',
            charset: 'utf-8',
            protocol: 'https',
            ip: '::1'
        };
        const response = {};

        re.mock({}, { request, response })
            .then(() => failhere())
            .catch(e => expect(e.type.key).toBe('NO_RULE_MATCHES'))
            .catch(e => {
                console.error(e);
                failhere();
            });
    });

    it("mock(): no latency", function() {
        const rule = {
            path: '/ab',
            response: {}
        };

        const re = buildEngine('test', { ab: rule });

        const request = {
            path: '/ab',
            method: 'get',
            url: 'https://host/ab',
            charset: 'utf-8',
            protocol: 'https',
            ip: '::1'
        };
        const response = {};

        const beginTime = new Date().getTime();

        return re.mock({}, { request, response }).then(() => {
            const duration = new Date().getTime() - beginTime;
            expect(duration).toBeLessThanOrEqual(10);
        });
    });

    it("_buildRequestData()", function() {
        const re = buildEngine('test');

        const req = {
            path: '/path',
            method: 'post',
            url: 'https://localhost/path',
            charset: 'ascii',
            protocol: 'http',
            ip: '::1',
            query: {
                a: 1,
                b: 2
            }
        };

        const t = re._buildRequestData(req);

        expect(_.size(t)).toBe(7);

        expect(t.path).toEqual(req.path);
        expect(t.method).toEqual(req.method);
        expect(t.url).toEqual(req.url);
        expect(t.charset).toEqual(req.charset);
        expect(t.protocol).toEqual(req.protocol);
        expect(t.ip).toEqual(req.ip);
        expect(t.path).toEqual(req.path);
        expect(t.q.a).toEqual(req.query.a);
        expect(t.q.b).toEqual(req.query.b);
    });

});