const RuleNode = require('../src/RuleNode');

describe("RuleNode test suite: ", function() {
    it("put the rule on this node exactly", function() {
        const n = new RuleNode('/', '/');
        const rule = {};

        expect(n.put('/', 0, rule)).toBe(true);
        expect(n.children.length).toBe(0);
        expect(n.rules.length).toBe(1);
        expect(n.rules[0]).toEqual(rule);
    });

    it("put the rule on child node", function() {
        const n = new RuleNode('/', '/');
        const rule = {};

        expect(n.put('/1', 0, rule)).toBe(true);
        expect(n.children.length).toBe(1);
        expect(n.rules.length).toBe(0);

        const child = n.children[0];
        expect(child.rules.length).toBe(1);
        expect(child.rules[0]).toEqual(rule);
    });
});