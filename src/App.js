/* eslint no-unused-vars:'off' */
/* eslint global-require:'off' */
const Path = require('path');
const ApiServer = require('qnode-rest').ApiServer;

global.PROJECT_PREFIX = 'mw';
const QNodeConfig = require('qnode-config');

const Logger = require('qnode-log');

function isMainModule() {
    const mainModuleFileName = process.mainModule.filename;
    const thisModuleFileName = module.filename;
    return mainModuleFileName === thisModuleFileName;
}

const cfg = global.config = QNodeConfig.load('config', undefined, true);
cfg.Beans = cfg.Beans || {};
if (!cfg.Beans.baseDir) {
    cfg.Beans.baseDir = Path.join(process.cwd(), 'src');
}

const Beans = require('qnode-beans');


class App {

    constructor() {
        this._logger = new Logger('App');
        this._beans = new Beans();

        this.mockServerManager = this._beans.create('./MockServerManager');

        this.apiServer = this._beans.create(ApiServer, 'ApiServer');

        this._beans.init();
    }

    start() {
        this.mockServerManager.start();
        this.apiServer.start();

        this._logger.info('started');
    }

}

if (isMainModule()) {
    const app = new App();
    app.start();
}

module.exports = App;