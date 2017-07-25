const getLogger = require('./logger');
const _logger = getLogger('app');

const beans = require('./beans');

beans.create('./ApiServer');
beans.create('./MockServerManager');

beans.init();

_logger.info('app started');