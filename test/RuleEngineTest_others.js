/* eslint no-undef: "off" */
const Beans = require('qnode-beans');
const _ = require('underscore');

const SRC = '../src';
const RuleEngine_alasql = require(`${SRC}/RuleEngine_alasql`);

function buildEngine(name, rules) {
    const beans = new Beans();
    const r = new RuleEngine_alasql(name, { rules });
    beans.renderThenInitBean(r, name);
    return r;
}

describe("RuleEngine test suite: ", function() {

    it("mock(): happy", function() {
        const rule = {
            path: '/ab',
            response: {
                delay: 100
            }
        };

        const re = buildEngine('test', { ab: rule });

        const request = {
            path: '/ab',
            method: 'get',
            url: 'https://host/ab',
            charset: 'utf-8',
            protocol: 'https',
            ip: '::1'
        };
        const response = {};

        const beginTime = new Date().getTime();

        return re.mock(request, response).then(() => {
            const duration = new Date().getTime() - beginTime;
            expect(duration).toBeLessThanOrEqual(120);
            expect(duration).toBeGreaterThanOrEqual(90);
        });
    });

    it("mock(): no rule matched", function() {
        const re = buildEngine('test', {});

        const request = {
            path: '/ab',
            method: 'get',
            url: 'https://host/ab',
            charset: 'utf-8',
            protocol: 'https',
            ip: '::1'
        };
        const response = {};

        re.mock(request, response)
            .then(() => failhere())
            .catch(e => expect(e.type.key).toBe('NO_RULE_MATCHES'))
            .catch(e => {
                console.error(e);
                failhere();
            });
    });

    it("normalizeEngineSpecificRuleAttributes(): take specific statement", function() {
        const re = buildEngine('test');
        const rule = { q: '1=1' };
        const r = re.normalizeEngineSpecificRuleAttributes(rule);
        expect(r.statement).toBe('select * from request where 1=1');
    });


    it("normalizeEngineSpecificRuleAttributes(): take default statement", function() {
        const re = buildEngine('test');
        const r = re.normalizeEngineSpecificRuleAttributes();
        expect(r.statement).toBe('select * from request');
    });

});