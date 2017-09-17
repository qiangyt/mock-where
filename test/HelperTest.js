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

});