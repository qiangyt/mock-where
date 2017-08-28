/* eslint no-undef: "off" */

const SRC = '../src';
const BaseServer = require(`${SRC}/BaseServer`);
const qnodeError = require('qnode-error');
const MissingParamError = qnodeError.MissingParamError;
const InternalError = qnodeError.InternalError;
const RequestError = qnodeError.RequestError;
const Beans = require('qnode-beans');

function buildBaseServer() {
    const beans = new Beans();
    const r = new BaseServer();
    beans.render(r);
    return r;
}

describe("BaseServer test suite 1: ", function() {

    it("formatJsonError(): 403", function() {
        const s = buildBaseServer();
        const ctx = {};

        s.formatJsonError(ctx, new RequestError('NO_PERMISSION'));
        expect(ctx.status).toBe(403);
        expect(ctx.body.key).toBe('NO_PERMISSION');

        s.formatJsonError(ctx, new RequestError('INVALID_AUTH_TOKEN'));
        expect(ctx.status).toBe(403);
        expect(ctx.body.key).toBe('INVALID_AUTH_TOKEN');

        s.formatJsonError(ctx, new RequestError('SESSION_NOT_FOUND'));
        expect(ctx.status).toBe(403);
        expect(ctx.body.key).toBe('SESSION_NOT_FOUND');

        s.formatJsonError(ctx, new RequestError('INVALID_SESSION'));
        expect(ctx.status).toBe(403);
        expect(ctx.body.key).toBe('INVALID_SESSION');

        s.formatJsonError(ctx, new RequestError('INVALID_AUTH_FORMAT'));
        expect(ctx.status).toBe(403);
        expect(ctx.body.key).toBe('INVALID_AUTH_FORMAT');

        s.formatJsonError(ctx, new RequestError('EXPIRED_AUTH_TOKEN'));
        expect(ctx.status).toBe(403);
        expect(ctx.body.key).toBe('EXPIRED_AUTH_TOKEN');
    });

    it("formatJsonError(): formats *_NOT_FOUND error as 404", function() {
        const s = buildBaseServer();
        const ctx = {};

        s.formatJsonError(ctx, new RequestError('API_NOT_FOUND'));
        expect(ctx.status).toBe(404);
        expect(ctx.body.key).toBe('API_NOT_FOUND');

        s.formatJsonError(ctx, new RequestError('SERVICE_NOT_FOUND'));
        expect(ctx.status).toBe(404);
        expect(ctx.body.key).toBe('SERVICE_NOT_FOUND');

        s.formatJsonError(ctx, new RequestError('SERVER_NOT_FOUND'));
        expect(ctx.status).toBe(404);
        expect(ctx.body.key).toBe('SERVER_NOT_FOUND');

        s.formatJsonError(ctx, new RequestError('VHOST_NOT_FOUND'));
        expect(ctx.status).toBe(404);
        expect(ctx.body.key).toBe('VHOST_NOT_FOUND');
    });

    it("formatJsonError(): formats other non-INTERNAL_ERROR error as 400", function() {
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