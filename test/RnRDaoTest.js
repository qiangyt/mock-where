/* eslint no-undef: "off" */

const SRC = '../src';
const RnRDao = require(`${SRC}/RnRDao`);
const Beans = require('qnode-beans').Beans;

const beans = new Beans();

const target = new RnRDao();
beans.renderThenInitBean(target);

describe("RnRDao test suite: ", function() {

    beforeEach(function() {
        target._db.run("BEGIN TRANSACTION", function(err) {
            if (err) console.error(err);
        });
    });

    afterEach(function() {
        target._db.run("ROLLBACK TRANSACTION", function(err) {
            if (err) console.error(err);
        });
    });

    it("insert then list: happy", function(done) {
        const request1 = {
            protocol: 'http',
            method: 'get',
            header: {
                host: 'localhost',
                contentType: 'application/json'
            },
            path: '/p1',
            ip: '127.0.0.1',
            query: {
                a: 1
            },
            body: {
                x1: true
            }
        };
        const response1 = {
            status: 200,
            body: {
                y1: false
            }
        };

        const p1 = target.insert(request1, response1, 1234);
        p1.then(() => target.list(2, 0))
            .then(r => {
                expect(r.total).toBe(1);

                const item = r.items[0];
                expect(item._id).toBe(1);
                expect(item.protocol).toBe('http');
                expect(item.method).toBe('get');
                expect(item.ip).toBe('127.0.0.1');
                expect(item.host).toBe('localhost');
                expect(item.port).toBe(1234);
                expect(item.query).toBe('{"a":1}');
                expect(item.header).toBe('{"host":"localhost","contentType":"application/json"}');
                expect(item.path).toBe('/p1');
                expect(item.request_body).toBe('{"x1":true}');
                expect(item.status).toBe(200);
                expect(item.response_body).toBe('{"y1":false}');

            })
            .then(() => target.list(2, 1))
            .then(r => {
                expect(r.total).toBe(1);
                expect(r.items.length).toBe(0);
            })
            .then(() => {
                const request2 = {
                    protocol: 'https',
                    method: 'post',
                    header: {
                        host: 'github.com',
                        contentType: 'text/plain'
                    },
                    path: '/p2',
                    ip: '::1',
                    query: {
                        b: 2
                    },
                    body: {
                        x2: false
                    }
                };
                const response2 = {
                    body: {
                        y2: true
                    },
                    status: 403
                };
                return target.insert(request2, response2, 5678);
            })
            .then(() => target.list(2, 0))
            .then(r => {
                expect(r.total).toBe(2);

                const item0 = r.items[0];
                expect(item0._id).toBe(2);
                expect(item0.protocol).toBe('https');
                expect(item0.method).toBe('post');
                expect(item0.ip).toBe('::1');
                expect(item0.host).toBe('github.com');
                expect(item0.port).toBe(5678);
                expect(item0.query).toBe('{"b":2}');
                expect(item0.header).toBe('{"host":"github.com","contentType":"text/plain"}');
                expect(item0.path).toBe('/p2');
                expect(item0.request_body).toBe('{"x2":false}');
                expect(item0.status).toBe(403);
                expect(item0.response_body).toBe('{"y2":true}');

                const item1 = r.items[1];
                expect(item1._id).toBe(1);
            })
            .then(() => target.list(2, 1))
            .then(r => {
                expect(r.total).toBe(2);
                expect(r.items.length).toBe(1);

                const item = r.items[0];
                expect(item._id).toBe(1);
            })
            .then(() => done())
            .catch(err => {
                console.error(err);
                done(err);
                failhere();
            });
    });

});
