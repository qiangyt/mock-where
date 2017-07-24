const BaseServer = require('./BaseServer');
const beans = require('./beans');


class MockServer extends BaseServer {

    _starting() {
        this._ruleEngine = beans.load('ruleEngine');
        this._koa.use(this._ruleEngine.mock.bind(this._ruleEngine));
    }


}

module.exports = MockServer;