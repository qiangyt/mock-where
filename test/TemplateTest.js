/* eslint no-undef: "off" */

const SRC = '../src';
const Template = require(`${SRC}/Template`);

describe("Template test suite: ", function() {

    it("buildDefault(): not specified", function() {
        const r = Template.buildDefault();

        expect(r.type).toBe('ejs');
        expect(r.text).not.toBeNull();
    });

    it("buildDefault(): specified", function() {
        const input = {
            type: 'handlebars',
            text: 'hello'
        };
        const r = Template.buildDefault(input);

        expect(r.type).toBe(input.type);
        expect(r.text).toBe(input.text);
    });

    it("compile(): ejs", function() {
        const f = Template.compile('ejs', 'hi <%=you%>');
        expect(f instanceof Function).toBeTruthy();
        expect(f({ you: 'Qiang Yiting' })).toBe('hi Qiang Yiting');
    });

    it("compile(): mustache", function() {
        const f = Template.compile('mustache', 'hi {{you}}');
        expect(f instanceof Function).toBeTruthy();
        expect(f({ you: 'Qiang Yiting' })).toBe('hi Qiang Yiting');
    });

    it("compile(): lodash", function() {
        const f = Template.compile('lodash', 'hi <%=you%>');
        expect(f instanceof Function).toBeTruthy();
        expect(f({ you: 'Qiang Yiting' })).toBe('hi Qiang Yiting');
    });

    it("compile(): underscore", function() {
        const f = Template.compile('underscore', 'hi <%=you%>');
        expect(f instanceof Function).toBeTruthy();
        expect(f({ you: 'Qiang Yiting' })).toBe('hi Qiang Yiting');
    });

    it("compile(): handlebars", function() {
        const f = Template.compile('handlebars', 'hi {{you}}');
        expect(f instanceof Function).toBeTruthy();
        expect(f({ you: 'Qiang Yiting' })).toBe('hi Qiang Yiting');
    });

    it("compile(): jade", function() {
        const f = Template.compile('jade', 'div #{you}');
        expect(f instanceof Function).toBeTruthy();
        expect(f({ you: 'Qiang Yiting' })).toBe('<div>Qiang Yiting</div>');
    });

    it("compile(): pug", function() {
        const f = Template.compile('pug', 'div #{you}');
        expect(f instanceof Function).toBeTruthy();
        expect(f({ you: 'Qiang Yiting' })).toBe('<div>Qiang Yiting</div>');
    });

    it("compile(): unknown template type", function() {
        try {
            Template.compile('xxx', 'hi {{you}}');
            failhere();
        } catch (e) {
            expect(e.type.key).toBe('UNSUPPORTED_TEMPLATE_TYPE');
        }
    });


});