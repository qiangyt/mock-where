const Helper = require('./Helper');

function normalize(context) {
    if (!context) return;

    if (!context.urlEncode) context.urlEncode = Helper.urlEncode;
    if (!context.urlDecode) context.urlDecode = Helper.urlDecode;
    if (!context.formatDate) context.formatDate = Helper.formatDate;

    return context;
}

module.exports = {
    normalize
};