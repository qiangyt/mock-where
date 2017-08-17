/* eslint no-undef: "off" */

const SRC = '../../src';
const MockConfigProvider_dir = require(`${SRC}/provider/MockConfigProvider_dir`);

const mockFs = require('mock-fs');
const mockFsObjects = {
    'mock': {
        'dummy': 'none',
        'first': {
            'mw.json': JSON.stringify({
                nosense: 'blah',
                port: 20000
            }),
            'f1': {
                'f1_1_rule1.json': JSON.stringify({
                    f1_1_rule1_key: 'f1_1_rule1_value'
                }),
                'f1_2': {
                    'f1_2_rule1.json': JSON.stringify({
                        f1_2_rule1_key: 'f1_2_rule1_value'
                    }),
                    'f1_2_rule2.json': JSON.stringify({
                        f1_2_rule2_key: 'f1_2_rule2_value'
                    })
                }
            },
            'f2': {}
        },
        'second': {
            's1': {
                's1_2': {
                    's1_2_rule1.json': JSON.stringify({
                        s1_2_rule1_key: 's1_2_rule1_value'
                    })
                }
            }
        }
    }
};


describe("MockConfigProvider_empty test suite 1: ", function() {

    beforeAll(function() {
        mockFs(mockFsObjects, { createCwd: false, createTmp: false });
    });

    afterAll(function() {
        mockFs.restore();
    });

    it("resolveMockDir(): dir is specified via ctor", function() {
        const dir = new MockConfigProvider_dir({ dir: 'xyz' }).resolveMockDir();
        expect(dir).toBe('xyz');
    });

    it("resolveMockDir(): dir is not specified via ctor", function() {
        const dir = new MockConfigProvider_dir().resolveMockDir();
        expect(dir.indexOf('node_modules/jasmine/mock') > 0).toBeTruthy();
    });

    it("renderConfigWithDefaults(): happy", function() {
        const p = new MockConfigProvider_dir();
        expect(p.renderConfigWithDefaults({}).port).toBe(8001);
        expect(p.renderConfigWithDefaults({}).port).toBe(8002);
    });

    it("load(): happy", function() {
        const t = new MockConfigProvider_dir({ dir: 'mock' });
        const r = t.load();

        const first = r['first'];

        expect(first.config.nosense).toBe('blah');
        expect(first.config.port).toBe(20000);
        expect(first.config.name).toBe('first');

        const f1_1_rule1 = first.rules['/f1/f1_1_rule1'];
        expect(f1_1_rule1.path).toBe('/f1');
        expect(f1_1_rule1.f1_1_rule1_key).toBe('f1_1_rule1_value');

        const f1_2_rule1 = first.rules['/f1/f1_2/f1_2_rule1'];
        expect(f1_2_rule1.path).toBe('/f1/f1_2');
        expect(f1_2_rule1.f1_2_rule1_key).toBe('f1_2_rule1_value');

        const f1_2_rule2 = first.rules['/f1/f1_2/f1_2_rule2'];
        expect(f1_2_rule2.path).toBe('/f1/f1_2');
        expect(f1_2_rule2.f1_2_rule2_key).toBe('f1_2_rule2_value');

        const second = r['second'];
        expect(second.config.port).toBe(8001);
        expect(second.config.name).toBe('second');

        const s1_2_rule1 = second.rules['/s1/s1_2/s1_2_rule1'];
        expect(s1_2_rule1.path).toBe('/s1/s1_2');
        expect(s1_2_rule1.s1_2_rule1_key).toBe('s1_2_rule1_value');
    });

});