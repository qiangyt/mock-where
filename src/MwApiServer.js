const ApiServer = require('qnode-rest').ApiServer;
const Kcors = require('kcors');


module.exports = class MwApiServer extends ApiServer {

    prepare() {
        this._koa.use(Kcors());

        super.prepare();
    }

    _findAllApiFiles() {
        return ['Where', 'rnr/List'];
    }

};