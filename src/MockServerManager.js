const MockServer = require('./MockServer');
const Config = require('./Config');
const InternalError = require('./error/InternalError');

class MockServerManager {

    constructor() {
        this._all = {};
    }

    init() {
        this._loadConfig();
    }

    _buildProvider() {
        const providerConfig = Config.mockProvider = Config.mockProvider || {};
        const providerType = providerConfig.type || 'localDirectory';
        let providerClass;
        try {
            providerClass = require(`./MockConfigProvider_${providerType}`);
        } catch (e) {
            throw new InternalError(`provider ${providerType} not found`);
        }
        return new providerClass(providerClass);
    }

    _loadConfig() {
        const provider = this._buildProvider();
        const mockServerConfigs = provider.load();

        for (let mockServerName in mockServerConfigs) {
            const mockServer = this._create(mockServerName, mockServerConfigs[mockServerName]);
            this._all[mockServerName] = mockServer;
        }
    }

    _create(mockServerName, mockServerConfig) {
        this._logger.info('begin creating mock server: %s', mockServerName);

        const r = new MockServer(mockServerName, mockServerConfig);
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