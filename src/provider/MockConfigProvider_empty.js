module.exports = class MockConfigProvider_empty {

    load() {
        return {
            test: {
                server: { port: 12345 }
            }
        };
    }

}