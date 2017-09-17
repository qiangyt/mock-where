const QueryString = require('querystring');
const DateFormat = require('dateformat');

DateFormat.masks.std = 'yyyy-mm-dd HH:MM:ss';

function formatDate(dateObject, format) {
    return DateFormat(dateObject || new Date(), format || 'std');
}

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
    urlDecode,
    formatDate
};