const getLogger = require('./Logger');
const _ = require('lodash');
const Path = require('path');
const Config = require('./Config');
const _logger = getLogger('Beans');
const all = global.beans = {};
const _beansInited = {};


function init() {

    for (let name in _.clone(all)) {
        if (_beansInited[name]) continue;

        const b = all[name];
        if (b.init) {
            _logger.debug('begin initing bean: %s', name);
            b.init();
            _logger.debug('inited bean: %s', name);
        }
        _beansInited[name] = b;
    }

    if (_.size(all) === _.size(_beansInited)) {
        // no any more beans are dynamically created during bean.init();
        return;
    }

    init();
}

function render(bean, name, beanModuleAsClass) {
    bean._module = beanModuleAsClass;
    bean._name = name;
    bean._logger = getLogger(name);
    bean._config = Config[name] || {};
}

module.exports = {
    create: function(beanModulePath, name) {
        if (!name) {
            name = _.lowerFirst(Path.parse(beanModulePath).name);
        }

        // eslint ignore:global-require
        const clazz = require(beanModulePath);
        const r = new clazz();
        render(r, name, clazz);

        if (all[name]) throw new Error(`duplicated bean: ${name}`);
        all[name] = r;

        _logger.debug('loaded bean %s from module: %s', name, beanModulePath);

        return r;
    },

    render,

    init,

    get: function(name) {
        return all[name];
    },

    load: function(name) {
        const r = all[name];
        if (!r) throw new Error(`no bean named: ${name}`);
        return r;
    },

    all

};