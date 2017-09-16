const RuleTreeNode = require('./RuleTreeNode');
const Template = require('./Template');
const Hook = require('./Hook');


module.exports = class RuleTree {

    constructor(name, defaultRule) {
        this.name = name || 'RuleTree';
        this._defaultRule = RuleTree.normalizeDefaultRule(defaultRule);
        this._nameIndex = 0;
        this._rootNode = new RuleTreeNode('/', '/');
    }

    static normalizeDefaultRule(defaultRule) {
        const r = defaultRule || {};

        r.path = RuleTree.normalizePath(r.path || '/');
        r.method = (r.method || '*').toLowerCase();

        const resp = r.response = r.response || {};
        resp.status = resp.status || 200;
        resp.type = resp.type || 'application/json';
        resp.latency = (!resp.latency || resp.latency < 0) ? 0 : resp.latency;
        resp.latencyFix = resp.latencyFix || -10;

        resp.body = resp.body || {};
        resp.body.template = Template.buildDefault(resp.body.template);

        return r;
    }

    static normalizePath(path) {
        if ('/' === path.charAt(0)) return path;
        return '/' + path;
    }

    normalizeRule(rule) {
        const dft = this._defaultRule;

        rule.name = rule.name || `${this.name}_${++this._nameIndex}`;
        rule.path = RuleTree.normalizePath(rule.path || dft.path);
        rule.method = (rule.method || dft.method).toLowerCase();
        rule.q = rule.q || dft.q;

        rule.response = this.normalizeRuleResponse(rule.response, rule.name);

        rule.hook = rule.hook ? new Hook(rule.hook) : null;
    }

    normalizeRuleResponse(response, ruleName) {
        const dft = this._defaultRule.response;

        const r = response || {};

        r.status = r.status || dft.status;
        r.type = r.type || dft.type;

        r.body = r.body || {};
        r.body = Template.normalizeContent(r.body, dft.body, ruleName);

        r.latency = (!r.latency || r.latency < 0) ? dft.latency : r.latency;
        r.latencyFix = r.latencyFix || dft.latencyFix;

        return r;
    }

    put(rule) {
        this.normalizeRule(rule);
        return this._rootNode.put(0, rule);
    }

    match(method, path) {
        path = RuleTree.normalizePath(path);
        return this._rootNode.match(method, path, 0);
    }

}