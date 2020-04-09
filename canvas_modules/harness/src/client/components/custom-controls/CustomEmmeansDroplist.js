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

import React from "react";
import { Select, SelectItem } from "carbon-components-react";


class CustomEmmeansDroplist {
	static id() {
		return "custom-emmeans-droplist";
	}

	constructor(propertyId, controller, data, tableInfo) {
		this.propertyId = propertyId;
		this.controller = controller;
		this.data = data;
		this.tableInfo = tableInfo;
		this.emptyLabel = "...";
		const control = this.controller.getControl(this.propertyId);
		if (control.additionalText) {
			this.emptyLabel = control.additionalText;
		}
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(evt) {
		const value = evt.target.value;
		this.controller.updatePropertyValue(this.propertyId, value);
	}

	getAvailableFields() {
		const firstColumnId = { name: "emeans", row: this.propertyId.row, col: 0 };
		const value = this.controller.getPropertyValue(firstColumnId);
		return Array.isArray(value) ? value[0] : [];
	}

	getOptions() {
		const currentValue = this.controller.getPropertyValue(this.propertyId);
		const selection = currentValue ? currentValue : "";
		const options = [];
		if (selection.length === 0) {
			// need to add null option when no value set.  Shouldn't be an option for the user to select otherwise
			options.push(<SelectItem text={this.emptyLabel} key="" value="" />);
		}
		const fields = this.getAvailableFields();
		for (const field of fields) {
			options.push(<SelectItem text={field} key={field} value={field} />);
		}
		return { options: options, selection: selection };
	}

	renderControl() {
		let key = this.propertyId.name;
		if (Number.isInteger(this.propertyId.row)) {
			key += "_" + this.propertyId.row;
			if (Number.isInteger(this.propertyId.col)) {
				key += "_" + this.propertyId.col;
			}
		}
		const disabled = this.controller.getControlState(this.propertyId) === "disabled";
		const options = this.getOptions();
		const dropdownComponent = (<Select
			id={key}
			hideLabel
			inline
			labelText={""}
			disabled={disabled}
			onChange={this.handleChange}
			value={options.selection}
		>
			{ options.options }
		</Select>);
		return (<div>
			{dropdownComponent}
		</div>);
	}
}

export default CustomEmmeansDroplist;
