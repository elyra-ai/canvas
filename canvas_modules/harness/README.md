<!--
{% comment %}
Copyright 2017-2023 Elyra Authors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
{% endcomment %}
-->

# Test Harness

## Environment setup
- Nodejs `node 16.x`

#### Development setup
```sh
export NODE_ENV=development
./canvas_modules/common-canvas/build.sh
cd canvas_modules/harness
npm install
npm run build
npm start
```

#### Production setup

```sh
./canvas_modules/common-canvas/build.sh
cd canvas_modules/harness
npm install
npm build-prod
npm start-prod
```

#### Connect to canvas:
<http://localhost:3001>


## UI test

Ensure that the test harness is running.  The default location is http://localhost:3001.  
```sh
cd <base dir>/canvas_modules/harness
# Chrome
npx cypress run --headless --browser chrome
# Firefox
npx cypress run --headless --browser firefox
# Interactive
npx cypress open
```
