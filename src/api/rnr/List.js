/**
 * 
 */
class List {

    init() {
        this._RnRDao = this._beans.load('RnRDao');
    }

    async execute(ctx) {
        const q = ctx.request.query;

        const page = q.page || 1;
        const limit = q.limit || 20;

        return this._RnRDao.list(limit, (page - 1) * limit);
    }

}

List.description = 'list request and response';
List.method = 'get';

module.exports = List;