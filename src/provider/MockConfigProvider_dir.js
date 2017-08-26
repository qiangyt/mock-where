const Path = require('path');
const Fs = require('fs');
const Logger = require('qnode-log');
const QNodeConfig = require('qnode-config');
const MockConfigProvider = require('../MockConfigProvider');

const _CONFIG_FILE_NAME = 'mw';


module.exports = class MockConfigProvider_dir extends MockConfigProvider {

    resolveMockDir() {
        let r = this._config.dir;
        if (!r) r = Path.join(Path.dirname(require.main.filename), '../mock');
        return r;
    }

    load() {

        let dir = this.resolveMockDir();
        try {
            Fs.statSync(dir);
        } catch (e) {
            this._logger.warn(`mock directory is not found: ${dir}`);
            return {};
        }

        const r = {};

        /* eslint no-sync: "off" */
        for (const fileName of Fs.readdirSync(dir)) {
            const server = this.loadServerByPort(Path.join(dir, fileName));
            if (!server) continue;

            r[server.port] = server;
        }

        return r;
    }

    loadServerByPort(dir) {
        /* eslint no-sync: "off" */
        const stat = Fs.statSync(dir);
        if (!stat.isDirectory()) return undefined;

        let port = parseInt(Path.basename(dir), 10);
        if (isNaN(port)) return undefined;

        const vhosts = {};

        /* eslint no-sync: "off" */
        for (const fileName of Fs.readdirSync(dir)) {
            const vhost = this.loadVirtualHost(Path.join(dir, fileName));
            if (!vhost) continue;

            vhosts[vhost.name] = vhost;
        }

        return { port, vhosts };
    }

    loadVirtualHost(dir) {
        /* eslint no-sync: "off" */
        const stat = Fs.statSync(dir);
        if (!stat.isDirectory()) return undefined;

        const config = this.loadVirtualHostConfig(dir);
        const rules = this.loadVirtualHostRules('', dir);

        return this.normalizeVirtualHost(config, rules);
    }

    loadVirtualHostRules(parentPath, dir) {
        const r = {};

        /* eslint no-sync: "off" */
        for (const fileName of Fs.readdirSync(dir)) {
            const full = Path.join(dir, fileName);
            const stat = Fs.statSync(full);
            const path = Path.parse(full);
            const childPath = `${parentPath}/${path.name}`;
            if (stat.isDirectory()) {
                const children = this.loadVirtualHostRules(childPath, full);
                for (let childPath in children) {
                    r[childPath] = children[childPath];
                }
            } else {
                if (QNodeConfig.is(full, _CONFIG_FILE_NAME)) continue;

                const rule = QNodeConfig.load({ dir: path.dir, name: path.name });
                rule.path = parentPath;
                r[childPath] = rule;
            }
        }

        return r;
    }

    loadVirtualHostConfig(dir, dump) {
        const r = QNodeConfig.load({ dir, name: _CONFIG_FILE_NAME }, {}, dump);
        r.name = Path.basename(dir);
        return r;
    }

}