/* eslint no-undef: "off" */

const SRC = '../src';
const Beans = require('qnode-beans');
const ApiServer = require(`${SRC}/ApiServer`);
const finishTestcase = require('jasmine-supertest');

const _config = {};
const _beans = new Beans(_config);

function buildApiServer(name, port) {
    const r = new ApiServer();
    _config[name] = { port };
    _beans.render(r);
    r.init();
    return r;
}

describe("ApiServer test suite 2: ", function() {

    it("_loadApi(): raise error when loading duplicated API", function() {
        const s = buildApiServer();
        s._existing = { 'beanName': {} };
        expect(() => s._loadApi('beanName')).toThrow();

    });

});