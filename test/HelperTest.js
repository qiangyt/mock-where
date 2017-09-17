/* eslint no-undef: "off" */

const SRC = '../src';
const Helper = require(`${SRC}/Helper`);

describe("Helper test suite: ", function() {

    it("urlEncode(): happy", function() {
        expect(Helper.urlEncode('中')).toBe('%E4%B8%AD');
    });

    it("urlDecode(): happy", function() {
        expect(Helper.urlDecode('%E4%B8%AD')).toBe('中');
    });

    it("formatDate(): happy", function() {
        const date = new Date();
        date.setFullYear(2017, 8, 17);
        date.setHours(23, 32, 43, 0);
        expect(Helper.formatDate(date, 'std')).toBe('2017-09-17 23:32:43');
    });
});