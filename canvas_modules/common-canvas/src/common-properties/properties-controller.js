/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint max-depth: ["error", 7]*/

import PropertiesStore from "./properties-store.js";
import logger from "../../utils/logger";
import UiConditionsParser from "./ui-conditions/ui-conditions-parser.js";
import conditionsUtil from "./util/conditions-utils";
import PropertyUtils from "./util/property-utils.js";
import { STATES, ACTIONS } from "./constants/constants.js";
import CommandStack from "../command-stack/command-stack.js";
import ControlFactory from "./editor-controls/control-factory";

export default class PropertiesController {

	constructor() {
		this.propertiesStore = new PropertiesStore();
		this.handlers = {
			propertyListener: null,
			controllerHandler: null,
			actionHandler: null
		};
		this.visibleDefinition = {};
		this.enabledDefinitions = {};
		this.validationDefinitions = {};
		this.filterDefinitions = {};
		this.filteredEnumDefinitions = {};
		this.controls = {};
		this.summaryPanelControls = {};
		this.controllerHandlerCalled = false;
		this.requiredParameters = []; // TODO this is needed for validateInput, will change to use this.controls later
		this.commandStack = new CommandStack();
		this.custPropSumPanelValues = {};
		this.controlFactory = new ControlFactory(this);
		this.sharedCtrlInfo = [];

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
			this.setControls({});
			this.setControlStates({}); // clear state
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
	getForm() {
		return this.form;
	}

	setAppData(appData) {
		this.appData = appData;
	}
	getAppData() {
		return this.appData;
	}

	_parseUiConditions() {
		this.visibleDefinition = {};
		this.enabledDefinitions = {};
		this.validationDefinitions = {};
		this.filterDefinitions = {};
		this.filteredEnumDefinitions = {};
		if (this.form.conditions) {
			for (const condition of this.form.conditions) {
				if (condition.visible) {
					UiConditionsParser.parseConditions(this.visibleDefinition, condition, "visible");
				} else if (condition.enabled) {
					UiConditionsParser.parseConditions(this.enabledDefinitions, condition, "enabled");
				} else if (condition.validation) {
					UiConditionsParser.parseConditions(this.validationDefinitions, condition, "validation");
				} else if (condition.filter) {
					UiConditionsParser.parseConditions(this.filterDefinitions, condition, "filter");
				} else if (condition.enum_filter) {
					UiConditionsParser.parseConditions(this.filteredEnumDefinitions, condition, "enum_filter");
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
			let controlValue = this.getPropertyValue(propertyId);
			if (control.controlType === "structuretable" && control.addRemoveRows === false) {
				controlValue = this._populateFieldData(controlValue, this.getDatasetMetadata(), control);
				this.updatePropertyValue(propertyId, controlValue);
			} else if (typeof control.valueDef !== "undefined" && typeof control.valueDef.defaultValue !== "undefined" &&
				control.valueDef.defaultValue !== "" && (typeof controlValue === "undefined" || controlValue === "")) {
				controlValue = control.valueDef.defaultValue;
				this.updatePropertyValue(propertyId, controlValue);
			}
		}
	}

	_populateFieldData(controlValue, dataModel, control) {
		const rowData = [];
		const dm = dataModel;
		const updateCells = [];
		for (let idx = 0; idx < dm.length; idx++) {
			const schemaFields = dm[idx].fields;
			for (let i = 0; i < schemaFields.length; i++) {
				const row = [];
				const schemas = this.getDatasetMetadataSchemas();
				const schemaName = this.duplicateFieldName(dm, schemaFields[i]) ? schemas[idx] + "." + schemaFields[i].name : schemaFields[i].name;
				const fieldIndex = this._indexOfField(schemaName, controlValue);
				for (var k = 0; k < control.subControls.length; k++) {
					if (k === control.keyIndex) {
						row.push(schemaName);
					} else if (fieldIndex > -1 && controlValue.length > i && controlValue[i].length > k) {
						row.push(controlValue[i][k]);
					} else {
						row.push(this._getDefaultSubControlValue(k, schemaName, dataModel, control));
						updateCells.push([i, k]);
					}
				}
				rowData.push(row);
			}
		}
		return rowData;
	}

	// returns true if field name is in more than one schema
	duplicateFieldName(dm, fieldObj) {
		let count = 0;
		for (let idx = 0; idx < dm.length; idx++) {
			count += dm[idx].fields.filter((field) => field.name === fieldObj.name).length;
			if (count > 1) {
				return true;
			}
		}
		return false;
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
			for (const schema of dataModel) {
				for (const field of schema.fields) {
					if (field.name === fieldName) {
						switch (dmField) {
						case "type":
							defaultValue = field.type;
							break;
						case "description":
							defaultValue = field.description;
							break;
						case "measure":
							defaultValue = field.measure;
							break;
						case "modeling_role":
							defaultValue = field.modeling_role;
							break;
						default:
							break;
						}
						break;
					}
				}
			}
		}
		return defaultValue;
	}

	_indexOfField(fieldName, controlValue) {
		for (let i = 0; i < controlValue.length; i++) {
			if (controlValue[i][0] === fieldName) {
				return i;
			}
		}
		return -1;
	}

	// TODO remove this
	_parseRequiredParameters(form, controls) {
		let requiredParameters = [];
		requiredParameters = UiConditionsParser.parseRequiredParameters(requiredParameters, form, controls);
		return requiredParameters;
	}

	getUiItems() {
		return this.uiItems;
	}

	addSharedControls(id, controlsNames) {
		this.sharedCtrlInfo.push({ "id": id, "controlNames": controlsNames });
	}

	getSharedCtrlInfo() {
		return this.sharedCtrlInfo;
	}

	/*
	* DatasetMetadata methods
	*/
	getDatasetMetadata() {
		return this.propertiesStore.getDatasetMetadata();
	}
	getDatasetMetadataSchemas() {
		const datasetMetadata = this.getDatasetMetadata();
		const schemas = [];
		for (let idx = 0; idx < datasetMetadata.length; idx++) {
			let schemaIdentifier = datasetMetadata[idx].name ? datasetMetadata[idx].name : "";
			const dupSchemaNames = datasetMetadata.filter((schema) => schema.name === schemaIdentifier && schemaIdentifier.length !== 0);
			const dupSchemaNameIndex = schemas.indexOf(schemaIdentifier);
			if (dupSchemaNameIndex > -1 || dupSchemaNames.length > 1) {
				const separator = schemaIdentifier.length === 0 ? "" : "_";
				schemaIdentifier += (separator + idx);
				schemas[dupSchemaNameIndex] = schemas[dupSchemaNameIndex] + separator + dupSchemaNameIndex;
			} else if (schemaIdentifier.length === 0) {
				schemaIdentifier = idx.toString();
			}
			schemas.push(schemaIdentifier);
		}
		return schemas;
	}
	_getDatasetMetadataSchemaIndex(schemaName) {
		const schemas = this.getDatasetMetadataSchemas();
		return schemas.indexOf(schemaName);
	}
	getFilteredDatasetMetadata(propertyId) {
		let datasetMetadata = this.getDatasetMetadata();
		this._filterSharedDataset(propertyId, datasetMetadata);
		datasetMetadata = conditionsUtil.filterConditions(propertyId, this.filterDefinitions, this, datasetMetadata);
		return datasetMetadata;
	}

	/**
	 * Retrieves a filtered data model in which all fields that are already
	 * in use by other controls are already filtered out.
	 *
	 * @param propertyId Name of control to skip when checking field controls
	 * @return Filtered dataset metadata with fields in use removed
	 */
	_filterSharedDataset(propertyId, datasetMetadata) {
		if (!this.sharedCtrlInfo || !propertyId) {
			return;
		}
		const skipControlName = propertyId.name;
		try {
			// gets all the controls that are shared with this property
			let sharedCtrlNames = [];
			for (const sharedCtrlList of this.sharedCtrlInfo) {
				for (const sharedCtrl of sharedCtrlList.controlNames) {
					if (skipControlName === sharedCtrl.controlName) {
						sharedCtrlNames = sharedCtrlList.controlNames;
						break;
					}
				}
			}
			// get all the fields that are used by other controls
			const usedFields = [];
			for (const sharedCtr of sharedCtrlNames) {
				const ctrlName = sharedCtr.controlName;
				if (ctrlName !== skipControlName) {
					// only remove from the main list the values that are in other controls
					const propValue = this.getPropertyValue({ name: ctrlName });
					if (Array.isArray(propValue)) {
						for (const arrayValue of propValue) {
							if (Array.isArray(arrayValue)) {
								const fieldIdx = PropertyUtils.getTableFieldIndex(sharedCtr);
								if (fieldIdx >= 0 && fieldIdx < arrayValue.length) {
									usedFields.push(arrayValue[fieldIdx]);
								}
							} else { // one dimensional arrays
								usedFields.push(arrayValue);
							}
						}
					} else if (typeof propValue === "string") { // simple property values
						usedFields.push(propValue);
					}
				}
			}

			const usedFieldsList = Array.from(new Set(usedFields)); // make all values unique
			for (const usedField of usedFieldsList) {
				if (usedField.indexOf(".") > -1) {
					const schemaField = usedField.split(".");
					const schemaIndex = this._getDatasetMetadataSchemaIndex(schemaField[0]);
					datasetMetadata[schemaIndex].fields = datasetMetadata[schemaIndex].fields.filter(function(element) {
						return element && element.name !== schemaField[1];
					});
				} else {
					for (const schema of datasetMetadata) {
						schema.fields = schema.fields.filter(function(element) {
							return element && element.name !== usedField;
						});
					}
				}
			}
		} catch (error) {
			logger.warn("Error filtering shared controls " + error);
		}
	}

	setDatasetMetadata(datasetMetadata) {
		return this.propertiesStore.setDatasetMetadata(datasetMetadata);
	}

	validateInput(propertyId) {
		conditionsUtil.validateInput(propertyId, this, this.validationDefinitions, this.getDatasetMetadata());
	}

	//
	// Table row selections
	//
	getSelectedRows(controlName) {
		return this.propertiesStore.getSelectedRows(controlName);
	}

	updateSelectedRows(controlName, selection) {
		this.propertiesStore.updateSelectedRows(controlName, selection);
	}

	clearSelectedRows(controlName) {
		this.propertiesStore.clearSelectedRows(controlName);
	}

	/*
	* Retrieve filtered enumeration items.
	*
	* @param propertyId The unique property identifier
	* @param enumSet An object containing equal sized values and valueLabels arrays
	* @return Either the input object or a new object containing filtered items
	*/
	getFilteredEnumItems(propertyId, enumSet) {
		const replacementItems = this.propertiesStore.getFilteredEnumItems(propertyId);
		if (replacementItems && PropertyUtils.toType(replacementItems) === "array") {
			const newControl = {};
			newControl.values = [];
			newControl.valueLabels = [];
			for (let idx = 0; idx < replacementItems.length; idx++) {
				newControl.values.push(replacementItems[idx]);
				let label = replacementItems[idx];
				const index = enumSet.values.findIndex(function(value) {
					return value === replacementItems[idx];
				});
				if (index > -1) {
					label = enumSet.valueLabels[index];
				}
				newControl.valueLabels.push(label);
			}
			return newControl;
		}
		return enumSet;
	}

	/*
	* Property Values Methods
	*/
	updatePropertyValue(propertyId, value) {
		this.propertiesStore.updatePropertyValue(propertyId, value);
		const definitions = {
			visibleDefinition: this.visibleDefinition,
			enabledDefinitions: this.enabledDefinitions,
			filteredEnumDefinitions: this.filteredEnumDefinitions
		};
		conditionsUtil.validateConditions(this, definitions, this.getDatasetMetadata());
		conditionsUtil.validateInput(propertyId, this, this.validationDefinitions, this.getDatasetMetadata());
		if (this.handlers.propertyListener) {
			this.handlers.propertyListener(
				{
					action: ACTIONS.UPDATE_PROPERTY,
					property: propertyId,
					value: value
				}
			);
		}
	}

	getPropertyValue(propertyId, filterHiddenDisabled) {
		const propertyValue = this.propertiesStore.getPropertyValue(propertyId);
		// don't return hidden/disabled values
		if (filterHiddenDisabled && propertyValue) {
			// top level value
			const controlState = this.getControlState(propertyId);
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
								name: propertyId.name,
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
		const definitions = {
			visibleDefinition: this.visibleDefinition,
			enabledDefinitions: this.enabledDefinitions,
			filteredEnumDefinitions: this.filteredEnumDefinitions
		};
		conditionsUtil.validateConditions(this, definitions, this.getDatasetMetadata());
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
		if (message && message.type !== "info") {
			this.propertiesStore.updateErrorMessage(propertyId, message);
		} else {
			this.propertiesStore.clearErrorMessage(propertyId);
		}
	}

	/*
	* Controls Methods
	*/

	// Saves controls in a state that get be used to retrieve them using a propertyId
	_saveControls(controls) {
		controls.forEach((control) => {
			if (typeof control.columnIndex === "undefined") {
				this.controls[control.name] = control;
			} else {
				this.controls[control.parameterName][control.columnIndex] = control;
			}
		});
	}
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
		const control = this.getControl(propertyId);
		if (control) {
			const required = control.required;
			return (required) ? required : false;
		}
		return false;
	}

	isSummary(propertyId) {
		const control = this.getControl(propertyId);
		if (control) {
			const summary = control.summary;
			return (summary) ? summary : false;
		}
		return false;
	}

	getControlType(propertyId) {
		const control = this.getControl(propertyId);
		if (control) {
			return control.controlType;
		}
		return null;
	}

	/*
	* Summary Panel controls Methods
	*/
	_parseSummaryControls(controls) {
		const summaryControls = {};
		controls.forEach((control) => {
			if (control.summaryPanelId) {
				if (typeof summaryControls[control.summaryPanelId] === "undefined") {
					summaryControls[control.summaryPanelId] = [];
				}
				if (typeof control.columnIndex === "undefined") {
					summaryControls[control.summaryPanelId].push(control.name);
				}
			}
		});
		this.setSummaryPanelControls(summaryControls);
	}
	setSummaryPanelControls(summaryPanelControls) {
		this.summaryPanelControls = summaryPanelControls;
	}
	getSummaryPanelControls(panelId) {
		return this.summaryPanelControls[panelId];
	}
	// Sets the value to be displayed in the summaryPanel for a customPanel property
	updateCustPropSumPanelValue(propertyId, content) {
		if (typeof propertyId.name !== "undefined") {
			this.custPropSumPanelValues[propertyId.name] = content;
		}
	}
	getCustPropSumPanelValue(propertyId) {
		// don't display hidden or disabled parameters
		const controlState = this.getControlState(propertyId);
		if (controlState === STATES.DISABLED || controlState === STATES.HIDDEN) {
			return null;
		}
		return this.custPropSumPanelValues[propertyId.name];
	}
	// Only used in custom panel to allow for custom property summary values to be displayed
	setControlInSummary(propertyId, label, inSummary) {
		const control = this.getControl(propertyId);
		if (control) {
			control.summary = true;
			control.summaryLabel = label;
		}
	}

	/*
	* Used to create standard controls in customPanels
	*/
	createControl(propertyId, paramDef, parameter) {
		const control = this.controlFactory.createFormControl(paramDef, parameter);
		const controls = [];
		UiConditionsParser.parseControl(controls, control);
		this._saveControls(controls);
		return this.controlFactory.createControlItem(control, propertyId);
	}
	getControlFactory() {
		return this.controlFactory;
	}
}
