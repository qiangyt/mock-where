/* eslint no-undef: "off" */

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
        expect(r.method).toBe('*');

        const resp = r.response;
        expect(resp.status).toBe(200);
        expect(resp.type).toBe('application/json');
        expect(resp.delay).toBe(0);
        expect(resp.delayFix).toBe(-10);
        expect(resp.bodyTemplate.type).toBe('ejs');
    });

    it("normalizeDefaultRule(): default rule is specified in detail", function() {
        const dr = {
            path: '/p',
            method: 'POST',
            response: {
                status: 400,
                type: 'application/xml',
                delay: 123,
                delayFix: -456,
                template: {
                    type: 'handlebars'
                }
            }
        };
        const r = RuleTree.normalizeDefaultRule(dr);

        expect(r.path).toBe('/p');
        expect(r.method).toBe('post');

        const resp = r.response;
        expect(resp.status).toBe(400);
        expect(resp.type).toBe('application/xml');
        expect(resp.delay).toBe(123);
        expect(resp.delayFix).toBe(-456);
        expect(resp.template.type).toBe('handlebars');
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
    });

    it("normalizeRuleResponse(): take default", function() {
        const dr = {
            response: {
                status: 400,
                type: 'application/xml',
                delay: 123,
                delayFix: -456
            }
        };

        const r = new RuleTree('test', dr).normalizeRuleResponse();

        expect(r.status).toBe(400);
        expect(r.type).toBe('application/xml');
        expect(r.delay).toBe(123);
        expect(r.delayFix).toBe(-456);
    });

    it("normalizeRuleResponse(): take input", function() {
        const dr = {
            response: {
                status: 400,
                type: 'application/xml',
                delay: 123,
                delayFix: -456
            }
        };
        const input = {
            status: 200,
            type: 'text/html',
            delay: 456,
            delayFix: -123
        };

        const r = new RuleTree('test', dr).normalizeRuleResponse(input);

        expect(r.status).toBe(200);
        expect(r.type).toBe('text/html');
        expect(r.delay).toBe(456);
        expect(r.delayFix).toBe(-123);
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