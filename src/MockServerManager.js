const MockServer = require('./MockServer');
const _ = require('underscore');

/**
 * The mock server manager manages multiple mock servers, which mapped by server
 * port. It takes responsibility of resolving providers and create mock servers
 * from providers.
 * 
 */
module.exports = class MockServerManager {

    constructor() {
        this._allByPort = {};
    }

    init() {
        this._loadMockServers();
    }

    /**
     * resolve provider class name.
     * 
     * @param {string} name 
     * @param {object} cfg 
     */
    resolveProviderClassName(name, cfg) {
        let type;
        if (cfg && cfg.type) {
            type = cfg.type;
        } else {
            type = name || 'dir';
        }
        return `MockConfigProvider_${type}`;
    }

    /**
     * resolve provider class. the provider js should be located under
     * ./provider folder and take class name as js file name.
     * 
     * @param {string} className 
     */
    resolveProviderClass(className) {
        try {
            /* eslint global-require: "off" */
            return require(`./provider/${className}`);
        } catch (e) {
            this._logger.error(e);
            throw new Error(`failed to load provider: ${className}`);
        }
    }

    _buildProvider(name, providerConfig) {
        const className = this.resolveProviderClassName(name, providerConfig);
        const clazz = this.resolveProviderClass(className);
        const r = new clazz(providerConfig);
        this._beans.renderThenInitBean(r, className);
        return r;
    }

    /**
     * there're 2 default providers: dir and empty
     */
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

        if (_.size(this._allByPort) !== 1) {
            this.defaultPort = undefined;
        }
    }

    /**
     * load mock servers using configuration from specified provider.
     * 
     * The resulted this._allByPort holds map of mock servers, with server port
     * as key.
     * 
     * If there's only 1 mock server, then it's port is the default port
     * 
     * @param {object} provider 
     */
    _loadMockServerWithProvider(provider) {
        const vhostsConfigByPort = provider.load();
        const allByPort = this._allByPort;

        for (let port in vhostsConfigByPort) {
            if (allByPort[port]) throw new Error(`duplicated mocker server port: ${port}`);

            const vhostsConfig = vhostsConfigByPort[port];
            const mockServer = this._create(vhostsConfig);
            allByPort[port] = mockServer;

            if (!this.defaultPort) {
                this.defaultPort = parseInt(port, 10);
            }
        }
    }

    /**
     * start all mock servers holded in this._allByPort
     */
    async start() {
        const log = this._logger;
        log.info('starting mock servers');

        const allByPort = this._allByPort;
        for (let port in allByPort) {
            log.debug('starting mock server on port: %i', port);

            await allByPort[port].start();

            log.debug('created mock server on port: %i', port);
        }

        this.started = true;

        log.info('started mock servers\n');
    }

    /**
     * create a new mocker server, as a bean
     * 
     * @param {object} serverConfig 
     */
    _create(serverConfig) {
        this._logger.debug('creating mock server on port: %i', serverConfig.port);

        const r = new MockServer(serverConfig);
        this._beans.renderThenInitBean(r);

        this._logger.debug('created mock server on port: %i', serverConfig.port);

        return r;
    }

    get(port) {
        return this._allByPort[port];
    }

}
