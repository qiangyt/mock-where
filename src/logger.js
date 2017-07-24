const log4js = require('log4js');
const vsprintf = require("sprintf-js").vsprintf;
const config = require('./config');


function _formatMessage(args) {
    if (args.length <= 1) return args[0];

    const jsonArgs = [];
    for (let arg of Array.from(args).slice(1)) {
        const type = typeof(arg);
        if ('object' == type) {
            jsonArgs.push(JSON.stringify(arg));
        } else {
            jsonArgs.push(arg);
        }
    }
    return vsprintf(args[0], jsonArgs);
}

module.exports = function(categoryName) {
    const _internal = log4js.getLogger(categoryName);
    _internal.level = config.log.level;

    return {
        isDebugEnabled: function() { return _internal.isDebugEnabled(); },

        debug: function() {
            _internal.debug(_formatMessage(arguments));
        },

        info: function() {
            _internal.info(_formatMessage(arguments));
        },

        warn: function() {
            _internal.warn(_formatMessage(arguments));
        },

        error: function() {
            _internal.error(_formatMessage(arguments));
        },
    }

};