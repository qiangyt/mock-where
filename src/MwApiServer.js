const ApiServer = require('qnode-rest').ApiServer;

module.exports = class MwApiServer extends ApiServer {

    _findAllApiFiles() {
        return ['Where', 'rnr/List'];
    }

};