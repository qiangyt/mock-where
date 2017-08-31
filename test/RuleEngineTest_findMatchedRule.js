/* eslint no-undef: "off" */
const Beans = require('qnode-beans');
const RequestError = require('qnode-error').RequestError;

const SRC = '../src';
const RuleEngine = require(`${SRC}/RuleEngine`);

function buildEngine(name) {
    const beans = new Beans();
    const r = new RuleEngine();
    beans.renderThenInitBean(r, name);
    return r;
}

describe("RuleEngine test suite: ", function() {

    it("_findMatchedRule(): the rule db should be rollbacked always", function() {
        const re = buildEngine('test');
        const req = {
            path: '/ab',
            url: 'https://host/ab',
            charset: 'utf-8',
            protocol: 'https',
            ip: '::1'
        };

        const ruleDb = re._ruleDb;

        let rows = ruleDb.exec('select count(*) c from request');
        expect(rows[0].c).toBe(0);

        re._findMatchedRule(req);

        rows = ruleDb.exec('select count(*) c from request');
        expect(rows[0].c).toBe(0);
    });

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

        re.put({ path: '/ab', q: 'protocol="http"' });
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

        const rule = { path: '/ab', q: 'protocol="https"' };
        re.put(rule);

        const matched = re._findMatchedRule(req);
        expect(matched).toEqual(rule);
    });

});