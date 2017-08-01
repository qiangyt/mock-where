class RuleNode {

    constructor(letter, path) {
        this.letter = letter;
        this.rules = [];
        this.path = path;
        this.children = [];
    }

    put(path, index, letter, rule) {
        if (letter !== this.letter) return false;

        if (path === this.path) {
            this.rules.push(rule);
            return true;
        }

        const nextIndex = index + 1;
        const nextLetter = path.charAt(nextIndex);

        for (let child of this.children) {
            if (child.feed(nextIndex, nextLetter, rule)) return true;
        }

        const newChildPath = path.substring(0, nextIndex);
        const newChild = new RuleNode(nextLetter, newChildPath);
        this.children.push(newChild);

        return newChild.put(path, nextIndex, nextLetter, rule);
    }

    match(path, index, letter) {
        if (letter !== this.letter) return [];

        if (path === this.path) return this.rules;

        const nextIndex = index + 1;
        const nextLetter = path.charAt(nextIndex);

        for (let child of this.children) {
            const rulesFromChild = child.match(path, nextIndex, nextLetter);
            if (rulesFromChild.length > 0) return rulesFromChild;
        }

        return this.rules;
    }

}


class RuleTree {

    constructor() {
        this._rootNode = new RuleNode('/', '/');
    }


    normalizePath(path) {
        if ('/' === path.charAt(0)) return path;
        return '/' + path;
    }

    put(rule) {
        const path = rule.path = this.normalizePath(rule.path);
        return this._rootNode.put(path, 0, path.charAt(0), rule);
    }

    match(path) {
        path = this.normalizePath(path);
        return this._rootNode.match(path, 0, path.charAt(0));
    }

}

module.exports = RuleTree;