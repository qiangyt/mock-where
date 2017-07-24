const ApiServer = require('./ApiServer');
new ApiServer().start(8001);

const MockServer = require('./MockServer');
new MockServer().start(8000);