/* eslint no-undef: "off" */

const SRC = '../src';
const Beans = require('qnode-beans');
const ApiServer = require(`${SRC}/ApiServer`);
const finishTestcase = require('jasmine-supertest');

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

});