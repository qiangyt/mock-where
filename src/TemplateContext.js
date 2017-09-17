const Helper = require('./Helper');
const moment = require('moment');

function normalize(context) {
    if (!context) return;

    if (!context.urlEncode) context.urlEncode = Helper.urlEncode;
    if (!context.urlDecode) context.urlDecode = Helper.urlDecode;
    if (!context.formatDate) context.formatDate = Helper.formatDate;
    if (!context.moment) context.moment = moment;

    return context;
}

module.exports = {
    normalize
};