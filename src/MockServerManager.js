const MockServer = require('./MockServer');
const InternalError = require('qnode-error').InternalError;

module.exports = class MockServerManager {

    constructor() {
        this._all = {};
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
        //this._all['test'] = this._create('test', { server: { port: 12345 } });

        //const provider = this._buildProvider();
        const defs = provider.load();
        const all = this._all;

        for (let name in defs) {
            if (all[name]) throw new Error(`duplicated mocker server: ${name}`);

            const def = defs[name];
            const mockServer = this._create(name, def);
            all[name] = mockServer;
        }
    }

    start() {
        const log = this._logger;
        log.info('starting mock servers');

        const all = this._all;
        for (let name in all) {
            log.info('starting mock server: %s', name);

            all[name].start();

            log.info('created mock server: %s', name);
        }
        log.info('started all mock servers');
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