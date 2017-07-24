const BaseServer = require('./BaseServer');
const RuleRepository = require('./RuleRepository');


class MockServer extends BaseServer {

    starting() {
        this.koa.use(RuleRepository.instance.mock.bind(RuleRepository.instance));
    }


}

module.exports = MockServer;