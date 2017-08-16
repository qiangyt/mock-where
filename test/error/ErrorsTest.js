const SRC = '../../src';
const Errors = require(`${SRC}/error/Errors`);

const mockRequire = require('mock-require');

const mockFs = require('mock-fs');
const mockFsObjects = {};

const file$has_duplicated_key = {
    "INTERNAL_ERROR": {
        "code": 1,
        "en_US": "internal error: %s",
        "zh_CN": "系统内部错误: %s"
    }
};

const path$has_duplicated_key = 'has_duplicated_key.error.json';
mockRequire(path$has_duplicated_key, file$has_duplicated_key);
mockFsObjects[path$has_duplicated_key] = JSON.stringify(file$has_duplicated_key);



const file$conflict_with_system_error_code = {
    "XXXX_ERROR": {
        "code": 2,
        "en_US": "xxx error: %s",
        "zh_CN": "xxx错误: %s"
    }
};

const path$conflict_with_system_error_code = 'conflict_with_system_error_code.error.json';
mockRequire(path$conflict_with_system_error_code, file$conflict_with_system_error_code);
mockFsObjects[path$conflict_with_system_error_code] = JSON.stringify(file$conflict_with_system_error_code);



const file$duplicated_error_code = {
    "ERROR_1": {
        "code": 7002,
        "en_US": "xxx error: %s",
        "zh_CN": "xxx错误: %s"
    },
    "ERROR_2": {
        "code": 7002,
        "en_US": "xxx error: %s",
        "zh_CN": "xxx错误: %s"
    }
};

const path$duplicated_error_code = 'duplicated_error_code.error.json';
mockRequire(path$duplicated_error_code, file$duplicated_error_code);
mockFsObjects[path$duplicated_error_code] = JSON.stringify(file$duplicated_error_code);


const file$miss_default_locale = {
    "XXXX_ERROR": {
        "code": 2001,
        "zh_CN": "xxx错误: %s"
    }
};

const path$miss_default_locale = 'miss_default_locale.error.json';
mockRequire(path$miss_default_locale, file$miss_default_locale);
mockFsObjects[path$miss_default_locale] = JSON.stringify(file$miss_default_locale);



describe("Errors test suite: ", function() {

    beforeAll(function() {
        mockFs(mockFsObjects, { createCwd: false, createTmp: false });
    });

    afterAll(function() {
        mockFs.restore();
    });

    it("register(): codeStart >= codeEnd", function() {
        try {
            Errors.register(9100, 9100);
            fail('exception is expected to raise');
        } catch (e) {
            expect(e).toBeDefined();
        }

        try {
            Errors.register(9999, 9100);
            fail('exception is expected to raise');
        } catch (e) {
            expect(e).toBeDefined();
        }
    });

    it("register(): codeStart <= SYS_CODE_END", function() {
        try {
            Errors.register(100, 200);
            fail('exception is expected to raise');
        } catch (e) {
            expect(e).toBeDefined();
        }
    });

    it("register(): file not exists", function() {
        try {
            Errors.register(9100, 9200, 'xxx.json');
            fail('exception is expected to raise');
        } catch (e) {
            expect(e.message.indexOf('file not found')).toBe(0);
        }
    });

    it("register(): duplicated key", function() {
        try {
            Errors.register(9100, 9200, path$has_duplicated_key);
            fail('exception is expected to raise');
        } catch (e) {
            expect(e).toBeDefined();
        }
    });

    it("register(): conflict with system error code", function() {
        try {
            Errors.register(8100, 8200, path$conflict_with_system_error_code);
            fail('exception is expected to raise');
        } catch (e) {
            expect(e).toBeDefined();
        }
    });

    it("register(): duplicated error code", function() {
        try {
            Errors.register(7000, 8000, path$duplicated_error_code);
            fail('exception is expected to raise');
        } catch (e) {
            expect(e).toBeDefined();
        }
    });

    it("register(): miss default locale", function() {
        try {
            Errors.register(2000, 3000, path$miss_default_locale);
            fail('exception is expected to raise');
        } catch (e) {
            expect(e).toBeDefined();
        }
    });

});