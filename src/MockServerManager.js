const MockServer = require('./MockServer');
const config = require('./config');


class MockServerManager {

    constructor() {
        this._all = {};
    }

    init() {
        if (!config.mockServers) throw new Error('config.mockServers is not configured');

        for (let mockServerName in config.mockServers) {
            const mockServerConfig = config.mockServers[mockServerName];
            const mockServer = this._create(mockServerName, mockServerConfig);
            this._all[mockServerName] = mockServer;
        }
    }

    _create(mockServerName, mockServerConfig) {
        this._logger.info('begin creating mock server: %s', mockServerName);

        const r = new MockServer(mockServerName);
        r.init();

        this._logger.info('created mock server: %s', mockServerName);

        return r;
    }

    get(mockServerName) {
        return this._all[mockServerName];
    }

    load(mockServerName) {
        const r = this.get(mockServerName);
        if (!r) throw new Error('no mock server found with name: %s', mockServerName);
        return r;
    }

}

module.exports = MockServerManager;