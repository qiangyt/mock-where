/* eslint no-undef: "off" */

const SRC = '../src';

const mockRequire = require('mock-require');

class SpiedMockServer {

    constructor(config) {
        this._config = config;
        this.inited = false;
    }

    init() {
        this.inited = true;
    }

    start() {
        this.started = true;
    }
}

mockRequire(`${SRC}/MockServer`, SpiedMockServer);

let _addDuplicatedConfig = false;

class SpiedMockConfigProvider {

    constructor(config) {
        this.config = config;
    }

    load() {
        return {
            123: {
                port: 123
            },
            456: {
                port: 456
            }
        };
    }

}

mockRequire(`${SRC}/provider/MockConfigProvider_dir`, SpiedMockConfigProvider);
mockRequire(`${SRC}/provider/MockConfigProvider_dir2`, SpiedMockConfigProvider);

const Beans = require('qnode-beans');
const MockServerManager = require(`${SRC}/MockServerManager`);

function buildMockServerManager() {
    const r = new MockServerManager();
    Beans.render(r);
    if (_addDuplicatedConfig) {
        r._config.providers = {
            dir: {
                type: 'dir'
            },
            dir2: {}
        };
    }
    return r;
}

describe("MockServerManager test suite: ", function() {

    it("resolveProviderClass(): configured and not exists", function() {
        try {
            MockServerManager.resolveProviderClass('dir', { type: 'xxx' });
            fail('exception is expected to raise');
        } catch (e) {
            expect(e.type.key).toBe('INTERNAL_ERROR');
        }

        try {
            MockServerManager.resolveProviderClass('xxx');
            fail('exception is expected to raise');
        } catch (e) {
            expect(e.type.key).toBe('INTERNAL_ERROR');
        }

    });

    it("resolveProviderClass(): take default", function() {
        const t = MockServerManager.resolveProviderClass();
        expect(t).toEqual(SpiedMockConfigProvider);
    });

    it("_buildProvider(): happy", function() {
        const t = buildMockServerManager();
        const cfg = {};
        const p = t._buildProvider('dir', cfg);

        expect(p instanceof SpiedMockConfigProvider).toBeTruthy();
        expect(p.config).toEqual(cfg);
    });

    it("_resolveDefaultProviders", function() {
        const t = buildMockServerManager();
        t.init();

        const r = t._resolveDefaultProviders();
        expect(r.dir.type).toBe('dir');
        expect(r.empty).not.toBeNull();
    });

    it("init(): happy", function() {
        const t = buildMockServerManager();
        t.init();

        const a = t._allByPort[123];
        expect(a instanceof SpiedMockServer).toBeTruthy();
        expect(a.inited).toBeTruthy();
        expect(a.started).toBeFalsy();

        const b = t._allByPort[456];
        expect(b instanceof SpiedMockServer).toBeTruthy();
        expect(b.inited).toBeTruthy();
        expect(b.started).toBeFalsy();
    });

    it("init(): duplicated mock server", function() {
        _addDuplicatedConfig = true;
        const t = buildMockServerManager();

        try {
            t.init();
            fail('exception is expected to raise');
        } catch (e) {
            // dymmmy
        } finally {
            _addDuplicatedConfig = false;
        }
    });

    it("get(): happy", function() {
        const t = buildMockServerManager();
        t.init();

        expect(t.get('a')).not.toBeNull();
        expect(t.get('x')).toBeUndefined();
    });

});