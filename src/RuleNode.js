class RuleNode {

    constructor(letter, path) {
        this.letter = letter;
        this.rules = [];
        this.path = path;
        this.children = [];
    }

    put(index, rule) {
        const path = rule.path;
        const letter = path.charAt(index);
        if (letter !== this.letter) return false;

        if (path === this.path) {
            //TODO: support priority
            this.rules.push(rule);
            return true;
        }

        const nextIndex = index + 1;

        for (let child of this.children) {
            if (child.put(nextIndex, rule)) return true;
        }

        const newChildPath = path.substring(0, nextIndex + 1);
        const newChild = new RuleNode(path.charAt(nextIndex), newChildPath);
        this.children.push(newChild);

        return newChild.put(nextIndex, rule);
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

        if (path.indexOf(this.path) === 0) {
            const r = [];
            for (let candidate of this.rules) {
                if (candidate.method === method) r.push(candidate);
            }
            return r;
        }

        return [];
    }

}

module.exports = RuleNode;