const Sqlite3 = require('sqlite3').verbose();
const moment = require('moment');
const Helper = require('./Helper');

/**
 * Manages and execute proxy
 */
module.exports = class RnRDao {

    init() {
        this.createDb();
    }

    createDb() {
        const logger = this._logger;

        logger.info('creating rnr database');

        const db = new Sqlite3.Database(':memory:', err => {
            if (err) logger.error(err);
            else logger.info('created rnr database');
        });

        db.serialize(() => {
            db.run(`CREATE TABLE rnr (
                _id         INTEGER PRIMARY KEY, 
                created_at  VARCHAR(32), 
                host        TEXT, 
                port        INTEGER, 
                path        TEXT, 
                request     TEXT, 
                status      INTEGER, 
                response    TEXT
            )`);

            const sql_insert = `INSERT INTO rnr 
                (created_at, host, port, path, request, status, response) 
                VALUES 
                ($created_at, $host, $port, $path, $request, $status, $response)`;
            this._stmt_insert = db.prepare(sql_insert, err => {
                if (err) logger.error(err);
                else logger.debug('prepared insert statement');
            });

            const sql_list = `SELECT * FROM rnr LIMIT $limit OFFSET $offset`;
            this._stmt_list = db.prepare(sql_list, err => {
                if (err) logger.error(err);
                else logger.debug('prepared list statement');
            });

            const sql_count = `SELECT COUNT(1) c FROM rnr`;
            this._stmt_count = db.prepare(sql_count, err => {
                if (err) logger.error(err);
                else logger.debug('prepared count statement');
            });
        });

        this._db = db;
        return db;
    }

    insert(request, response) {
        const row = {
            created_at: Helper.formatDate(moment()),
            host: request.host,
            port: request.port,
            path: request.path,
            request: request.body,
            status: response.status,
            response: ('string' === typeof response.body) ? response.body : JSON.stringify(response.body)
        };
        this._stmt_insert.run(row, err => {
            this._logger.error(err);
        });
    }

    async list(limit, offset) {
        const countP = new Promise((resolve, reject) => {
            this._stmt_count.get((err, row) => {
                if (err) {
                    this._logger.error(err);
                    return reject(err);
                }
                resolve(row['c']);
            });
        });

        const listP = new Promise((resolve, reject) => {
            this._stmt_list.all({ $limit: limit, $offset: offset }, (err, rows) => {
                if (err) {
                    this._logger.error(err);
                    return reject(err);
                }
                resolve(rows);
            });
        });

        return Promise.all([countP, listP]).then(result => {
            const r = {
                items: result[1],
                total: result[0]
            };
            return r;
        }).catch(err => {
            this._logger.error(err);
        });
    }

};