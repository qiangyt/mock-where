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

    it("normalizeList(): happy", function() {
        expect(Callback.normalizeList(undefined).length).toBe(0);
        expect(Callback.normalizeList(null).length).toBe(0);
        expect(Callback.normalizeList([]).length).toBe(0);

        expect(Callback.normalizeList([{}, {}]).length).toBe(2);
    });

    it("normalizeTarget(): method", function() {
        expect(Callback.normalizeTarget({}).method).toBe('post');
        expect(Callback.normalizeTarget({ method: 'get' }).method).toBe('get');
    });

});