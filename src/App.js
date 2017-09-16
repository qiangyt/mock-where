/* eslint no-unused-vars:'off' */
/* eslint global-require:'off' */
const Path = require('path');
const ApiServer = require('qnode-rest').ApiServer;
const QError = require('qnode-error');
const Helper = require('./Helper');

global.PROJECT_PREFIX = 'mw';
const QConfig = require('qnode-config');

const cfg = global.config = QConfig.load('./config/config', undefined, true);
cfg.Beans = cfg.Beans || {};
if (!cfg.Beans.baseDir) {
    cfg.Beans.baseDir = Path.join(process.cwd(), 'src');
}

const Beans = require('qnode-beans');

const Errors = require('qnode-error').Errors;
Errors.register(1001, 2000, './src/MwErrorCode');

const Logger = require('qnode-log');
const logger = new Logger('App');

class App {

    constructor() {
        this._beans = new Beans();

        this.mockServerManager = this._beans.create('./MockServerManager');

        this.apiServer = this._beans.create(ApiServer, 'ApiServer');

        this._beans.init();
    }

    start() {
        this.mockServerManager.start();
        this.apiServer.start();

        logger.info('started');
    }

}

if (Helper.isMainModule(module.filename)) {
    try {
        const app = new App();
        app.start();
    } catch (e) {
        if (e instanceof QError.BaseError) {
            logger.error(e.build('en-US').message);
        }

        logger.error(e.stack);

        /* eslint no-process-exit:off */
        process.exit(1);
    }
}

module.exports = App;