const RequestError = require('./RequestError');

module.exports = class MissingParamError extends RequestError {

    constructor(paramName) {
        super('MISSING_PARAMETER', paramName);
    }

};