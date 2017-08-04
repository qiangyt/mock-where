const BaseServer = require('./BaseServer');
const RuleEngine = require('./RuleEngine');
const getLogger = require('./logger');

class MockServer extends BaseServer {

    constructor(name, definition) {
        super();
        this._name = name;
        this._logger = getLogger(name);
        this._definition = definition;
        this._config = definition.config;
    }

    _starting() {
        this._ruleEngine = new RuleEngine(this._name, this._definition);

        this._koa.use(this._ruleEngine.mock.bind(this._ruleEngine));
    }

    putRule(rule) {
        this._ruleEngine.put(rule);
    }
}

module.exports = MockServer;