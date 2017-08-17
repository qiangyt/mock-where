/* eslint no-undef: "off" */

const SRC = '../src';
const Beans = require('qnode-beans');
const ApiServer = require(`${SRC}/ApiServer`);

function buildApiServer() {
    const r = new ApiServer();
    Beans.render(r);
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

    it("_loadApi(): raise error when loading duplicated API", function() {
        const s = buildApiServer();
        s._existing = { 'beanName': {} };
        expect(() => s._loadApi('beanName')).toThrow();

    });

    it("_loadApi(): raise error when API.execute function is not defined", function() {
        const s = buildApiServer();
        mockApi('post', null, 'desc');
        expect(() => s._loadApi('beanName')).toThrow();

    });

    it("_loadApi(): load an API", function() {
        const execute = function() {};
        mockApi('get', execute, 'description');

        const s = buildApiServer();
        const mod = s._loadApi('beanName');
        const api = s._existing['beanName'];

        expect(api._module).toEqual(mod);
        expect(api.execute).toEqual(execute);

        expect(mod.instance).toEqual(api);
        expect(mod.method).toBe('get');
        expect(mod.path).toBe('/api/beanName');
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
        const execute = function() {};
        mockApi('POST', execute, 'description');

        const s = buildApiServer();
        const mod = s._loadApi('beanName');
        expect(mod.method).toBe('post');
    });

});