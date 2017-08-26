/* eslint no-unused-vars:'off' */

global.PROJECT_PREFIX = 'mw';

const QNodeConfig = require('qnode-config');
global.config = QNodeConfig.load('config', undefined, true);

const Logger = require('qnode-log');
const LOG = new Logger('App');

const Beans = require('qnode-beans');

const mockServerManager = Beans.create('./MockServerManager');

const apiServer = Beans.create('./ApiServer');

Beans.init();

mockServerManager.start();
apiServer.start();

LOG.info('started');