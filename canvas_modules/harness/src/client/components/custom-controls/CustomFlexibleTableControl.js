/*
 * Copyright 2025 Elyra Authors
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
import CustomFlexibleTableCtrl from "../custom-components/CustomFlexibleTableCtrl";

class CustomFlexibleTableControl {
	static id() {
		return "harness-custom-flexible-table-control";
	}
	constructor(propertyId, controller, data, tableInfo) {
		this.propertyId = propertyId;
		this.controller = controller;
		this.data = data;
		this.tableInfo = tableInfo;
	}

	renderControl() {
		let key = this.propertyId.name;
		if (this.propertyId.row) {
			key += "_" + this.propertyId.row;
			if (this.propertyId.col) {
				key += "_" + this.propertyId.col;
			}
		}
		return (
			<CustomFlexibleTableCtrl
				key={"harness-flexible-table-" + key}
				propertyId={this.propertyId}
				controller={this.controller}
			/>
		);
	}
}

export default CustomFlexibleTableControl;
