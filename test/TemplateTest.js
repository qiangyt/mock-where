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

    it("compile(): compile error", function() {
        try {
            Template.compile('jade', 'div #{you');
            failhere();
        } catch (e) {
            expect(e.type.key).toBe('FAILED_TO_COMPILE_TEMPLATE');
        }
    });

    it("normalizeTemplate(): template is string", function() {
        const r = Template.normalizeTemplate('hi');
        expect(r.type).toBe('ejs');
        expect(r.text).toBe('hi');
        expect(r.func).toBeDefined();
    });

    it("normalizeTemplate(): template is a number", function() {
        const r = Template.normalizeTemplate(3);
        expect(r.type).toBe('ejs');
        expect(r.text).toBe('3');
        expect(r.func).toBeDefined();
    });

    it("normalizeTemplate(): template is zero", function() {
        const r = Template.normalizeTemplate(0);
        expect(r.type).toBe('ejs');
        expect(r.text).toBe('0');
        expect(r.func).toBeDefined();
    });

    it("normalizeTemplate(): template is not string and inputted", function() {
        const t = {
            type: 'handlebars',
            text: 'wow'
        };
        const r = Template.normalizeTemplate(t);
        expect(r.type).toBe('handlebars');
        expect(r.text).toBe('wow');
        expect(r.func).toBeDefined();
    });

    it("normalizeTemplate(): template is not string but not inputed", function() {
        const r = Template.normalizeTemplate({}, 'test', Template.buildDefault());
        expect(r.type).toBe('ejs');
        expect(r.text).toBeDefined();
        expect(r.func).toBeDefined();
    });

    it("normalizeTemplate(): template is not string and take default", function() {
        const dft = Template.buildDefault({ type: 'underscore' });
        const r = Template.normalizeTemplate({}, 'test', dft);
        expect(r.type).toBe('underscore');
        expect(r.text).toBeDefined();
        expect(r.func).toBeDefined();
    });

    it("normalizeTemplate(): template is not specified, take default", function() {
        const dft = Template.buildDefault({ type: 'underscore' });
        const r = Template.normalizeTemplate(null, 'test', dft);
        expect(r.type).toBe('underscore');
        expect(r.text).toBeDefined();
        expect(r.func).toBeDefined();
    });

    it("normalizeContent(): both object and template is defined", function() {
        try {
            Template.normalizeContent({ template: 'test', object: {} }, {});
            failhere();
        } catch (e) {
            expect(e.type.key).toBe('MULTIPLE_CONTENTS_NOT_ALLOWED');
        }
    });

    it("normalizeContent(): take template", function() {
        const r = {
            template: {
                type: 'mustache',
                text: 'dummy'
            }
        };
        Template.normalizeContent(r, {});
        expect(r.template.text).toBe('dummy');
        expect(r.template.type).toBe('mustache');
    });

    it("normalizeContent(): take template with a zero number", function() {
        let r = {
            template: 0
        };
        r = Template.normalizeContent(r, {}, 'body');
        expect(r.template.text).toBe('0');
        expect(r.template.type).toBe('ejs');
    });

    it("normalizeContent(): take object, should be json text", function() {
        let r = {
            object: 'dummy object'
        };
        r = Template.normalizeContent(r, {});
        expect(r.object).toBe('"dummy object"');
    });

    it("normalizeContent(): take object, but object is undefined too", function() {
        let r = {};
        r = Template.normalizeContent(r, {}, 'body');
        expect(r.object).toBe('"no object specified"');
    });

    it("normalizeContent(): take text", function() {
        let r = { text: 'dummy' };
        r = Template.normalizeContent(r, {}, 'body');
        expect(r.text).toBe('dummy');
    });

    it("normalizeContent(): content object itself is text", function() {
        let r = 'dummy text';
        r = Template.normalizeContent(r, {}, 'body');
        expect(r.text).toBe('dummy text');
    });


    it("render(): render as message with template", function() {
        const content = {
            template: {
                func: function(request) {
                    return `hi ${request.you}`;
                }
            }
        };

        const r = Template.render(content, { you: 'Yiting' });

        expect(r).toBe('hi Yiting');
    });

    it("render(): render with object", function() {
        const object = {};
        const content = { object };
        const r = Template.render(content, { you: 'Yiting' });
        expect(r).toEqual(object);
    });

    it("render(): render with text", function() {
        const content = { text: 'Yiting' };
        const r = Template.render(content);
        expect(r).toEqual('Yiting');
    });

    it("render(): fail to generate with template", function() {
        const content = {
            template: {
                func: function() {
                    throw new Error('mock exception to be ignored');
                }
            }
        };

        try {
            Template.render(content, { you: 'Yiting' });
        } catch (e) {
            expect(e.type.key).toBe('FAILED_TO_GENERATE_CONTENT_WITH_TEMPLATE');
        }
    });

});