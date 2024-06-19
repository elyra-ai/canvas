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

/* eslint-disable no-empty-function */
import React from "react";
import CustomSliderCtrl from "../custom-components/CustomSliderCtrl";
import paramDef from "./json/standardControls_paramDef.json";


class CustomSliderPanel {
	static id() {
		return "harness-custom-slider-panel";
	}
	constructor(parameters, controller) {
		this.parameters = parameters;
		this.controller = controller;
		this.propertyId = { name: parameters[0] };
		this.controller.setControlInSummary(this.propertyId, "Slider", true);
		this.selectionChanged = this.selectionChanged.bind(this);
		if (this.parameters.length >= 2) {
			this.controller.addRowSelectionListener(this.parameters[1], this.selectionChanged);
		}
	}

	selectionChanged(selections) {
		this.controller.updatePropertyValue({ name: "readonly_text" }, JSON.stringify(selections));
	}

	renderPanel() {
		let table = (<div />);
		if (this.parameters.length >= 2) {
			table = this.controller.createControl({ name: this.parameters[1] }, paramDef, this.parameters[1]);
		}
		let color = (<div />);
		if (this.parameters.length >= 3) {
			if (this.controller.getPropertyValue(this.propertyId) >= 60) {
				paramDef.parameters[0].enum = ["red", "orange", "yellow"];
			} else {
				paramDef.parameters[0].enum = ["red", "orange", "yellow", "green", "blue", "purple"];
			}
			color = this.controller.createControl({ name: this.parameters[2] }, paramDef, this.parameters[2]);
		}
		return (
			<div>
				<CustomSliderCtrl
					key={"slider" + this.propertyId.name}
					propertyId={this.propertyId}
					controller={this.controller}
				/>
				{color}
				{table}
			</div>
		);
	}
}

export default CustomSliderPanel;
