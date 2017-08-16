const BaseServer = require('./BaseServer');
const RuleEngine = require('./RuleEngine');
const Logger = require('json-log4js');

class MockServer extends BaseServer {

    constructor(name, definition) {
        super();
        this._name = name;
        this._logger = new Logger(name);
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