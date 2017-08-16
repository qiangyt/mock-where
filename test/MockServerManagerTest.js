/* eslint no-undef: "off" */

const SRC = '../src';

const mockRequire = require('mock-require');

class SpiedMockServer {

    constructor(name, definition) {
        this.name = name;
        this.definition = definition;
        this.inited = false;
    }

    init() {
        this.inited = true;
    }
}

mockRequire(`${SRC}/MockServer`, SpiedMockServer);

class SpiedMockConfigProvider {

    constructor(config) {
        this.config = config;
    }

    load() {
        return {
            a: 'config_a',
            b: 'config_b'
        };
    }
}

mockRequire(`${SRC}/provider/MockConfigProvider_dir`, SpiedMockConfigProvider);

const Beans = require('node-beans').DEFAULT;
const MockServerManager = require(`${SRC}/MockServerManager`);

function buildMockServerManager() {
    const r = new MockServerManager();
    Beans.render(r);
    return r;
}

describe("MockServerManager test suite: ", function() {

    it("resolveProviderClass(): configured and not exists", function() {
        try {
            MockServerManager.resolveProviderClass({ type: 'xxx' });
            fail('exception is expected to raise');
        } catch (e) {
            expect(e.type.key).toBe('INTERNAL_ERROR');
        }

    });

    it("resolveProviderClass(): take default", function() {
        const t = MockServerManager.resolveProviderClass({});
        expect(t).toEqual(SpiedMockConfigProvider);
    });

    it("_buildProvider(): happy", function() {
        const t = buildMockServerManager();
        const cfg = t._config.provider = {};
        const p = t._buildProvider();

        expect(p instanceof SpiedMockConfigProvider).toBeTruthy();
        expect(p.config).toEqual(cfg);
    });

    it("init(): happy", function() {
        const t = buildMockServerManager();
        t.init();

        const a = t._all['a'];
        expect(a instanceof SpiedMockServer).toBeTruthy();
        expect(a.name).toBe('a');
        expect(a.definition).toBe('config_a');
        expect(a.inited).toBeTruthy();

        const b = t._all['b'];
        expect(b instanceof SpiedMockServer).toBeTruthy();
        expect(b.name).toBe('b');
        expect(b.definition).toBe('config_b');
        expect(b.inited).toBeTruthy();
    });

    it("get(): happy", function() {
        const t = buildMockServerManager();
        t.init();

        expect(t.get('a')).not.toBeNull();
        expect(t.get('x')).toBeUndefined();
    });

});