const ejs = require('ejs');
const Mustache = require('mustache');
const RequestError = require('qnode-error').RequestError;
const lodash = require('lodash');
const underscore = require('underscore');
const Handlebars = require('handlebars');
const Jade = require('jade');
const Pug = require('pug');


module.exports = function(type, text) {

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

    throw new RequestError('UNSUPPORTED_TEMPLATE_TYPE', type);

};