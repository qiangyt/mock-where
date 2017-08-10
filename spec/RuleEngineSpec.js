const SRC = '../src';
const RuleEngine = require(`${SRC}/RuleEngine`);

describe("RuleEngine test suite: ", function() {

    it("sleep", function() {
        expect(RuleEngine.determineTimeToSleep({sleep: 100, sleepFix:10})).toBe(110);
        expect(RuleEngine.determineTimeToSleep({sleep: -100, sleepFix:10})).toBe(0);
    });

    it("render response body as message with template", function() {
        const ruleResponse = {
            template: {
                func: function(request) {
                    return `hi ${request.you}`;
                }
            }
        };
        
        const responseToMock = {};
        RuleEngine.renderMockResponseBody({you:'Yiting'}, ruleResponse, responseToMock);

        expect(responseToMock.body).toBeUndefined();
        expect(responseToMock.message).toBe('hi Yiting');
    });

    it("render response body as object", function() {
        const body = {};
        const ruleResponse = {body};
        const responseToMock = {};
        RuleEngine.renderMockResponseBody({you:'Yiting'}, ruleResponse, responseToMock);

        expect(responseToMock.message).toBeUndefined();
        expect(responseToMock.body).toEqual(body);
    });

    it("render response", function() {
        const body = {};
        const header = {};
        const type = 'application/json';
        const status = 200;
        const ruleResponse = {body, header, type, status};
        const responseToMock = {
            header: {}
        };
        RuleEngine.renderMockResponse({you:'Yiting'}, ruleResponse, responseToMock);

        expect(responseToMock.body).toEqual(body);
        expect(responseToMock.header).toEqual(header);
        expect(responseToMock.type).toBe(type);
        expect(responseToMock.status).toBe(status);
    });

    it("normalize request", function() {
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

});