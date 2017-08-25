const MockConfigProvider = require('../MockConfigProvider');

module.exports = class MockConfigProvider_empty extends MockConfigProvider {

    load() {
        const config = {
            domains: ['localhost', '127.0.0.1']
        };
        const vhost = this.normalizeVirtualHost(config, {});

        const vhosts = {};
        vhosts[vhost.name] = vhost;

        const r = {};
        const port = this._config.port || 8000;
        r[port] = { port, vhosts };

        return r;
    }

}