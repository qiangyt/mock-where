const getLogger = require('./Logger');
const _logger = getLogger('app');

const Beans = require('./Beans');

Beans.create('./ApiServer');
Beans.create('./MockServerManager');

Beans.init();

_logger.info('app started');