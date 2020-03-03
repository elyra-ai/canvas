
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

import { getURL } from "./utilities/test-config.js";
import { postData } from "./utilities/HTTPClient-utils.js";

module.exports = function() {
	/* global browser */
	/* global window */
	// post code coverage reports
	this.After(function() {
		const url = `${getURL()}/coverage/client`;
		const covObj = browser.execute(() => window.__coverage__);
		if (covObj && covObj.value) {
			const covStr = JSON.stringify(covObj.value);
			browser.executeAsync(postData, url, covStr);
		}
	});
};
