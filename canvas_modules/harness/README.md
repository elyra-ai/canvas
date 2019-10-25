<!--
{% comment %}
Copyright 2017-2019 IBM Corporation

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
- Nodejs `node 8.16.x`

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
