const ejs = require('ejs');
const Errors = require('./error/Errors');
const RequestError = require('./error/RequestError');

module.exports = function(type, text) {

    if ('ejs' === type) {
        return ejs.compile(text);
    }

    throw new RequestError(Errors.UNSUPPORTED_TEMPLATE_TYPE, type);

};