const RuleNode = require('./RuleNode');
const resolveTemplateFunc = require('./Template');
const RequestError = require('./error/RequestError');

class RuleTree {

    constructor(name, defaultRule) {
        this.name = name || 'RuleTree';
        this._defaultRule = RuleTree.normalizeDefaultRule(defaultRule);
        this._nameIndex = 0;
        this._rootNode = new RuleNode('/', '/');
    }

    static normalizeDefaultRule(defaultRule) {
        const r = defaultRule || {};

        r.path = RuleTree.normalizePath(r.path || '/');
        r.method = (r.method || 'get').toLowerCase();

        const resp = r.response = r.response || {};
        resp.status = resp.status || 200;
        resp.type = resp.type || 'application/json';
        resp.sleep = (!resp.sleep || resp.sleep < 0) ? 0 : resp.sleep;
        resp.sleepFix = resp.sleepFix || -10;
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

        return r;
    }

    normalizeRuleResponse(response) {
        const dft = this._defaultRule.response;

        const r = response || {};

        r.status = r.status || dft.status;
        r.type = r.type || dft.type;

        this.normalizeResponseBodyOrTemplate(r);

        r.sleep = (!r.sleep || r.sleep < 0) ? dft.sleep : r.sleep;
        r.sleepFix = r.sleepFix || dft.sleepFix;

        return r;
    }

    normalizeResponseBodyOrTemplate(response) {
        if (response.template && response.body) throw new RequestError('MULTIPLE_RESPONSE_CONTENTS_NOT_ALLOWED');

        if (response.template) {
            this.normalizeTemplate(response);
        } else {
            response.body = response.body || 'no response body specified';
        }
    }

    normalizeTemplate(response) {
        const template = response.template;

        let type;
        let text;

        if (!template) {
            type = this._defaultRule.response.templateType;
            text = 'template not specified';
        } else if (typeof template === 'string') {
            type = 'ejs';
            text = template;
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

module.exports = RuleTree;