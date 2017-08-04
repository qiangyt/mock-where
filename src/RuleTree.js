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
            //TODO: support priority
            this.rules.push(rule);
            return true;
        }

        const nextIndex = index + 1;
        const nextLetter = path.charAt(nextIndex);
        const newChildPath = path.substring(0, nextIndex + 1);

        for (let child of this.children) {
            if (child.put(newChildPath, nextIndex, nextLetter, rule)) return true;
        }

        const newChild = new RuleNode(nextLetter, newChildPath);
        this.children.push(newChild);

        return newChild.put(path, nextIndex, nextLetter, rule);
    }

    match(method, path, index, letter) {
        if (letter !== this.letter) return [];

        if (path === this.path) {
            const r = [];
            for (let candidate of this.rules) {
                if (candidate.method === method) r.push(candidate);
            }
            return r;
        }

        const nextIndex = index + 1;
        const nextLetter = path.charAt(nextIndex);

        for (let child of this.children) {
            const rulesFromChild = child.match(method, path, nextIndex, nextLetter);
            if (rulesFromChild.length > 0) return rulesFromChild;
        }

        return [];
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

    match(method, path) {
        path = this.normalizePath(path);
        return this._rootNode.match(method, path, 0, path.charAt(0));
    }

}

module.exports = RuleTree;