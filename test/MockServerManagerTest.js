/* eslint no-undef: "off" */

const SRC = '../src';
const MockConfigProvider = require(`${SRC}/MockConfigProvider`);
const mockRequire = require('mock-require');

class SpiedMockServer {

    constructor(config) {
        this._config = config;
        this.inited = false;
    }

    init() {
        this.inited = true;
    }

    async start() {
        this.started = true;
    }
}

mockRequire(`${SRC}/MockServer`, SpiedMockServer);

let _addDuplicatedConfig = false;

let _addSpiedHosts = true;

class SpiedMockConfigProvider extends MockConfigProvider {

    load() {
        if (!_addSpiedHosts) return {};
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

const Beans = require('qnode-beans').Beans;
const MockServerManager = require(`${SRC}/MockServerManager`);

function buildMockServerManager() {
    const beans = new Beans();
    const r = new MockServerManager();
    beans.render(r);
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

    it("resolveProviderClassName(): happy", function() {
        const s = buildMockServerManager();
        let className = s.resolveProviderClassName('dir', { type: 'xxx' });
        expect(className).toBe('MockConfigProvider_xxx');

        className = s.resolveProviderClassName('yyy');
        expect(className).toBe('MockConfigProvider_yyy');

        className = s.resolveProviderClassName();
        expect(className).toBe('MockConfigProvider_dir');
    });

    it("resolveProviderClass(): happy", function() {
        const s = buildMockServerManager();
        const className = s.resolveProviderClassName();
        const t = s.resolveProviderClass(className);
        expect(t).toEqual(SpiedMockConfigProvider);
    });

    it("resolveProviderClass(): not exists", function() {
        const s = buildMockServerManager();
        try {
            s.resolveProviderClass('MockConfigProvider_zzz');
            failhere();
        } catch (e) {
            expect(e.message.indexOf('MockConfigProvider_zzz') >= 0).toBeTruthy();
        }
    });

    it("_buildProvider(): happy", function() {
        const t = buildMockServerManager();
        const cfg = { test: 'test' };
        const p = t._buildProvider('dir', cfg);

        expect(p instanceof SpiedMockConfigProvider).toBeTruthy();
        expect(p._config.test).toBe('test');
        expect(p._logger).not.toBeNull();
        expect(p._name).toBe('MockConfigProvider_dir');
    });

    it("_resolveDefaultProviders", function() {
        _addSpiedHosts = false;

        const t = buildMockServerManager();
        t.init();
        expect(t.defaultPort).toBe(8000);

        const r = t._resolveDefaultProviders();
        expect(r.dir.type).toBe('dir');
        expect(r.empty).not.toBeNull();
    });

    it("init(): happy", function() {
        _addSpiedHosts = true;

        const t = buildMockServerManager();
        t.init();
        expect(t.defaultPort).toBeUndefined();

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
            failhere();
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
