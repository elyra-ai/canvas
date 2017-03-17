## harness

## Enviroment setup

Link common canvas modules to test project:
```sh
cd <base dir>/canvas_modules/harness
npm link ../common-properties
npm link ../common-canvas
```
Use [this page](https://docs.npmjs.com/getting-started/fixing-npm-permissions) to fix node setup if installed as root.

Build common-canvas and common-properties projects (currently only common-canvas is used)
```sh
cd <base dir>/canvas_modules/common-canvas
./build.sh
cd <base dir>/canvas_modules/common-properties
./build.sh
```
For any changes in common-canvas or common-properties a rerun the steps above
```sh
npm install
npm start
```
Connect to canvas:
```
http://localhost:3001
```

## UI test

Ensure that the test harness is running.  You will need to specify the URL of the running test harness as a environment variable.
```sh
export UI_TEST_URL=http://localhost:3001
cd <base dir>/canvas_modules/harness
npm test
```
