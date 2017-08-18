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

describe("ApiServer test suite 2: ", function() {

    it("_loadApi(): raise error when loading duplicated API", function() {
        const s = buildApiServer();
        s._existing = { 'beanName': {} };
        expect(() => s._loadApi('beanName')).toThrow();

    });

});