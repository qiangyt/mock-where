const RuleEngine = require('./RuleEngine');
const vm = require('vm');


module.exports = class RuleEngineJs extends RuleEngine {

    prepareRule(rule) {
        rule.statement = 'matched=(' + (rule.q || 'true') + ')';
        rule.script = new vm.Script(rule.statement);
    }

    /**
     * Find matched rule.
     * 
     * @param {object} req 
     */
    _filterRule(req, candidateRules) {
        const sandbox = this._buildRequestData(req);
        const contextifiedSandbox = new vm.createContext(sandbox);

        for (const rule of candidateRules) {
            const script = rule.script;
            this._logger.debug(`executing: ${script}`);

            script.runInContext(contextifiedSandbox);

            if (sandbox.matched) {
                this._logger.info('found matched rule: %s', rule);
                return rule;
            }
        }

        return null;
    }


}