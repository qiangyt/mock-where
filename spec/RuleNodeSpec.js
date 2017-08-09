const SRC = '../src';
const RuleNode = require(`${SRC}/RuleNode`);

function buildRuleTree() {
    const root = new RuleNode('/', '/');

    root.put('/', 0, { name: 'root', method: 'get' });
    root.put('/1', 0, { name: '1', method: 'get' });
    root.put('/1/A', 0, { name: '1_A', method: 'get' });
    root.put('/1/B', 0, { name: '1_B1', method: 'get' });
    root.put('/1/B', 0, { name: '1_B2', method: 'get' });
    root.put('/2/A/a', 0, { name: '2_A_a1', method: 'get' });
    root.put('/2/A/a', 0, { name: '2_A_a2', method: 'post' });

    return root;
}

describe("RuleNode test suite: ", function() {
    it("put the rule on this node exactly", function() {
        const n = new RuleNode('/', '/');
        const rule = { A: 'A' };

        expect(n.put('/', 0, rule)).toBe(true);
        expect(n.children.length).toBe(0);
        expect(n.rules.length).toBe(1);
        expect(n.rules[0]).toEqual(rule);
    });

    it("put the rule on new child node", function() {
        const n = new RuleNode('/', '/');
        const rule = { A: 'A' };

        expect(n.put('/1', 0, rule)).toBe(true);
        expect(n.children.length).toBe(1);
        expect(n.rules.length).toBe(0);

        const child = n.children[0];
        expect(child.rules.length).toBe(1);
        expect(child.rules[0]).toEqual(rule);
    });

    it("put the rule on existing child node", function() {
        const n = new RuleNode('/', '/');
        const rule1 = { A: 'A' };
        n.put('/1', 0, rule1);

        const rule2 = { B: 'B' };

        expect(n.put('/1', 0, rule2)).toBe(true);
        expect(n.children.length).toBe(1);
        expect(n.rules.length).toBe(0);

        const child = n.children[0];
        expect(child.rules.length).toBe(2);
        expect(child.rules[1]).toEqual(rule2);
    });

    it("put the rule on secondary existing child node", function() {
        const n = new RuleNode('/', '/');

        const rule1 = { A: 'A' };
        n.put('/1', 0, rule1);

        const rule2 = { B: 'B' };
        n.put('/2', 0, rule2);

        const rule3 = { C: 'C' };

        expect(n.put('/2', 0, rule3)).toBe(true);
        expect(n.children.length).toBe(2);
        expect(n.rules.length).toBe(0);

        const child1 = n.children[0];
        expect(child1.rules.length).toBe(1);
        expect(child1.rules[0]).not.toEqual(rule3);

        const child2 = n.children[1];
        expect(child2.rules.length).toBe(2);
        expect(child2.rules[1]).toEqual(rule3);
    });

    it("put rule with different path letter", function() {
        const n = new RuleNode('/', '/');
        const rule = { A: 'A' };

        expect(n.put('a', 0, rule)).toBe(false);
    });

    it("match rule with root node", function() {
        const root = buildRuleTree();

        const matched = root.match('get', '/', 0);

        expect(matched.length).toBe(1);
        expect(matched[0].name).toBe('root');
    });

    it("match rule with 2 child node", function() {
        const root = buildRuleTree();

        const matched = root.match('get', '/1/B', 0);

        expect(matched.length).toBe(2);
        expect(matched[0].name).toBe('1_B1');
        expect(matched[1].name).toBe('1_B2');
    });

    it("no matched rule due to different method", function() {
        const root = buildRuleTree();

        const matched = root.match('post', '/1/B', 0);

        expect(matched.length).toBe(0);
    });

    it("match rule with path as prefix", function() {
        const root = buildRuleTree();

        const matched = root.match('get', '/1/BC', 0);

        expect(matched.length).toBe(2);
        expect(matched[0].name).toBe('1_B1');
        expect(matched[1].name).toBe('1_B2');
    });
});