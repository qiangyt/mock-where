const vsprintf = require("sprintf-js").vsprintf;


/**
 * 定义一个预定义的错误类别
 */
class ErrorType {

    constructor(key, code, formaters) {
        if (!formaters['en_US']) throw new Error("Error '" + code + "': missing formater for locale 'en_US'");
        if (!formaters['zh_CN']) throw new Error("Error '" + code + "': missing formater for locale 'zh_CN'");

        this.key = key;
        this.code = code;
        this.formaters = formaters;
    }

    build(args, locale) {
        locale = locale || 'en_US';

        let formater = this.formaters[locale];
        if (!formater) formater = this.formaters['en_US'];

        return {
            code: '' + this.code, // return the code as text so that conforms to default behaviors of restify
            key: this.key,
            message: vsprintf(formater, args),
            time: new Date().getTime()
        };
    }
}

module.exports = ErrorType;