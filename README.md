# wdp-abstract-canvas
Abstract canvas UI tooling for the glass

## Developer Tools
### Atom
- Optional packages
  - react
  - linter-eslint

## Enviroment setup

Link common canvas modules to test project:
```sh
cd <base dir>
npm link canvas_modules/prop-editor
npm link canvas_modules/canvas
```
Use [this page](https://docs.npmjs.com/getting-started/fixing-npm-permissions) to fix node setup if installed as root.

```sh
npm install
npm start
```
Connect to canvas:
```
http://localhost:3300
```
