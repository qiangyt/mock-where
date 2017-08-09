const getLogger = require('./Logger');
const _ = require('lodash');
const Path = require('path');
const Config = require('./Config');

const _logger = getLogger('Beans');
const _beans = global.beans = {};
const _beansInited = {};


function init() {

    for (let name in _.clone(_beans)) {
        if (_beansInited[name]) continue;

        const b = _beans[name];
        if (b.init) {
            _logger.debug('begin initing bean: %s', name);
            b.init();
            _logger.debug('inited bean: %s', name);
        }
        _beansInited[name] = b;
    }

    if (_.size(_beans) === _.size(_beansInited)) {
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
        const beanModuleAsClass = require(beanModulePath);
        const r = new beanModuleAsClass();
        render(r, name, beanModuleAsClass);

        if (_beans[name]) throw new Error(`duplicated bean: ${name}`);
        _beans[name] = r;

        _logger.debug('loaded bean %s from module: %s', name, beanModulePath);

        return r;
    },

    render,

    init,

    get: function(name) {
        return _beans[name];
    },

    load: function(name) {
        const r = _beans[name];
        if (!r) throw new Error(`no bean named: ${name}`);
        return r;
    }

};