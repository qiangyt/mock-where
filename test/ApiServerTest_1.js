/* eslint no-undef: "off" */

const SRC = '../src';
const Beans = require('qnode-beans');
const ApiServer = require(`${SRC}/ApiServer`);

function buildApiServer(mockMethod, mockExecute, mockDescription, mockPath) {
    const beans = new Beans();

    if (mockMethod || mockExecute) {
        beans.create = function() {
            return {
                _module: {
                    method: mockMethod,
                    description: mockDescription,
                    path: mockPath
                },
                execute: mockExecute
            };
        };
    }

    const r = new ApiServer({ rootDir: 'src/api' });
    beans.render(r);
    r.init();
    return r;
}

describe("ApiServer test suite 1: ", function() {

    it("_loadAllApi(): raise error when duplicated path", function() {
        try {
            const s = buildApiServer('get', () => {}, '', '/duplicated');
            const apiFileList = ['api1', 'api2'];
            s._loadAllApi(apiFileList);
            failhere();
        } catch (e) {
            expect(e.message.indexOf('duplicated api path') >= 0).toBeTruthy();
        }
    });

    it("_loadAllApi(): raise error when duplicated bean", function() {
        try {
            const s = buildApiServer();
            const apiFileList = ['Where'];
            s._loadAllApi(apiFileList);
        } catch (e) {
            expect(e.message.indexOf('duplicated bean') >= 0).toBeTruthy();
        }
    });

    it("_loadApi(): raise error when API.execute function is not defined", function() {
        try {
            s = buildApiServer('post', null, 'desc');
            failhere();
        } catch (e) {
            expect(e.message.indexOf('execute() not defined') >= 0).toBeTruthy();
        }
    });

    it("_loadApi(): load an API", function() {
        const s = buildApiServer('get', () => {}, 'description');
        const mod = s._loadApi('beanName');

        expect(mod.instance).not.toBeNull();
        expect(mod.method).toBe('get');
        expect(mod.path).toBe('/beanname');
        expect(mod.description).toBe('description');
    });

    it("_loadApi(): method should be 'get' by default", function() {
        const s = buildApiServer(undefined, function() {}, 'description');
        const mod = s._loadApi('beanName');
        expect(mod.method).toBe('get');
    });

    it("_loadApi(): method should be lowercased", function() {
        const s = buildApiServer('POST', () => {}, 'description');
        const mod = s._loadApi('beanName');
        expect(mod.method).toBe('post');
    });

});