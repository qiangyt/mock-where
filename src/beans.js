const getLogger = require('./logger');
const _ = require('lodash');
const Path = require('path');
const config = require('./config');

const _logger = getLogger('beans');
const _beans = global.beans = {};

module.exports = {
    create: function(beanModulePath, name) {
        if (!name) {
            name = _.lowerFirst(Path.parse(beanModulePath).name);
        }

        const mod = require(beanModulePath);
        const r = new mod();
        r._module = mod;
        r._beanName = name;
        r._logger = getLogger(name);
        r._config = config[name] || {};

        if (_beans[name]) throw new Error(`duplicated bean: ${name}`);
        _beans[name] = r;

        _logger.debug('loaded bean %s from module: ', name, mod);

        if (r.init) {
            r.init(name);
            _logger.debug('inited bean: %s', name);
        }

        return r;
    },

    get: function(name) {
        return _beans[name];
    },

    load: function(name) {
        const r = _beans[name];
        if (!r) throw new Error(`no bean named: ${name}`);
        return r;
    }

};