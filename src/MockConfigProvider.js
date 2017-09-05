const Util = require('util');

module.exports = class MockConfigProvider {

    constructor(config) {
        this._config = config || {};
    }

    /**
     * Load the configuration.
     * 
     * TODO: the structure of loaded configuration
     */
    load() {
        throw new Error('to be implemented');
    }

    /**
     * Resolve domains for the server with specified domain name
     * 
     * @param {string|string[]} domains domains that be either string or array of string. optional
     * @param {string} name the server name. be domain to return if the 'domains' argument is empty
     * @return {string[]} array of domain names
     */
    resolveDomains(domains, name) {
        if (!domains) return [name];

        if ('string' === typeof domains) return [domains];
        if (!Util.isArray(domains)) throw new Error('config domains should be either string or array of string');
        if (!domains.length) return [name];

        return domains;
    }

    /**
     * Resolve virtual host name
     * 
     * @param {string[]} domains domains
     */
    resolveVirtualHostName(domains) {
        if (domains.length === 1) return domains[0];
        return domains.join('|');
    }

    /**
     * Normalize the config of a virtual host
     * 
     * @param {object} config config of the virtual host, to normalize
     * @param {map} rules rules of the virtual host
     * @return {object} config of the virtual host, with the structure normalized to be:
     *                  {
     *                      config: <config object>
     *                      domains: <array of domain names>
     *                      name: <name of the virtual host>
     *                      rules: <rules of the virtual host>
     *                  }
     */
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