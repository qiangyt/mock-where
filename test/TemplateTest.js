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

    it("normalize(): template is string", function() {
        const r = Template.normalize('hi');
        expect(r.type).toBe('ejs');
        expect(r.text).toBe('hi');
        expect(r.func).toBeDefined();
    });

    it("normalize(): template is a number", function() {
        const r = Template.normalize(3);
        expect(r.type).toBe('ejs');
        expect(r.text).toBe('3');
        expect(r.func).toBeDefined();
    });

    it("normalize(): template is zero", function() {
        const r = Template.normalize(0);
        expect(r.type).toBe('ejs');
        expect(r.text).toBe('0');
        expect(r.func).toBeDefined();
    });

    it("normalize(): template is not string and inputted", function() {
        const t = {
            type: 'handlebars',
            text: 'wow'
        };
        const r = Template.normalize(t);
        expect(r.type).toBe('handlebars');
        expect(r.text).toBe('wow');
        expect(r.func).toBeDefined();
    });

    it("normalize(): template is not string but not inputed", function() {
        const r = Template.normalize({}, 'test', Template.buildDefault());
        expect(r.type).toBe('ejs');
        expect(r.text).toBeDefined();
        expect(r.func).toBeDefined();
    });

    it("normalize(): template is not string and take default", function() {
        const dft = Template.buildDefault({ type: 'underscore' });
        const r = Template.normalize({}, 'test', dft);
        expect(r.type).toBe('underscore');
        expect(r.text).toBeDefined();
        expect(r.func).toBeDefined();
    });

    it("normalizeContent(): both object and template is defined", function() {
        try {
            Template.normalizeContent({ bodyTemplate: 'test', body: {} }, {}, 'body');
            failhere();
        } catch (e) {
            expect(e.type.key).toBe('MULTIPLE_CONTENTS_NOT_ALLOWED');
        }
    });

    it("normalizeContent(): take template", function() {
        const r = {
            bodyTemplate: {
                type: 'mustache',
                text: 'dummy'
            }
        };
        Template.normalizeContent(r, {}, 'body');
        expect(r.bodyTemplate.text).toBe('dummy');
        expect(r.bodyTemplate.type).toBe('mustache');
    });

    it("normalizeContent(): take template with a zero number", function() {
        const r = {
            bodyTemplate: 0
        };
        Template.normalizeContent(r, {}, 'body');
        expect(r.bodyTemplate.text).toBe('0');
        expect(r.bodyTemplate.type).toBe('ejs');
    });

    it("normalizeContent(): take object, should be json text", function() {
        const r = {
            body: 'dummy body'
        };
        Template.normalizeContent(r, {}, 'body');
        expect(r.body).toBe('"dummy body"');
    });

    it("normalizeContent(): take object, but object is undefined too", function() {
        const r = {};
        Template.normalizeContent(r, {}, 'body');
        expect(r.body).toBe('"no object specified"');
    });

});