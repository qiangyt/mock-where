const SRC = '../src';
const RuleTree = require(`${SRC}/RuleTree`);

describe("RuleTree test suite: ", function() {

    it("normalizePath(): path without slash prefix should be normalized to be prefixed with slash", function() {
        expect(RuleTree.normalizePath('xyz')).toBe('/xyz');
    });

    it("normalizePath(): path with slash prefix should keep as it is", function() {
        expect(RuleTree.normalizePath('/xyz')).toEqual('/xyz');
    });

    it("normalizeDefaultRule(): default rule is not specified", function() {
        const r = RuleTree.normalizeDefaultRule();

        expect(r.path).toBe('/');
        expect(r.method).toBe('get');

        const resp = r.response;
        expect(resp.status).toBe(200);
        expect(resp.type).toBe('application/json');
        expect(resp.sleep).toBe(0);
        expect(resp.sleepFix).toBe(-10);
        expect(resp.templateType).toBe('ejs');
    });

    it("normalizeDefaultRule(): default rule is specified in detail", function() {
        const dr = {
            path: '/p',
            method: 'POST',
            response: {
                status: 400,
                type: 'application/xml',
                sleep: 123,
                sleepFix: -456,
                templateType: 'handlebars'
            }
        };
        const r = RuleTree.normalizeDefaultRule(dr);

        expect(r.path).toBe('/p');
        expect(r.method).toBe('post');

        const resp = r.response;
        expect(resp.status).toBe(400);
        expect(resp.type).toBe('application/xml');
        expect(resp.sleep).toBe(123);
        expect(resp.sleepFix).toBe(-456);
        expect(resp.templateType).toBe('handlebars');
    });

    it("normalizeRule(): take default", function() {
        const dr = {
            path: '/p',
            method: 'POST',
            q: '1=1'
        };

        const r = new RuleTree('test', dr).normalizeRule();

        expect(r.name).toBe('test_1');
        expect(r.path).toBe('/p');
        expect(r.method).toBe('post');
        expect(r.q).toBe('1=1');
        expect(r.statement).toBe('select * from request where 1=1');
    });

    it("normalizeRule(): take input", function() {
        const dr = {
            path: '/p',
            method: 'POST',
            q: '1=1'
        };
        const input = {
            path: '/p2',
            method: 'PUT',
            q: '1<>2'
        };

        const r = new RuleTree('test', dr).normalizeRule(input);

        expect(r.name).toBe('test_1');
        expect(r.path).toBe('/p2');
        expect(r.method).toBe('put');
        expect(r.q).toBe('1<>2');
        expect(r.statement).toBe('select * from request where 1<>2');
    });

    it("normalizeRuleResponse(): take default", function() {
        const dr = {
            response: {
                status: 400,
                type: 'application/xml',
                sleep: 123,
                sleepFix: -456
            }
        };

        const r = new RuleTree('test', dr).normalizeRuleResponse();

        expect(r.status).toBe(400);
        expect(r.type).toBe('application/xml');
        expect(r.sleep).toBe(123);
        expect(r.sleepFix).toBe(-456);
    });

    it("normalizeRuleResponse(): take input", function() {
        const dr = {
            response: {
                status: 400,
                type: 'application/xml',
                sleep: 123,
                sleepFix: -456
            }
        };
        const input = {
            status: 200,
            type: 'text/html',
            sleep: 456,
            sleepFix: -123
        };

        const r = new RuleTree('test', dr).normalizeRuleResponse(input);

        expect(r.status).toBe(200);
        expect(r.type).toBe('text/html');
        expect(r.sleep).toBe(456);
        expect(r.sleepFix).toBe(-123);
    });

    it("normalizeTemplate(): template is string", function() {
        const r = {
            template: 'hi'
        };
        new RuleTree().normalizeTemplate(r);
        expect(r.template.type).toBe('ejs');
        expect(r.template.text).toBe('hi');
        expect(r.template.func).toBeDefined();
    });

    it("normalizeTemplate(): template is not string and inputted", function() {
        const r = {
            template: {
                type: 'handlebars',
                text: 'wow'
            }
        };
        new RuleTree().normalizeTemplate(r);
        expect(r.template.type).toBe('handlebars');
        expect(r.template.text).toBe('wow');
        expect(r.template.func).toBeDefined();
    });

    it("normalizeTemplate(): template is not string but not inputted", function() {
        const r = {
            template: {}
        };
        new RuleTree().normalizeTemplate(r);
        expect(r.template.type).toBe('ejs');
        expect(r.template.text).toBeDefined();
        expect(r.template.func).toBeDefined();
    });

    it("normalizeTemplate(): template is not string and take default", function() {
        const r = {};
        const dft = {
            response: {
                templateType: 'underscore'
            }
        };
        new RuleTree("test", dft).normalizeTemplate(r);
        expect(r.template.type).toBe('underscore');
        expect(r.template.text).toBeDefined();
        expect(r.template.func).toBeDefined();
    });

    it("normalizeResponseBodyOrTemplate(): neither body nor template is defined", function() {
        try {
            new RuleTree().normalizeResponseBodyOrTemplate({ template: 'test', body: {} });
            fail('expect to raise error');
        } catch (e) {
            expect(e.type.key).toBe('MULTIPLE_RESPONSE_CONTENTS_NOT_ALLOWED');
        }
    });

    it("normalizeResponseBodyOrTemplate(): take template", function() {
        const r = {
            template: {
                type: 'mustache',
                text: 'dummy'
            }
        };
        new RuleTree().normalizeResponseBodyOrTemplate(r);
        expect(r.template.text).toBe('dummy');
        expect(r.template.type).toBe('mustache');
    });

    it("normalizeResponseBodyOrTemplate(): take body", function() {
        const r = {
            body: 'dummy body'
        };
        new RuleTree().normalizeResponseBodyOrTemplate(r);
        expect(r.body).toBe('dummy body');
    });

    it("put() & match(): matches the rule that just puts", function() {
        const t = new RuleTree();

        const rule = { path: 'abc/123', method: 'get' };
        expect(t.put(rule)).toBeTruthy();
        expect(rule.path).toBe('/abc/123');

        const matched = t.match('get', '/abc/123');
        expect(matched.length).toBe(1);
        expect(matched[0]).toEqual(rule);
    });


});