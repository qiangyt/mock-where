/* eslint no-undef: "off" */

const SRC = '../src';
const Helper = require(`${SRC}/Helper`);
const moment = require('moment');

describe("Helper test suite: ", function() {

    it("urlEncode(): happy", function() {
        expect(Helper.urlEncode('中')).toBe('%E4%B8%AD');
    });

    it("urlDecode(): happy", function() {
        expect(Helper.urlDecode('%E4%B8%AD')).toBe('中');
    });

    it("formatDate(): happy", function() {
        const m = moment('2017-09-17 23:32:43', 'YYYY-MM-DD HH:mm:ss');
        expect(Helper.formatDate(m)).toBe('2017-09-17 23:32:43');
    });
});