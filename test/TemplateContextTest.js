/* eslint no-undef: "off" */
const moment = require('moment');

const SRC = '../src';
const Helper = require(`${SRC}/Helper`);
const TemplateContext = require(`${SRC}/TemplateContext`);

describe("TemplateContext test suite: ", function() {

    it("normalize(): happy", function() {
        expect(TemplateContext.normalize()).not.toBeDefined();

        const r = TemplateContext.normalize({});
        expect(r.urlEncode).toEqual(Helper.urlEncode);
        expect(r.urlDecode).toEqual(Helper.urlDecode);
        expect(r.formatDate).toEqual(Helper.formatDate);
    });

    it("normalize(): don't overwrite", function() {
        const r = TemplateContext.normalize({
            urlEncode: 'urlEncode',
            urlDecode: 'urlDecode',
            formatDate: 'formatDate',
            moment: 'moment'
        });

        expect(r.urlEncode).toBe('urlEncode');
        expect(r.urlDecode).toBe('urlDecode');
        expect(r.formatDate).toBe('formatDate');
        expect(r.moment).toBe('moment');
    });

});