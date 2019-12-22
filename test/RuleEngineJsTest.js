/* eslint no-undef: "off" */
const Beans = require('qnode-beans').Beans;
const RequestError = require('qnode-error').RequestError;

const SRC = '../src';
const RuleEngineJs = require(`${SRC}/RuleEngineJs`);

function buildEngine(name) {
    const beans = new Beans();
    const r = new RuleEngineJs('', { record: false });
    beans.renderThenInitBean(r, name);
    return r;
}

describe("RuleEngineJs test suite: ", function() {

    it("_findMatchedRule() & loadMatchedRule(): no matched rules from rule tree", function() {
        const re = buildEngine('test');
        const req = {
            path: '/ab',
            method: 'get',
            url: 'https://host/ab',
            charset: 'utf-8',
            protocol: 'https',
            ip: '::1'
        };

        const matched = re._findMatchedRule(req);
        expect(matched).toBeNull();

        try {
            re.loadMatchedRule(req);
            failhere();
        } catch (e) {
            expect(e instanceof RequestError).toBeTruthy();
            expect(e.type.key).toBe('NO_RULE_MATCHES');
        }
    });

    it("_findMatchedRule(): have matched rules from rule tree, but filtered by rule db", function() {
        const re = buildEngine('test');
        const req = {
            path: '/ab',
            method: 'get',
            url: 'https://host/ab',
            charset: 'utf-8',
            protocol: 'https',
            ip: '::1'
        };

        re.put({ path: '/ab', q: 'protocol==="http"' });
        expect(re._ruleTree.match(req.method, req.path).length).toBe(1);

        const matched = re._findMatchedRule(req);
        expect(matched).toBeNull();
    });

    it("_findMatchedRule(): got matched rules", function() {
        const re = buildEngine('test');
        const req = {
            path: '/ab',
            method: 'get',
            url: 'https://host/ab',
            charset: 'utf-8',
            protocol: 'https',
            ip: '::1'
        };

        const rule = { path: '/ab', q: 'protocol==="https"' };
        re.put(rule);

        const matched = re._findMatchedRule(req);
        expect(matched).toEqual(rule);
    });

    it("_findMatchedRule(): no q", function() {
        const re = buildEngine('test');
        const req = {
            path: '/ab',
            method: 'get',
            url: 'https://host/ab',
            charset: 'utf-8',
            protocol: 'https',
            ip: '::1'
        };

        const rule = { path: '/ab' };
        re.put(rule);

        const matched = re._findMatchedRule(req);
        expect(matched).toEqual(rule);
    });


    it("prepareRule(): take specific statement", function() {
        const re = buildEngine('test');
        const rule = { q: '1===1' };
        re.prepareRule(rule);
        expect(rule.statement).toBe('matched=(1===1)');
        expect(rule.script).not.toBeNull();
    });


    it("prepareRule(): take default statement", function() {
        const re = buildEngine('test');
        const rule = {};
        re.prepareRule(rule);
        expect(rule.statement).toBe('matched=(true)');
        expect(rule.script).not.toBeNull();
    });

});
