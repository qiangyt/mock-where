const Koa = require('koa');
const KoaStatic = require('koa-static');
const Path = require('path');
const Fs = require('fs');
const Http = require('http');

module.exports = class WebUI {

    init() {
        const cfg = this._config;
        WebUI.normalizeConfig(cfg);

        if (!WebUI.doesUiFilesExists(cfg)) throw new Error('web ui files NOT found');

        this._koa = new Koa();
        this._koa.use(KoaStatic(cfg.root, cfg));
    }

    async start() {
        const logger = this._logger;
        logger.debug('starting webui: %s', this._name);

        const port = this._config.port;
        if (!port) throw new Error(`port NOT specified for ${this._name}`);

        this._server = Http.createServer(this._koa.callback()).listen(port, err => {
            if (err) logger.error(err);
            else logger.info('port listening on: %s\n', port);
        });

        this.started = true;

        return this._server;
    }

    static doesUiFilesExists(config) {
        config = config || {};
        WebUI.normalizeConfig(config);

        try {
            /* eslint no-sync:'off' */
            Fs.statSync(Path.join(config.root, 'index.html'));
            return true;
        } catch (e) {
            return false;
        }
    }

    static normalizeConfig(config) {
        config.root = config.root || './mock-where-webui/dist';
        config.port = config.port || 8080;
    }

};
