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
{
      port:  8000, // optional. if has default port, then take it, otherwise, throws error
      domain:  "github.com", // optional. if has default domain, then take it, otherwise, throws error
      name: "My rule name", // optional. assigned by default
      path: "/test", // optional. assigned to default path, if not specified
      method: "POST", // optional. assigned to default method, if not specified
      q: "ip='localhost'", // optional. assigned to default query, if not specified
      latency: 200, // optoinal. assigned to default latency, if not specified
      latencyFix: 16, // optional. assigned to default latencyFix, if not specified
      hook: {
      before: [
          {   
              enabled: false, // optional. true by default
              method: 'POST', // optional
               path: 'http://example.com/notify', 
               pathTemplate: {}, // exclusive with path
               header: {},// optional
              query: {}, // or string, optional
               queryTemplate: {}, // exclusive with query
               type: 'application/json',// optional
               body: {
                   object: {}, // or string, or stream, or file, optional
                   text: '...', // exclusive with object/template
                   template: {}// exclusive with object/text
              }
              accept: 'application/xml' // optional
          }
        ],
        after: [ // same as before
        ]   
      },
      response:  // optional. merged with default response
      {
          status: 403,
          type: "application/json",
          body: {
              template:  // exclusive with body.object
              {
                  type: "mustache", // optional. if not specified, assigned to "ejs" 
                                    // if template is text, otherwise to default response.templateType
                  text: "hi", // optional. if not specified, assigned to "template text not specified"
              },
              object: {
                  // exclusive with "bodyTemplate".
                  // could be any JSON-stringify-able object, string, or primitive value,
                  // "no response body specified", if not specified
              }
          }
      },
      proxy: {
          enabled: true, // optional. false by default
          path: 'http://example.com/target'
      }
 }

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



