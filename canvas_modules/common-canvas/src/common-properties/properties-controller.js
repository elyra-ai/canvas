/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint max-depth: ["error", 7]*/

import PropertiesStore from "./properties-store.js";
import logger from "../../utils/logger";
import UiConditionsParser from "./ui-conditions/ui-conditions-parser.js";
import UiGroupsParser from "./ui-conditions/ui-groups-parser.js";
import conditionsUtil from "./ui-conditions/conditions-utils";
import PropertyUtils from "./util/property-utils.js";
import { STATES, ACTIONS, CONDITION_TYPE, PANEL_TREE_ROOT } from "./constants/constants.js";
import CommandStack from "../command-stack/command-stack.js";
import ControlFactory from "./controls/control-factory";
import { ControlType, Type, ParamRole } from "./constants/form-constants";
import cloneDeep from "lodash/cloneDeep";
import assign from "lodash/assign";

import ConditionOps from "./ui-conditions/condition-ops/condition-ops";

export default class PropertiesController {

	constructor() {
		this.propertiesStore = new PropertiesStore();
		this.handlers = {
			propertyListener: null,
			controllerHandler: null,
			actionHandler: null
		};
		this.visibleDefinitions = {};
		this.enabledDefinitions = {};
		this.validationDefinitions = {};
		this.filterDefinitions = {};
		this.filteredEnumDefinitions = {};
		this.panelTree = {};
		this.controls = {};
		this.customControls = [];
		this.summaryPanelControls = {};
		this.controllerHandlerCalled = false;
		this.commandStack = new CommandStack();
		this.custPropSumPanelValues = {};
		this.controlFactory = new ControlFactory(this);
		this.sharedCtrlInfo = [];
		this.isSummaryPanel = false;
		this.visibleSubPanelCounter = 0;
		this.conditionOps = ConditionOps.getConditionOps();
	}

	subscribe(callback) {
		this.propertiesStore.subscribe(callback);
	}

	getHandlers() {
		return this.handlers;
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
	setForm(form, intl) {
		this.form = form;
		this.reactIntl = intl;
		// console.log(JSON.stringify(form, null, 2));
		// set initial property values
		if (this.form) {
			this.controls = {};
			this.setControlStates({}); // clear state
			this.setErrorMessages({}); // clear messages
			this.isSummaryPanel = false; // when new form is set, summary panel is gone
			this.visibleSubPanelCounter = 0;
			this._parseUiConditions();
			// should be done before running any validations
			const controls = UiConditionsParser.parseControls([], this.form);
			this.saveControls(controls); // saves controls without the subcontrols
			this._parseSummaryControls(controls);
			this.parsePanelTree();
			conditionsUtil.injectDefaultValidations(this.controls, this.validationDefinitions, intl);
			let datasetMetadata;
			if (this.form.data) {
				datasetMetadata = this.form.data.datasetMetadata;
				const propertyValues = this.form.data.uiCurrentParameters ? assign({}, this.form.data.currentParameters, this.form.data.uiCurrentParameters)
					: this.form.data.currentParameters;
				this.setPropertyValues(propertyValues);
			}
			// Determine from the current control set whether or not there can be multiple input datasets
			this.multipleSchemas = this._canHaveMultipleSchemas();
			// Set the opening dataset(s), during which multiples are flattened and compound names generated if necessary
			this.setDatasetMetadata(datasetMetadata);
			// for control.type of structuretable that do not use FieldPicker, we need to add to
			// the controlValue any missing data model fields.  We need to do it here so that
			// validate can run against the added fields
			this._addToControlValues();
			// we need to take another pass through to resolve any default values that are parameterRefs.
			// we need to do it here because the parameter that is referenced in the parameterRef may need to have a
			// default value set in the above loop.
			this._addToControlValues(true);
			this.uiItems = this.form.uiItems; // set last so properties dialog doesn't render too early
			// set initial tab to first tab
			if (Array.isArray(this.uiItems) && Array.isArray(this.uiItems[0].tabs)) {
				this.setActiveTab(this.uiItems[0].tabs[0].group);
			}
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
		this.visibleDefinitions = { controls: {}, refs: {} };
		this.enabledDefinitions = { controls: {}, refs: {} };
		this.validationDefinitions = { controls: {}, refs: {} };
		this.filterDefinitions = { controls: {}, refs: {} };
		this.filteredEnumDefinitions = { controls: {}, refs: {} };
		if (this.form.conditions) {
			for (const condition of this.form.conditions) {
				if (condition.visible) {
					UiConditionsParser.parseConditions(this.visibleDefinitions, condition, CONDITION_TYPE.VISIBLE);
				} else if (condition.enabled) {
					UiConditionsParser.parseConditions(this.enabledDefinitions, condition, CONDITION_TYPE.ENABLED);
				} else if (condition.validation) {
					UiConditionsParser.parseConditions(this.validationDefinitions, condition, CONDITION_TYPE.VALIDATION);
				} else if (condition.filter) {
					UiConditionsParser.parseConditions(this.filterDefinitions, condition, CONDITION_TYPE.FILTER);
				} else if (condition.enum_filter) {
					UiConditionsParser.parseConditions(this.filteredEnumDefinitions, condition, CONDITION_TYPE.FILTEREDENUM);
				} else { // invalid
					logger.info("Invalid definition: " + JSON.stringify(condition));
				}
			}
		}
	}

	/*
	* This function will get all definitions of the input definition type (visible, enabled,
	* filteredEnum and validation) and the definition index (controls, refs) that are
	* referenced by the propertyId.  The definition types visible and enabled have two indexes.
	* Controls indexes are  all definitions that have the propertyId as an operand in the evaluate.
	* Refs are all definitions that have the propertyId as something that is set as a result of the evaluate.
	*
	*/
	getDefinitions(propertyId, dfnType, dfnIndex) {
		let conditionDefinitions;
		switch (dfnType) {
		case CONDITION_TYPE.VISIBLE:
			conditionDefinitions = this.visibleDefinitions[dfnIndex];
			break;
		case CONDITION_TYPE.ENABLED:
			conditionDefinitions = this.enabledDefinitions[dfnIndex];
			break;
		case CONDITION_TYPE.FILTEREDENUM:
			conditionDefinitions = this.filteredEnumDefinitions[dfnIndex];
			break;
		case CONDITION_TYPE.VALIDATION:
			conditionDefinitions = this.validationDefinitions[dfnIndex];
			break;
		default:
			break;
		}

		// only return definitions that reference the propertyId
		let retCond = [];
		for (const conditionKey in conditionDefinitions) {
			if (!conditionDefinitions.hasOwnProperty(conditionKey)) {
				continue;
			}
			// the definition may have a column indicator, build a propertyID
			// with the the name and col set from the definition ref.
			const baseId = conditionsUtil.getParamRefPropertyId(conditionKey);
			// baseId.col and propertyId.col can be undefined
			if (baseId.name === propertyId.name && baseId.col === propertyId.col) {
				retCond = retCond.concat(conditionDefinitions[conditionKey]);
			}
		}
		return retCond;

	}

	/*
	* Used to convert a propertyId to a propertyId that always has a row.
	* Used in complex types that aren't tables and don't have rows.  Returns original
	* propertyId or a propertyId where col is converted to row.  Used in messages and property values since they
	* are stored name -> row -> col
	* @param propertyId
	* @return propertyId
	*/
	convertPropertyId(propertyId) {
		// used for complex types that aren't tables
		if (propertyId && typeof propertyId.col !== "undefined" && typeof propertyId.row === "undefined") {
			return {
				name: propertyId.name,
				row: propertyId.col
			};
		}
		return propertyId;
	}

	// This function will traverse the form and build a tree representation of panels.
	// Each panel entry will have an array of children controls and children panels.
	parsePanelTree() {
		this.panelTree = {};
		this.panelTree[PANEL_TREE_ROOT] = { controls: [], panels: [] };
		UiGroupsParser.parseUiContent(this.panelTree, this.form, PANEL_TREE_ROOT);
	}

	_addToControlValues(resolveParameterRefs) {
		for (const keyName in this.controls) {
			if (!this.controls.hasOwnProperty(keyName)) {
				continue;
			}
			const control = this.controls[keyName];
			const propertyId = { name: control.name };
			let controlValue = this.getPropertyValue(propertyId);
			if (resolveParameterRefs) {
				if (typeof controlValue !== "undefined" && controlValue !== null && typeof controlValue.parameterRef !== "undefined") {
					controlValue = this.getPropertyValue({ name: controlValue.parameterRef });
					this.updatePropertyValue(propertyId, controlValue);
				}
			} else if (control.controlType === "structuretable" && control.addRemoveRows === false) {
				controlValue = this._populateFieldData(controlValue, control);
				this.updatePropertyValue(propertyId, controlValue);
			} else if (typeof control.valueDef !== "undefined" && typeof control.valueDef.defaultValue !== "undefined" &&
				(typeof controlValue === "undefined")) {
				controlValue = control.valueDef.defaultValue;
				this.updatePropertyValue(propertyId, controlValue);
			}
		}
	}

	_populateFieldData(controlValue, control) {
		const rowData = [];
		const fields = this.getDatasetMetadataFields();
		const updateCells = [];
		const multiSchema = this._isMultiSchemaControl(control);
		for (let i = 0; i < fields.length; i++) {
			const row = [];
			const fieldIndex = this._indexOfField(fields[i].name, controlValue);
			for (let k = 0; k < control.subControls.length; k++) {
				if (k === control.keyIndex) {
					const fieldValue = multiSchema ? { link_ref: fields[i].schema, field_name: fields[i].origName } : fields[i].name;
					row.push(fieldValue);
				} else if (fieldIndex > -1 && controlValue.length > i && controlValue[i].length > k) {
					row.push(controlValue[i][k]);
				} else {
					row.push(this._getDefaultSubControlValue(k, fields[i].name, fields, control));
					updateCells.push([i, k]);
				}
			}
			rowData.push(row);
		}
		return rowData;
	}

	/**
	 * Determines if the given control supports multiple input schemas.
	 *
	 * @param control A control structure
	 * @return True if the control supports multiple input schemas
	 */
	_isMultiSchemaControl(control) {
		if (control.role === ParamRole.COLUMN && control.valueDef.propType === Type.STRUCTURE) {
			return true;
		}
		if (PropertyUtils.toType(control.subControls) === "array") {
			for (const keyName in control.subControls) {
				if (control.subControls.hasOwnProperty(keyName)) {
					const subControl = control.subControls[keyName];
					if (subControl.role === ParamRole.COLUMN && subControl.valueDef.propType === Type.STRUCTURE) {
						return true;
					}
				}
			}
		}
		return false;
	}

	/**
	 * Determines if the current form can accept multiple input schemas.
	 *
	 * @return True if multiple input datasets are supported in this node
	 */
	_canHaveMultipleSchemas() {
		for (const keyName in this.controls) {
			if (this.controls.hasOwnProperty(keyName)) {
				const control = this.controls[keyName];
				if (this._isMultiSchemaControl(control)) {
					return true;
				}
			}
		}
		return false;
	}

	_getDefaultSubControlValue(col, fieldName, fields, control) {
		let val;
		const subControl = control.subControls[col];
		if (PropertyUtils.toType(subControl.valueDef.defaultValue) !== "undefined") {
			val = subControl.valueDef.defaultValue;
			if (val.parameterRef) {
				val = this.getPropertyValue({ name: val.parameterRef });
			}
		} else if (PropertyUtils.toType(subControl.dmDefault) !== "undefined") {
			val = this._getDMDefault(subControl, fieldName, fields);
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
		} else if (subControl.valueDef.propType === "structure") {
			val = {};
		} else {
			val = null;
		}
		return val;
	}

	_getDMDefault(subControlDef, fieldName, fields) {
		let defaultValue;
		const dmField = subControlDef.dmDefault;
		if (fieldName) {
			for (const field of fields) {
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

	getUiItems() {
		return this.uiItems;
	}

	addSharedControls(id, controlsNames) {
		this.sharedCtrlInfo.push({ "id": id, "controlNames": controlsNames });
	}

	getSharedCtrlInfo() {
		return this.sharedCtrlInfo;
	}

	isSummaryPanelShowing() {
		return this.isSummaryPanel;
	}

	setIsSummaryPanelShowing(isSummaryPanelShowing) {
		this.isSummaryPanel = isSummaryPanelShowing;
	}

	increaseVisibleSubPanelCounter() {
		this.visibleSubPanelCounter++;
	}

	decreaseVisibleSubPanelCounter() {
		this.visibleSubPanelCounter--;
	}

	isSubPanelsShowing() {
		return this.visibleSubPanelCounter > 0;
	}

	/**
	* Returns title
	*	@return string
	*/
	getTitle() {
		return this.propertiesStore.getTitle();
	}

	/**
	* Sets title for common-properties
	*	@param title string
	*/
	setTitle(title) {
		return this.propertiesStore.setTitle(title);
	}

	/**
	* Returns activeTab
	*	@return string
	*/
	getActiveTab() {
		return this.propertiesStore.getActiveTab();
	}

	/**
	* Sets active primary tab for common-properties
	*	@param title string
	*/
	setActiveTab(activeTab) {
		return this.propertiesStore.setActiveTab(activeTab);
	}

	/**
	* Sets all ops supported in common-properties.  Both standard and custom
	*	@param custOps object
	*/
	setConditionOps(custOps) {
		this.conditionOps = ConditionOps.getConditionOps(custOps);
	}

	/**
	* Returns the op to run.
	*	@param op string
	* @return op method to run
	*/
	getConditionOp(op) {
		if (this.conditionOps) {
			return this.conditionOps[op];
		}
		return null;
	}

	/**
	*	@return a map of condition ops
	*/
	getConditionOps() {
		return this.conditionOps;
	}

	/**
	* Returns datasetMetadata passed into common-properties.
	*	@return passed in value
	*/
	getDatasetMetadata() {
		return this.propertiesStore.getDatasetMetadata().schemas;
	}

	/**
	* Returns a list field objects.  Based on datasetMetadata passed into common-properties.
	*	@return array[field]
	*/
	getDatasetMetadataFields() {
		return this.propertiesStore.getDatasetMetadata().fields;
	}

	/**
	* Returns a list of schema names.
	*	@return array[string]
	*/
	getDatasetMetadataSchemas() {
		return this.propertiesStore.getDatasetMetadata().schemaNames;
	}

	/**
	* Returns a list field objects filtered. These are filterd by conditions and
	* by shared controls
	* @param propertyId Propertied id of the control requesting the fields
	* @return array[field]
	*/
	getFilteredDatasetMetadata(propertyId) {
		let fields = this.getDatasetMetadataFields();
		if (propertyId) {
			fields = this._filterSharedDataset(propertyId, fields);
			fields = conditionsUtil.filterConditions(propertyId, this.filterDefinitions.controls, this, fields);
		}
		return fields;
	}

	/**
	 * Retrieves a filtered data model in which all fields that are already
	 * in use by other controls are already filtered out.
	 *
	 * @param propertyId Name of control to skip when checking field controls
	 * @param fields array of available fields to be filtered
	 * @return Filtered fields with fields in use removed
	 */
	_filterSharedDataset(propertyId, fields) {
		if (!this.sharedCtrlInfo || !propertyId) {
			return fields;
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
					const control = this.getControl({ name: ctrlName });
					// only remove from the main list the values that are in other controls
					const propValue = this.getPropertyValue({ name: ctrlName });
					if (Array.isArray(propValue)) {
						for (const arrayValue of propValue) {
							if (Array.isArray(arrayValue)) {
								// Two dimensional arrays
								const fieldIdx = PropertyUtils.getTableFieldIndex(control);
								if (fieldIdx >= 0 && fieldIdx < arrayValue.length) {
									usedFields.push(PropertyUtils.stringifyFieldValue(arrayValue[fieldIdx], control));
								}
							} else {
								// Single dimensional arrays
								usedFields.push(PropertyUtils.stringifyFieldValue(arrayValue, control));
							}
						}
					} else {
						// Plain properties
						usedFields.push(PropertyUtils.stringifyFieldValue(propValue, control));
					}
				}
			}
			const usedFieldsList = Array.from(new Set(usedFields)); // make all values unique
			const filteredFields = fields.filter(function(field) {
				return usedFieldsList.indexOf(field.name) === -1;
			});
			return filteredFields;
		} catch (error) {
			logger.warn("Error filtering shared controls " + error);
		}
		return fields;
	}

	/**
	 * This method parses the inDatasetMetadata into fields and schemaNames to be
	 * used throughout common-properties.
	 *
	 * @param inDatasetMetadata Array of datasetMetadata schemata
	 */
	setDatasetMetadata(inDatasetMetadata) {
		const schemaNames = [];
		const fields = [];
		if (inDatasetMetadata) {
			let schemas = cloneDeep(inDatasetMetadata);
			// in the 2.0 schema only arrays are support but we want to support both for now.  Internally everything should be an array
			if (!Array.isArray(schemas)) {
				schemas = [schemas];
			}
			// make sure all schemas have a name
			for (let j = 0; j < schemas.length; j++) {
				if (!schemas[j].name) {
					schemas[j].name = j.toString();
				}
				schemas[j].idx = j; // used to set dup names
			}
			// make sure all schemas have a unique names
			for (const schema of schemas) {
				const dupNamedSchemas = schemas.filter(function(filterSchema) {
					return filterSchema.name === schema.name;
				});
				if (dupNamedSchemas && dupNamedSchemas.length > 1) {
					for (let j = 0; j < dupNamedSchemas.length; j++) {
						dupNamedSchemas[j].name = dupNamedSchemas[j].name + "_" + dupNamedSchemas[j].idx;
					}
				}
			}

			// process all fields into single array
			for (const schema of schemas) {
				schemaNames.push(schema.name);
				if (schema.fields) {
					for (const field of schema.fields) {
						field.schema = schema.name;
						field.origName = field.name; // original name
						fields.push(field);
					}
				}
			}
		}

		// Adjust field names for multi-schema scenarios in which setForm is not called
		if (typeof this.multipleSchemas === "undefined") {
			// Determine from the current control set whether or not there can be multiple input datasets
			this.multipleSchemas = this._canHaveMultipleSchemas();
		}
		if (this.multipleSchemas) {
			for (const field of fields) {
				field.name = field.schema + "." + field.origName;
			}
		}

		// store values in redux
		this.propertiesStore.setDatasetMetadata({ schemas: inDatasetMetadata, fields: fields, schemaNames: schemaNames });
	}

	/**
	* This public API will validate a single property input value.
	*
	* @param {object} propertyId. required.
	*/
	validateInput(propertyId) {
		conditionsUtil.validateInput(propertyId, this, this.validationDefinitions);
	}

	/**
	* This public API will validate all properties input values.
	*
	*/
	validatePropertiesValues() {
		conditionsUtil.validatePropertiesValues(this);
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

	/**
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
	updatePropertyValue(inPropertyId, value, skipValidateInput) {
		const propertyId = this.convertPropertyId(inPropertyId);
		this.propertiesStore.updatePropertyValue(propertyId, value);
		conditionsUtil.validateConditions(inPropertyId, this);
		if (!skipValidateInput) {
			conditionsUtil.validateInput(inPropertyId, this);
		}
		if (this.handlers.propertyListener) {
			this.handlers.propertyListener(
				{
					action: ACTIONS.UPDATE_PROPERTY,
					property: inPropertyId,
					value: value
				}
			);
		}
	}

	getPropertyValue(inPropertyId, filterHiddenDisabled) {
		const propertyId = this.convertPropertyId(inPropertyId);
		const propertyValue = this.propertiesStore.getPropertyValue(propertyId);
		let filteredValue;
		// don't return hidden/disabled values
		if (filterHiddenDisabled) {
			// top level value
			const controlState = this.getControlState(propertyId);
			if (controlState === STATES.DISABLED || controlState === STATES.HIDDEN) {
				return filteredValue;
			}
			// copy array to modify it and clear out disabled/hidden values
			filteredValue = PropertyUtils.copy(propertyValue);
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
				if (typeof filteredValue !== "undefined") {
					filteredValues[propKey] = filteredValue;
				}
			}
			return filteredValues;
		}
		return propertyValues;
	}

	setPropertyValues(values) {
		this.propertiesStore.setPropertyValues(values);

		conditionsUtil.validatePropertiesConditions(this);
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

	/**
	* @param propertyId
	* @param state string ("disabled", "enabled", "hidden", "visible")
	*/
	updateControlState(propertyId, state) {
		this.propertiesStore.updateControlState(propertyId, state);
	}
	getControlState(propertyId) {
		return this.propertiesStore.getControlState(propertyId);
	}
	getControlStates() {
		return this.propertiesStore.getControlStates();
	}

	/**
	 * Panel States Methods
	 * Sets the panel state. Supported states are:
	 * "disabled", "enabled", "hidden", "visible".
	 */
	setPanelStates(states) {
		this.propertiesStore.setPanelStates(states);
	}

	/**
	* @param panelId {name: panel.id}
  * @param state string ("disabled", "enabled", "hidden", "visible")
	*/
	updatePanelState(panelId, state) {
		this.propertiesStore.updatePanelState(panelId, state);
	}
	getPanelState(panelId) {
		return this.propertiesStore.getPanelState(panelId);
	}
	getPanelStates() {
		return this.propertiesStore.getPanelStates();
	}

	/**
	* Error Messages Methods
	* @param messages object with keys being property name
	*/
	setErrorMessages(messages) {
		this.propertiesStore.setErrorMessages(messages);
	}

	/**
	*	Converts pipeline-flow error messages to messages common-properties can handle
	* @param messages array of messages in pipeline-flow schema format
	*/
	setPipelineErrorMessages(messages) {
		this.setErrorMessages({});
		if (Array.isArray(messages)) {
			messages.forEach((message) => {
				const propertyId = message.table_ref ? { name: message.id_ref, row: message.table_ref.row, col: message.table_ref.col }
					: { name: message.id_ref };
				this.updateErrorMessage(propertyId,
					{ type: message.type, text: message.text, validation_id: message.validation_id });
			});
		}
	}

	/**
	* returns a single error message for a propertyId
	* @param inPropertyId boolean
	* @return error message object
	*/
	getErrorMessage(inPropertyId, filterHiddenDisable) {
		const propertyId = this.convertPropertyId(inPropertyId);
		// don't return hidden message
		if (filterHiddenDisable) {
			const controlState = this.getControlState(propertyId);
			if (controlState === STATES.DISABLED || controlState === STATES.HIDDEN) {
				return null;
			}
		}

		return this.propertiesStore.getErrorMessage(propertyId, this.reactIntl);
	}

	/**
	*	Used to return all error messages.  Will either return internally stored messages
	* or formatted list to store in pipeline-flow
	* @param filteredPipeline boolean
	* @return object when filteredPipeline=false or array when filteredPipeline=true
	*/
	getErrorMessages(filteredPipeline, filterHiddenDisable) {
		let messages = this.propertiesStore.getErrorMessages();
		if (filteredPipeline || filterHiddenDisable) {
			messages = this._filterMessages(messages, filteredPipeline, filterHiddenDisable);
		}
		return messages;
	}

	_filterMessages(messages, filteredPipeline, filterHiddenDisable) {
		if (filteredPipeline) {
			return this._filterPipelineMessages(messages, filterHiddenDisable);
		}
		const filteredMessages = {};
		for (const paramKey in messages) {
			if (!messages.hasOwnProperty(paramKey)) {
				continue;
			}
			const paramMessage = this.getErrorMessage({ name: paramKey }, filterHiddenDisable);
			if (paramMessage && paramMessage.text) {
				filteredMessages[paramKey] = paramMessage;
			}
		}
		return filteredMessages;
	}

	_filterPipelineMessages(messages, filterHiddenDisable) {
		let pipelineMessages = [];
		for (const paramKey in messages) {
			if (!messages.hasOwnProperty(paramKey)) {
				continue;
			}
			const controlMessages = messages[paramKey];
			for (const rowKey in controlMessages) {
				if (!controlMessages.hasOwnProperty(rowKey)) {
					continue;
				}
				if (rowKey === "text") { // control level message
					pipelineMessages = this._addToMessages(pipelineMessages, paramKey, null,
						controlMessages, filterHiddenDisable);
				} else if (rowKey !== "type" && rowKey !== "validation_id") {
					const rowMessages = controlMessages[rowKey];
					for (const colKey in rowMessages) {
						if (!rowMessages.hasOwnProperty(colKey)) {
							continue;
						}
						if (colKey === "text") { // row level message
							pipelineMessages = this._addToMessages(pipelineMessages, paramKey, { row: rowKey },
								rowMessages, filterHiddenDisable);
						} else if (colKey !== "type" && colKey !== "validation_id") {
							const colMessage = rowMessages[colKey]; // cell level messages
							pipelineMessages = this._addToMessages(pipelineMessages, paramKey, { row: rowKey, col: colKey },
								colMessage, filterHiddenDisable);
						}
					}
				}
			}
		}
		return pipelineMessages;
	}

	_addToMessages(messages, idRef, tableRef, message, filterHiddenDisable) {
		const propertyId = tableRef ? { name: idRef, row: tableRef.row, col: tableRef.col }
			: { name: idRef };
		if (filterHiddenDisable) {
			const controlState = this.getControlState(propertyId);
			if (controlState === STATES.DISABLED || controlState === STATES.HIDDEN) {
				return messages;
			}
		}
		if (tableRef) {
			messages.push({
				id_ref: idRef,
				table_ref: tableRef,
				validation_id: message.validation_id,
				type: message.type,
				text: message.text
			});
		} else {
			messages.push({
				id_ref: idRef,
				validation_id: message.validation_id,
				type: message.type,
				text: message.text
			});
		}
		return messages;
	}

	updateErrorMessage(inPropertyId, message) {
		const propertyId = this.convertPropertyId(inPropertyId);
		if (message && message.type !== "info") {
			this.propertiesStore.updateErrorMessage(propertyId, message);
		} else {
			this.propertiesStore.clearErrorMessage(propertyId);
		}
	}

	removeErrorMessageRow(inPropertyId) {
		const propertyId = this.convertPropertyId(inPropertyId);
		let messages = this.propertiesStore.getErrorMessages();
		const controlMsg = messages[propertyId.name];
		if (typeof controlMsg !== "undefined") {
			for (const rowIndex of Object.keys(controlMsg)) {
				const rowNumber = parseInt(rowIndex, 10);
				if (rowNumber === propertyId.row) {
					delete messages[propertyId.name][rowNumber];
				} else if (rowNumber > propertyId.row) {
					messages = this._moveMessageRows(messages, propertyId.name, rowNumber, rowNumber - 1);
				}
			}
			this.setErrorMessages(messages);
		}
	}

	moveErrorMessageRows(controlName, firstRow, secondRow) {
		let messages = this.propertiesStore.getErrorMessages();
		const controlMsg = messages[controlName];
		if (typeof controlMsg !== "undefined") {
			const firstRowErrorMsg = controlMsg[firstRow];
			const secondRowErrorMsg = controlMsg[secondRow];
			if (typeof firstRowErrorMsg !== "undefined" && typeof secondRowErrorMsg !== "undefined") {
				messages = this._moveMessageRows(messages, controlName, firstRow, secondRow);
				// create second message because it is deleted in the changeErrorMessageRow, set it to first row number
				messages[controlName][firstRow] = {};
				for (const colNumber of Object.keys(secondRowErrorMsg)) {
					messages[controlName][firstRow][colNumber] = secondRowErrorMsg[colNumber];
				}
			} else if (typeof firstRowErrorMsg !== "undefined") {
				messages = this._moveMessageRows(messages, controlName, firstRow, secondRow);
			} else if (typeof secondRowErrorMsg !== "undefined") {
				messages = this._moveMessageRows(messages, controlName, secondRow, firstRow);
			}
			this.setErrorMessages(messages);
		}
	}

	_moveMessageRows(messages, controlName, fromRow, toRow) {
		messages[controlName][toRow] = messages[controlName][fromRow];
		delete messages[controlName][fromRow];
		return messages;
	}

	/*
	* Controls Methods
	*/

	// Saves controls in a state that get be used to retrieve them using a propertyId
	saveControls(controls) {
		controls.forEach((control) => {
			if (typeof control.columnIndex === "undefined") {
				this.controls[control.name] = control;
			} else {
				this.controls[control.parameterName][control.columnIndex] = control;
			}
		});
	}

	getControl(propertyId) {
		let control = this.controls[propertyId.name];
		// custom control doesn't have any subcontrols so default to parent
		if (typeof propertyId.col !== "undefined" && control && control.controlType !== ControlType.CUSTOM) {
			control = this.controls[propertyId.name][propertyId.col.toString()];
		}
		return control;
	}

	getControls() {
		return this.controls;
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

	/**
	* Used to create standard controls in customPanels
	* @param propertyId - Property id of the controls
	* @param paramDef - schema definition.  See paramDef schema
	* @param parameter (string) - name of the parameter to pull out of paramDef
	*/
	createControl(propertyId, paramDef, parameter) {
		const control = this.controlFactory.createFormControl(paramDef, parameter);
		const controls = [];
		// need to preserve parentCategoryId which is set during initial parsing of all controls
		const parentCategoryId = this.getControl(propertyId).parentCategoryId;
		UiConditionsParser.parseControl(controls, control, parentCategoryId);
		this.saveControls(controls);
		return this.controlFactory.createControlItem(control, propertyId);
	}

	/**
	* Used to create controls
	* @return the controlFactory instance
	*/
	getControlFactory() {
		return this.controlFactory;
	}

	/**
	* Sets the custom controls available to common-properties
	* @param customControls
	*/
	setCustomControls(customControls) {
		this.customControls = customControls;
	}

	/**
	* Returns a rendered custom control
	* @param propertyId
	* @param control
	* @param tableInfo
	*/
	getCustomControl(propertyId, control, tableInfo) {
		if (control.customControlId) {
			for (const customCtrl of this.customControls) {
				if (customCtrl.id() === control.customControlId) {
					try {
						return new customCtrl(propertyId, this, control.data, tableInfo).renderControl();
					} catch (error) {
						logger.warn("Error thrown creating custom control: " + error);
						return "";
					}
				}
			}
		}
		return "Custom control not found: " + control.customControlId;
	}
}
