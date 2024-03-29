/*
 * Copyright 2017-2023 Elyra Authors
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
import OpsService from "../../services/OpsService";

function op() {
	return "customSyntaxCheckAsync";
}

function evaluate(paramInfo, param2Info, value, controller) {
	const supportedControls = ["expression"];
	if (supportedControls.indexOf(paramInfo.control.controlType) >= 0) {
		const appData = controller.getAppData();
		if (appData) {
			// console.log("nodeId = " + appData.nodeId);
		}
		// This does not really work without additional support from Conditions code for
		// asynchronous custom condition operators.
		const result = OpsService.syntaxCheck(paramInfo.value).then(function(res) {
			return res;
		});
		return result;
	}
	return true;
}

// Public Methods ------------------------------------------------------------->

export { op, evaluate };
