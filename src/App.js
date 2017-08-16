/* eslint no-unused-vars:'off' */

global.PROJECT_PREFIX = 'mw';

const QNodeConfig = require('qnode-config');
global.config = QNodeConfig.load('config', undefined, true);

const Logger = require('qnode-log');
const LOG = new Logger('App');

const Beans = require('qnode-beans').DEFAULT;

Beans.create('./ApiServer');
Beans.create('./MockServerManager');

Beans.init();

LOG.info('app started');