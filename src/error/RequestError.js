class RequestError extends Error {

    constructor(errorType, ...args) {
        super(errorType.build(args));

        this.args = args;
        this.errorType = errorType;
    }

    build(locale) {
        return this.errorType.build(this.args, locale);
    }

}

module.exports = RequestError;