const ejs = require('ejs');
const Mustache = require('mustache');
const Errors = require('./error/Errors');
const RequestError = require('./error/RequestError');

module.exports = function(type, text) {

    if ('ejs' === type) {
        return ejs.compile(text);
    }

    if ('mustache' === type) {
        Mustache.parse(text);
        return data => Mustache.render(text, data);
    }

    throw new RequestError(Errors.UNSUPPORTED_TEMPLATE_TYPE, type);

};