const BaseServer = require('./BaseServer');
const RuleEngine = require('./RuleEngine');
const getLogger = require('./logger');
const config = require('./config');

class MockServer extends BaseServer {

    constructor(name) {
        super();
        this._name = name;
        this._logger = getLogger(name);
    }

    init() {
        this._config = config.mockServers[this._name] || {};

        super.init();
    }

    _starting() {
        this._ruleEngine = new RuleEngine(this._name);

        this._koa.use(this._ruleEngine.mock.bind(this._ruleEngine));
    }

    putRule(rule) {
        this._ruleEngine.put(rule);
    }
}

module.exports = MockServer;