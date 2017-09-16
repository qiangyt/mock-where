const QueryString = require('querystring');

function urlEncode(a) {
    return QueryString.escape(a);
}


function urlDecode(a) {
    return QueryString.unescape(a);
}


function normalize(context) {
    if (!context) return;

    if (!context.urlEncode) context.urlEncode = urlEncode;
    if (!context.urlDecode) context.urlDecode = urlDecode;

    return context;
}

module.exports = {
    normalize,
    urlEncode,
    urlDecode
};