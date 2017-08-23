const Path = require('path');
const Fs = require('fs');
const Logger = require('qnode-log');
const QNodeConfig = require('qnode-config');

module.exports = class MockConfigProvider_dir {

    constructor(config) {
        this._logger = new Logger('MockConfigProvider_dir');
        this._portIndex = 1;
        this._config = config;
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
            const rules = this.loadRules('', full, true)

            r[config.name] = { config, rules };
        }

        return r;
    }

    loadRules(parentPath, dir, excludeConfigJson) {
        const r = {};

        /* eslint no-sync: "off" */
        for (const fileName of Fs.readdirSync(dir)) {
            const full = Path.join(dir, fileName);
            const stat = Fs.statSync(full);
            const path = Path.parse(full);
            const childPath = `${parentPath}/${path.name}`;
            if (stat.isDirectory()) {
                const children = this.loadRules(childPath, full, false);
                for (let ruleName in children) {
                    r[ruleName] = children[ruleName];
                }
            } else {
                if (path.ext !== '.json') continue;
                if (path.base === 'config.json' && excludeConfigJson) continue;
                const rule = require(full);
                if (rule.path) {
                    throw new Error(`path is already defined for rule ${childPath} (derived from folder path)`);
                }
                rule.path = parentPath;
                r[childPath] = rule;
            }
        }

        return r;
    }

    loadConfig(dir, dump) {
        let r = QNodeConfig.load({ dir, name: 'config' }, this.buildDefaultConfig(), dump);
        let name = Path.parse(dir).name;
        if (r.name) {
            throw new Error(`name is already defined as ${name} (derived from folder name)`);
        }
        r.name = name;
        return r;
    }

    buildDefaultConfig() {
        return {
            port: 8000 + (++this._portIndex)
        };
    }

}