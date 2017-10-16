# mock-where [![Build Status](https://api.travis-ci.org/qiangyt/mock-where.svg?branch=master&style=flat)](https://travis-ci.org/qiangyt/mock-where) 

RESTful-API-driven mock service, with rule engine and web-hook (AKA. callback)

## Contents 

- [Target usage](#target-usage)
- [Features](#features)
- [In Progress](#in-progress)
- [Installation](#installation)
- [Configuration](#configuration)
- [API](#api)
- [Contributing to Mock-where](#contributing-to-mock-where)
- [Any Question or Issue](#any-question-or-issue)
- [Build Status](#build-status)
- [License](#license)

## Target Usage
- Mock expensive cloud services, such as 3rd-party login and payment that requires fee and complex round-trip: you call them and then they will call back you later; or even worse - they're one-off
- Mock dependent services for test automation which requires programmatic control
- Share single mock server inside/across team, by specifying rules to separate mocked responses
- Locate performance bottleneck by removing external dependencies 

## Features
- **RESTful API.** Create/update/delete/query mock rules with http test client, for ex. postman, curl, soapui, jmeter, and so on
- **Rule Engine.** dynamically return different response determined by: headers, path, query, body/parameter and so on
- **Web-hook.** Mock callback / notification, such as payment fullfillment 
- **Built-in HTTP(s) proxy.** Backed by [http-proxy](https://github.com/nodejitsu/node-http-proxy); turn on/off for specific rule
- **Recording Request & Response.** by in-memory sqlite3 database
- **[Simple Web UI] (https://github.com/qiangyt/mock-where-webui)**

## Installation
- **Prerequisite -**
  - [Node 7] (https://nodejs.org/en/)
  - [Yarn] (https://yarnpkg.com/en/docs/install)
- Download latest release (https://github.com/qiangyt/mock-where/releases)
- ```yarn install```
- Run example mock server, which mocks a SMS cloud service named-ems: ```npm start```
- Test the mocked SMS cloud service by postman

## Configuration
Working ......

## API
Working ......

## Contributing to Mock-where
Contributions are always welcome, especifiallno matter how large or small. Before contributing, please read the [code of conduct](CODE_OF_CONDUCT.md).

See [Contributing](CONTRIBUTING.md).

## In Progress
- As micro-services (Eureka,...)
- Recording proxied request/response
- Web UI to manage rules
- Use [mock.js](https://github.com/nuysoft/Mock)
- Dockerization
- Rule repository for various of cloud services

## Any Question or Issue
https://github.com/qiangyt/mock-where/issues/new

## Build Status
- [Travis-CI] (https://travis-ci.org/qiangyt/mock-where)
- Coverage: ```npm run cover```

## License
[MIT](LICENSE)  © [Qiang Yiting](http://github.com/qianyt)



