const BaseServer = require('./BaseServer');
const RuleEngine = require('./RuleEngine');
const Logger = require('qnode-log');

module.exports = class MockServer extends BaseServer {

    constructor(name, definition) {
        super();
        this._name = name;
        this._logger = new Logger(name);
        this._definition = definition;
        this._config = definition.server;
    }

    prepare() {
        const re = this._ruleEngine = new RuleEngine(this._name, this._definition);

        this._koa.use(re.mock.bind(re));
    }

    putRule(rule) {
        this._ruleEngine.put(rule);
    }
}