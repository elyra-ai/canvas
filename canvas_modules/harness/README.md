## harness

## Enviroment setup

Link common canvas modules to test project:
```sh
cd <base dir>/canvas_modules/harness
npm link ../common-properties
npm link ../common-canvas
```
Use [this page](https://docs.npmjs.com/getting-started/fixing-npm-permissions) to fix node setup if installed as root.

```sh
npm install
npm start
```
Connect to canvas:
```
http://localhost:3001
```
