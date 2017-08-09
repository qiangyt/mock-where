const SRC = '../src';
const RuleTree = require(`${SRC}/RuleTree`);

describe("RuleTree test suite: ", function() {
    it("has a root node", function() {
        const t = new RuleTree();

        expect(t._rootNode.path).toBe('/');
    });

    it("path without slash prefix should be normalized to be prefixed with slash", function() {
        expect(RuleTree.normalizePath('xyz')).toBe('/xyz');
    });

    it("path with slash prefix should keep as it is", function() {
        expect(RuleTree.normalizePath('/xyz')).toEqual('/xyz');
    });

    it("matches the rule that just puts", function() {
        const t = new RuleTree();

        const rule = { path: 'abc/123', method: 'get' };
        expect(t.put(rule)).toBeTruthy();
        expect(rule.path).toBe('/abc/123');

        const matched = t.match('get', '/abc/123');
        expect(matched.length).toBe(1);
        expect(matched[0]).toEqual(rule);
    });


});