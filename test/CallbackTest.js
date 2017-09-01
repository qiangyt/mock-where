/* eslint no-undef: "off" */

const SRC = '../src';
const Callback = require(`${SRC}/Callback`);
const MissingParamError = require('qnode-error').MissingParamError;

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

        expect(Callback.normalizeList([{ path: '/a' }, { path: '/b' }]).length).toBe(2);
    });

    it("normalizeTarget(): method", function() {
        expect(Callback.normalizeTarget({ path: '/' }).method).toBe('post');
        expect(Callback.normalizeTarget({ path: '/', method: 'get' }).method).toBe('get');
    });

    it("normalizeTarget(): missing path", function() {
        try {
            expect(Callback.normalizeTarget({}));
            failhere();
        } catch (e) {
            expect(e instanceof MissingParamError).toBeTruthy();
            expect(e.args[0].indexOf('path')).toBeGreaterThan(0);
        }
    });

    it("needCallBefore(): happy", function() {
        const t1 = new Callback({ before: [] });
        expect(t1.needCallBefore()).toBeFalsy();

        const t2 = new Callback({ before: [{path:'/'}] });
        expect(t2.needCallBefore()).toBeTruthy();
    });
    
    it("needCallAfter(): happy", function() {
        const t1 = new Callback({ after: [] });
        expect(t1.needCallAfter()).toBeFalsy();
    
        const t2 = new Callback({ after: [{path:'/'}] });
        expect(t2.needCallAfter()).toBeTruthy();
    });

    it("needCallOn(): happy", function() {
        const t1 = new Callback({ on: [] });
        expect(t1.needCallOn()).toBeFalsy();

        const t2 = new Callback({ on: [{path:'/'}] });
        expect(t2.needCallOn()).toBeTruthy();
    });

});