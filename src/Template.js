const ejs = require('ejs');
const Mustache = require('mustache');
const RequestError = require('qnode-error').RequestError;
const lodash = require('lodash');
const underscore = require('underscore');
const Handlebars = require('handlebars');
const Jade = require('jade');
const Pug = require('pug');
const Logger = require('qnode-log');

const _logger = new Logger('Template');


function buildDefault(input) {
    const r = input || {};
    r.type = r.type || 'ejs';
    r.text = r.text || 'template text not specified';
    return r;
}


function compile(type, text, ruleName) {

    //if (text.indexOf('require(') >= 0) {
    //
    //  }

    try {
        if ('ejs' === type) {
            return ejs.compile(text);
        }

        if ('mustache' === type) {
            Mustache.parse(text);
            return data => Mustache.render(text, data);
        }

        if ('lodash' === type) {
            return lodash.template(text);
        }

        if ('underscore' === type) {
            return underscore.template(text);
        }

        if ('handlebars' === type) {
            return Handlebars.compile(text);
        }

        if ('jade' === type) {
            return Jade.compile(text);
        }

        if ('pug' === type) {
            return Pug.compile(text);
        }
    } catch (e) {
        _logger.error(e);
        throw new RequestError('FAILED_TO_COMPILE_TEMPLATE', ruleName, type, text);
    }

    throw new RequestError('UNSUPPORTED_TEMPLATE_TYPE', ruleName, type);

}


function normalizeTemplate(template, ruleName, deftTemplate) {
    let type;
    let text;

    if (template === undefined || template === null) {
        type = deftTemplate.type;
        text = deftTemplate.text;
    } else if (typeof template !== 'object') {
        type = 'ejs';
        text = '' + template;
    } else {
        type = template.type || deftTemplate.type;
        text = template.text || deftTemplate.text;
    }

    return {
        type,
        text,
        func: compile(type, text, ruleName)
    };
}

function normalizeContent(content, defaultContent, ruleName) {
    if (typeof content === 'string') {
        return { text: content };
    }

    const template = content.template;
    const object = content.object;
    const text = content.text;

    if ((template && object) || (template && text) || (object && text)) {
        throw new RequestError('MULTIPLE_CONTENTS_NOT_ALLOWED', ruleName);
    }

    if (template !== undefined && template !== null) {
        return {
            template: normalizeTemplate(template, ruleName, defaultContent.template)
        };
    }

    if (text !== undefined && text !== null) {
        return { text };
    }

    return {
        object: JSON.stringify(content.object || 'no object specified')
    };
}

/**
 * Render the template-ized content
 * 
 * @param {object} content 
 * @param {object} context 
 */
function render(content, context) {
    if (content.template) {
        try {
            return content.template.func(context);
        } catch (e) {
            throw new RequestError('FAILED_TO_GENERATE_CONTENT_WITH_TEMPLATE', e.message);
        }
    }
    if (content.object) {
        return content.object;
    }
    return content.text;
}

module.exports = {
    compile,
    buildDefault,
    normalizeTemplate,
    normalizeContent,
    render
};