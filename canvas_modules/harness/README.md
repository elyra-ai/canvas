## Test Harness

### Environment setup

Install Nodejs `node 8.11`

Artifactory setup
See [here](https://github.ibm.com/wdpx/developers-guide/blob/master/guide/Artifactory.md#what-changes-are-required-to-our-deployments)

Build common-canvas project
```sh
./canvas_modules/common-canvas/build.sh
cd canvas_modules/harness
npm install
npm start
```
Connect to canvas:
```
http://localhost:3001
```

Testing updates to common-canvas module
```sh
npm stop
./canvas_modules/common-canvas/build.sh
./update-local-env.sh
npm start
# harness will automatically pick up changes so npm stop/npm start should not be needed
```
Testing without rebuilding.  Harness references common-canvas directly
```sh
export NODE_ENV=development
# changes to common-canvas or harness will automatically be picked up by webpack
```

### UI test

Ensure that the test harness is running.  The default location is http://localhost:3001.  
```sh
cd <base dir>/canvas_modules/harness
npm test
```
The default browser tested is Chrome.  I have successfully tested with Firefox v45.8.  Firefox versions over 47+ will not work.
The Firefox version that will be used is located in the default folder.  On Mac it is /Applications/Firefox.app
```sh
cd <base dir>/canvas_modules/harness
npm test -- --browser=firefox
```

### Webpack Bundle Analyzer
See [wiki](https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/wiki/Branches-and-Builds#webpack-bundle-analyzer)
