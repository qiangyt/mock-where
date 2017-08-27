/* eslint no-undef: "off" */

const SRC = '../src';
const Beans = require('qnode-beans');
const ApiServer = require(`${SRC}/ApiServer`);

function buildApiServer() {
    const r = new ApiServer();
    Beans.render(r);
    r.init();
    return r;
}

const originalBeansCreate = Beans.create;

function mockApi(method, execute, description) {
    Beans.create = function() {
        return { _module: { method, description }, execute };
    };
}

describe("ApiServer test suite 1: ", function() {

    afterAll(function() {
        Beans.create = originalBeansCreate;
    });

    it("_loadAllApi(): raise error when loading duplicated API", function() {
        const s = buildApiServer();
        const apiFileList = ['Where', 'Where'];
        expect(() => s._loadAllApi(apiFileList)).toThrow();
    });

    it("_loadApi(): raise error when API.execute function is not defined", function() {
        const s = buildApiServer();
        mockApi('post', null, 'desc');
        expect(() => s._loadApi('beanName')).toThrow();

    });

    it("_loadApi(): load an API", function() {
        mockApi('get', () => {}, 'description');

        const s = buildApiServer();
        const mod = s._loadApi('beanName');

        expect(mod.instance).not.toBeNull();
        expect(mod.method).toBe('get');
        expect(mod.path).toBe('/beanname');
        expect(mod.description).toBe('description');
    });

    it("_loadApi(): method should be 'get' by default", function() {
        const execute = function() {};
        mockApi(undefined, execute, 'description');

        const s = buildApiServer();
        const mod = s._loadApi('beanName');
        expect(mod.method).toBe('get');
    });

    it("_loadApi(): method should be lowercased", function() {
        mockApi('POST', () => {}, 'description');

        const s = buildApiServer();
        const mod = s._loadApi('beanName');
        expect(mod.method).toBe('post');
    });

});