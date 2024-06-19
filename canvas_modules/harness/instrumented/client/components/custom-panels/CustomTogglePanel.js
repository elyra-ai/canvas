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

import React from "react";
import CustomToggleCtrl from "../custom-components/CustomToggleCtrl";
import paramDef from "./json/standardControls_paramDef.json";

class CustomTogglePanel {
	static id() {
		return "harness-custom-toggle-panel";
	}
	constructor(parameters, controller) {
		this.parameters = parameters;
		this.controller = controller;
	}

	renderPanel() {
		const controlId = this.parameters[0]; // toggle
		let textField = (<div />);
		if (this.parameters.length === 2) {
			textField = this.controller.createControl({ name: this.parameters[1] }, paramDef, this.parameters[1]);
		}
		return (
			<div key={"toggle-container-" + controlId}>
				{textField}
				<CustomToggleCtrl
					key={"toggle-" + controlId}
					propertyId={{ name: controlId }}
					controller={this.controller}
				/>
			</div>
		);
	}
}

export default CustomTogglePanel;
