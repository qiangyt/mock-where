const SRC = '../../src';
const Errors = require(`${SRC}/error/Errors`);

const mockRequire = require('mock-require');

const mockFs = require('mock-fs');
const mockFsObjects = {
    createCwd: false,
    createTmp: false
};

const has_duplicated_key = {
    "INTERNAL_ERROR": {
        "code": 1,
        "en_US": "internal error: %s",
        "zh_CN": "系统内部错误: %s"
    }
};
const path$has_duplicated_key = 'has_duplicated_key.error.json';
mockRequire(path$has_duplicated_key, has_duplicated_key);
mockFsObjects[path$has_duplicated_key] = JSON.stringify(has_duplicated_key);

mockFs(mockFsObjects);


describe("Errors test suite: ", function() {

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
        const ok = Errors.register(9100, 9200, 'xxx.json');
        expect(ok).toBeFalsy();
    });

    it("register(): duplicated key", function() {
        try {
            Errors.register(9100, 9200, path$has_duplicated_key);
            fail('exception is expected to raise');
        } catch (e) {
            expect(e).toBeDefined();
        }

    });

});