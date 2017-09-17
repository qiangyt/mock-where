const QueryString = require('querystring');
const moment = require('moment');

/**
 * 
 * @param {Date} dateObject date object
 * @param {string} format see http://momentjs.com/docs/#/displaying/
 */
function formatDate(m, format) {
    return m.format(format || 'YYYY-MM-DD HH:mm:ss');
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