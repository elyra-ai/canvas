/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import Select from "carbon-components-react/lib/components/Select";
import SelectItem from "carbon-components-react/lib/components/SelectItem";


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
