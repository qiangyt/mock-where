/* eslint no-undef: "off" */

const SRC = '../src';
const RuleEngine = require(`${SRC}/RuleEngine`);

describe("RuleEngine test suite: ", function() {

    it("determineTimeToSleep(): sleep", function() {
        expect(RuleEngine.determineTimeToSleep({ sleep: 100, sleepFix: 10 })).toBe(110);
        expect(RuleEngine.determineTimeToSleep({ sleep: -100, sleepFix: 10 })).toBe(0);
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

        expect(responseToMock.body).toBeUndefined();
        expect(responseToMock.message).toBe('hi Yiting');
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

        const r = RuleEngine.normalizeRequest(req);

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

    it("mock(): happy", function() {
        const re = new RuleEngine('test');

        const ctx = {
            request: {
                path: '/ab',
                method: 'get',
                url: 'https://host/ab',
                charset: 'utf-8',
                protocol: 'https',
                ip: '::1'
            },
            response: {}
        };

        const rule = {
            path: '/ab',
            response: {
                sleep: 100
            }
        };
        re.put(rule);

        let nextIsCalled = false;
        const beginTime = new Date().getTime();

        return re.mock(ctx, function() {
            nextIsCalled = true;
        }).then(() => {
            const duration = new Date().getTime() - beginTime;
            expect(duration).toBeLessThanOrEqual(110);
            expect(duration).toBeGreaterThanOrEqual(90);

            expect(nextIsCalled).toBeTruthy();
        });
    });

    it("mock(): no rule matched", function() {
        const re = new RuleEngine('test');

        const ctx = {
            request: {
                path: '/ab',
                method: 'get',
                url: 'https://host/ab',
                charset: 'utf-8',
                protocol: 'https',
                ip: '::1'
            },
            response: {}
        };

        return re.mock(ctx, function() {})
            .then(() => {
                fail('exception is expected to raise');
            })
            .catch(e => {
                expect(e.type.key).toBe('NO_RULE_MATCHES');
            });
    });

    it("mock(): no sleep", function() {
        const re = new RuleEngine('test');

        const ctx = {
            request: {
                path: '/ab',
                method: 'get',
                url: 'https://host/ab',
                charset: 'utf-8',
                protocol: 'https',
                ip: '::1'
            },
            response: {}
        };

        const rule = {
            path: '/ab'
        };
        re.put(rule);

        const beginTime = new Date().getTime();

        return re.mock(ctx, function() {}).then(() => {
            const duration = new Date().getTime() - beginTime;
            expect(duration).toBeLessThanOrEqual(10);
        });
    });

});