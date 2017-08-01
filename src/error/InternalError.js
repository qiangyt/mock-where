const BaseError = require('./BaseError');
const Errors = require('./Errors');

class InternalError extends BaseError {

    constructor() {
        super(Errors.INTERNAL_ERROR, ...arguments);
    }

}

module.exports = InternalError;