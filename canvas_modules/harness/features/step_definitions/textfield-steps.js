/*
 * Copyright 2017-2019 IBM Corporation
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

import testUtils from "./utilities/test-utils.js";

module.exports = function() {
	// this is a workaround for subpanels.  For some reason the browser can't find the control just by data-id in a subpanel
	this.Then(/^I enter "([^"]*)" in textfield "([^"]*)" in sub-panel "([^"]*)"$/, function(value, controlId, panelName) {
		const panel = testUtils.getWideFlyoutPanel(panelName);
		var textbox = panel.$("div[data-id='properties-" + controlId + "']");
		textbox.$("input").setValue("", value);
	});
};
