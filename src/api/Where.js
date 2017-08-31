const MissingParamError = require('qnode-error').MissingParamError;
const RequestError = require('qnode-error').RequestError;


/**
 * API: add a rule.
 * 
 * The rule should be in request body. 
 * Example: {
 *      port:  8000, // optional. if has default port, then take it, otherwise, throws error
 *      domain:  "github.com", // optional. if has default domain, then take it, otherwise, throws error
 *      name: "My rule name", // optional. assigned by default
 *      path: "/test", // optional. assigned to default path, if not specified
 *      method: "POST", // optional. assigned to default method, if not specified
 *      q: "ip='localhost'", // optional. assigned to default query, if not specified
 *      delay: 200, // optoinal. assigned to default delay, if not specified
 *      delayFix: 16, // optional. assigned to default delayFix, if not specified
 *      callback: {
 *        before: [
 *          async: true,
 *          method: 'POST',
 *          path: 'http://example.com/notify',
 *          header: {},
 *          query: {}, // or string
 *          type: 'application/json',
 *          body: {}, // or string, or stream, or file
 *          retry: 2,
 *          accept: 'application/xml'
 *        ],
 *        on: [ // always async
 *        ]
 *        after: [ // same as before
 *        ]   
 *      },
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

        let port = rule.port;
        if (!port) {
            if (!this._mockServerManager.defaultPort) throw new MissingParamError('port');
            port = this._mockServerManager.defaultPort;
        }

        const mockServer = this._mockServerManager.get(port);
        if (!mockServer) throw new RequestError('MOCK_SERVER_NOT_FOUND', port);

        let domain = rule.domain;
        if (!domain) {
            if (!mockServer.defaultDomain) throw new MissingParamError('domain');
            domain = mockServer.defaultDomain;
        }

        return { domain, rule, mockServer };
    }

    async execute(ctx, { domain, rule, mockServer }) {
        mockServer.putRule(domain, rule);
    }

}

Where.description = 'specifies how mock response when got specific request';
Where.method = 'post';

module.exports = Where;