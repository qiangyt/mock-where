const RuleTreeNode = require('./RuleTreeNode');
const resolveTemplateFunc = require('./Template');
const RequestError = require('qnode-error').RequestError;
const Callback = require('./Callback');


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
        resp.templateType = resp.templateType || 'ejs';

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
        r.statement = 'select * from request' + (r.q ? ` where ${r.q}` : '');

        r.response = this.normalizeRuleResponse(r.response);

        r.callback = r.callback ? new Callback(r.callback) : null;

        return r;
    }

    normalizeRuleResponse(response) {
        const dft = this._defaultRule.response;

        const r = response || {};

        r.status = r.status || dft.status;
        r.type = r.type || dft.type;

        this.normalizeResponseBodyOrTemplate(r);

        r.delay = (!r.delay || r.delay < 0) ? dft.delay : r.delay;
        r.delayFix = r.delayFix || dft.delayFix;

        return r;
    }

    normalizeResponseBodyOrTemplate(response) {
        if (response.template && response.body) {
            throw new RequestError('MULTIPLE_RESPONSE_CONTENTS_NOT_ALLOWED');
        }

        if (response.template !== undefined && response.template !== null) {
            this.normalizeTemplate(response);
        } else {
            response.body = JSON.stringify(response.body || 'no response body specified');
        }
    }

    normalizeTemplate(response) {
        const template = response.template;

        let type;
        let text;

        if (template === undefined || template === null) {
            type = this._defaultRule.response.templateType;
            text = 'template not specified';
        } else if (typeof template !== 'object') {
            type = 'ejs';
            text = '' + template;
        } else {
            type = template.type || this._defaultRule.response.templateType;
            text = template.text || 'template text not specified';
        }

        response.template = {
            type,
            text,
            func: resolveTemplateFunc(type, text)
        };
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