/* eslint no-unused-vars:'off' */
const Path = require('path');

global.PROJECT_PREFIX = 'mw';

const QNodeConfig = require('qnode-config');
const cfg = global.config = QNodeConfig.load('config', undefined, true);
if( !cfg.Beans ) cfg.Beans = {};
if( !cfg.Beans.baseDir ) cfg.Beans.baseDir = Path.join(process.cwd(), 'src');

const Logger = require('qnode-log');
const LOG = new Logger('App');

const Beans = require('qnode-beans');

const mockServerManager = Beans.create('./MockServerManager');

const apiServer = Beans.create('./ApiServer');

Beans.init();

mockServerManager.start();
apiServer.start();

LOG.info('started');