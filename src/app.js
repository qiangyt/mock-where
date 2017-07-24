const getLogger = require('./logger');
const _logger = getLogger('app');

const beans = require('./beans');

beans.create('./RuleEngine');
beans.create('./ApiServer');
beans.create('./MockServer');

_logger.info('app started');