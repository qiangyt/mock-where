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
                _id           INTEGER PRIMARY KEY, 
                created_at    VARCHAR(32), 
                protocol      VARCHAR(8), 
                method        VARCHAR(8), 
                ip            VARCHAR(64), 
                host          TEXT, 
                port          INTEGER, 
                query         TEXT,
                header        TEXT,
                path          TEXT, 
                request_body  TEXT, 
                status        INTEGER, 
                response_body TEXT
            )`);
        });

        this._db = db;
        return db;
    }

    insert(request, response, port) {
        const row = {
            $created_at: Helper.formatDate(moment()),
            $protocol: request.protocol,
            $method: request.method,
            $host: request.header.host,
            $port: port,
            $path: request.path,
            $ip: request.ip,
            $header: JSON.stringify(request.header),
            $query: ('string' === typeof request.query) ? request.query : JSON.stringify(request.query),
            $requestBody: ('string' === typeof request.body) ? request.body : JSON.stringify(request.body),
            $status: response.status,
            $responseBody: ('string' === typeof response.body) ? response.body : JSON.stringify(response.body)
        };

        const sql = `INSERT INTO rnr 
        (created_at, protocol, method, host, port, path, ip, header, query, request_body, status, response_body) 
        VALUES 
        ($created_at, $protocol, $method, $host, $port, $path, $ip, $header, $query, $requestBody, $status, $responseBody)`;

        return new Promise((resolve, reject) => {
            this._db.run(sql, row, err => {
                if (err) {
                    this._logger.error(err);
                    return reject(err);
                }
                resolve();
            });
        });
    }

    async list(limit, offset) {
        const countP = new Promise((resolve, reject) => {
            const sql = `SELECT COUNT(1) c FROM rnr`;
            this._db.get(sql, (err, row) => {
                if (err) {
                    this._logger.error(err);
                    return reject(err);
                }
                resolve(row['c']);
            });
        });

        const listP = new Promise((resolve, reject) => {
            const sql = `SELECT * FROM rnr order by _id desc LIMIT $limit OFFSET $offset`;
            this._db.all(sql, { $limit: limit, $offset: offset }, (err, rows) => {
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
            throw err;
        });
    }

};