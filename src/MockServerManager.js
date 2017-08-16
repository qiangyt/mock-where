const MockServer = require('./MockServer');
const InternalError = require('qnode-error').InternalError;

class MockServerManager {

    constructor() {
        this._all = {};
    }

    init() {
        this._loadMockServers();
    }

    static resolveProviderClass(cfg) {
        const type = cfg.type || 'dir';
        try {
            /* eslint global-require: "off" */
            return require(`./provider/MockConfigProvider_${type}`);
        } catch (e) {
            throw new InternalError(`provider ${type} not found`);
        }
    }

    _buildProvider() {
        const cfg = this._config.provider = this._config.provider || {};
        const clazz = MockServerManager.resolveProviderClass(cfg);
        return new clazz(cfg);
    }

    _loadMockServers() {
        const provider = this._buildProvider();
        const defs = provider.load();

        for (let name in defs) {
            const def = defs[name];
            const mockServer = this._create(name, def);
            this._all[name] = mockServer;
        }
    }

    _create(name, definition) {
        this._logger.info('begin creating mock server: %s', name);

        const r = new MockServer(name, definition);
        r.init();

        this._logger.info('created mock server: %s', name);

        return r;
    }

    get(mockServerName) {
        return this._all[mockServerName];
    }

}

module.exports = MockServerManager;