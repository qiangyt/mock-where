const SRC = '../src';
const RuleNode = require(`${SRC}/RuleNode`);

function buildRuleTree() {
    const root = new RuleNode('/', '/');

    root.put(0, { path: '/', name: 'root', method: 'get' });
    root.put(0, { path: '/1', name: '1', method: 'get' });
    root.put(0, { path: '/1/A', name: '1_A', method: 'get' });
    root.put(0, { path: '/1/B', name: '1_B1', method: 'get' });
    root.put(0, { path: '/1/B', name: '1_B2', method: 'get' });
    root.put(0, { path: '/2/A/a', name: '2_A_a1', method: 'get' });
    root.put(0, { path: '/2/A/a', name: '2_A_a2', method: 'post' });

    return root;
}

describe("RuleNode test suite: ", function() {
    it("put(): put the rule on this node exactly", function() {
        const n = new RuleNode('/', '/');
        const rule = { A: 'A', path: '/' };

        expect(n.put(0, rule)).toBeTruthy();
        expect(n.children.length).toBe(0);
        expect(n.rules.length).toBe(1);
        expect(n.rules[0]).toEqual(rule);
    });

    it("put(): put the rule on new child node", function() {
        const n = new RuleNode('/', '/');
        const rule = { A: 'A', path: '/1' };

        expect(n.put(0, rule)).toBeTruthy();
        expect(n.children.length).toBe(1);
        expect(n.rules.length).toBe(0);

        const child = n.children[0];
        expect(child.rules.length).toBe(1);
        expect(child.rules[0]).toEqual(rule);
    });

    it("put(): put the rule on existing child node", function() {
        const n = new RuleNode('/', '/');
        const rule1 = { A: 'A', path: '/1' };
        n.put(0, rule1);

        const rule2 = { B: 'B', path: '/1' };

        expect(n.put(0, rule2)).toBeTruthy();
        expect(n.children.length).toBe(1);
        expect(n.rules.length).toBe(0);

        const child = n.children[0];
        expect(child.rules.length).toBe(2);
        expect(child.rules[1]).toEqual(rule2);
    });

    it("put(): put the rule on secondary existing child node", function() {
        const n = new RuleNode('/', '/');

        const rule1 = { A: 'A', path: '/1' };
        n.put(0, rule1);

        const rule2 = { B: 'B', path: '/2' };
        n.put(0, rule2);

        const rule3 = { C: 'C', path: '/2' };

        expect(n.put(0, rule3)).toBeTruthy();
        expect(n.children.length).toBe(2);
        expect(n.rules.length).toBe(0);

        const child1 = n.children[0];
        expect(child1.rules.length).toBe(1);
        expect(child1.rules[0]).not.toEqual(rule3);

        const child2 = n.children[1];
        expect(child2.rules.length).toBe(2);
        expect(child2.rules[1]).toEqual(rule3);
    });

    it("put(): put rule with different path letter", function() {
        const n = new RuleNode('/', '/');
        const rule = { A: 'A', path: 'a' };

        expect(n.put(0, rule)).toBeFalsy();
    });

    it("match(): match rule with root node", function() {
        const root = buildRuleTree();

        const matched = root.match('get', '/', 0);

        expect(matched.length).toBe(1);
        expect(matched[0].name).toBe('root');
    });

    it("match(): match rule with 2 child node", function() {
        const root = buildRuleTree();

        const matched = root.match('get', '/1/B', 0);

        expect(matched.length).toBe(2);
        expect(matched[0].name).toBe('1_B1');
        expect(matched[1].name).toBe('1_B2');
    });

    it("match(): no matched rule due to different method", function() {
        const root = buildRuleTree();

        const matched = root.match('post', '/1/B', 0);

        expect(matched.length).toBe(0);
    });

    it("match(): no matched rule due to different path", function() {
        const n = new RuleNode('/', '/X');
        const rule = { A: 'A', method: 'get', path: '/X' };
        n.put(0, rule);

        const matched = n.match('get', '/Y', 0);

        expect(matched.length).toBe(0);
    });

    it("match(): match rule with path as prefix", function() {
        const root = buildRuleTree();

        const matched = root.match('get', '/1/BC', 0);

        expect(matched.length).toBe(2);
        expect(matched[0].name).toBe('1_B1');
        expect(matched[1].name).toBe('1_B2');
    });
});