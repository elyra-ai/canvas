/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* eslint-disable no-empty-function */
/* eslint-disable no-unused-vars */
import React from "react";
import Button from "ap-components-react/dist/components/Button";


class CustomButtonPanel {
	static id() {
		return "custom-button-panel";
	}

	constructor(parameters, controller, data) {
		this.parameters = parameters;
		this.controller = controller;
		this.data = data;
		this.addRowAction = this.addRowAction.bind(this);
		this.removeRowsAction = this.removeRowsAction.bind(this);
	}

	addRowAction() {
		const actualValue = this.controller.getPropertyValue({ name: "actual_value" });
		const predictedValue = this.controller.getPropertyValue({ name: "predicted_value" });
		const costValue = this.controller.getPropertyValue({ name: "cost_value" });
		const newRow = [];
		newRow.push(actualValue);
		newRow.push(predictedValue);
		newRow.push(costValue);
		const tablePropertyId = { name: "custom_table_info" };
		const tableValue = this.controller.getPropertyValue(tablePropertyId);
		tableValue.push(newRow);
		this.controller.updatePropertyValue(tablePropertyId, tableValue);
	}

	getAddDisabled() {
		const actualValue = this.controller.getPropertyValue({ name: "actual_value" });
		const predictedValue = this.controller.getPropertyValue({ name: "predicted_value" });
		const costValue = this.controller.getPropertyValue({ name: "cost_value" });
		if (!actualValue || actualValue === "" ||
				!predictedValue || predictedValue === "" ||
				costValue === null) {
			return { "disabled": true };
		}
		return "";
	}

	removeRowsAction() {
		const tablePropertyId = { name: "custom_table_info" };
		const tableValue = this.controller.getPropertyValue(tablePropertyId);
		// Sort descending to ensure lower indices don"t get
		// changed when values are deleted
		const selected = this.controller.getSelectedRows("custom_table_info").sort(function(aa, bb) {
			return bb - aa;
		});
		for (let ii = 0; ii < selected.length; ii++) {
			tableValue.splice(selected[ii], 1);
		}
		this.controller.updatePropertyValue(tablePropertyId, tableValue);
		this.controller.clearSelectedRows("custom_table_info");
	}

	getRemoveDisabled() {
		const selected = this.controller.getSelectedRows("custom_table_info");
		if (selected.length === 0) {
			return { "disabled": true };
		}
		return "";
	}

	renderPanel() {
		const addDisabled = this.getAddDisabled();
		const removeDisabled = this.getRemoveDisabled();
		return (
			<div key="custom-button-div">
				<Button semantic onClick={this.addRowAction} {...addDisabled}>
					Add
				</Button>
				&nbsp; &nbsp;
				<Button semantic onClick={this.removeRowsAction} {...removeDisabled}>
					Remove Selected
				</Button>
			</div>
		);
	}
}

export default CustomButtonPanel;
