const vsprintf = require("sprintf-js").vsprintf;

class BaseError extends Error {

    constructor(type, ...args) {
        super(BaseError.staticBuild(type, args));

        this.args = args;
        this.type = type;
    }

    build(locale) {
        return BaseError.staticBuild(this.type, this.args, locale);
    }

    static staticBuild(type, args, locale) {

        locale = locale || BaseError.DEFAULT_LOCALE;
        let formater = type.formaters[locale] || type.formaters[BaseError.DEFAULT_LOCALE];

        return {
            code: '' + type.code, // return the code as text so that conforms to default behaviors of restify
            key: type.key,
            message: vsprintf(formater, args),
            time: new Date().getTime()
        };
    }

}

BaseError.DEFAULT_LOCALE = 'en_US';

module.exports = BaseError;