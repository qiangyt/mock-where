const MockServer = require('./MockServer');
const InternalError = require('qnode-error').InternalError;

module.exports = class MockServerManager {

    constructor() {
        this._allByPort = {};
    }

    init() {
        this._loadMockServers();
    }

    static resolveProviderClass(name, cfg) {
        let type;
        if (cfg && cfg.type) {
            type = cfg.type;
        } else {
            type = name || 'dir';
        }

        try {
            /* eslint global-require: "off" */
            return require(`./provider/MockConfigProvider_${type}`);
        } catch (e) {
            throw new InternalError(`failed to load provider: ${type}`);
        }
    }

    _buildProvider(name, providerConfig) {
        const clazz = MockServerManager.resolveProviderClass(name, providerConfig);
        return new clazz(providerConfig);
    }

    _resolveDefaultProviders() {
        return {
            dir: {
                type: 'dir'
            },
            empty: {}
        };
    }

    _buildProviders() {
        const providerConfigs = this._config.providers = this._config.providers || this._resolveDefaultProviders();

        const r = [];
        for (let name in providerConfigs) {
            const providerConfig = providerConfigs[name];
            r.push(this._buildProvider(name, providerConfig));
        }
        return r;
    }

    _loadMockServers() {
        const providers = this._buildProviders();
        providers.forEach(provider => this._loadMockServerWithProvider(provider));
    }

    _loadMockServerWithProvider(provider) {
        const vhostsConfigByPort = provider.load();
        const allByPort = this._allByPort;

        for (let port in vhostsConfigByPort) {
            if (allByPort[port]) throw new Error(`duplicated mocker server port: ${port}`);

            const vhostsConfig = vhostsConfigByPort[port];
            const mockServer = this._create(vhostsConfig);
            allByPort[port] = mockServer;
        }
    }

    start() {
        const log = this._logger;
        log.info('starting mock servers');

        const allByPort = this._allByPort;
        for (let port in allByPort) {
            log.debug('starting mock server on port: %i', port);

            allByPort[port].start();

            log.debug('created mock server on port: %i', port);
        }
        log.info('started mock servers');
    }

    _create(serverConfig) {
        this._logger.debug('begin creating mock server on port: %i', serverConfig.port);

        const r = new MockServer(serverConfig);
        Beans.render(r);
        r.init();

        this._logger.debug('created mock server on port: %i', serverConfig.port);

        return r;
    }

    get(port) {
        return this._allByPort[port];
    }

}