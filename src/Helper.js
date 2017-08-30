function isMainModule(thisModuleFileName) {
    const mainModuleFileName = process.mainModule.filename;
    return mainModuleFileName === thisModuleFileName;
}

module.exports = {
    isMainModule
};