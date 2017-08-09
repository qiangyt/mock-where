const RuleNode = require('./RuleNode');

class RuleTree {

    constructor() {
        this._rootNode = new RuleNode('/', '/');
    }


    static normalizePath(path) {
        if ('/' === path.charAt(0)) return path;
        return '/' + path;
    }

    put(rule) {
        const path = rule.path = RuleTree.normalizePath(rule.path);
        return this._rootNode.put(path, 0, rule);
    }

    match(method, path) {
        path = RuleTree.normalizePath(path);
        return this._rootNode.match(method, path, 0);
    }

}

module.exports = RuleTree;