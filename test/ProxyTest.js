/* eslint no-undef: "off" */

const SRC = '../src';
const Proxy = require(`${SRC}/Proxy`);

describe("Proxy test suite: ", function() {

    it("normalizeEnabledFlag(): happy", function() {
        expect(Proxy.normalizeEnabledFlag()).toBeFalsy();
        expect(Proxy.normalizeEnabledFlag(null)).toBeFalsy();
        expect(Proxy.normalizeEnabledFlag(true)).toBeTruthy();
        expect(Proxy.normalizeEnabledFlag(false)).toBeFalsy();
    });

    it("normalizeOptions(): happy", function() {
        const target = 'http://github.com/qiangyt/mock-where';
        const options = Proxy.normalizeOptions({ target, enabled: true });
        expect(options.target).toBe(target);
        expect(options.enabled).toBeTruthy();
    });

    it("normalizeOptions(): missing target", function() {
        try {
            Proxy.normalizeOptions({ enabled: true }, "test");
            failhere();
        } catch (e) {
            expect(e.message.indexOf('missing')).toBeGreaterThanOrEqual(0);
            expect(e.message.indexOf('target')).toBeGreaterThanOrEqual(0);
            expect(e.message.indexOf('test')).toBeGreaterThanOrEqual(0);
        }
    });

    it("isEnabled(): happy", function() {
        expect(new Proxy({ target: 'hi', enabled: true }).isEnabled()).toBeTruthy();
        expect(new Proxy({ target: 'hi' }).isEnabled()).toBeFalsy();
    });

});