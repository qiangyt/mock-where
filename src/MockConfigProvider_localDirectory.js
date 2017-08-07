const Path = require('path');
const Fs = require('fs');
const getLogger = require('./Logger');
const InternalError = require('./error/InternalError');


class MockConfigProvider_localDirectory {

    constructor(config) {
        this._logger = getLogger('MockConfigProvider_localDirectory');
        this._portIndex = 1;
        this._config = config;
    }


    load() {

        let dir = this._config.dir;
        if (!dir) dir = Path.join(Path.dirname(require.main.filename), '../mock');

        const r = {};

        /*eslint no-sync: "off"*/
        for (const fileName of Fs.readdirSync(dir)) {
            const full = Path.join(dir, fileName);
            const stat = Fs.statSync(full);
            if (!stat.isDirectory()) continue;

            const path = Path.parse(full);
            const name = path.name;

            r[name] = {
                config: this.loadConfig(name, full),
                rules: this.loadRules('', full, true)
            };
        }

        return r;
    }

    loadRules(parentPath, dir, excludeConfigJson) {
        const r = {};

        /*eslint no-sync: "off"*/
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
                    throw new InternalError(`path is already defined for rule ${childPath} (derived from folder path)`);
                }
                rule.path = parentPath;
                r[childPath] = rule;
            }
        }

        return r;
    }

    loadConfig(name, dir) {
        let r;

        try {
            r = require(Path.join(dir, 'config.json'));
        } catch (e) {
            r = this.buildDefaultConfig();
        }

        if (r.name) {
            throw new InternalError(`name is already defined as ${name} (derived from folder name)`);
        }

        return r;
    }

    buildDefaultConfig() {
        return {
            port: 8000 + (++this._portIndex)
        };
    }

}

module.exports = MockConfigProvider_localDirectory;