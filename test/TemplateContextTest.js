/* eslint no-undef: "off" */

const SRC = '../src';
const TemplateContext = require(`${SRC}/TemplateContext`);

describe("TemplateContext test suite: ", function() {

    it("urlEncode(): happy", function() {
        expect(TemplateContext.urlEncode('中')).toBe('%E4%B8%AD');
    });

    it("urlDecode(): happy", function() {
        expect(TemplateContext.urlDecode('%E4%B8%AD')).toBe('中');
    });

    it("normalize(): happy", function() {
        const r = TemplateContext.normalize({});
        expect(r.urlEncode).toEqual(TemplateContext.urlEncode);
        expect(r.urlDecode).toEqual(TemplateContext.urlDecode);
    });

    it("normalize(): don't overwrite", function() {
        const r = TemplateContext.normalize({
            urlEncode: 'urlEncode',
            urlDecode: 'urlDecode'
        });
        expect(r.urlEncode).toBe('urlEncode');
        expect(r.urlDecode).toBe('urlDecode');
    });

});