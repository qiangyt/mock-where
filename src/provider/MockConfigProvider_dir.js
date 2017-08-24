const Path = require('path');
const Fs = require('fs');
const Logger = require('qnode-log');
const QNodeConfig = require('qnode-config');

const _CONFIG_FILE_NAME = 'mw';


module.exports = class MockConfigProvider_dir {

    constructor(config) {
        this._logger = new Logger('MockConfigProvider_dir');
        this._config = config || {};
    }


    resolveMockDir() {
        let r = this._config.dir;
        if (!r) r = Path.join(Path.dirname(require.main.filename), '../mock');
        return r;
    }

    load() {

        let dir = this.resolveMockDir();

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

        return {
            name: Path.basename(dir),
            config: this.loadVirtualHostConfig(dir),
            rules: this.loadVirtualHostRules('', dir)
        };
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
        return QNodeConfig.load({ dir, name: _CONFIG_FILE_NAME }, {}, dump);
    }

}