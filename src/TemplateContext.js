const Helper = require('./Helper');

function normalize(context) {
    if (!context) return;

    if (!context.urlEncode) context.urlEncode = Helper.urlEncode;
    if (!context.urlDecode) context.urlDecode = Helper.urlDecode;

    return context;
}

module.exports = {
    normalize
};