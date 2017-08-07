class RuleNode {

    constructor(letter, path) {
        this.letter = letter;
        this.rules = [];
        this.path = path;
        this.children = [];
    }

    put(path, index, rule) {
        const letter = path.charAt(index);
        if (letter !== this.letter) return false;

        if (path === this.path) {
            //TODO: support priority
            this.rules.push(rule);
            return true;
        }

        const nextIndex = index + 1;
        const newChildPath = path.substring(0, nextIndex + 1);

        for (let child of this.children) {
            if (child.put(newChildPath, nextIndex, rule)) return true;
        }

        const newChild = new RuleNode(path.charAt(nextIndex), newChildPath);
        this.children.push(newChild);

        return newChild.put(path, nextIndex, rule);
    }

    match(method, path, index) {
        const letter = path.charAt(index);
        if (letter !== this.letter) return [];

        if (path === this.path) {
            const r = [];
            for (let candidate of this.rules) {
                if (candidate.method === method) r.push(candidate);
            }
            return r;
        }

        const nextIndex = index + 1;

        for (let child of this.children) {
            const rulesFromChild = child.match(method, path, nextIndex);
            if (rulesFromChild.length > 0) return rulesFromChild;
        }

        return [];
    }

}

module.exports = RuleNode;