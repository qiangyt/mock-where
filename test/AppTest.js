/* eslint no-undef: "off" */
/* eslint global-require: "off" */

const SRC = '../src';
const App = require(`${SRC}/App`);

describe("App test suite: ", function() {

    it("happy", async function() {
        const app = new App();

        expect(app.mockServerManager.started).toBeFalsy();
        expect(app.apiServer.started).toBeFalsy();

        await app.start();

        expect(app.mockServerManager.started).toBeTruthy();
        expect(app.apiServer.started).toBeTruthy();
    });

});
