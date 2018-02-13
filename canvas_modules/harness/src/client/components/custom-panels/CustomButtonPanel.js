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
import paramDef from "./misclassification_paramDef.json";


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
		this.getAvailableValues = this.getAvailableValues.bind(this);
		this.getAvailableActualValues = this.getAvailableActualValues.bind(this);

		// @TODO: Decide upon how the name of the target field will be conveyed to this code.
		// For now we are simply looking for 'target' in the field modeling_role.
		//
		// Attempt to discern the target field name from the modeling_role
		const datasetMetadata = this.controller.getDatasetMetadata();
		if (datasetMetadata.length > 0) {
			for (let idx = 0; idx < datasetMetadata[0].fields.length; idx++) {
				if (datasetMetadata[0].fields[idx].metadata.modeling_role === "target") {
					this.targetFieldName = datasetMetadata[0].fields[idx].name;
					break;
				}
			}
		}
	}

	addRowAction() {
		const actualValue = this.controller.getPropertyValue({ name: "actual_value" });
		const predictedValue = this.controller.getPropertyValue({ name: "predicted_value" });
		const costValue = this.controller.getPropertyValue({ name: "cost_value" });
		const newRow = [];

		// Update controller's values table
		newRow.push(actualValue);
		newRow.push(predictedValue);
		newRow.push(costValue);
		const tablePropertyId = { name: this.data.parameter_ref };
		const tableValue = this.controller.getPropertyValue(tablePropertyId);
		tableValue.push(newRow);
		this.controller.updatePropertyValue(tablePropertyId, tableValue);

		// Update controller's actual value
		this.controller.updatePropertyValue({ name: "actual_value" }, "");
	}

	getAddDisabled() {
		const actualValue = this.controller.getPropertyValue({ name: "actual_value" });
		const predictedValue = this.controller.getPropertyValue({ name: "predicted_value" });
		const costValue = this.controller.getPropertyValue({ name: "cost_value" });
		if (!actualValue || actualValue === "" ||
				!predictedValue || predictedValue === "" ||
				typeof costValue === "undefined" || costValue === null) {
			return { "disabled": true };
		}
		return "";
	}

	removeRowsAction() {
		const tableId = this.data.parameter_ref;
		const tablePropertyId = { name: tableId };
		const tableValue = this.controller.getPropertyValue(tablePropertyId);
		// Sort descending to ensure lower indices don"t get
		// changed when values are deleted
		const selected = this.controller.getSelectedRows(tableId).sort(function(aa, bb) {
			return bb - aa;
		});
		for (let ii = 0; ii < selected.length; ii++) {
			tableValue.splice(selected[ii], 1);
		}
		this.controller.updatePropertyValue(tablePropertyId, tableValue);
		this.controller.clearSelectedRows(tableId);
	}

	getRemoveDisabled() {
		const selected = this.controller.getSelectedRows(this.data.parameter_ref);
		if (selected.length === 0) {
			return { "disabled": true };
		}
		return "";
	}

	getAvailableActualValues() {
		let values = [];
		const datasetMetadata = this.controller.getDatasetMetadata();
		if (this.targetFieldName && datasetMetadata.length > 0) {
			for (let idx = 0; idx < datasetMetadata[0].fields.length; idx++) {
				if (this.targetFieldName === datasetMetadata[0].fields[idx].name) {
					values = datasetMetadata[0].fields[idx].metadata.values;
					break;
				}
			}
		} else {
			this.errorMsg = "Missing target field";
		}
		if (!values || values.length === 0) {
			this.errorMsg = "Missing valid values";
		}
		return this.getAvailableValues(values);
	}

	getAvailableValues(values) {
		let retVal;
		const paramDefCopy = JSON.parse(JSON.stringify(paramDef));
		const propertyId = { name: this.data.parameter_ref };
		const tableValues = this.controller.getPropertyValue(propertyId);
		const actuals = JSON.parse(JSON.stringify(values));
		const predicteds = JSON.parse(JSON.stringify(values));
		const actualValue = this.controller.getPropertyValue({ name: "actual_value" });
		const predictedValue = this.controller.getPropertyValue({ name: "predicted_value" });

		// First, remove the current predicted value from the Actual Values array
		retVal = actuals.findIndex(function(value) {
			return predictedValue === value;
		});
		if (retVal > -1) {
			actuals.splice(retVal, 1);
		}

		// Next, create the predicated array containing all but the current actual value
		retVal = predicteds.findIndex(function(value) {
			return actualValue === value;
		});
		if (retVal > -1) {
			predicteds.splice(retVal, 1);
		}

		// Finally, update controller's predicted_value if necessary
		retVal = predicteds.findIndex(function(value) {
			return predictedValue === value;
		});
		if (retVal === -1 && predictedValue && predictedValue.length > 0) {
			// Update controller's predicted value
			const that = this;
			setTimeout(function() {
				that.controller.updatePropertyValue({ name: "predicted_value" }, "");
			}, 50);
		}

		// Return the updated actual and predicted value arrays
		paramDefCopy.parameters[0].enum = actuals;
		paramDefCopy.parameters[1].enum = predicteds;
		return paramDefCopy;
	}

	renderPanel() {
		const addDisabled = this.getAddDisabled();
		const removeDisabled = this.getRemoveDisabled();
		const paramDefNow = this.getAvailableActualValues();
		const actual = this.controller.createControl({ name: this.parameters[0] }, paramDefNow, this.parameters[0]);
		const predicted = this.controller.createControl({ name: this.parameters[1] }, paramDefNow, this.parameters[1]);
		const cost = this.controller.createControl({ name: this.parameters[2] }, paramDefNow, this.parameters[2]);
		return (
			<div key="custom-button-div">
				<div>
					<span>Add Misclassification Costs</span>
				</div>
				<div>
					{actual}
				</div>
				<div>
					{predicted}
				</div>
				<div>
					{cost}
				</div>
				<br />
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
