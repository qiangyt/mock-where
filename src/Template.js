const ejs = require('ejs');
const Mustache = require('mustache');
const Errors = require('./error/Errors');
const RequestError = require('./error/RequestError');
const lodash = require('lodash');
const underscore = require('underscore');

module.exports = function(type, text) {

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

    throw new RequestError(Errors.UNSUPPORTED_TEMPLATE_TYPE, type);

};