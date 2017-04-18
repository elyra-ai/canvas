## harness

## Enviroment setup

Build common-canvas and common-properties projects (currently only common-canvas is used)
```sh
./canvas_modules/common-canvas/build.sh
./canvas_modules/common-properties/build.sh
cd canvas_modules/harness
npm install
npm start
```
Connect to canvas:
```
http://localhost:3001
```

Testing updates to common-canvas or common-properties
```sh
# Run one or both builds depending on which files have been updated
./canvas_modules/common-canvas/build.sh
# and/or
./canvas_modules/common-properties/build.sh
./update-local-env.sh
# harness will automatically pick up changes so npm stop/npm start should not be needed
```

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
