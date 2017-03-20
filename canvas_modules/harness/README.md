## harness

## Enviroment setup

Build common-canvas and common-properties projects (currently only common-canvas is used)
```sh
cd <base dir>/canvas_modules/common-canvas
./build.sh
cd <base dir>/canvas_modules/common-properties
./build.sh
cd <base dir>/canvas_modules/harness
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
The default browser tested is Chrome.  You will need to add the location of Firefox to the PATH environment variable to be able
to test with Firefox.  I have successfully tested with Firefox v45.8.  I am not sure if more recent version will work.
```sh
export PATH=export PATH="/Applications/IBM Firefox.app/Contents/MacOS:/usr/local/opt/node@4/bin:"$PATH
export UI_TEST_URL=http://localhost:3001
cd <base dir>/canvas_modules/harness
npm test -- --browser=firefox
```
