/* eslint no-undef: "off" */
const Beans = require('qnode-beans');
const _ = require('underscore');

const SRC = '../src';
const RuleEngine = require(`${SRC}/RuleEngine`);

function buildEngine(name, rules) {
    const beans = new Beans();
    const r = new RuleEngine(name, { rules });
    beans.renderThenInitBean(r, name);
    return r;
}

describe("RuleEngine test suite: ", function() {

    it("determineTimeToDelay(): delay", function() {
        expect(RuleEngine.determineTimeToDelay({ delay: 100, delayFix: 10 })).toBe(110);
        expect(RuleEngine.determineTimeToDelay({ delay: -100, delayFix: 10 })).toBe(0);
    });

    it("renderMockResponseBody(): render response body as message with template", function() {
        const ruleResponse = {
            template: {
                func: function(request) {
                    return `hi ${request.you}`;
                }
            }
        };

        const responseToMock = {};
        RuleEngine.renderMockResponseBody({ you: 'Yiting' }, ruleResponse, responseToMock);

        expect(responseToMock.body).toBe('hi Yiting');
    });

    it("renderMockResponseBody(): render response body as object", function() {
        const body = {};
        const ruleResponse = { body };
        const responseToMock = {};
        RuleEngine.renderMockResponseBody({ you: 'Yiting' }, ruleResponse, responseToMock);

        expect(responseToMock.message).toBeUndefined();
        expect(responseToMock.body).toEqual(body);
    });

    it("renderMockResponseBody(): fail to generate response with template", function() {
        const ruleResponse = {
            template: {
                func: function() {
                    throw new Error('mock exception to be ignored');
                }
            }
        };

        const responseToMock = {};
        try {
            RuleEngine.renderMockResponseBody({ you: 'Yiting' }, ruleResponse, responseToMock);
        } catch (e) {
            expect(e.type.key).toBe('FAILED_TO_GENERATE_RESPONSE_WITH_TEMPLATE');
        }
    });

    it("renderMockResponse(): render response", function() {
        const body = {};
        const header = {};
        const type = 'application/json';
        const status = 200;
        const ruleResponse = { body, header, type, status };
        const responseToMock = {
            header: {}
        };
        RuleEngine.renderMockResponse({ you: 'Yiting' }, ruleResponse, responseToMock);

        expect(responseToMock.body).toEqual(body);
        expect(responseToMock.header).toEqual(header);
        expect(responseToMock.type).toBe(type);
        expect(responseToMock.status).toBe(status);
    });

    it("mock(): happy", function() {
        const rule = {
            path: '/ab',
            response: {
                delay: 100
            }
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

        return re.mock(request, response).then(() => {
            const duration = new Date().getTime() - beginTime;
            expect(duration).toBeLessThanOrEqual(120);
            expect(duration).toBeGreaterThanOrEqual(90);
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

        re.mock(request, response)
            .then(() => failhere())
            .catch(e => expect(e.type.key).toBe('NO_RULE_MATCHES'))
            .catch(e => {
                console.error(e);
                failhere();
            });
    });

    it("mock(): no delay", function() {
        const rule = {
            path: '/ab'
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

        return re.mock(request, response).then(() => {
            const duration = new Date().getTime() - beginTime;
            expect(duration).toBeLessThanOrEqual(10);
        });
    });

    it("_buildRequestTableData()", function() {
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

        const t = re._buildRequestTableData(req)[0];

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