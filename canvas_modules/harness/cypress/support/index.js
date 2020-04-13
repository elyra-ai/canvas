/*
 * Copyright 2017-2020 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import "./properties/properties-cmds";
import "./canvas/comments-cmds";
import "./canvas/context-menu-cmds";
import "./canvas/node-cmds";
import "./canvas/object-model-cmds";
import "./canvas/test-harness-cmds";
import "./canvas/toolbar-cmds";
import "./canvas/verification-cmds";

// turn off screenshots when running in headless mode.
Cypress.Screenshot.defaults({
	screenshotOnRunFailure: false,
});
