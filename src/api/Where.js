const MissingParamError = require('qnode-error').MissingParamError;
const RequestError = require('qnode-error').RequestError;


/**
 * API: add a rule.
 * 
 * The rule should be in request body. 
 * Example: {
 *      port:  8000,
 *      domain:  "github.com",
 *      name: "My rule name", // optional. assigned by default
 *      path: "/test", // optional. assigned to default path, if not specified
 *      method: "POST", // optional. assigned to default method, if not specified
 *      q: "ip='localhost'", // optional. assigned to default query, if not specified
 *      delay: 200, // optoinal. assigned to default delay, if not specified
 *      delayFix: 16, // optional. assigned to default delayFix, if not specified
 *      response:  // optional. merged with default response
 *      {
 *          status: 403,
 *          type: "application/json",
 *          template:  // exclusive with "body"
 *          {
 *              type: "mustache", // optional. if not specified, assigned to "ejs" 
 *                                // if template is text, otherwise to default response.templateType
 *              text: "hi", // optional. if not specified, assigned to "template text not specified"
 *          },
 *          body: // exclusive with "template".
 *                // could be any JSON-stringify-able object, string, or primitive value,
 *                // "no response body specified", if not specified
 *          {
 *          }
 *      }
 * }
 */
class Where {

    init() {
        this._mockServerManager = this._beans.load('MockServerManager');
    }

    async validate(ctx) {
        const req = ctx.request;

        const rule = req.body;
        this._logger.info('rule is requested: %s', rule);

        const domain = rule.domain;
        if (!domain) throw new MissingParamError('domain');

        const port = rule.port;
        if (!port) throw new MissingParamError('port');

        const mockServer = this._mockServerManager.get(port);
        if (!mockServer) throw new RequestError('MOCK_SERVER_NOT_FOUND', port);

        return { domain, rule, mockServer };
    }

    async execute(ctx, { domain, rule, mockServer }) {
        mockServer.putRule(domain, rule);
    }

}

Where.description = 'specifies how mock response when got specific request';
Where.method = 'post';

module.exports = Where;