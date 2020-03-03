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
/* eslint no-console: "off" */
import { setCanvasConfig } from "../utilities/test-utils.js";

module.exports = function() {

	this.Then(/^I have set this canvas config ""([^']*)""$/, function(config) {
		try {
			setCanvasConfig(JSON.parse(config));
		} catch (err) {
			console.log("Err = " + err);
			throw err;
		}
	});

};
