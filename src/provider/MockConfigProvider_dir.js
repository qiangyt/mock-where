const Path = require('path');
const Fs = require('fs');
const Logger = require('qnode-log');
const QNodeConfig = require('qnode-config');

const _CONFIG_FILE_NAME = 'mw';


module.exports = class MockConfigProvider_dir {

    constructor(config) {
        this._logger = new Logger('MockConfigProvider_dir');
        this._portIndex = 1;
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
            const full = Path.join(dir, fileName);
            const stat = Fs.statSync(full);
            if (!stat.isDirectory()) continue;

            const config = this.loadConfig(full);
            const rules = this.loadRules('', full);

            r[config.name] = { config, rules };
        }

        return r;
    }


    loadRules(parentPath, dir) {
        const r = {};

        /* eslint no-sync: "off" */
        for (const fileName of Fs.readdirSync(dir)) {
            const full = Path.join(dir, fileName);
            const stat = Fs.statSync(full);
            const path = Path.parse(full);
            const childPath = `${parentPath}/${path.name}`;
            if (stat.isDirectory()) {
                const children = this.loadRules(childPath, full);
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

    loadConfig(dir, dump) {
        let r = QNodeConfig.load({ dir, name: _CONFIG_FILE_NAME }, {}, dump);
        this.renderConfigWithDefaults(r);

        r.name = Path.basename(dir);

        return r;
    }

    renderConfigWithDefaults(cfg) {
        if (!cfg.port) {
            cfg.port = 8000 + (this._portIndex++);
        }
        return cfg;
    }

}