const BaseServer = require('./BaseServer');
const RuleEngine = require('./RuleEngine');


class MockServer extends BaseServer {

    starting() {
        this.koa.use(RuleEngine.instance.mock.bind(RuleEngine.instance));
    }


}

module.exports = MockServer;