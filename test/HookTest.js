/* eslint no-undef: "off" */
const superagent = require('superagent');
const SuperAgentMocker = require('qnode-superagent-mocker');

const SRC = '../src';
const Hook = require(`${SRC}/Hook`);
const MissingParamError = require('qnode-error').MissingParamError;

describe("Hook test suite: ", function() {

    afterAll(function() {
        //if (mocker) mocker.unmock(superagent);
    });

    it("normalizeEnabledFlag(): happy", function() {
        expect(Hook.normalizeEnabledFlag()).toBeTruthy();
        expect(Hook.normalizeEnabledFlag(true)).toBeTruthy();
        expect(Hook.normalizeEnabledFlag(false)).toBeFalsy();
    });

    it("normalizeList(): happy", function() {
        expect(Hook.normalizeList(undefined).length).toBe(0);
        expect(Hook.normalizeList(null).length).toBe(0);
        expect(Hook.normalizeList([]).length).toBe(0);

        expect(Hook.normalizeList([{ path: '/a' }, { path: '/b' }]).length).toBe(2);
    });

    it("normalizeTarget(): method", function() {
        expect(Hook.normalizeTarget({ path: '/' }).method).toBe('post');
        expect(Hook.normalizeTarget({ path: '/', method: 'get' }).method).toBe('get');
    });

    it("normalizeTarget(): missing path", function() {
        try {
            expect(Hook.normalizeTarget({}));
            failhere();
        } catch (e) {
            expect(e instanceof MissingParamError).toBeTruthy();
            expect(e.args[0].indexOf('path')).toBeGreaterThan(0);
        }
    });

    it("needCallBefore(): happy", function() {
        const t1 = new Hook({ before: [] });
        expect(t1.needCallBefore()).toBeFalsy();

        const t2 = new Hook({ before: [{ path: '/' }] });
        const x = t2.needCallBefore();
        expect(x).toBeTruthy();
    });

    it("needCallAfter(): happy", function() {
        const t1 = new Hook({ after: [] });
        expect(t1.needCallAfter()).toBeFalsy();

        const t2 = new Hook({ after: [{ path: '/' }] });
        expect(t2.needCallAfter()).toBeTruthy();
    });

    it("_callOne(): none", function() {
        const target = {
            method: 'post',
            path: '/say'
        };
        const data = { you: 'Qiang Yiting' };

        const mocker = SuperAgentMocker(superagent);
        mocker.timeout = 100;
        mocker.post('/say', function() {
            return {
                code: '0',
                message: 'ok',
                data
            };
        });

        const c = new Hook({ before: [target] });
        c._callOne(target, {}).then(result => {
            expect(result.code).toBe('0');
            expect(result.message).toBe('ok');
            expect(result.data).toEqual(data);
        }).catch(e => {
            console.error(e);
            failhere();
        });
    });


    it("_callOne(): full", function() {
        const target = {
            method: 'post',
            path: '/say',
            header: { 'x-header': 'x-header-value' },
            query: { 'x-query': 'x-query-value' },
            type: 'application/json',
            accept: 'application/json',
            body: {
                bodyKey: 'bodyValue'
            }
        };
        const data = {
            header: target.header,
            query: target.query,
            type: target.type,
            accept: target.accept,
            body: target.body
        };

        const mocker = SuperAgentMocker(superagent);
        mocker.timeout = 100;
        mocker.post('/say', function() {
            return { code: '0', message: 'ok', data }
        });

        const c1 = new Hook({ before: [target] });
        c1._callOne(target, {}).then(result => {
            expect(result.code).toBe('0');
            expect(result.message).toBe('ok');
            expect(result.data).toEqual(data);
        }).catch(e => {
            console.error(e);
            failhere();
        });
    });

    it("_callList(): list is empty", function() {
        new Hook({})._callList([])
            .then(r => expect(r).not.toBeDefined());
    });

    it("_callList(): single", function() {
        const target = {
            method: 'get',
            path: '/say'
        };

        const mocker = SuperAgentMocker(superagent);
        mocker.timeout = 100;
        mocker.get('/say', function() {
            return {
                code: '0',
                message: 'ok',
                data: 'wow'
            };
        });

        const c = new Hook({ before: [target] });
        c._callList([target], {}).then(result => {
            expect(result.code).toBe('0');
            expect(result.message).toBe('ok');
            expect(result.data).toBe('wow');
        }).catch(e => {
            console.error(e);
            failhere();
        });
    });

    it("_callList(): multi A->B", function() {
        const targetA = {
            method: 'post',
            path: '/sayA'
        };
        const targetB = {
            method: 'get',
            path: '/sayB'
        };

        const mocker = SuperAgentMocker(superagent);
        mocker.timeout = 100;
        mocker.post('/sayA', function() {
            return {
                code: '0',
                message: 'ok',
                data: 'A'
            };
        });
        mocker.get('/sayB', function() {
            return {
                code: '0',
                message: 'ok',
                data: 'B'
            };
        });

        const c = new Hook({ before: [targetA, targetB] });
        c._callList([targetA, targetB], {}).then(result => {
            expect(result.code).toBe('0');
            expect(result.message).toBe('ok');
            expect(result.data).toBe('B');
        }).catch(e => {
            console.error(e);
            failhere();
        });
    });

    it("_callList(): multi B->A", function() {
        const targetA = {
            method: 'post',
            path: '/sayA'
        };
        const targetB = {
            method: 'get',
            path: '/sayB'
        };

        const mocker = SuperAgentMocker(superagent);
        mocker.timeout = 100;
        mocker.post('/sayA', function() {
            return {
                code: '0',
                message: 'ok',
                data: 'A'
            };
        });
        mocker.get('/sayB', function() {
            return {
                code: '0',
                message: 'ok',
                data: 'B'
            };
        });

        const c = new Hook({ before: [targetA, targetB] });
        c._callList([targetB, targetA], {}).then(result => {
            expect(result.code).toBe('0');
            expect(result.message).toBe('ok');
            expect(result.data).toBe('A');
        }).catch(e => {
            console.error(e);
            failhere();
        });
    });

    it("callBefore(): happy", function() {
        const target = {
            method: 'get',
            path: '/before'
        };

        const mocker = SuperAgentMocker(superagent);
        mocker.timeout = 100;
        mocker.get('/before', function() {
            return { code: '0' };
        });

        const c = new Hook({ before: [target] });
        c.callBefore([target]).then(result => {
            expect(result.code).toBe('0');
        }).catch(e => {
            console.error(e);
            failhere();
        });
    });

    it("callAfter(): happy", function() {
        const target = {
            method: 'get',
            path: '/after'
        };

        const mocker = SuperAgentMocker(superagent);
        mocker.timeout = 100;
        mocker.get('/after', function() {
            return { code: '1' };
        });

        const c = new Hook({ after: [target] });
        c.callAfter([target]).then(result => {
            expect(result.code).toBe('1');
        }).catch(e => {
            console.error(e);
            failhere();
        });
    });

});