/* eslint no-undef: "off" */

const SRC = '../src';
const Callback = require(`${SRC}/Callback`);

describe("Callback test suite: ", function() {

    it("normalizeAsyncFlag(): happy", function() {
        expect(Callback.normalizeAsyncFlag()).toBe(false);
        expect(Callback.normalizeAsyncFlag(true)).toBe(true);
        expect(Callback.normalizeAsyncFlag(false)).toBe(false);
        expect(Callback.normalizeAsyncFlag(null)).toBe(false);
    });

});