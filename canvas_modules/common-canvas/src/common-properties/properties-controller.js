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
/* eslint max-depth: ["error", 7]*/

import PropertiesStore from "./properties-store.js";
import logger from "../../utils/logger";
import * as UiConditionsParser from "./ui-conditions/ui-conditions-parser.js";
import setExpressionInfo from "./controls/expression/expressionInfo-parser.js";

import { parseUiContent } from "./ui-conditions/ui-groups-parser.js";
import * as conditionsUtil from "./ui-conditions/conditions-utils";
import * as PropertyUtils from "./util/property-utils.js";

import { STATES, ACTIONS, CONDITION_TYPE, PANEL_TREE_ROOT, CONDITION_MESSAGE_TYPE, UPDATE_TYPE } from "./constants/constants.js";
import CommandStack from "../command-stack/command-stack.js";
import ControlFactory from "./controls/control-factory";
import { Type, ParamRole, ControlType, ItemType } from "./constants/form-constants";
import { has, cloneDeep, assign, isEmpty, isEqual, isUndefined, get, difference } from "lodash";
import Form from "./form/Form";
import { getConditionOps } from "./ui-conditions/condition-ops/condition-ops";
import { DEFAULT_LOCALE } from "./constants/constants";
export default class PropertiesController {

	constructor() {
		this.propertiesStore = new PropertiesStore();
		this.handlers = {
			propertyListener: null,
			controllerHandler: null,
			actionHandler: null,
			buttonHandler: null,
			buttonIconHandler: null,
			titleChangeHandler: null,
			tooltipLinkHandler: null
		};
		this.propertiesConfig = {};
		this.visibleDefinitions = {};
		this.enabledDefinitions = {};
		this.validationDefinitions = {};
		this.requiredDefinitionsIds = [];
		this.filterDefinitions = {};
		this.filteredEnumDefinitions = {};
		this.allowChangeDefinitions = {};
		this.conditionalDefaultDefinitions = {};
		this.panelTree = {};
		this.prevControls = {};
		this.controls = {};
		this.actions = {};
		this.customControls = [];
		this.summaryPanelControls = {};
		this.controllerHandlerCalled = false;
		this.commandStack = new CommandStack();
		this.custPropSumPanelValues = {};
		this.controlFactory = new ControlFactory(this);
		this.sharedCtrlInfo = [];
		this.isSummaryPanel = false;
		this.visibleSubPanelCounter = 0;
		this.conditionOps = getConditionOps();
		this.expressionFunctionInfo = {};
		this.expressionRecentlyUsed = [];
		this.expressionFieldsRecentlyUsed = [];
		this.selectionListeners = {};
	}

	getStore() {
		return this.propertiesStore.getStore();
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
			this.handlers.controllerHandler(this); // one time call to return controller
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

	setEditorSize(editorSize) {
		this.editorSize = editorSize;
	}

	getEditorSize() {
		return this.editorSize;
	}

	setLight(light) {
		this.light = light;
	}

	getLight() {
		return this.light;
	}

	setPropertiesConfig(config) {
		this.propertiesConfig = config;
	}

	getPropertiesConfig() {
		return this.propertiesConfig;
	}

	getLocale() {
		return get(this.propertiesConfig, "locale", DEFAULT_LOCALE);
	}

	isTearsheetContainer() {
		return this.propertiesConfig.containerType === "Tearsheet";
	}

	setParamDef(paramDef) {
		const containerType = get(this.getPropertiesConfig(), "containerType");
		const convertTypes = get(this.getPropertiesConfig(), "convertTypes");
		const formData = Form.makeForm(paramDef, containerType, convertTypes);
		this.setForm(formData);
	}

	//
	// Form and parsing Methods
	//
	setForm(form, intl, sameParameterDefRendered) {
		this.form = form;
		// console.log(JSON.stringify(form, null, 2));
		this.reactIntl = intl;
		// set initial property values
		if (this.form) {
			this.prevControls = this.controls;
			this.controls = {};
			this.setControlStates({}); // clear state
			this.setErrorMessages({}); // clear messages
			this.isSummaryPanel = false; // when new form is set, summary panel is gone
			this.visibleSubPanelCounter = 0;
			this._parseUiConditions();
			// should be done before running any validations
			const controls = [];
			UiConditionsParser.parseControls(controls, this.actions, this.form);
			this.saveControls(controls); // saves controls without the subcontrols
			this._parseSummaryControls(controls);
			this.parsePanelTree();
			conditionsUtil.injectDefaultValidations(this.controls, this.validationDefinitions, this.requiredDefinitionsIds, intl);
			let datasetMetadata;
			let propertyValues = {};
			if (this.form.data) {
				datasetMetadata = this.form.data.datasetMetadata;
				propertyValues = this.form.data.uiCurrentParameters ? assign({}, this.form.data.currentParameters, this.form.data.uiCurrentParameters)
					: this.form.data.currentParameters;
			}
			// Set the opening dataset(s), during which multiples are flattened and compound names generated if necessary
			this.setDatasetMetadata(datasetMetadata);
			this.setPropertyValues(propertyValues, true); // needs to be after setDatasetMetadata to run conditions
			this.differentProperties = [];
			if (sameParameterDefRendered) {
				// When a parameterDef is dynamically updated, set difference between old and new controls
				this.differentProperties = difference(Object.keys(this.controls), Object.keys(this.prevControls));
			}
			// for control.type of structuretable that do not use FieldPicker, we need to add to
			// the controlValue any missing data model fields.  We need to do it here so that
			// validate can run against the added fields
			this._addToControlValues(sameParameterDefRendered);
			// we need to take another pass through to resolve any default values that are parameterRefs.
			// we need to do it here because the parameter that is referenced in the parameterRef may need to have a
			// default value set in the above loop.
			this._addToControlValues(sameParameterDefRendered, true);

			// set initial values for addRemoveRows, tableButtons in redux
			this.setInitialAddRemoveRows();
			this.setInitialTableButtonState();

			this.uiItems = this.form.uiItems; // set last so properties dialog doesn't render too early
			// set initial tab to first tab
			if (!isEmpty(this.uiItems) && !isEmpty(this.uiItems[0].tabs)) {
				// active tab is the first non-tearsheet
				const filteredTearsheets = this.uiItems[0].tabs.filter((tab) => tab.content.itemType !== ItemType.TEARSHEET);
				if (filteredTearsheets.length) {
					this.propertiesStore.setActiveTab(filteredTearsheets[0].group);
				}
			}

			// set title
			this.setTitle(this.form.label);
		}
	}

	getForm() {
		return this.form;
	}

	getResource(key, defaultValue) {
		if (this.form && this.form.resources) {
			return this.form.resources[key] ? this.form.resources[key] : defaultValue;
		}
		return defaultValue;
	}

	setAppData(appData) {
		this.appData = appData;
	}

	getAppData() {
		return this.appData;
	}

	getActiveTabPropertyValues() {
		const activeTab = this.propertiesStore.getActiveTab();
		const allPropertyValues = this.propertiesStore.getPropertyValues();
		const activeTabPropertyValues = {};
		let activeTabPropertyIds = [];

		for (const group of this.form.groupMetadata.groups) {
			if (group.name === activeTab) {
				activeTabPropertyIds = this.getGroupProperties(group);
				break;
			}
		}

		activeTabPropertyIds.forEach((propertyId) => {
			activeTabPropertyValues[propertyId] = allPropertyValues[propertyId];
		});

		return activeTabPropertyValues;
	}

	// Recursively get all properties under given uiGroup
	getGroupProperties(uiGroup) {
		const parameters = typeof uiGroup.parameterNames() !== "undefined" ? uiGroup.parameterNames() : [];
		const actions = typeof uiGroup.actionIds() !== "undefined" ? uiGroup.actionIds() : [];
		let groupProperties = [...parameters, ...actions];

		if (has(uiGroup, "subGroups") && uiGroup.subGroups) {
			for (const subGrp of uiGroup.subGroups) {
				const subGroupProperties = this.getGroupProperties(subGrp);
				groupProperties = groupProperties.concat(subGroupProperties);
			}
		}

		return groupProperties;
	}

	_parseUiConditions() {
		this.visibleDefinitions = { controls: {}, refs: {} };
		this.enabledDefinitions = { controls: {}, refs: {} };
		this.validationDefinitions = { controls: {}, refs: {} };
		this.filterDefinitions = { controls: {}, refs: {} };
		this.filteredEnumDefinitions = { controls: {}, refs: {} };
		this.allowChangeDefinitions = { controls: {}, refs: {} };
		this.conditionalDefaultDefinitions = { controls: {}, refs: {} };

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
				} else if (condition.allow_change) {
					UiConditionsParser.parseConditions(this.allowChangeDefinitions, condition, CONDITION_TYPE.ALLOWCHANGE);
				} else if (condition.default_value) {
					UiConditionsParser.parseConditions(this.conditionalDefaultDefinitions, condition, CONDITION_TYPE.CONDITIONALDEFAULT);
				} else { // invalid
					logger.info("Invalid definition: " + JSON.stringify(condition));
				}
			}
		}
	}

	/*
	* This function will get all definitions of the input definition type (visible, enabled,
	* filteredEnum and validation) and the definition index (controls, refs) that are
	* referenced by the propertyId.  The definition types visible and enabled have two indices.
	* Controls indices are all definitions that have the propertyId as an operand in the evaluate.
	* Refs are all definitions that have the propertyId as something that is set as a result of the evaluate.
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
		case CONDITION_TYPE.ALLOWCHANGE:
			conditionDefinitions = this.allowChangeDefinitions[dfnIndex];
			break;
		case CONDITION_TYPE.CONDITIONALDEFAULT:
			conditionDefinitions = this.conditionalDefaultDefinitions[dfnIndex];
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
			if (!has(conditionDefinitions, conditionKey)) {
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

	getRequiredDefinitionIds() {
		return this.requiredDefinitionsIds;
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
		// used for backward compatibility when a controlName is passed in
		if (typeof propertyId === "string") {
			return {
				name: propertyId
			};
		}
		// used for complex types that aren't tables
		return this.convertNestedPropertyId(propertyId);
	}

	convertNestedPropertyId(propertyId) {
		if (propertyId && typeof propertyId.col !== "undefined" && typeof propertyId.row === "undefined") {

			let childPropertyId;
			if (typeof propertyId.propertyId !== "undefined") {
				childPropertyId = this.convertNestedPropertyId(propertyId.propertyId);
			}
			return {
				name: propertyId.name,
				row: propertyId.col,
				propertyId: childPropertyId
			};
		} else if (propertyId &&
			typeof propertyId.col !== "undefined" &&
			typeof propertyId.row !== "undefined" &&
			typeof propertyId.propertyId !== "undefined") { // handle nested complex types that aren't tables
			return {
				name: propertyId.name,
				row: propertyId.row,
				col: propertyId.col,
				propertyId: this.convertNestedPropertyId(propertyId.propertyId)
			};
		}
		return propertyId;
	}

	// Given the parent's "propertyId", find the "propertyId" of the last child
	//  and update the "row" and "col" properties defined in "childProperties"
	updateLastChildPropertyId(propertyId, childProperties) {
		if (typeof propertyId.propertyId !== "undefined") {
			return this.updateLastChildPropertyId(propertyId.propertyId, childProperties);
		}
		if (typeof childProperties.row !== "undefined") {
			propertyId.row = childProperties.row;
		}
		if (typeof childProperties.col !== "undefined") {
			propertyId.col = childProperties.col;
		}
		return propertyId;
	}

	// Given the parent's "propertyId", set the "childPropertyId" as the last child of "propertyId"
	// The "childPropertyId" is a control of a nested structure
	setChildPropertyId(propertyId, childPropertyId) {
		if (typeof propertyId.propertyId !== "undefined") {
			return this.setChildPropertyId(propertyId.propertyId, childPropertyId);
		}
		propertyId.propertyId = childPropertyId;
		return propertyId;
	}

	// This function will traverse the form and build a tree representation of panels.
	// Each panel entry will have an array of children controls and children panels.
	parsePanelTree() {
		this.panelTree = {};
		this.panelTree[PANEL_TREE_ROOT] = { controls: [], panels: [], actions: [] };
		parseUiContent(this.panelTree, this.form, PANEL_TREE_ROOT);
	}

	_addToControlValues(sameParameterDefRendered, resolveParameterRefs) {
		for (const keyName in this.controls) {
			if (!has(this.controls, keyName)) {
				continue;
			}
			const control = this.controls[keyName];
			const propertyId = { name: control.name };
			let controlValue = this.getPropertyValue(propertyId);

			if (resolveParameterRefs) {
				if (typeof controlValue !== "undefined" && controlValue !== null && typeof controlValue.parameterRef !== "undefined") {
					controlValue = this.getPropertyValue({ name: controlValue.parameterRef });
					this.updatePropertyValue(propertyId, controlValue, true, UPDATE_TYPE.INITIAL_LOAD);
				}
			} else if (control.controlType === "structuretable" && control.addRemoveRows === false && control.includeAllFields === true) {
				controlValue = this._populateFieldData(controlValue, control);
				this.updatePropertyValue(propertyId, controlValue, true, UPDATE_TYPE.INITIAL_LOAD);
			} else if (typeof control.valueDef !== "undefined" && typeof control.valueDef.defaultValue !== "undefined" &&
				(typeof controlValue === "undefined")) {
				controlValue = control.valueDef.defaultValue;

				// convert values of type:object to the internal format array values
				if (PropertyUtils.isSubControlStructureObjectType(control)) {
					controlValue = PropertyUtils.convertObjectStructureToArray(control.valueDef.isList, control.subControls, controlValue);
				}

				// When parameterDef is dynamically updated, don't set INITIAL_LOAD on pre-existing properties
				if (sameParameterDefRendered && !this.differentProperties.includes(control.name)) {
					this.updatePropertyValue(propertyId, controlValue, true);
				} else {
					this.updatePropertyValue(propertyId, controlValue, true, UPDATE_TYPE.INITIAL_LOAD);
				}
			} else if (control.controlType === "structureeditor") {
				if (!controlValue || (Array.isArray(controlValue) && controlValue.length === 0)) {
					if (Array.isArray(control.defaultRow)) {
						this.updatePropertyValue(propertyId, control.defaultRow, true, UPDATE_TYPE.INITIAL_LOAD);
					}
				}
			}
		}
	}

	_populateFieldData(controlValue, control) {
		const fields = this.getDatasetMetadataFields();
		const multiSchema = this._isMultiSchemaControl(control);
		// Start with the values stored in current_parameters
		const rowData = [].concat(controlValue);
		// Add in any rows containing fields not present in the current parameters
		for (let i = 0; i < fields.length; i++) {
			const row = [];
			const fieldIndex = this._indexOfField(fields[i].name, controlValue);
			if (fieldIndex === -1) {
				for (let k = 0; k < control.subControls.length; k++) {
					if (k === control.keyIndex) {
						const fieldValue = multiSchema ? { link_ref: fields[i].schema, field_name: fields[i].origName } : fields[i].name;
						row.push(fieldValue);
					} else {
						row.push(this._getDefaultSubControlValue(k, fields[i].name, fields, control));
					}
				}
				rowData.push(row);
			}
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
				if (has(control.subControls, keyName)) {
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
			if (has(this.controls, keyName)) {
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
		if (PropertyUtils.toType(subControl.dmDefault) !== "undefined") {
			val = PropertyUtils.getDMDefault(subControl, fieldName, fields);
		} else if (PropertyUtils.toType(subControl.valueDef.defaultValue) !== "undefined") {
			val = subControl.valueDef.defaultValue;
			if (val.parameterRef) {
				val = this.getPropertyValue({ name: val.parameterRef });
			}
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

	getReactIntl() {
		return this.reactIntl;
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
	* Sets all ops supported in common-properties.  Both standard and custom
	*	@param custOps object
	*/
	setConditionOps(custOps) {
		this.conditionOps = getConditionOps(custOps);
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
		const propNames = sharedCtrlNames.map(function(item) {
			return item.controlName;
		});
		return this.filterFieldsFromSharedProps(fields, propNames, skipControlName);
	}

	/**
	 * Filters field names that are already in use from the given list.
	 *
	 * @param fieldNames - Array of field names to filter
	 * @param propNames - Array of property names that share a single source field list
	 * @param skipName - Name of a property to skip from the list
	 * @return An array of filtered field names that are not in use
	 */
	filterFieldsFromSharedProps(fieldNames, propNames, skipName) {
		try {
			const usedFields = [];
			for (const sharedProp of propNames) {
				if (sharedProp !== skipName) {
					const control = this.getControl({ name: sharedProp });
					// only remove from the main list the values that are in other controls
					const propValue = this.getPropertyValue({ name: sharedProp });
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
			const filteredFields = fieldNames.filter(function(field) {
				return usedFieldsList.indexOf(field.name) === -1;
			});
			return filteredFields;
		} catch (error) {
			logger.warn("Error filtering shared controls " + error);
		}
		return fieldNames;
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
	* @param {boolean} showErrors. optional. Set to false to run conditions without displaying errors in the UI
	*    Defaults to true to always display errors
	*/
	validateInput(propertyId, showErrors = true) {
		conditionsUtil.validateInput(propertyId, this, showErrors);
	}

	/**
	* This public API will validate all properties input values.
	* @param {boolean} showErrors. optional. Set to false to run conditions without displaying errors in the UI
	*    Defaults to true to always display errors
	*/
	validatePropertiesValues(showErrors = true) {
		conditionsUtil.validatePropertiesValues(this, showErrors);
	}

	//
	// Table row selections
	//
	getSelectedRows(inPropertyId) {
		const propertyId = this.convertPropertyId(inPropertyId);
		return this.propertiesStore.getSelectedRows(propertyId);
	}

	updateSelectedRows(inPropertyId, selection) {
		const propertyId = this.convertPropertyId(inPropertyId);
		this.propertiesStore.updateSelectedRows(propertyId, selection);
		this._notifySelectionListener(propertyId, selection);
	}

	clearSelectedRows(inPropertyId) {
		const propertyId = this.convertPropertyId(inPropertyId);
		this.propertiesStore.clearSelectedRows(propertyId);
	}

	/**
	 * Disable table row move buttons for all propertyIds in given array
	 * @param propertyIds Array of propertyIds
	 *
	 */
	setDisableRowMoveButtons(propertyIds) {
		// Verify that input is an array of objects
		if (Array.isArray(propertyIds)) {
			this.propertiesStore.setDisableRowMoveButtons(propertyIds);
		}
	}

	/**
	* Returns array of propertyIds for which row move buttons will be disabled
	*	@return Array of propertyIds
	*/
	getDisableRowMoveButtons() {
		return this.propertiesStore.getDisableRowMoveButtons();
	}

	/**
	 * Check if row move buttons should be disabled for given propertyId
	 * @param propertyId  The unique property identifier
	 * @return boolean
	 */
	isDisableRowMoveButtons(propertyId) {
		const propertyIds = this.getDisableRowMoveButtons();
		return (
			Array.isArray(propertyIds)
				? propertyIds.some((el) => isEqual(el, propertyId))
				: false
		);
	}

	//
	// Table row selection listeners
	//

	/**
	 * Adds a row selection listener for a table or list.
	 *
	 * @param inPropertyId Property id for a table or list control
	 * @param listener A callback function that contains a parameter that is
	 *	an array of row selection indices. The callback is fired whenever
	 *	row selections change for the given (row-based) control.
	 */
	addRowSelectionListener(inPropertyId, listener) {
		const propertyId = this.convertPropertyId(inPropertyId);
		const controlName = propertyId.name;
		if (!this.selectionListeners[controlName]) {
			this.selectionListeners[controlName] = {};
		}
		if (Number.isInteger(propertyId.row)) {
			throw new Error("Listening for row selection changes on controls within table cells is not currently supported");

			// TODO: Add this back if we ever get a request for listening to row changes on embedded tables.

			/*
			const row = String(propertyId.row);
			if (!this.selectionListeners[propertyId.name][row]) {
				this.selectionListeners[propertyId.name][row] = {};
			}
			if (Number.isInteger(propertyId.col)) {
				const col = String(propertyId.col);
				if (!this.selectionListeners[propertyId.name][row][col]) {
					this.selectionListeners[propertyId.name][row][col] = {};
				}
				this.selectionListeners[controlName][row][col] = listener;
			} else {
				this.selectionListeners[controlName][row] = listener;
			}
			*/
		} else {
			this.selectionListeners[controlName].listener = listener;
		}
	}

	/**
	 * Removes the row selection listener from a control.
	 *
	 * @param inPropertyId Property id for a table or list control
	 */
	removeRowSelectionListener(inPropertyId) {
		const propertyId = this.convertPropertyId(inPropertyId);
		const controlName = propertyId.name;
		if (Number.isInteger(propertyId.row)) {
			throw new Error("Listening for row selection changes on controls within table cells is not currently supported");

			// TODO: Add this back if we ever get a request for listening to row changes on embedded tables.

			/*
			const row = propertyId.row;
			if (Number.isInteger(propertyId.col)) {
				const col = propertyId.col;
				if (this.selectionListeners[controlName][row][col]) {
					delete this.selectionListeners[controlName][row][col];
				}
			} else if (this.selectionListeners[controlName][row]) {
				delete this.selectionListeners[controlName][row];
			}
			*/
		} else if (this.selectionListeners[controlName]) {
			delete this.selectionListeners[controlName];
		}
	}

	_notifySelectionListener(inPropertyId, selections) {
		const propertyId = this.convertPropertyId(inPropertyId);
		const controlName = propertyId.name;
		if (this.selectionListeners[controlName]) {

			// TODO: Add this back if we ever get a request for listening to row changes on embedded tables.

			/*
			const row = propertyId.row;
			if (Number.isInteger(propertyId.row)) {
				const col = propertyId.col;
				if (Number.isInteger(propertyId.col)) {
					if (this.selectionListeners[controlName][row][col].listener) {
						this.selectionListeners[controlName][row][col].listener(selections);
					}
				} else if (this.selectionListeners[controlName][row].listener) {
					this.selectionListeners[controlName][row].listener(selections);
				}
			}
			*/
			this.selectionListeners[controlName].listener(selections);
		}
	}

	//
	// A set of APIs for Expression Builder
	//

	setExpressionInfo(expressionInfo) {
		this.expressionFunctionInfo = setExpressionInfo(expressionInfo);
	}

	getExpressionInfo() {
		return this.expressionFunctionInfo;
	}

	// recently used of all categories under functions tab
	getExpressionRecentlyUsed() {
		return this.expressionRecentlyUsed;
	}

	updateExpressionRecentlyUsed(functionInfo) {
		const index = this.expressionRecentlyUsed.indexOf(functionInfo);
		if (index === -1) {
			this.expressionRecentlyUsed.splice(0, 0, functionInfo);
		} else {
			// if already in the list, move it to the front
			this.expressionRecentlyUsed.splice(index, 1);
			this.expressionRecentlyUsed.unshift(functionInfo);
		}
	}

	// recently used of all categories under fields/values tab
	clearExpressionRecentlyUsed() {
		this.expressionRecentlyUsed = [];
	}

	getExpressionFieldsRecentlyUsed() {
		return this.expressionFieldsRecentlyUsed;
	}

	updateExpressionFieldsRecentlyUsed(fieldInfo) {
		const index = this.expressionFieldsRecentlyUsed.indexOf(fieldInfo);
		if (index === -1) {
			this.expressionFieldsRecentlyUsed.splice(0, 0, fieldInfo);
		} else {
			// if already in the list, move it to the front
			this.expressionFieldsRecentlyUsed.splice(index, 1);
			this.expressionFieldsRecentlyUsed.unshift(fieldInfo);
		}
	}

	clearExpressionFieldsRecentlyUsed() {
		this.expressionFieldsRecentlyUsed = [];
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
		if (Array.isArray(replacementItems)) {
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
	updatePropertyValue(inPropertyId, value, skipValidateInput, type) {
		const propertyId = this.convertPropertyId(inPropertyId);
		const initialValue = this.getPropertyValue(propertyId);
		if (typeof value === "undefined") {
			this.removePropertyValue(propertyId);
		} else {
			this.propertiesStore.updatePropertyValue(propertyId, value);
		}
		if (!conditionsUtil.allowConditions(inPropertyId, this)) {
			this.propertiesStore.updatePropertyValue(propertyId, initialValue);
			return;
		}
		conditionsUtil.validateConditions(inPropertyId, this);
		if (!skipValidateInput) {
			conditionsUtil.validateInput(inPropertyId, this, true);
		}

		if (this.handlers.propertyListener) {
			const convertedValue = this._convertObjectStructure(propertyId, value);
			const data = {
				action: ACTIONS.UPDATE_PROPERTY,
				property: propertyId,
				value: convertedValue,
				previousValue: initialValue
			};
			if (typeof type !== "undefined") {
				data.type = type;
			}
			this.handlers.propertyListener(data);
		}
	}

	/*
	* return the property value for the given 'inPropertyId'
	* options - optional object of config options where
	*   filterHiddenDisabled: true - filter out values from controls having state "hidden" or "disabled"
	*   applyProperties: true - this function is called from PropertiesMain.applyPropertiesEditing()
	*   filterHidden: true - filter out values from controls having state "hidden"
	*   filterDisabled: true - filter out values from controls having state "disabled"
	*   filterHiddenControls: true - filter out values from controls having type "hidden"
	*/
	getPropertyValue(inPropertyId, options, defaultValue) {
		const propertyId = this.convertPropertyId(inPropertyId);
		const propertyValue = this.propertiesStore.getPropertyValue(propertyId);
		let filteredValue = defaultValue;

		// don't return hidden/disabled values
		const filterHidden = options && (options.filterHiddenDisabled || options.filterHidden);
		const filterDisabled = options && (options.filterHiddenDisabled || options.filterDisabled);
		const filterHiddenControls = options && options.filterHiddenControls;
		if (filterHidden || filterDisabled || filterHiddenControls) {
			// top level value
			const controlState = this.getControlState(propertyId);
			const controlType = this.getControlType(propertyId);
			if (
				(controlState === STATES.DISABLED && filterDisabled) ||
				(controlState === STATES.HIDDEN && filterHidden) ||
				(controlType === ControlType.HIDDEN && filterHiddenControls)
			) {
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
							const valueType = this.getControlType(colPropertyId);
							if (
								(valueState === STATES.DISABLED && filterDisabled) ||
								(valueState === STATES.HIDDEN && filterHidden) ||
								(valueType === ControlType.HIDDEN && filterHiddenControls)
							) {
								filteredValue[rowIdx][colIdx] = null;
							}
						}
					}
				}
			}
			if (options && options.applyProperties === true) {
				return this._convertObjectStructure(propertyId, filteredValue);
			}
			return filteredValue;
		}

		if (options && options.applyProperties === true) {
			return this._convertObjectStructure(propertyId, propertyValue);
		}
		return propertyValue;
	}

	removePropertyValue(inPropertyId) {
		const propertyId = this.convertPropertyId(inPropertyId);
		this.propertiesStore.removePropertyValue(propertyId);
	}

	// convert currentParameters of structureType:object to object values
	_convertObjectStructure(propertyId, propertyValue) {
		const control = this.getControl(propertyId);
		if (PropertyUtils.isSubControlStructureObjectType(control)) {
			const convert = control.structureType && control.structureType === "object";
			const convertedValues = PropertyUtils.convertArrayStructureToObject(control.valueDef.isList, control.subControls, propertyValue, convert);
			return convertedValues;
		}
		return propertyValue;
	}

	/*
	* return the property values for all controls
	* options - optional object of config options where
	*   filterHiddenDisabled: true - filter out values from controls having state "hidden" or "disabled"
	*   applyProperties: true - this function is called from PropertiesMain.applyPropertiesEditing()
	*   filterHidden: true - filter out values from controls having state "hidden"
	*   filterDisabled: true - filter out values from controls having state "disabled"
	*   filterHiddenControls: true - filter out values from controls having type "hidden"
	*   getActiveTabControls: true - return all properties under selected tab/category
	*/
	getPropertyValues(options) {
		// All property values
		let propertyValues = this.propertiesStore.getPropertyValues();

		if (options && options.getActiveTabControls) {
			propertyValues = this.getActiveTabPropertyValues();
		}
		let returnValues = propertyValues;
		if (options && (options.filterHiddenDisabled || options.filterHidden || options.filterDisabled || options.filterHiddenControls || options.valueFilters)) {
			const filteredValues = {};
			for (const propKey in propertyValues) {
				if (!has(propertyValues, propKey)) {
					continue;
				}
				const filteredValue = this.getPropertyValue({ name: propKey }, options);
				// only set parameters with values or filter out values specified in config
				const valueFilters = Array.isArray(options.valueFilters) ? options.valueFilters : [];
				if (typeof filteredValue !== "undefined" && !valueFilters.includes(filteredValue)) {
					filteredValues[propKey] = filteredValue;
				}
			}
			returnValues = filteredValues;
		}

		// convert currentParameters of structureType:object to object values
		if (options && options.applyProperties === true) {
			for (const controlId in returnValues) {
				if (!has(returnValues, controlId)) {
					continue;
				}

				const propertyId = this.convertPropertyId(controlId);
				const propertyValue = this.propertiesStore.getPropertyValue(propertyId);
				returnValues[controlId] = this._convertObjectStructure(propertyId, propertyValue);
			}
		}

		return returnValues;
	}

	setPropertyValues(values, isInitProps) {
		let inValues = cloneDeep(values);

		// convert currentParameters of type:object to array values
		if (values) {
			const controls = this.getControls();
			Object.keys(inValues).forEach((propertyName) => {
				if (PropertyUtils.isSubControlStructureObjectType(controls[propertyName])) {
					const currentValues = values[propertyName];
					const control = controls[propertyName];
					const convertedValues = PropertyUtils.convertObjectStructureToArray(control.valueDef.isList, control.subControls, currentValues);
					inValues[propertyName] = convertedValues;
				}
			});

			if (get(this.getPropertiesConfig(), "convertValueDataTypes")) {
				inValues = PropertyUtils.convertValueDataTypes(inValues, controls);
			}
		}

		this.propertiesStore.setPropertyValues(inValues);

		if (isInitProps) {
			// Evaluate conditional defaults based on current_parameters upon loading of view
			// For a given parameter_ref, if multiple conditions evaluate to true only the first one is used.
			const conditionalDefaultValues = {};
			if (!isEmpty(inValues)) {
				Object.keys(inValues).forEach((propertyName) => {
					const propertyId = { name: propertyName };
					// Update conditionalDefaultValues object using pass-by-reference
					conditionsUtil.setConditionalDefaultValue(propertyId, this, conditionalDefaultValues);
				});
				if (!isEmpty(conditionalDefaultValues)) {
					Object.keys(conditionalDefaultValues).forEach((parameterRef) => {
						if (!(parameterRef in inValues)) {
							// convert values of type:object to the internal format array values
							const control = this.getControl({ name: parameterRef });
							if (PropertyUtils.isSubControlStructureObjectType(control)) {
								conditionalDefaultValues[parameterRef] =
								PropertyUtils.convertObjectStructureToArray(control.valueDef.isList, control.subControls, conditionalDefaultValues[parameterRef]);
							}
							this.propertiesStore.updatePropertyValue({ name: parameterRef }, conditionalDefaultValues[parameterRef]);
						}
					});
				}
			}
		}

		// Validate other conditions after evaluating conditional defaults (default_value conditions)
		conditionsUtil.validatePropertiesConditions(this);
		if (this.handlers.propertyListener) {
			this.handlers.propertyListener(
				{
					action: ACTIONS.SET_PROPERTIES // Setting the properties in current_parameters
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
	* Updates the enabled/visible state of a control.
	*
	* @param inPropertyId Id of the property for the control to operate upon
	* @param state string ("disabled", "enabled", "hidden", "visible")
	*/
	updateControlState(inPropertyId, state) {
		const propertyId = this.convertPropertyId(inPropertyId);
		this.propertiesStore.updateControlState(propertyId, state);
	}
	getControlState(propertyId) {
		const state = this.propertiesStore.getControlState(propertyId);
		return state ? state.value : "";
	}
	getControlStates() {
		return this.propertiesStore.getControlStates();
	}

	/**
	 * Retrieves the enumeration value states for the given propertyId.
	 *
	 * @param propertyId The of an enumeration property
	 * @return An object containing state settings for those enumeration values
	 * that have previously been set
	 */
	getControlValueStates(propertyId) {
		const state = this.propertiesStore.getControlState(propertyId);
		return state ? state.values : {};
	}

	/**
	 * Retrieves the enumeration value states for the given propertyId.
	 *
	 * @param propertyId The of an enumeration property
	 * @return An object containing state enumFilter
	 */
	getControlEnumFilterStates(propertyId) {
		const state = this.propertiesStore.getControlState(propertyId);
		return state ? state.enumFilter : {};
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
	clearActiveTearsheet() {
		this.propertiesStore.setActiveTearsheetId(null);
	}
	setActiveTearsheet(tearsheetId) {
		this.propertiesStore.setActiveTearsheetId(tearsheetId);
	}
	getActiveTearsheet() {
		return this.propertiesStore.getActiveTearsheetId() || null;
	}


	/**
	 * Action States Methods
	 * Sets the panel state. Supported states are:
	 * "disabled", "enabled", "hidden", "visible".
	 */
	setActionStates(states) {
		this.propertiesStore.setActionStates(states);
	}

	/**
	* @param actionId {name: action.id}
  * @param state string ("disabled", "enabled", "hidden", "visible")
	*/
	updateActionState(actionId, state) {
		this.propertiesStore.updateActionState(actionId, state);
	}

	/**
	* @param actionId {name: action.id}
	*/
	getActionState(actionId) {
		return this.propertiesStore.getActionState(actionId);
	}

	getActionStates() {
		return this.propertiesStore.getActionStates();
	}

	/**
	* @param actionId {name: action.id}
	*/
	getAction(actionId) {
		return this.actions[actionId.name];
	}

	/**
	* Error Messages Methods
	* @param messages object with keys being property name
	*/
	setErrorMessages(messages) {
		this.propertiesStore.setErrorMessages(messages);
	}

	/**
	* Returns a single error message for a propertyId.
	*
	* @param inPropertyId Target propertyId
	* @param filterHiddenDisable True to leave out hidden and disabled properties
	* @param filterSuccess If true, leave out success messages
	* @param filterDisplayError If true, leave out messages that are not displayed in the UI
	* @return error message object
	*/
	getErrorMessage(inPropertyId, filterHiddenDisable = false, filterSuccess = false, filterDisplayError = true) {
		const propertyId = this.convertPropertyId(inPropertyId);
		// don't return hidden message
		if (filterHiddenDisable) {
			const controlState = this.getControlState(propertyId);
			const controlType = this.getControlType(propertyId);
			if (controlState === STATES.DISABLED || controlState === STATES.HIDDEN || controlType === ControlType.HIDDEN) {
				return null;
			}
		}
		const message = this.propertiesStore.getErrorMessage(propertyId, this.reactIntl);
		if (filterSuccess) {
			if (message && message.type === CONDITION_MESSAGE_TYPE.SUCCESS) {
				return null;
			}
		}

		if (filterDisplayError) {
			if (message && !isUndefined(message.displayError) && !message.displayError) { // This is only set if false
				return null;
			}
		}
		return message;
	}

	/**
	*	Used to return all error messages.  Will either return internally stored messages
	* or formatted list to store in pipeline-flow
	* @param filteredPipeline boolean
	* @param filterHiddenDisable True to leave out hidden and disabled properties
	* @param filterSuccess If true, leave out success messages
	* @param filterDisplayError If true, leave out messages that are not displayed in the UI
	* @return object when filteredPipeline=false or array when filteredPipeline=true
	*/
	getErrorMessages(filteredPipeline, filterHiddenDisable, filterSuccess, filterDisplayError = true) {
		let messages = this.propertiesStore.getErrorMessages();

		if (filterDisplayError) {
			messages = this._filterDisplayErrors(messages);
		}
		if (filteredPipeline || filterHiddenDisable) {
			messages = this._filterMessages(messages, filteredPipeline, filterHiddenDisable, filterSuccess);
		}
		return messages;
	}

	getAllErrorMessages() {
		return this.getErrorMessages(false, false, false, false);
	}

	getRequiredErrorMessages() {
		const messages = this.propertiesStore.getErrorMessages();
		const requiredMessages = this._filterNonRequiredErrors(messages);
		const filtered = this._filterHiddenDisabledErrors(requiredMessages); // Exclude errors for controls that are hidden or disabled
		return filtered;
	}

	_filterMessages(messages, filteredPipeline, filterHiddenDisable, filterSuccess) {
		const filteredMessages = {};
		const pipelineMessages = [];
		for (const paramKey in messages) {
			if (!has(messages, paramKey)) {
				continue;
			}

			// This returns top-level message for tables
			const paramMessage = this.getErrorMessage({ name: paramKey }, filterHiddenDisable, filterSuccess);
			if (paramMessage && paramMessage.text) {
				if (filteredPipeline) {
					pipelineMessages.push({
						id_ref: paramKey,
						validation_id: paramMessage.validation_id,
						type: paramMessage.type,
						text: paramMessage.text
					});
				} else {
					filteredMessages[paramKey] = paramMessage;
				}
			}
		}
		if (filteredPipeline) {
			return pipelineMessages;
		}
		return filteredMessages;
	}

	// Remove error messages that will not be displayed in the UI
	_filterDisplayErrors(messages) {
		const filterCondition = (testMessage) => (isUndefined(testMessage.displayError) || testMessage.displayError);
		const filteredMessages = this._filterErrors(messages, filterCondition);
		return filteredMessages;
	}

	// Remove error messages that are not from a required parameters
	_filterNonRequiredErrors(messages) {
		const filterCondition = (testMessage) => testMessage.required === true;
		const filteredMessages = this._filterErrors(messages, filterCondition);
		return filteredMessages;
	}

	// Remove error messages that are disabled or hidden
	_filterHiddenDisabledErrors(messages) {
		const filterCondition = (testMessage, propertyId) => {
			const controlState = this.getControlState(propertyId);
			const controlType = this.getControlType(propertyId);
			return controlState !== STATES.HIDDEN && controlState !== STATES.DISABLED && controlType !== ControlType.HIDDEN;
		};
		const filteredMessages = this._filterErrors(messages, filterCondition);
		return filteredMessages;
	}


	// Remove error messages that do not satisfy the given condition
	_filterErrors(messages, condition) {
		const filteredMessages = {};
		const parameterNames = Object.keys(messages);
		parameterNames.forEach((paramKey) => {
			const parameterError = messages[paramKey];
			if (parameterError.text && condition(parameterError, parameterError.propertyId)) { // not table
				filteredMessages[paramKey] = parameterError;
			} else { // table cell
				for (const rowKey in parameterError) {
					if (!has(parameterError, rowKey)) {
						continue;
					}
					const rowMessage = parameterError[rowKey];
					if (rowMessage && rowMessage.text && condition(rowMessage, rowMessage.propertyId)) {
						if (typeof filteredMessages[paramKey] === "undefined") {
							filteredMessages[paramKey] = {};
						}
						filteredMessages[paramKey][rowKey] = rowMessage;
					} else {
						for (const colKey in rowMessage) {
							if (!has(rowMessage, colKey)) {
								continue;
							}
							const colMessage = rowMessage[colKey];
							if (colMessage && colMessage.text && condition(colMessage, colMessage.propertyId)) {
								if (typeof filteredMessages[paramKey] === "undefined") {
									filteredMessages[paramKey] = {};
								}
								if (typeof filteredMessages[paramKey][rowKey] === "undefined") {
									filteredMessages[paramKey][rowKey] = {};
								}
								filteredMessages[paramKey][rowKey][colKey] = colMessage;
							}
						}
					}
				}
			}
		});
		return filteredMessages;
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
				// only add to map if control hasn't already been added or override if set to custom.
				// This is needed if a parameter is referenced from multiple groups and one is a custom panel
				if (!has(this.controls, control.name) || (has(this.controls, control.name) && control.controlType !== ControlType.CUSTOM)) {
					this.controls[control.name] = control;
				}
			} else {
				this.controls[control.parameterName][control.columnIndex] = control;
			}
		});
	}

	getControl(propertyId) {
		const control = this.controls[propertyId.name];
		// if no subcontrol return parent control
		if (typeof propertyId.col !== "undefined" && control) {
			const subControl = this.controls[propertyId.name][propertyId.col.toString()];
			if (subControl) {
				return subControl;
			}
		}
		return control;
	}

	getControlPropType(propertyId) {
		const control = this.getControl(propertyId);
		if (typeof control.valueDef !== "undefined") {
			return control.valueDef.propType;
		}
		return null;
	}

	updateControlEnumValues(propertyId, valuesObj) {
		const control = this.getControl(propertyId);
		if (!Array.isArray(valuesObj) || !control) {
			logger.warn("properties-controller", new Error("updateControlEnumValues - control not found or valuesObj not valid"));
			return;
		}
		control.values = valuesObj.map((valueObj) => valueObj.value);
		control.valueLabels = valuesObj.map((valueObj) => {
			if (!valueObj.label) {
				return valueObj.value;
			}
			return valueObj.label;
		});
	}

	getControls() {
		return this.controls;
	}

	setSaveButtonDisable(saveDisable) {
		this.propertiesStore.setSaveButtonDisable(saveDisable);
	}

	getSaveButtonDisable() {
		return this.propertiesStore.getSaveButtonDisable();
	}

	/**
	* Enable/disable OK button for given summary panel
	* @param panelId {name: panel.id}
	* @param wideFlyoutPrimaryButtonDisable boolean
	*/
	setWideFlyoutPrimaryButtonDisabled(panelId, wideFlyoutPrimaryButtonDisable) {
		this.propertiesStore.setWideFlyoutPrimaryButtonDisabled(panelId, wideFlyoutPrimaryButtonDisable);
	}

	/**
	* @param panelId {name: panel.id}
	*/
	getWideFlyoutPrimaryButtonDisabled(panelId) {
		return this.propertiesStore.getWideFlyoutPrimaryButtonDisabled(panelId);
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
		if (typeof propertyId === "undefined") {
			return null;
		}
		const control = this.getControl(propertyId);
		if (control) {
			return control.controlType;
		}
		return null;
	}

	// check if given column is visible in the table
	getColumnVisibility(propertyId, columnIndex) {
		return this.controls[propertyId.name][columnIndex].visible;
	}

	toggleColumnVisibility(propertyId, columnIndex, value) {
		this.controls[propertyId.name][columnIndex].visible = value;
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
		const containerType = get(this.getPropertiesConfig(), "containerType");
		const control = this.controlFactory.createFormControl(paramDef, parameter, this.getLight(), containerType);
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

	/*
	* maxLength for single-line and multi-line control methods
	*/

	/**
	* Returns the maximum characters allowed for multi-line string controls like textarea
	* Default value is 1024
	*/
	getMaxLengthForMultiLineControls() {
		const maxLengthForMultiLineControls = (typeof this.getPropertiesConfig().maxLengthForMultiLineControls !== "undefined")
			? this.getPropertiesConfig().maxLengthForMultiLineControls
			: 1024;
		return maxLengthForMultiLineControls;
	}

	/**
	* Returns the maximum characters allowed for single-line string controls like textfield
	* Default value is 128
	*/
	getMaxLengthForSingleLineControls() {
		const maxLengthForSingleLineControls = (typeof this.getPropertiesConfig().maxLengthForSingleLineControls !== "undefined")
			? this.getPropertiesConfig().maxLengthForSingleLineControls
			: 128;
		return maxLengthForSingleLineControls;
	}

	/**
	* Set the initial values of addRemoveRows for all structure controls
	*/
	setInitialAddRemoveRows() {
		const parameterNames = Object.keys(this.controls);
		parameterNames.forEach((parameterName) => {
			const control = this.controls[parameterName];
			if (control.valueDef && control.valueDef.propType === Type.STRUCTURE && !isUndefined(control.addRemoveRows)) {
				const propertyId = { name: control.name };
				this.setAddRemoveRows(propertyId, control.addRemoveRows);
			}
		});

	}

	/**
	* Set the addRemoveRows attribute to 'enabled' for the given propertyId
	* @param propertyId The unique property identifier
	* @param enabled boolean value to enable or disable addRemoveRows
	*/
	setAddRemoveRows(propertyId, enabled) {
		this.propertiesStore.setAddRemoveRows(propertyId, enabled);
	}

	/**
	* Returns the true if addRemoveRows is enabled for the given propertyID
	* @param propertyId The unique property identifier
	* @return boolean
	*/
	getAddRemoveRows(propertyId) {
		return this.propertiesStore.getAddRemoveRows(propertyId);
	}

	/**
	* Set the hideEditButton attribute to 'enabled' for the given propertyId
	* @param propertyId The unique property identifier
	* @param enabled boolean value to enable or disable hideditButton
	*/
	setHideEditButton(propertyId, enabled) {
		this.propertiesStore.setHideEditButton(propertyId, enabled);
	}

	/**
	* Returns the true if hideEditButton is enabled for the given propertyID
	* @param propertyId The unique property identifier
	* @return boolean
	*/
	getHideEditButton(propertyId) {
		return this.propertiesStore.getHideEditButton(propertyId);
	}

	/**
	 * Freeze row move buttons for row indexes in given array
	 * @param propertyId The unique property identifier
	 * @param rowIndexes Array of row indexes
	 */

	getStaticRows(inPropertyId) {
		const propertyId = this.convertPropertyId(inPropertyId);
		return this.propertiesStore.getStaticRows(propertyId);
	}

	updateStaticRows(inPropertyId, staticRowsArr) {
		const propertyId = this.convertPropertyId(inPropertyId);
		const controlValue = this.getPropertyValue(inPropertyId);
		const staticRows = staticRowsArr.sort();
		const isValidSlection = this.validateSelectionValues(staticRows, controlValue);
		if (isValidSlection) {
			this.propertiesStore.updateStaticRows(propertyId, staticRows);
		}
	}

	clearStaticRows(inPropertyId) {
		const propertyId = this.convertPropertyId(inPropertyId);
		this.propertiesStore.clearStaticRows(propertyId);
	}

	/**
	* Set the initial values of table buttons for all table controls
	*/
	setInitialTableButtonState() {
		const parameterNames = Object.keys(this.controls);
		parameterNames.forEach((parameterName) => {
			const control = this.controls[parameterName];
			const propertyId = { name: control.name };
			if (!isUndefined(control.buttons)) {
				control.buttons.forEach((button) => {
					this.setTableButtonEnabled(propertyId, button.id, button.enabled || false);
				});
			}
			if (control.subControls) {
				this.setInitialTableButtonSubControlState(propertyId, control.subControls);
			}
		});
	}

	// This only handles 1 level of nesting, will need to make this recusrive if there is a need for deeper nesting
	setInitialTableButtonSubControlState(parentPropertyId, subControls) {
		subControls.forEach((control) => {
			const propertyValues = this.getPropertyValue(parentPropertyId);

			if (!isUndefined(control.buttons)) {
				propertyValues.forEach((value, valueIdx) => {
					const propertyId = { name: parentPropertyId.name, row: valueIdx, col: control.columnIndex };
					control.buttons.forEach((button) => {
						this.setTableButtonEnabled(propertyId, button.id, button.enabled || false);
					});
				});
			}
		});
	}

	/**
	* Set the table button to 'enabled' for the given propertyId
	* @param propertyId The unique property identifier
	* @param buttonId The unique button identifier
	* @param enabled boolean value to enable or disable the button
	*/
	setTableButtonEnabled(propertyId, buttonId, enabled) {
		this.propertiesStore.setTableButtonEnabled(propertyId, buttonId, enabled);
	}

	/**
	* Returns the table button states for the given propertyID
	* @param propertyId The unique property identifier
	* @return boolean
	*/
	getTableButtons(propertyId) {
		return this.propertiesStore.getTableButtons(propertyId);
	}

	/**
	* Returns the true if the table button is enabled for the given propertyID
	* @param propertyId The unique property identifier
	* @param buttonId The unique button identifier
	* @return boolean
	*/
	getTableButtonEnabled(propertyId, buttonId) {
		return this.propertiesStore.getTableButtonEnabled(propertyId, buttonId);
	}

	/**
	 * Validate if the array for freeze rows is correct. Should only have continuous value of row indexes
	 * Must not contain first and last row index together in the array ever. you can only freeze either first n row or the last n row
	 * @param staticRows Array of rows you want to freeze
	 * @param controlValue the property values for the property Id
	 * @returns
	 */
	validateSelectionValues(staticRows, controlValue) {
		let isValid = false;
		if (staticRows && controlValue.length > 0) {
			const consecutiveAry = staticRows.slice(1).map(function(n, i) {
				return n - staticRows[i];
			});
			const isDifference = consecutiveAry.every((value) => value === 1);
			if (isDifference && ((staticRows.includes(0) && !staticRows.includes(controlValue.length - 1)) ||
			(!staticRows.includes(0) && staticRows.includes(controlValue.length - 1)))) {
				isValid = true;
			} else {
				isValid = false;
			}
		} else {
			isValid = false;
		}
		return isValid;
	}
}
