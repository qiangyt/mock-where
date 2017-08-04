const BaseError = require('./BaseError');
const Errors = require('./Errors');

class RequestError extends BaseError {

    constructor() {
        super(Errors[arguments[0]], ...Array.from(arguments).slice(1));
    }

}

module.exports = RequestError;