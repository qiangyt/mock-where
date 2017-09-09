const RuleEngine = require('./RuleEngine');
const alasql = require('alasql');


module.exports = class RuleEngineAlasql extends RuleEngine {

    init() {
        super.init();

        this._db = this._initDatabase();
        this._requestTable = this._db.tables.request;
    }

    /**
     * The rule database is a request database servers by alasql engine.
     * So far, the database is dynamic and stores only 1 row of request.
     */
    _initDatabase() {
        // the alasql database name should be globally unique, otherwise,
        // the database data will interfere across rule engines
        const r = new alasql.Database(this._name /*, { cache: false }*/ );
        this._logger.debug('rule database is created');

        r.exec('create table request');
        this._logger.debug('request table is is created');

        return r;
    }

    prepareRule(rule) {
        const r = rule || {};
        r.statement = 'select * from request' + (r.q ? ` where ${r.q}` : '');
        return r;
    }

    /**
     * Find matched rule.
     * 
     * The matching procedure is:
     * 1) Find rule candidates in rule tree, by HTTP method and path
     * 2) Execute SQL statement defined in rule candidates, one by one, on request object, 
     *    the 1st rule that passed the SQL query is the winner.
     * 
     * @param {object} req 
     */
    _filterRule(req, candidateRules) {

        try {
            // Because we're inserting the current request into the global request
            // table, and the inserted is temporary data which will be erased
            // finally (see the tail of this method), to avoid multiple request
            // accessing the same one table to rase concurrency issues, we should
            // be careful not to do any asynchronous things before the inserted
            // temporary data is erased finally.
            // 
            // This works but not a good solution, because it stops any potential
            // performance/concurrency improvement which may be done by async execution.
            // So far I think we could replace this approach by belows:
            // 1. create table always per request
            // 2. modify alasql to support dynamic table
            // 3. use transaction to isolate un-committed data and rollback after done
            // 4. use 'SELECT directly on your JavaScript data' (https://github.com/agershun/alasql)
            // 
            this._requestTable.data = [this._buildRequestData(req)];

            for (const rule of candidateRules) {
                const stmt = rule.statement;
                this._logger.debug(`executing: ${stmt}`);

                const matched = this._db.exec(stmt);
                if (matched.length > 0) {
                    this._logger.info('found matched rule: %s', rule);
                    return rule;
                }
            }

            return null;
        } finally {
            this._requestTable.data = [];
        }
    }


}