/* eslint no-undef: "off" */
/* eslint global-require: "off" */

const SRC = '../../src';
const Where = require(`${SRC}/api/Where`);
const Beans = require('qnode-beans');

class MockedMockServerManager1 {

    get() {
        return null; //{putRule: function(){}};
    }
}

class MockedMockServerManager2 {

    get(port) {
        return { port };
    }
}

class MockedMockServerManager3 extends MockedMockServerManager2 {

    constructor() {
        super();
        this.defaultPort = 12345;
    }
}

class MockedMockServer {

    putRule(domain, rule) {
        this.domain = domain;
        this.rule = rule;
    }

}

describe("api/Where test suite: ", function() {

    it("validate(): missing domain parameter", function() {
        const where = new Where();
        Beans.render(where);

        where.validate({
                request: {
                    body: {
                        port: 7086
                    }
                }
            }).then(() => failhere())
            .catch(e => {
                expect(e.type.key).toBe('MISSING_PARAMETER');
                expect(e.args[0]).toBe('domain');
            });
    });

    it("validate(): missing port parameter", function() {
        const where = new Where();
        Beans.render(where);

        where.validate({
                request: {
                    body: {
                        domain: 'wxcount.com'
                    }
                }
            }).then(() => failhere())
            .catch(e => {
                expect(e.type.key).toBe('MISSING_PARAMETER');
                expect(e.args[0]).toBe('port');
            });
    });

    it("validate(): take default port", function() {
        const beans = new Beans();
        beans.create(MockedMockServerManager3, 'MockServerManager');
        const where = beans.create(Where, 'Where');
        beans.init();

        where.validate({
            request: {
                body: {
                    domain: 'wxcount.com'
                }
            }
        }).then(({ mockServer }) => {
            expect(mockServer.port).toBe(12345);
        });
    });

    it("validate(): no default port", function() {
        const beans = new Beans();
        beans.create(MockedMockServerManager2, 'MockServerManager');
        const where = beans.create(Where, 'Where');
        beans.init();

        where.validate({
                request: {
                    body: {
                        domain: 'wxcount.com'
                    }
                }
            }).then(() => failhere())
            .catch(e => {
                expect(e.type.key).toBe('MISSING_PARAMETER');
                expect(e.args[0]).toBe('port');
            });
    });

    it("validate(): mock server not found", function() {
        const beans = new Beans();
        beans.create(MockedMockServerManager1, 'MockServerManager');
        const where = beans.create(Where, 'Where');
        beans.init();

        where.validate({
                request: {
                    body: {
                        port: 7086,
                        domain: 'wxcount.com'
                    }
                }
            }).then(() => failhere())
            .catch(e => {
                expect(e.type.key).toBe('MOCK_SERVER_NOT_FOUND');
                expect(e.args[0]).toBe(7086);
            });
    });


    it("validate(): happy", function() {
        const beans = new Beans();
        beans.create(MockedMockServerManager2, 'MockServerManager');
        const where = beans.create(Where, 'Where');
        beans.init();

        where.validate({
                request: {
                    body: {
                        port: 8076,
                        domain: 'wxcount.com'
                    }
                }
            })
            .then(({ domain, rule, mockServer }) => {
                expect(domain).toBe('wxcount.com');
                expect(rule.domain).toBe('wxcount.com');
                expect(rule.port).toBe(8076);
                expect(mockServer.port).toBe(8076);
            })
            .catch(() => {
                failhere();
            });
    });

    it("execute(): happy", function() {
        const beans = new Beans();
        beans.create(MockedMockServerManager2, 'MockServerManager');
        const mockServer = new MockedMockServer();
        const where = beans.create(Where, 'Where');
        beans.init();

        const ctx = {};
        const domain = 'github.com';
        const rule = {};

        where.execute(ctx, { domain, rule, mockServer })
            .then(() => {
                expect(mockServer.domain).toEqual(domain);
                expect(mockServer.rule).toEqual(rule);
            })
            .catch(() => {
                failhere();
            });
    });

});