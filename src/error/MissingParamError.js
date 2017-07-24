const RequestError = require('./RequestError');
const Errors = require('./Errors');

class MissingParamError extends RequestError {

    constructor(paramName) {
        super(Errors.MISSING_PARAMETER, paramName);
    }

}

module.exports = MissingParamError;