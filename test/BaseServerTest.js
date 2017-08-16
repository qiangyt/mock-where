/* eslint no-undef: "off" */

const SRC = '../src';
const BaseServer = require(`${SRC}/BaseServer`);
const MissingParamError = require('qnode-error').MissingParamError;
const InternalError = require('qnode-error').InternalError;
const Beans = require('qnode-beans').DEFAULT;


function buildBaseServer() {
    const r = new BaseServer();
    Beans.render(r);
    return r;
}

describe("BaseServer test suite: ", function() {

    it("formatJsonError(): formats non-INTERNAL_ERROR error as 400", function() {
        const s = buildBaseServer();
        const ctx = {};

        s.formatJsonError(ctx, new MissingParamError());

        expect(ctx.status).toBe(400);
        expect(ctx.body.key).toBe('MISSING_PARAMETER');
    });

    it("formatJsonError(): formats INTERNAL_ERROR BaseError as 500", function() {
        const s = buildBaseServer();
        const ctx = {};

        s.formatJsonError(ctx, new InternalError());

        expect(ctx.status).toBe(500);
        expect(ctx.body.key).toBe('INTERNAL_ERROR');
    });

    it("formatJsonError(): formats other error as 500", function() {
        const s = buildBaseServer();
        const ctx = {};

        s.formatJsonError(ctx, new Error('what?'));

        expect(ctx.status).toBe(500);
        expect(ctx.body.key).toBe('INTERNAL_ERROR');
        expect(ctx.body.message).toBe('internal error - what?');
    });



});