const BaseError = require('./BaseError');
const Fs = require('fs');
const Path = require('path');

const errorMapByCode = {};
const SYS_CODE_START = 0;
const SYS_CODE_END = 1000;

let sysErrorInited = false;

/**
 * 加载error定义的json文件。
 * 格式例子参见./Errors.json
 * 
 * @param jsonFilePath error定义的json文件的路径
 */
function register(codeStart, codeEnd, jsonFilePath) {
    if (codeStart >= codeEnd) throw new Error(`code start value (${codeStart}) must be less than code end value (${codeEnd})`);
    if (sysErrorInited) {
        if (codeStart <= SYS_CODE_END) {
            throw new Error(`code range (${codeStart}~${codeEnd} conflicts with system error codes(${SYS_CODE_START}~${SYS_CODE_END}`);
        }
    }

    try {
        Fs.statSync(jsonFilePath);
    } catch (e) {
        return;
    }

    const entries = require(jsonFilePath);

    for (let key in entries) {
        if (module.exports[key]) throw new Error('duplicated error key: ' + key);

        const formaters = entries[key];
        const code = formaters.code;
        //if (code === 0) throw new Error('code cannot be 0: ' + key);
        if (sysErrorInited && (SYS_CODE_START < code && code < SYS_CODE_END)) {
            throw new Error(`code ${code} conflicts with system error codes(${SYS_CODE_START}~${SYS_CODE_END})`);
        }
        if (errorMapByCode[code]) throw new Error('duplicated error code: ' + code);

        const type = { key, code, formaters };

        if (!formaters[BaseError.DEFAULT_LOCALE]) {
            throw new Error(`Error '${code}': missing formater for locale '${BaseError.DEFAULT_LOCALE}'`);
        }

        module.exports[key] = type;
        errorMapByCode[code] = type;
    }

}

// 初始化系统内部错误
const sysErrorsJsonPath = Path.join(Path.parse(module.filename).dir, 'Errors.json');
register(SYS_CODE_START, SYS_CODE_END, sysErrorsJsonPath);
sysErrorInited = true;