const RuleTreeNode = require('./RuleTreeNode');
const Template = require('./Template');
const RequestError = require('qnode-error').RequestError;
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
        resp.delay = (!resp.delay || resp.delay < 0) ? 0 : resp.delay;
        resp.delayFix = resp.delayFix || -10;

        resp.bodyTemplate = Template.buildDefault(resp.template);

        return r;
    }

    static normalizePath(path) {
        if ('/' === path.charAt(0)) return path;
        return '/' + path;
    }

    normalizeRule(rule) {
        const r = rule || {};
        const dft = this._defaultRule;

        r.name = r.name || `${this.name}_${++this._nameIndex}`;
        r.path = RuleTree.normalizePath(r.path || dft.path);
        r.method = (r.method || dft.method).toLowerCase();
        r.q = r.q || dft.q;

        r.response = this.normalizeRuleResponse(r.response, r.name);

        r.hook = r.hook ? new Hook(r.hook) : null;

        return r;
    }

    normalizeRuleResponse(response, ruleName) {
        const dft = this._defaultRule.response;

        const r = response || {};

        r.status = r.status || dft.status;
        r.type = r.type || dft.type;

        this.normalizeResponseBodyOrTemplate(r, ruleName);

        r.delay = (!r.delay || r.delay < 0) ? dft.delay : r.delay;
        r.delayFix = r.delayFix || dft.delayFix;

        return r;
    }

    normalizeResponseBodyOrTemplate(response, ruleName) {
        const template = response.bodyTemplate;

        if (template && response.body) {
            throw new RequestError('MULTIPLE_RESPONSE_CONTENTS_NOT_ALLOWED', ruleName);
        }

        if (template !== undefined && template !== null) {
            response.bodyTemplate = this.normalizeTemplate(response, ruleName);
        } else {
            response.body = JSON.stringify(response.body || 'no response body specified');
        }
    }

    normalizeTemplate(response, ruleName) {
        const template = response.bodyTemplate;
        const deftTemplate = this._defaultRule.response.bodyTemplate;

        return Template.normalize(template, ruleName, deftTemplate);
    }

    put(rule) {
        rule = this.normalizeRule(rule);
        return this._rootNode.put(0, rule);
    }

    match(method, path) {
        path = RuleTree.normalizePath(path);
        return this._rootNode.match(method, path, 0);
    }

}