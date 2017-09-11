const ejs = require('ejs');
const Mustache = require('mustache');
const RequestError = require('qnode-error').RequestError;
const lodash = require('lodash');
const underscore = require('underscore');
const Handlebars = require('handlebars');
const Jade = require('jade');
const Pug = require('pug');
const Logger = require('qnode-log');

const _logger = new Logger('Template');

module.exports = function(type, text, ruleName) {

    try {
        if ('ejs' === type) {
            return ejs.compile(text);
        }

        if ('mustache' === type) {
            Mustache.parse(text);
            return data => Mustache.render(text, data);
        }

        if ('lodash' === type) {
            return lodash.template(text);
        }

        if ('underscore' === type) {
            return underscore.template(text);
        }

        if ('handlebars' === type) {
            return Handlebars.compile(text);
        }

        if ('jade' === type) {
            return Jade.compile(text);
        }

        if ('pug' === type) {
            return Pug.compile(text);
        }
    } catch (e) {
        _logger.error(e);
        throw new RequestError('FAILED_TO_COMPILE_TEMPLATE', ruleName, type, text);
    }

    throw new RequestError('UNSUPPORTED_TEMPLATE_TYPE', ruleName, type);

};