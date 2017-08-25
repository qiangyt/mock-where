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

    it("mock(): happy", function() {
        const re = new RuleEngine('test');

        const request = {
            path: '/ab',
            method: 'get',
            url: 'https://host/ab',
            charset: 'utf-8',
            protocol: 'https',
            ip: '::1'
        };
        const response = {};

        const rule = {
            path: '/ab',
            response: {
                sleep: 100
            }
        };
        re.put(rule);

        const beginTime = new Date().getTime();

        return re.mock(request, response).then(() => {
            const duration = new Date().getTime() - beginTime;
            expect(duration).toBeLessThanOrEqual(120);
            expect(duration).toBeGreaterThanOrEqual(90);
        });
    });

    it("mock(): no rule matched", function() {
        const re = new RuleEngine('test');

        const request = {
            path: '/ab',
            method: 'get',
            url: 'https://host/ab',
            charset: 'utf-8',
            protocol: 'https',
            ip: '::1'
        };
        const response = {};

        try {
            re.mock(request, response);
            fail('exception is expected to raise');
        } catch (e) {
            expect(e.type.key).toBe('NO_RULE_MATCHES');
        }
    });

    it("mock(): no sleep", function() {
        const re = new RuleEngine('test');

        const request = {
            path: '/ab',
            method: 'get',
            url: 'https://host/ab',
            charset: 'utf-8',
            protocol: 'https',
            ip: '::1'
        };
        const response = {};

        const rule = {
            path: '/ab'
        };
        re.put(rule);

        const beginTime = new Date().getTime();

        return re.mock(request, response).then(() => {
            const duration = new Date().getTime() - beginTime;
            expect(duration).toBeLessThanOrEqual(10);
        });
    });

});