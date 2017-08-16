const BaseError = require('./BaseError');
const QNodeConfig = require('qnode-config');
const Path = require('path');

const ERROR_MAP_BY_CODE = {};
const SYS_CODE_START = 0;
const SYS_CODE_END = 1000;

let sysErrorInited = false;

/**
 * 加载error定义的json文件。
 * 格式例子参见./Errors.json
 * 
 * @param jsonFilePath error定义的json文件的路径
 */
function register(codeStart, codeEnd, file) {
    if (codeStart >= codeEnd) {
        throw new Error(`code start value (${codeStart}) must be less than code end value (${codeEnd})`);
    }
    if (sysErrorInited) {
        if (codeStart <= SYS_CODE_END) {
            throw new Error(`code range (${codeStart}~${codeEnd} conflicts with system error codes(${SYS_CODE_START}~${SYS_CODE_END}`);
        }
    }

    let entries = QNodeConfig.load(file);

    for (let key in entries) {
        if (module.exports[key]) throw new Error('duplicated error key: ' + key);

        const formaters = entries[key];
        const code = formaters.code;
        //if (code === 0) throw new Error('code cannot be 0: ' + key);
        if (sysErrorInited && (SYS_CODE_START < code && code < SYS_CODE_END)) {
            throw new Error(`code ${code} conflicts with system error codes(${SYS_CODE_START}~${SYS_CODE_END})`);
        }
        if (ERROR_MAP_BY_CODE[code]) throw new Error('duplicated error code: ' + code);

        const type = { key, code, formaters };

        if (!formaters[BaseError.DEFAULT_LOCALE]) {
            throw new Error(`Error '${code}': missing formater for locale '${BaseError.DEFAULT_LOCALE}'`);
        }

        module.exports[key] = type;
        ERROR_MAP_BY_CODE[code] = type;
    }

    return true;
}

// 初始化系统内部错误
const sysErrorsJsonPath = {
    dir: Path.parse(module.filename).dir,
    name: 'sys_errors'
};

register(SYS_CODE_START, SYS_CODE_END, sysErrorsJsonPath);
sysErrorInited = true;

module.exports.register = register;