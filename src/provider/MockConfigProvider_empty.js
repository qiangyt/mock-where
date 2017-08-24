module.exports = class MockConfigProvider_empty {

    load() {
        return {
            12345: {
                localhost: {}
            }
        };
    }

}