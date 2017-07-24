var log4js = require('log4js');

var logger = log4js.getLogger();
logger.level = 'debug'; // default level is OFF - which means no logs at all.
module.exports = logger;