/* eslint no-undef: "off" */

const SRC = '../src';
const MockConfigProvider = require(`${SRC}/MockConfigProvider`);

describe("MockConfigProvider test suite: ", function() {

    it("load(): to be implemented", function() {
        const t = new MockConfigProvider();
        try {
            t.load();
            failhere();
        } catch (e) {
            expect(e.message).toBe('to be implemented');
        }
    });

    it("resolveDomains(): no domains, so take name as domains", function() {
        const t = new MockConfigProvider();

        let domains = t.resolveDomains(undefined, 'github.com');
        expect(domains.length).toBe(1);
        expect(domains[0]).toBe('github.com');

        domains = t.resolveDomains('', 'wxcount.com');
        expect(domains.length).toBe(1);
        expect(domains[0]).toBe('wxcount.com');

        domains = t.resolveDomains(null, 'mock-where.com');
        expect(domains.length).toBe(1);
        expect(domains[0]).toBe('mock-where.com');
    });

    it("resolveDomains(): domains get string value", function() {
        const t = new MockConfigProvider();

        const domains = t.resolveDomains('github.com');
        expect(domains.length).toBe(1);
        expect(domains[0]).toBe('github.com');
    });

    it("resolveDomains(): domains get object value", function() {
        const t = new MockConfigProvider();
        try {
            t.resolveDomains({});
            failhere();
        } catch (e) {
            expect(e.message).not.toBeNull();
        }
    });

    it("resolveDomains(): empty array so take names as domains", function() {
        const t = new MockConfigProvider();

        const domains = t.resolveDomains([], 'github.com');
        expect(domains.length).toBe(1);
        expect(domains[0]).toBe('github.com');
    });

    it("resolveDomains(): happy", function() {
        const t = new MockConfigProvider();

        const domains = t.resolveDomains(['github.com']);
        expect(domains.length).toBe(1);
        expect(domains[0]).toBe('github.com');
    });

    it("resolveVirtualHostName(): single domain", function() {
        const t = new MockConfigProvider();

        const name = t.resolveVirtualHostName(['github.com']);
        expect(name).toBe('github.com');
    });

    it("resolveVirtualHostName(): multi domains", function() {
        const t = new MockConfigProvider();

        const name = t.resolveVirtualHostName(['github.com', 'mock-where.com']);
        expect(name).toBe('github.com|mock-where.com');
    });

    it("normalizeVirtualHost(): happy", function() {
        const t = new MockConfigProvider();

        const config = {
            name: 'localhost'
        };
        const rules = {};

        const normalized = t.normalizeVirtualHost(config, rules);
        expect(normalized.rules).toEqual(rules);
        expect(normalized.config).toEqual(config);
        expect(normalized.name).toBe('localhost');
        expect(normalized.domains[0]).toBe('localhost');
    });

});