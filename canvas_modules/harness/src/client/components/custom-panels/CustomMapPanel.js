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

/* eslint-disable no-empty-function */
import React from "react";
import CustomMapCtrl from "../custom-components/CustomMapCtrl";
import CustomMapSummary from "../custom-components/CustomMapSummary";

class CustomMapPanel {
	static id() {
		return "harness-custom-map-panel";
	}

	constructor(parameters, controller, data) {
		this.parameters = parameters;
		this.controller = controller;
		this.data = data;
	}

	renderPanel() {
		const controlId = this.parameters[0];
		const propertyId = { name: controlId };
		const currentValue = this.controller.getPropertyValue(propertyId);
		const mapSummary = (<CustomMapSummary lng={currentValue[1]} lat={currentValue[0]} zoom={currentValue[2]} />);
		this.controller.updateCustPropSumPanelValue(propertyId,
			{ value: mapSummary, label: "Map" });
		return (
			<CustomMapCtrl
				key={"map-" + controlId}
				propertyId={propertyId}
				controller={this.controller}
				data={this.data}
			/>
		);
	}
}

export default CustomMapPanel;
