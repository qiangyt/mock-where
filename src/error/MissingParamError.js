const RequestError = require('./RequestError');

class MissingParamError extends RequestError {

    constructor(paramName) {
        super('MISSING_PARAMETER', paramName);
    }

}

module.exports = MissingParamError;