/* eslint no-undef: "off" */

const SRC = '../../src';
const MockConfigProvider_dir = require(`${SRC}/provider/MockConfigProvider_dir`);

const mockFs = require('mock-fs');
const mockFsObjects = {
    'mock': {
        'dummyFile': 'none',
        'dummyDir': {},
        '7086': {
            'dummyHost': 'none',
            'first.com': {
                'mw.json': JSON.stringify({
                    nosense: 'blah'
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
            'second.org': {
                's1': {
                    's1_2': {
                        's1_2_rule1.json': JSON.stringify({
                            s1_2_rule1_key: 's1_2_rule1_value'
                        })
                    }
                }
            }
        }
    }
}


describe("MockConfigProvider_dir test suite 1: ", function() {

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

    it("load(): happy", function() {
        const t = new MockConfigProvider_dir({ dir: 'mock' });
        const vhostsByPort = t.load();

        expect(vhostsByPort.dummyFile).toBeUndefined();
        expect(vhostsByPort.dummyDir).toBeUndefined();

        const vhosts = vhostsByPort[7086];
        expect(vhosts.port).toBe(7086);

        const first = vhosts.vhosts['first.com'];
        expect(first.name).toBe('first.com');

        expect(first.config.nosense).toBe('blah');

        const f1_1_rule1 = first.rules['/f1/f1_1_rule1'];
        expect(f1_1_rule1.path).toBe('/f1');
        expect(f1_1_rule1.f1_1_rule1_key).toBe('f1_1_rule1_value');

        const f1_2_rule1 = first.rules['/f1/f1_2/f1_2_rule1'];
        expect(f1_2_rule1.path).toBe('/f1/f1_2');
        expect(f1_2_rule1.f1_2_rule1_key).toBe('f1_2_rule1_value');

        const f1_2_rule2 = first.rules['/f1/f1_2/f1_2_rule2'];
        expect(f1_2_rule2.path).toBe('/f1/f1_2');
        expect(f1_2_rule2.f1_2_rule2_key).toBe('f1_2_rule2_value');

        const second = vhosts.vhosts['second.org'];
        expect(second.name).toBe('second.org');

        const s1_2_rule1 = second.rules['/s1/s1_2/s1_2_rule1'];
        expect(s1_2_rule1.path).toBe('/s1/s1_2');
        expect(s1_2_rule1.s1_2_rule1_key).toBe('s1_2_rule1_value');
    });

});