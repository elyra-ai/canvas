/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint max-depth: ["error", 6]*/

import PropertiesStore from "./properties-store.js";
import logger from "../../utils/logger";
import UiConditionsParser from "./ui-conditions/ui-conditions-parser.js";
import conditionsUtil from "./util/conditions-utils";
import PropertyUtils from "./util/property-utils.js";
import { STATES, ACTIONS } from "./constants/constants.js";
import CommandStack from "../command-stack/command-stack.js";

export default class PropertiesController {

	constructor() {
		this.propertiesStore = new PropertiesStore();
		this.handlers = {
			propertyListener: null,
			controllerHandler: null
		};
		this.visibleDefinition = {};
		this.enabledDefinitions = {};
		this.validationDefinitions = {};
		this.controls = {};
		this.summaryPanelControls = {};
		this.controllerHandlerCalled = false;
		this.requiredParameters = []; // TODO this is needed for validateInput, will change to use this.controls later
		this.commandStack = new CommandStack();

	}
	subscribe(callback) {
		this.propertiesStore.subscribe(callback);
	}
	setHandlers(inHandlers) {
		this.handlers = Object.assign(this.handlers, inHandlers);
		if (this.handlers.controllerHandler && !this.controllerHandlerCalled) {
			this.handlers.controllerHandler(this); // ontime call to return controller
			// probably isn't needed but seems like it can cause infinite loops
			this.controllerHandlerCalled = true;
		}
	}

	setCommandStack(commandStack) {
		this.commandStack = commandStack;
	}

	getCommandStack() {
		return this.commandStack;
	}

	//
	// Form and parsing Methods
	//
	setForm(form) {
		this.form = form;
		// set initial property values
		if (this.form) {
			this._parseUiConditions();
			// should be done before running any validations
			const controls = UiConditionsParser.parseControls([], this.form);
			this._saveControls(controls); // saves controls without the subcontrols
			this._parseSummaryControls(controls);
			if (this.form.data) {
				this.setDatasetMetadata(this.form.data.datasetMetadata);
				this.setPropertyValues(this.form.data.currentParameters);
			}
			this.requiredParameters = this._parseRequiredParameters(this.form, controls); // TODO remove this when we switch to using this.controls in validateInput
			// for control.type of structuretable that do not use FieldPicker, we need to add to
			// the controlValue any missing data model fields.  We need to do it here so that
			// validate can run against the added fields
			this._addToControlValues();
			this.uiItems = this.form.uiItems; // set last so properties dialog doesn't render too early
		}
	}

	_parseUiConditions() {
		this.visibleDefinition = {};
		this.enabledDefinitions = {};
		this.validationDefinitions = {};
		if (this.form.conditions) {
			for (const condition of this.form.conditions) {
				if (condition.visible) {
					UiConditionsParser.parseConditions(this.visibleDefinition, condition, "visible");
				} else if (condition.enabled) {
					UiConditionsParser.parseConditions(this.enabledDefinitions, condition, "enabled");
				} else if (condition.validation) {
					UiConditionsParser.parseConditions(this.validationDefinitions, condition, "validation");
				} else { // invalid
					logger.info("Invalid definition: " + JSON.stringify(condition));
				}
			}
		}
	}
	_addToControlValues() {
		for (const keyName in this.controls) {
			if (!this.controls.hasOwnProperty(keyName)) {
				continue;
			}
			const control = this.controls[keyName];
			const propertyId = { name: control.name };
			var controlValue = this.getPropertyValue(propertyId);
			if (control.controlType === "structuretable" && control.noPickColumns) {
				controlValue = this._populateFieldData(controlValue, this.getDatasetMetadata(), control);
				this.updatePropertyValue(propertyId, controlValue);
			} else if (control.valueDef && control.valueDef.defaultValue &&
				control.valueDef.defaultValue !== "" && (!controlValue || controlValue === "")) {
				controlValue = control.valueDef.defaultValue;
				this.updatePropertyValue(propertyId, controlValue);
			}
		}
	}

	_populateFieldData(controlValue, dataModel, control) {
		const rowData = [];
		const dm = dataModel;
		const updateCells = [];
		for (var i = 0; i < dm.fields.length; i++) {
			const row = [];
			const fieldIndex = this._indexOfField(dm.fields[i].name, controlValue);
			for (var k = 0; k < control.subControls.length; k++) {
				if (k === control.keyIndex) {
					row.push(dm.fields[i].name);
				} else if (fieldIndex > -1 && controlValue.length > i && controlValue[i].length > k) {
					row.push(controlValue[i][k]);
				} else {
					row.push(this._getDefaultSubControlValue(k, dm.fields[i].name, dataModel, control));
					updateCells.push([i, k]);
				}
			}
			rowData.push(row);
		}
		return rowData;
	}

	_getDefaultSubControlValue(col, fieldName, dataModel, control) {
		let val;
		const subControl = control.subControls[col];
		if (PropertyUtils.toType(subControl.valueDef.defaultValue) !== "undefined") {
			val = subControl.valueDef.defaultValue;
		} else if (PropertyUtils.toType(subControl.dmDefault) !== "undefined") {
			val = this._getDMDefault(subControl, fieldName, dataModel);
		} else if (subControl.values) {
			val = subControl.values[0];
		} else if (subControl.valueDef.propType === "string") {
			val = "";
		} else if (subControl.valueDef.propType === "boolean") {
			val = false;
		} else if (subControl.valueDef.propType === "enum") {
			val = subControl.values[0];
		} else if (subControl.valueDef.propType === "integer" ||
								subControl.valueDef.propType === "long" ||
								subControl.valueDef.propType === "double") {
			val = 0;
		} else {
			val = null;
		}
		return val;
	}

	_getDMDefault(subControlDef, fieldName, dataModel) {
		let defaultValue;
		const dmField = subControlDef.dmDefault;
		if (fieldName) {
			for (let i = 0; i < dataModel.fields.length; i++) {
				if (dataModel.fields[i].name === fieldName) {
					switch (dmField) {
					case "type":
						defaultValue = dataModel.fields[i].type;
						break;
					case "description":
						defaultValue = dataModel.fields[i].description;
						break;
					case "measure":
						defaultValue = dataModel.fields[i].measure;
						break;
					case "modeling_role":
						defaultValue = dataModel.fields[i].modeling_role;
						break;
					default:
						break;
					}
					break;
				}
			}
		}
		return defaultValue;
	}

	_indexOfField(fieldName, controlValue) {
		for (var i = 0; i < controlValue.length; i++) {
			if (controlValue[i][0] === fieldName) {
				return i;
			}
		}
		return -1;
	}

	/*
	* Saves controls in a state that get be used to retrieve them using a propertyId
	*/
	_saveControls(controls) {
		var newControls = {};
		controls.forEach((control) => {

			if (typeof control.columnIndex === "undefined") {
				newControls[control.name] = control;
			} else {
				newControls[control.parameterName][control.columnIndex] = control;
			}
		});
		this.setControls(newControls);
	}

	_parseSummaryControls(controls) {
		var summaryControls = {};
		controls.forEach((control) => {
			if (control.summaryPanelId) {
				if (typeof summaryControls[control.summaryPanelId] === "undefined") {
					summaryControls[control.summaryPanelId] = {};
				}
				if (typeof control.columnIndex === "undefined") {
					summaryControls[control.summaryPanelId][control.name] = {
						controlType: control.controlType,
						label: control.summaryLabel
					};
				} else {
					summaryControls[control.summaryPanelId][control.parameterName] = {
						controlType: control.controlType,
						label: control.summaryLabel
					};
				}
			}
		});
		this.setSummaryPanelControls(summaryControls);
	}
	// TODO remove this
	_parseRequiredParameters(form, controls) {
		var requiredParameters = [];
		requiredParameters = UiConditionsParser.parseRequiredParameters(requiredParameters, form, controls);
		return requiredParameters;
	}
	getForm() {
		return this.form;
	}
	getUiItems() {
		return this.uiItems;
	}

	/*
	* DatasetMetadata methods
	*/
	getDatasetMetadata() {
		return this.propertiesStore.getDatasetMetadata();
	}
	setDatasetMetadata(datasetMetadata) {
		return this.propertiesStore.setDatasetMetadata(datasetMetadata);
	}

	validateInput(propertyId) {
		conditionsUtil.validateInput(propertyId, this, this.validationDefinitions, this.getDatasetMetadata());
	}

	/*
	* Property Values Methods
	*/
	updatePropertyValue(id, value) {
		this.propertiesStore.updatePropertyValue(id, value);
		conditionsUtil.validateConditions(this, this.visibleDefinition, this.enabledDefinitions, this.getDatasetMetadata());
		conditionsUtil.validateInput(id, this, this.validationDefinitions, this.getDatasetMetadata());
		if (this.handlers.propertyListener) {
			this.handlers.propertyListener(
				{
					action: ACTIONS.UPDATE_PROPERTY,
					property: id,
					value: value
				}
			);
		}
	}
	getPropertyValue(id, filterHiddenDisabled) {
		const propertyValue = this.propertiesStore.getPropertyValue(id);
		// don't return hidden/disabled values
		if (filterHiddenDisabled && propertyValue) {
			// top level value
			const controlState = this.getControlState(id);
			if (controlState === STATES.DISABLED || controlState === STATES.HIDDEN) {
				return null;
			}
			// copy array to modify it and clear out disabled/hidden values
			const filteredValue = JSON.parse(JSON.stringify(propertyValue));
			if (Array.isArray(filteredValue)) {
				for (let rowIdx = 0; rowIdx < filteredValue.length; rowIdx++) {
					const rowValue = filteredValue[rowIdx];
					if (Array.isArray(rowValue)) {
						for (let colIdx = 0; colIdx < rowValue.length; colIdx++) {
							const colPropertyId = {
								name: id.name,
								row: rowIdx,
								col: colIdx
							};
							const valueState = this.getControlState(colPropertyId);
							if (valueState === STATES.DISABLED || valueState === STATES.HIDDEN) {
								filteredValue[rowIdx][colIdx] = null;
							}
						}
					}
				}
			}
			return filteredValue;
		}
		return propertyValue;
	}
	getPropertyValues(filterHiddenDisabled) {
		const propertyValues = this.propertiesStore.getPropertyValues();
		if (filterHiddenDisabled) {
			const filteredValues = {};
			for (const propKey in propertyValues) {
				if (!propertyValues.hasOwnProperty(propKey)) {
					continue;
				}
				const filteredValue = this.getPropertyValue({ name: propKey }, filterHiddenDisabled);
				// only set parameters with values
				if (typeof filteredValue !== "undefined" && filteredValue !== null) {
					filteredValues[propKey] = filteredValue;
				}
			}
			return filteredValues;
		}
		return propertyValues;
	}
	setPropertyValues(values) {
		this.propertiesStore.setPropertyValues(values);
		conditionsUtil.validateConditions(this, this.visibleDefinition, this.enabledDefinitions, this.getDatasetMetadata());
		if (this.handlers.propertyListener) {
			this.handlers.propertyListener(
				{
					action: ACTIONS.SET_PROPERTIES
				}
			);
		}
	}

	/**
	 * Control States Methods
	 * Sets the control state. Supported states are:
	 * "disabled", "enabled", "hidden", "visible".
	 */
	setControlStates(states) {
		this.propertiesStore.setControlStates(states);
	}
	updateControlState(propertyId, state) {
		this.propertiesStore.updateControlState(propertyId, state);
	}
	getControlState(propertyId) {
		return this.propertiesStore.getControlState(propertyId);
	}
	getControlStates() {
		return this.propertiesStore.getControlStates();
	}

	/*
	* Error Messages Methods
	*/
	setErrorMessages(messages) {
		this.propertiesStore.setErrorMessages(messages);
	}
	getErrorMessage(propertyId) {
		return this.propertiesStore.getErrorMessage(propertyId);
	}
	getErrorMessages(filteredPipeline) {
		const messages = this.propertiesStore.getErrorMessages();
		if (filteredPipeline) {
			const pipelineMessages = [];
			for (const paramKey in messages) {
				if (!messages.hasOwnProperty(paramKey)) {
					continue;
				}
				const paramMessage = this.getErrorMessage({ name: paramKey });
				if (paramMessage && paramMessage.text) {
					pipelineMessages.push({
						id_ref: paramKey,
						type: paramMessage.type,
						text: paramMessage.text
					});
				}
			}
			return pipelineMessages;
		}
		return messages;
	}
	updateErrorMessage(propertyId, message) {
		if (message.type !== "info") {
			this.propertiesStore.updateErrorMessage(propertyId, message);
		} else {
			this.propertiesStore.clearErrorMessage(propertyId);
		}
	}

	/*
	* Controls Methods
	*/
	setControls(controls) {
		this.controls = controls;
	}

	getControl(propertyId) {
		var control = this.controls[propertyId.name];
		if (typeof propertyId.col !== "undefined" && control) {
			control = this.controls[propertyId.name][propertyId.col.toString()];
		}
		return control;
	}

	getRequiredParameters() {
		return this.requiredParameters;
	}

	isRequired(propertyId) {
		if (typeof this.controls[propertyId.name] !== "undefined") {
			var required = this.controls[propertyId.name].required;
			if (typeof propertyId.col !== "undefined") {
				required = this.controls[propertyId.name][propertyId.col].required;
			}
			return (required) ? required : false;
		}
		return false;
	}

	isSummary(propertyId) {
		if (typeof this.controls[propertyId.name] !== "undefined") {
			var summary = this.controls[propertyId.name].summary;
			if (typeof propertyId.col !== "undefined") {
				summary = this.controls[propertyId.name][propertyId.col].summary;
			}
			return (summary) ? summary : false;
		}
		return false;
	}

	getControlType(propertyId) {
		if (typeof this.controls[propertyId.name] !== "undefined") {
			var controlType = this.controls[propertyId.name].controlType;
			if (typeof propertyId.col !== "undefined") {
				controlType = this.controls[propertyId.name][propertyId.col].controlType;
			}
			return controlType;
		}
		return null;
	}

	/*
	* Summary Panel controls Methods
	*/
	setSummaryPanelControls(summaryPanelControls) {
		this.summaryPanelControls = summaryPanelControls;
	}
	getSummaryPanelControls(panelId) {
		return this.summaryPanelControls[panelId];
	}
}
