# Test Harness

## Environment setup
- Nodejs `node 8.11`

#### Artifactory setup
 <https://github.ibm.com/wdpx/developers-guide/blob/master/guide/Artifactory.md#what-changes-are-required-to-our-deployments>

#### Development setup
```sh
export NODE_ENV=development
./canvas_modules/common-canvas/build.sh
cd canvas_modules/harness
npm install
grunt
npm start
```

#### Production setup

```sh
./canvas_modules/common-canvas/build.sh
cd canvas_modules/harness
npm install
export NODE_ENV=production
grunt
npm start
```

#### Connect to canvas:
<http://localhost:3001>


## UI test

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

