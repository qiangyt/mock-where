
const MockConfigProvider = require('../MockConfigProvider');

module.exports = class MockConfigProvider_empty extends MockConfigProvider {

    load() {
        const config = {
            domains: ['localhost','127.0.0.1']
        };
        const vhost = this.normalizeVirtualHost(config, {});
        
        const vhosts = {};
        vhosts[vhost.name] = vhost;

        const r = {};
        const port = 12345;//TODO: configurable
        r[port] = {port, vhosts};

        return r;
    }

}