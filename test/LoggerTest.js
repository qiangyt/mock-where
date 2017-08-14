const SRC = '../src';
const Logger = require(`${SRC}/Logger`);
const Config = require(`${SRC}/Config`);

describe("Logger test suite: ", function() {

    it("formatMessage(): no need to format", function() {
        const msg = new Logger('test').format('xxx');
        expect(msg).toBe('xxx');
    });

    it("formatMessage(): happy", function() {
        const me = { name: 'mock-where', language: 'node.js' };
        const msg = new Logger('test').format('%s: %s', 'me', me);
        expect(msg).toBe(`me: ${JSON.stringify(me)}`);
    });

    it("isDebugEnabled()", function() {
        expect(new Logger('test').isDebugEnabled()).toBeFalsy();

        Config.log = {};

        Config.log.level = 'DEBUG';
        expect(new Logger('test').isDebugEnabled()).toBeTruthy();

        Config.log.level = 'ERROR';
        expect(new Logger('test').isDebugEnabled()).toBeFalsy();

        new Logger('test').warn('dummy'); // e..., just for coverage
    });

});