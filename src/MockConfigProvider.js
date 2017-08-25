const Util = require('util');

module.exports = class MockConfigProvider {

    constructor(config) {
        this._config = config || {};
    }

    load() {
        throw new Error('to be implemented');
    }

    resolveDomains(domains, name) {
        if (!domains) return [name];

        if ('string' === typeof domains) return [domains];
        if (!Util.isArray(domains)) throw new Error('config domains should be either string or array of string');
        if (!domains.length) return [name];

        return domains;
    }

    resolveVirtualHostName(domains) {
        if (domains.length === 1) return domains[0];
        return domains.join('|');
    }

    normalizeVirtualHost(config, rules) {
        const domains = this.resolveDomains(config.domains, config.name);

        return {
            config,
            domains,
            name: this.resolveVirtualHostName(domains),
            rules
        };
    }

}