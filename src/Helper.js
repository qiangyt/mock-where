const QueryString = require('querystring');

function urlEncode(a) {
    return QueryString.escape(a);
}


function urlDecode(a) {
    return QueryString.unescape(a);
}

function isMainModule(thisModuleFileName) {
    const mainModuleFileName = process.mainModule.filename;
    return mainModuleFileName === thisModuleFileName;
}

module.exports = {
    isMainModule,
    urlEncode,
    urlDecode
};