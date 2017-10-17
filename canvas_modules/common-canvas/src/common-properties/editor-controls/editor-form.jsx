/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* eslint complexity: ["error", 28] */
/* eslint max-depth: ["error", 9] */

import logger from "../../../utils/logger";
import React from "react";
import PropTypes from "prop-types";
import { ButtonToolbar } from "react-bootstrap";
import { Tabs } from "ap-components-react/dist/ap-components-react";
import { EDITOR_CONTROL, TOOL_TIP_DELAY } from "../constants/constants.js";
import ReactTooltip from "react-tooltip";

import ControlItem from "./control-item.jsx";
import TextfieldControl from "./textfield-control.jsx";
import ToggletextControl from "./toggletext-control.jsx";
import TextareaControl from "./textarea-control.jsx";
import ExpressionControl from "./expression-control.jsx";
import PasswordControl from "./password-control.jsx";
import NumberfieldControl from "./numberfield-control.jsx";
import CheckboxControl from "./checkbox-control.jsx";
import CheckboxsetControl from "./checkboxset-control.jsx";
import RadiosetControl from "./radioset-control.jsx";
import OneofselectControl from "./oneofselect-control.jsx";
import SomeofselectControl from "./someofselect-control.jsx";
import OneofcolumnsControl from "./oneofcolumns-control.jsx";
import SomeofcolumnsControl from "./someofcolumns-control.jsx";
import ColumnAllocatorControl from "./column-allocator-control.jsx";
import FieldAllocatorControl from "./field-allocator-control.jsx";
import ColumnSelectControl from "./column-select-control.jsx";
import ColumnStructureAllocatorControl from "./column-structure-allocator-control.jsx";
import ColumnStructureTableControl from "./column-structure-table-control.jsx";
import StructureeditorControl from "./structureeditor-control.jsx";
import StructurelisteditorControl from "./structure-list-editor-control.jsx";
import FieldPicker from "./field-picker.jsx";
import ColumnAllocationPanel from "./../editor-panels/column-allocation-panel.jsx";
import SelectorPanel from "./../editor-panels/selector-panel.jsx";
import SubPanelButton from "./../editor-panels/sub-panel-button.jsx";
import UiConditions from "../ui-conditions/ui-conditions.js";
import UiConditionsParser from "../ui-conditions/ui-conditions-parser.js";
import CheckboxSelectionPanel from "../editor-panels/checkbox-selection-panel.jsx";
import PropertyUtils from "../util/property-utils.js";


export default class EditorForm extends React.Component {

	static tabId(component, id, hash) {
		if (hash) {
			return "#tab-" + component + "-" + id;
		}
		return "tab-" + component + "-" + id;
	}

	constructor(props) {
		super(props);
		this.state = {
			formData: this.props.form,
			valuesTable: this.props.form.data.currentParameters,
			controlErrorMessages: {},
			visibleDefinition: {},
			enabledDefinitions: {},
			validationDefinitions: {},
			requiredParameters: [],
			controlStates: {},
			selectedRows: {},
			showFieldPicker: false,
			fieldPickerControl: {},
			activeTabId: ""
		};

		this.sharedCtrlInfo = [];

		this.getControlValue = this.getControlValue.bind(this);
		this.updateControlValue = this.updateControlValue.bind(this);
		this.updateControlValues = this.updateControlValues.bind(this);
		this.updateSelectedRows = this.updateSelectedRows.bind(this);

		this.handleSubmit = this.handleSubmit.bind(this);
		this.validateConditions = this.validateConditions.bind(this);
		this.parseUiConditions = this.parseUiConditions.bind(this);
		this.parseRequiredParameters = this.parseRequiredParameters.bind(this);
		this.updateValidationErrorMessage = this.updateValidationErrorMessage.bind(this);
		this.retrieveValidationErrorMessage = this.retrieveValidationErrorMessage.bind(this);
		this.validateChildRefs = this.validateChildRefs.bind(this);

		this.getControlValues = this.getControlValues.bind(this);
		this.getSubControlValues = this.getSubControlValues.bind(this);
		this.getControl = this.getControl.bind(this);
		this.genPanel = this.genPanel.bind(this);
		this.genUIContent = this.genUIContent.bind(this);
		this.genUIItem = this.genUIItem.bind(this);

		this.closeFieldPicker = this.closeFieldPicker.bind(this);
		this.openFieldPicker = this.openFieldPicker.bind(this);
		this.getFilteredDataset = this.getFilteredDataset.bind(this);
		this.generateSharedControlNames = this.generateSharedControlNames.bind(this);
		this.getSelectedRows = this.getSelectedRows.bind(this);
		this.setControlState = this.setControlState.bind(this);
		this.updateTableConditions = this.updateTableConditions.bind(this);
	}

	componentWillMount() {
		if (this.props.form.conditions) {
			this.parseUiConditions(this.props.form.conditions);
		}
		this.parseRequiredParameters(this.props.form);
	}

	componentDidMount() {
		this.validateConditions();

		// One time table condition updates
		this.updateTableConditions();
	}

	getControl(propertyName) {
		return this.refs[propertyName];
	}

	/**
	 * Retrieves a filtered data model in which all fields that are already
	 * in use by other controls are already filtered out.
	 *
	 * @param skipControlName Name of control to skip when checking field controls
	 * @return Filtered dataset metadata with fields in use removed
	 */
	getFilteredDataset(skipControlName) {
		const data = this.state.formData.data.datasetMetadata;
		if (!this.sharedCtrlInfo) {
			return data;
		}

		let filteredDataset = { fields: [] };
		try {

			filteredDataset = JSON.parse(JSON.stringify(data)); // deep copy
			let sharedCtrlNames = [];
			let sharedDataModelPanel = false;
			for (let h = 0; h < this.sharedCtrlInfo.length; h++) {
				for (let k = 0; k < this.sharedCtrlInfo[h].controlNames.length; k++) {
					if (skipControlName === this.sharedCtrlInfo[h].controlNames[k].controlName) {
						sharedDataModelPanel = true;
						sharedCtrlNames = this.sharedCtrlInfo[h].controlNames;
						break;
					}
				}
			}

			if (sharedDataModelPanel) {
				const temp = [];
				for (let i = 0; i < sharedCtrlNames.length; i++) {
					const ctrlName = sharedCtrlNames[i].controlName;
					if (ctrlName !== skipControlName) {
						// only remove from the main list the values that are in other controls
						const values = this.state.valuesTable[ctrlName];
						for (let j = 0; j < values.length; j++) {
							temp.push(data.fields.filter(function(element) {
								if (Array.isArray(values)) {
									return values[j].split(",")[0].indexOf(element.name) > -1;
								}
								return values.split(",")[0].indexOf(element.name) > -1;
							})[0]);
							// logger.info("Temp is: " + JSON.stringify(temp));
						}
					}

					if (temp.length > 0) {
						for (let k = 0; k < temp.length; k++) {
							filteredDataset.fields = filteredDataset.fields.filter(function(element) {
								return element && temp[k] && element.name !== temp[k].name;
							});
							// logger.info("filteredData.fields is: " + JSON.stringify(filteredData.fields));
						}
					}
				}
			}
		} catch (error) {
			logger.warn("unable to parse json " + error);
		}
		return filteredDataset;
	}

	getControlValue(controlId) {
		return this.state.valuesTable[controlId];
	}

	getControlValues(removeDisabled) {
		var values = {};
		for (var ref in this.refs) {
			// Slightly hacky way of identifying non-control references with 3 underscores...
			if (!(ref.startsWith("___"))) {
				const stateValue = this.state.controlStates[ref];
				const skip = removeDisabled && stateValue === "disabled";
				if (!skip) {
					// logger.info(this.refs[ref]);
					// logger.info(this.refs[ref].getControlValue());
					values[ref] = this.refs[ref].getControlValue();
				}
			}
		}
		// TODO add in customPanels
		return values;
	}

	getSubControlValues() {
		return this.getSubControlValuesRecursive(this.refs, {});
	}

	getSubControlValuesRecursive(parentRefs, values) {
		const that = this;
		Object.keys(parentRefs).forEach(function(control) {
			if (typeof parentRefs[control] === "object" &&
				typeof parentRefs[control].getSubControlId === "function" &&
				typeof parentRefs[control].refs === "object") {
				that.getSubControlValuesRecursive(parentRefs[control].refs, values);
			} else if (typeof parentRefs[control].getControlID === "function") {
				const subControlId = parentRefs[control].getControlID().replace(EDITOR_CONTROL, "");
				values[subControlId] = parentRefs[control].getControlValue();
			}
		});
		return values;
	}

	getSelectedRows(controlName) {
		if (!this.state.selectedRows[controlName]) {
			this.state.selectedRows[controlName] = [];
		}
		return this.state.selectedRows[controlName];
	}

	/**
	 * Sets the control state. Supported states are:
	 * "disabled", "hidden", and undefined.
	 */
	setControlState(controlName, state) {
		const tempState = this.state.controlStates;
		tempState[controlName] = state;
		this.setState({ controlStates: tempState });
	}

	updateTableConditions() {
		// First, find the largest table dimensions
		let maxRow = 0;
		let maxCol = 0;
		const controlValues = this.getControlValues();
		for (const key in controlValues) {
			if (key) {
				const value = controlValues[key];
				if (PropertyUtils.toType(value) === "array" && value.length > 0 &&
						PropertyUtils.toType(value[0]) === "array") {
					maxRow = Math.max(maxRow, value.length);
					maxCol = Math.max(maxCol, value[0].length);
				}
			}
		}

		// Then run a condition updater for each cell address
		for (let i = 0; i < maxRow; i++) {
			for (let j = 0; j < maxCol; j++) {
				this.validateConditions(null, { rowIndex: i, colIndex: j });
			}
		}
	}

	updateControlValue(controlId, controlValue, cellCoords) {
		const that = this;
		var values = this.state.valuesTable;
		values[controlId] = controlValue;
		this.setState({ valuesTable: values },
			function() {
				const control = that.getControl(controlId);
				if (control && control.validateInput) {
					control.validateInput(cellCoords);
				} else if (typeof that.refs === "object") { // needed for subpanel validations
					that.validateChildRefs(that.refs, controlId);
				}
			});
	}

	validateChildRefs(parentRefs, controlId) {
		const that = this;
		Object.keys(parentRefs).forEach(function(control) {
			if (typeof parentRefs[control] === "object" &&
				typeof parentRefs[control].getSubControlId === "function" &&
				parentRefs[control].refs) {
				that.validateChildRefs(parentRefs[control].refs, controlId);
			} else if (typeof parentRefs[control].getControlID === "function") {
				const subControlId = parentRefs[control].getControlID().replace(EDITOR_CONTROL, "");
				if (subControlId === controlId) {
					parentRefs[control].validateInput();
					return;
				}
			}
		});
	}

	updateControlValues() {
		var values = this.state.valuesTable;
		for (var ref in this.refs) {
			// Slightly hacky way of identifying non-control references with
			// 3 underscores...
			if (!(ref.startsWith("___"))) {
				values[ref] = this.refs[ref].getControlValue();
			}
		}
		this.setState({ valuesTable: values });
	}

	updateSelectedRows(controlName, selection) {
		const selectedRows = this.state.selectedRows;
		selectedRows[controlName] = selection;
		this.setState({ selectedRows: selectedRows });
	}

	genControl(control, idPrefix, controlValueAccessor, datasetMetadata) {
		const controlId = idPrefix + control.name;
		// List of available controls is defined in models/editor/Control.scala
		if (control.controlType === "textfield") {
			return (<TextfieldControl control={control}
				dataModel={datasetMetadata}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				requiredParameters={this.state.requiredParameters}
				updateControlValue={this.updateControlValue}
				controlStates={this.state.controlStates}
				validateConditions={this.validateConditions}
				getControlValues={this.getControlValues}
				getSubControlValues={this.getSubControlValues}
				updateValidationErrorMessage={this.updateValidationErrorMessage}
				retrieveValidationErrorMessage={this.retrieveValidationErrorMessage}
			/>);
		} else if (control.controlType === "textarea") {
			return (<TextareaControl control={control}
				dataModel={datasetMetadata}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				requiredParameters={this.state.requiredParameters}
				updateControlValue={this.updateControlValue}
				controlStates={this.state.controlStates}
				validateConditions={this.validateConditions}
				getControlValues={this.getControlValues}
				getSubControlValues={this.getSubControlValues}
				updateValidationErrorMessage={this.updateValidationErrorMessage}
				retrieveValidationErrorMessage={this.retrieveValidationErrorMessage}
			/>);
		} else if (control.controlType === "expression") {
			return (<ExpressionControl control={control}
				dataModel={datasetMetadata}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				requiredParameters={this.state.requiredParameters}
				updateControlValue={this.updateControlValue}
				controlStates={this.state.controlStates}
				validateConditions={this.validateConditions}
				getControlValues={this.getControlValues}
				getSubControlValues={this.getSubControlValues}
				updateValidationErrorMessage={this.updateValidationErrorMessage}
				retrieveValidationErrorMessage={this.retrieveValidationErrorMessage}
			/>);
		} else if (control.controlType === "toggletext") {
			return (<ToggletextControl control={control}
				updateControlValue={this.updateControlValue}
				valueAccessor={controlValueAccessor}
				updateControlValue={this.updateControlValue}
				controlStates={this.state.controlStates}
				controlValue={[]}
				values={control.values}
				valueLabels={control.valueLabels}
				valueIcons={control.valueIcons}
				getSubControlValues={this.getSubControlValues}
			/>);
		} else if (control.controlType === "passwordfield") {
			return (<PasswordControl control={control}
				key={controlId}
				ref={controlId}
				updateControlValue={this.updateControlValue}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				requiredParameters={this.state.requiredParameters}
				controlStates={this.state.controlStates}
				validateConditions={this.validateConditions}
				getControlValues={this.getControlValues}
				getSubControlValues={this.getSubControlValues}
				updateValidationErrorMessage={this.updateValidationErrorMessage}
				retrieveValidationErrorMessage={this.retrieveValidationErrorMessage}
			/>);
		} else if (control.controlType === "numberfield") {
			return (<NumberfieldControl control={control}
				dataModel={datasetMetadata}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				updateControlValue={this.updateControlValue}
				validationDefinitions={this.state.validationDefinitions}
				requiredParameters={this.state.requiredParameters}
				controlStates={this.state.controlStates}
				validateConditions={this.validateConditions}
				getControlValues={this.getControlValues}
				getSubControlValues={this.getSubControlValues}
				updateValidationErrorMessage={this.updateValidationErrorMessage}
				retrieveValidationErrorMessage={this.retrieveValidationErrorMessage}
			/>);
		} else if (control.controlType === "checkbox") {
			return (<CheckboxControl control={control}
				key={controlId}
				ref={controlId}
				updateControlValue={this.updateControlValue}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				requiredParameters={this.state.requiredParameters}
				controlStates={this.state.controlStates}
				validateConditions={this.validateConditions}
				getControlValues={this.getControlValues}
				getSubControlValues={this.getSubControlValues}
				updateValidationErrorMessage={this.updateValidationErrorMessage}
				retrieveValidationErrorMessage={this.retrieveValidationErrorMessage}
			/>);
		} else if (control.controlType === "checkboxset") {
			return (<CheckboxsetControl control={control}
				key={controlId}
				ref={controlId}
				updateControlValue={this.updateControlValue}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				requiredParameters={this.state.requiredParameters}
				controlStates={this.state.controlStates}
				validateConditions={this.validateConditions}
				getControlValues={this.getControlValues}
				getSubControlValues={this.getSubControlValues}
				updateValidationErrorMessage={this.updateValidationErrorMessage}
				retrieveValidationErrorMessage={this.retrieveValidationErrorMessage}
			/>);
		} else if (control.controlType === "radioset") {
			return (<RadiosetControl control={control}
				key={controlId}
				ref={controlId}
				updateControlValue={this.updateControlValue}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				requiredParameters={this.state.requiredParameters}
				controlStates={this.state.controlStates}
				validateConditions={this.validateConditions}
				getControlValues={this.getControlValues}
				getSubControlValues={this.getSubControlValues}
				updateValidationErrorMessage={this.updateValidationErrorMessage}
				retrieveValidationErrorMessage={this.retrieveValidationErrorMessage}
			/>);
		} else if (control.controlType === "oneofselect") {
			return (<OneofselectControl control={control}
				dataModel={datasetMetadata}
				key={controlId}
				ref={controlId}
				updateControlValue={this.updateControlValue}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				requiredParameters={this.state.requiredParameters}
				controlStates={this.state.controlStates}
				validateConditions={this.validateConditions}
				getControlValues={this.getControlValues}
				getSubControlValues={this.getSubControlValues}
				updateValidationErrorMessage={this.updateValidationErrorMessage}
				retrieveValidationErrorMessage={this.retrieveValidationErrorMessage}
			/>);
		} else if (control.controlType === "someofselect") {
			return (<SomeofselectControl control={control}
				dataModel={datasetMetadata}
				key={controlId}
				ref={controlId}
				updateControlValue={this.updateControlValue}
				controlStates={this.state.controlStates}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				requiredParameters={this.state.requiredParameters}
				validateConditions={this.validateConditions}
				getControlValues={this.getControlValues}
				getSubControlValues={this.getSubControlValues}
				updateValidationErrorMessage={this.updateValidationErrorMessage}
				retrieveValidationErrorMessage={this.retrieveValidationErrorMessage}
			/>);
		} else if (control.controlType === "oneofcolumns") {
			return (<OneofcolumnsControl control={control}
				dataModel={datasetMetadata}
				key={controlId}
				ref={controlId}
				updateControlValue={this.updateControlValue}
				controlStates={this.state.controlStates}
				valueAccessor={controlValueAccessor}
				validateConditions={this.validateConditions}
				getControlValues={this.getControlValues}
				getSubControlValues={this.getSubControlValues}
				updateValidationErrorMessage={this.updateValidationErrorMessage}
				retrieveValidationErrorMessage={this.retrieveValidationErrorMessage}
			/>);
		} else if (control.controlType === "someofcolumns") {
			return (<SomeofcolumnsControl control={control}
				dataModel={datasetMetadata}
				key={controlId}
				ref={controlId}
				updateControlValue={this.updateControlValue}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				requiredParameters={this.state.requiredParameters}
				controlStates={this.state.controlStates}
				validateConditions={this.validateConditions}
				getControlValues={this.getControlValues}
				getSubControlValues={this.getSubControlValues}
				updateValidationErrorMessage={this.updateValidationErrorMessage}
				retrieveValidationErrorMessage={this.retrieveValidationErrorMessage}
			/>);
		} else if (control.controlType === "allocatedcolumn") {
			// logger.info("allocatedcolumn");
			return (<ColumnAllocatorControl control={control}
				dataModel={datasetMetadata}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				requiredParameters={this.state.requiredParameters}
				updateControlValue={this.updateControlValue}
				controlStates={this.state.controlStates}
				validateConditions={this.validateConditions}
				getControlValues={this.getControlValues}
				getSubControlValues={this.getSubControlValues}
				updateValidationErrorMessage={this.updateValidationErrorMessage}
				retrieveValidationErrorMessage={this.retrieveValidationErrorMessage}
			/>);
		} else if (control.controlType === "allocatedcolumns") {
			// logger.info("allocatedcolumns");
			return (<ColumnAllocatorControl control={control}
				dataModel={datasetMetadata}
				multiColumn
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				requiredParameters={this.state.requiredParameters}
				controlStates={this.state.controlStates}
				updateControlValue={this.updateControlValue}
				selectedRows={this.getSelectedRows(control.name)}
				validateConditions={this.validateConditions}
				getControlValues={this.getControlValues}
				getSubControlValues={this.getSubControlValues}
				updateValidationErrorMessage={this.updateValidationErrorMessage}
				retrieveValidationErrorMessage={this.retrieveValidationErrorMessage}
			/>);
		} else if (control.controlType === "selectcolumn") {
			// logger.info("selectcolumn");
			return (<FieldAllocatorControl control={control}
				dataModel={datasetMetadata}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				requiredParameters={this.state.requiredParameters}
				updateControlValue={this.updateControlValue}
				availableFieldsAccessor={this.getFilteredDataset}
				controlStates={this.state.controlStates}
				validateConditions={this.validateConditions}
				getControlValues={this.getControlValues}
				getSubControlValues={this.getSubControlValues}
				updateValidationErrorMessage={this.updateValidationErrorMessage}
				retrieveValidationErrorMessage={this.retrieveValidationErrorMessage}
			/>);
		} else if (control.controlType === "selectcolumns") {
			return (<ColumnSelectControl control={control}
				dataModel={datasetMetadata}
				multiColumn
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				requiredParameters={this.state.requiredParameters}
				controlStates={this.state.controlStates}
				openFieldPicker={this.openFieldPicker}
				updateControlValue={this.updateControlValue}
				updateSelectedRows={this.updateSelectedRows}
				selectedRows={this.getSelectedRows(control.name)}
				validateConditions={this.validateConditions}
				getControlValues={this.getControlValues}
				getSubControlValues={this.getSubControlValues}
				updateValidationErrorMessage={this.updateValidationErrorMessage}
				retrieveValidationErrorMessage={this.retrieveValidationErrorMessage}
			/>);
		} else if (control.controlType === "allocatedstructures") {
			// logger.info("allocatedstructures");
			return (<ColumnStructureAllocatorControl control={control}
				dataModel={datasetMetadata}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				updateControlValue={this.updateControlValue}
				validationDefinitions={this.state.validationDefinitions}
				requiredParameters={this.state.requiredParameters}
				controlStates={this.state.controlStates}
				updateSelectedRows={this.updateSelectedRows}
				selectedRows={this.getSelectedRows(control.name)}
				buildUIItem={this.genUIItem}
				validateConditions={this.validateConditions}
				getControlValues={this.getControlValues}
				getSubControlValues={this.getSubControlValues}
				updateValidationErrorMessage={this.updateValidationErrorMessage}
				retrieveValidationErrorMessage={this.retrieveValidationErrorMessage}
			/>);
		} else if (control.controlType === "structuretable") {
			return (<ColumnStructureTableControl control={control}
				dataModel={datasetMetadata}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				updateControlValue={this.updateControlValue}
				updateSelectedRows={this.updateSelectedRows}
				validationDefinitions={this.state.validationDefinitions}
				requiredParameters={this.state.requiredParameters}
				controlStates={this.state.controlStates}
				selectedRows={this.getSelectedRows(control.name)}
				buildUIItem={this.genUIItem}
				openFieldPicker={this.openFieldPicker}
				validateConditions={this.validateConditions}
				getControlValues={this.getControlValues}
				getSubControlValues={this.getSubControlValues}
				updateValidationErrorMessage={this.updateValidationErrorMessage}
				retrieveValidationErrorMessage={this.retrieveValidationErrorMessage}
			/>);
		} else if (control.controlType === "structureeditor") {
			// logger.info("structureeditor");
			return (<StructureeditorControl control={control}
				dataModel={datasetMetadata}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				updateControlValue={this.updateControlValue}
				controlStates={this.state.controlStates}
				updateSelectedRows={this.updateSelectedRows}
				selectedRows={this.getSelectedRows(control.name)}
				buildUIItem={this.genUIItem}
			/>);
		} else if (control.controlType === "structurelisteditor") {
			// logger.info("structurelisteditor");
			return (<StructurelisteditorControl control={control}
				dataModel={datasetMetadata}
				key={controlId} ref={controlId}
				valueAccessor={controlValueAccessor}
				updateControlValue={this.updateControlValue}
				updateSelectedRows={this.updateSelectedRows}
				selectedRows={this.getSelectedRows(control.name)}
				buildUIItem={this.genUIItem}
				validationDefinitions={this.state.validationDefinitions}
				requiredParameters={this.state.requiredParameters}
				controlStates={this.state.controlStates}
				validateConditions={this.validateConditions}
				getControlValues={this.getControlValues}
				getSubControlValues={this.getSubControlValues}
				updateValidationErrorMessage={this.updateValidationErrorMessage}
				retrieveValidationErrorMessage={this.retrieveValidationErrorMessage}
			/>);
		}
		return <h6 key={controlId}>{controlId}</h6>;
	}

	genControlItem(key, control, idPrefix, controlValueAccessor, datasetMetadata) {
		const stateStyle = {};
		let tooltipShow = true;
		if (this.state.controlStates[control.name] === "hidden") {
			stateStyle.visibility = "hidden";
			tooltipShow = false;
		} else if (this.state.controlStates[control.name] === "disabled") {
			stateStyle.color = "#D8D8D8";
			tooltipShow = false;
		}

		const that = this;
		function generateNumber() {
			const generator = control.label.numberGenerator;
			const min = generator.range && generator.range.min ? generator.range.min : 10000;
			const max = generator.range && generator.range.max ? generator.range.max : 99999;
			const newValue = Math.floor(Math.random() * (max - min + 1) + min);
			that.state.valuesTable[control.name] = newValue;
			that.refs[control.name].setState({ controlValue: newValue }, function() {
				if (typeof that.refs[control.name].validateInput === "function") {
					that.refs[control.name].validateInput();
				}
			});
		}

		let label = <span />;
		if (control.label && control.separateLabel) {
			let description;
			let tooltip;
			if (control.description) {
				if (control.description.placement === "on_panel") {
					description = <div className="control-description">{control.description.text}</div>;
				// only show tooltip when control enabled and visible
				} else if (tooltipShow) {
					tooltip = control.description.text; // default to tooltip
				}
			}
			let requiredIndicator;
			if (control.required) {
				requiredIndicator = <span className="required-control-indicator" style={stateStyle}>*</span>;
			}
			let numberGenerator;
			if (control.label.numberGenerator) {
				numberGenerator = (<label>{"\u00A0\u00A0"}<a className="number-generator" onClick={generateNumber} style={stateStyle}>
					{control.label.numberGenerator.label.default}
				</a></label>);
			}
			let hasFilter = false;
			if (control.subControls) {
				for (const subControl of control.subControls) {
					if (subControl.filterable) {
						hasFilter = true;
						break;
					}
				}
			}
			// structuretable labels w/o descriptions and filtering are created elsewhere
			const isStructureTable = control.controlType === "structuretable";
			if (!isStructureTable || description || hasFilter) {
				let className = "default-label-container";
				if (control.controlType === "selectcolumns" || control.controlType === "structuretable") {
					className = "label-container";
				}
				const tooltipId = "tooltip-label-" + control.name;
				label = (<div className={className}>
					<div className="properties-tooltips-container" data-tip={tooltip} data-for={tooltipId}>
						<label className="control-label" style={stateStyle} >{control.label.text}</label>
						{requiredIndicator}
						{numberGenerator}
						{description}
					</div>
					<ReactTooltip
						id={tooltipId}
						place="right"
						type="light"
						effect="solid"
						border
						className="properties-tooltips"
						delayShow={TOOL_TIP_DELAY}
					/>
				</div>);
			}
		}
		var controlObj = this.genControl(control, idPrefix, controlValueAccessor, datasetMetadata);
		var controlItem = <ControlItem key={key} label={label} control={controlObj} />;
		return controlItem;
	}

	genPrimaryTabs(key, tabs, idPrefix, controlValueAccessor, datasetMetadata) {
		const tabContent = [];
		let initialTab = "";
		for (var i = 0; i < tabs.length; i++) {
			const tab = tabs[i];
			const panelItems = this.genUIItem(i, tab.content, idPrefix, controlValueAccessor, datasetMetadata);
			let additionalComponent = null;
			if (this.props.additionalComponents) {
				additionalComponent = this.props.additionalComponents[tab.group];
				// logger.info("TabGroup=" + tab.group);
				// logger.info(additionalComponent);
			}
			if (i === 0) {
				initialTab = "primary-tab." + tab.group;
			}

			tabContent.push(
				<Tabs.Panel
					id={"primary-tab." + tab.group}
					key={i}
					title={tab.text}
				>
					{panelItems}
					{additionalComponent}
				</Tabs.Panel>
			);
		}

		const that = this;
		return (
			<Tabs key={key}
				defaultActiveKey={0}
				animation={false}
				isTabActive={function active(id) {
					if (that.state.activeTabId === "") {
						return id === initialTab;
					}
					return id === that.state.activeTabId;
				}}
				onTabClickHandler={(e, id) => this.setState({ activeTabId: id })}
			>
				{tabContent}
			</Tabs>
		);
	}

	genSubTabs(key, tabs, idPrefix, controlValueAccessor, datasetMetadata) {
		// logger.info("genSubTabs");
		const subTabs = [];
		for (let i = 0; i < tabs.length; i++) {
			const tab = tabs[i];
			subTabs.push(
				<Tabs.Panel key={i} id={"sub-tab." + tab.group} title={tab.text}>{this.genUIItem(i, tab.content, idPrefix, controlValueAccessor, datasetMetadata)}</Tabs.Panel>
			);
		}

		return (
			<Tabs vertical animation={false}>
				{subTabs}
			</Tabs>
		);
	}

	genPanelSelector(key, tabs, idPrefix, controlValueAccessor, datasetMetadata, dependsOn) {
		// logger.info("genPanelSelector: dependsOn=" + dependsOn);
		const subPanels = {};
		for (let i = 0; i < tabs.length; i++) {
			const tab = tabs[i];
			// logger.info("Sub-panel: group=" + tab.group + ", title=" + tab.text);
			subPanels[tab.group] = <div className="control-panel" key={tab.group}>{this.genUIItem(i, tab.content, idPrefix, controlValueAccessor, datasetMetadata)}</div>;
		}

		return (
			<SelectorPanel id={"selector-panel." + dependsOn}
				key={key}
				controlAccessor={this.getControl}
				panels={subPanels}
				dependsOn={dependsOn}
			/>
		);
	}

	genUIContent(uiItems, idPrefix, controlValueAccessor, datasetMetadata) {
		// logger.info("genUIContent");
		var uiContent = [];
		for (var i = 0; i < uiItems.length; i++) {
			var uiItem = uiItems[i];
			// logger.info(uiItem);
			uiContent.push(this.genUIItem(i, uiItem, idPrefix, controlValueAccessor, datasetMetadata));
		}
		return uiContent;
	}

	genUIItem(key, uiItem, idPrefix, controlValueAccessor, datasetMetadata) {
		// logger.info("genUIItem");
		// logger.info(uiItem);

		if (uiItem.itemType === "control") {
			return this.genControlItem(key, uiItem.control, idPrefix, controlValueAccessor, datasetMetadata);
		} else if (uiItem.itemType === "additionalLink") {
			// logger.info ("Additional link");
			// logger.info(uiItem);
			var subPanel = this.genPanel(key, uiItem.panel, idPrefix, controlValueAccessor, datasetMetadata);
			return (<SubPanelButton id={"sub-panel-button." + key}
				label={uiItem.text}
				title={uiItem.secondaryText}
				panel={subPanel}
			/>);
		} else if (uiItem.itemType === "staticText") {
			return <div id={"static-text." + key}>{uiItem.text}</div>;
		} else if (uiItem.itemType === "hSeparator") {
			return <hr id={"h-separator." + key} />;
		} else if (uiItem.itemType === "panel") {
			return this.genPanel(key, uiItem.panel, idPrefix, controlValueAccessor, datasetMetadata);
		} else if (uiItem.itemType === "subTabs") {
			return this.genSubTabs(key, uiItem.tabs, idPrefix, controlValueAccessor, datasetMetadata);
		} else if (uiItem.itemType === "primaryTabs") {
			return this.genPrimaryTabs(key, uiItem.tabs, idPrefix, controlValueAccessor, datasetMetadata);
		} else if (uiItem.itemType === "panelSelector") {
			return this.genPanelSelector(key, uiItem.tabs, idPrefix, controlValueAccessor, datasetMetadata, uiItem.dependsOn);
		} else if (uiItem.itemType === "checkboxSelector") {
			return this.genPanel(key, uiItem.panel, idPrefix, controlValueAccessor, datasetMetadata);
		} else if (uiItem.itemType === "customPanel") {
			return this.generateCustomPanel(uiItem.panel, controlValueAccessor, datasetMetadata);
		}
		return <div>Unknown: {uiItem.itemType}</div>;
	}

	generateCustomPanel(panel, controlValueAccessor, datasetMetadata) {
		if (this.props.customPanels) {
			for (const custPanel of this.props.customPanels) {
				if (custPanel.id() === panel.id) {
					return new custPanel(panel.parameters, controlValueAccessor, this.updateControlValue, datasetMetadata).renderPanel();
				}
			}
		}
		return <div>Panel Not Found: {panel.id}</div>;
	}

	generateSharedControlNames(panel) {
		for (let j = 0; j < this.sharedCtrlInfo.length; j++) {
			if (typeof this.sharedCtrlInfo[j].id !== "undefined" && this.sharedCtrlInfo[j].id === panel.id) {
				return;
			}
		}
		const sharedCtrlNames = [];
		for (let i = 0; i < panel.uiItems.length; i++) {
			const controlName = panel.uiItems[i].control.name;
			sharedCtrlNames.push({
				"controlName": controlName
			});
		}
		this.sharedCtrlInfo.push({
			"id": panel.id,
			"controlNames": sharedCtrlNames
		});
	}

	genPanel(key, panel, idPrefix, controlValueAccessor, datasetMetadata) {
		// logger.info("genPanel");
		// logger.info(panel);
		const content = this.genUIContent(panel.uiItems, idPrefix, controlValueAccessor, datasetMetadata);
		const id = "panel." + key;
		var uiObject;
		if (panel.panelType === "columnAllocation") {
			this.generateSharedControlNames(panel);
			uiObject = (<ColumnAllocationPanel
				id={id}
				key={key}
				panel={panel}
				dataModel={datasetMetadata}
				controlAccessor={this.getControl}
			>
				{content}
			</ColumnAllocationPanel>);
		} else if (panel.panelType === "columnSelection") {
			this.generateSharedControlNames(panel);
			uiObject = (<div id={id}
				className="control-panel"
				key={key}
			>
				{content}
			</div>);
		} else if (panel.panelType === "checkboxPanel") {
			uiObject = (<CheckboxSelectionPanel
				id={id}
				key={key}
				panel={panel}
				dataModel={datasetMetadata}
				controlAccessor={this.getControl}
				controlStateModifier={this.setControlState}
			>
				{content}
			</CheckboxSelectionPanel>);
		} else {
			uiObject = (<div id={id}
				className="control-panel"
				key={key}
			>
				{content}
			</div>);
		}

		return uiObject;
	}

	handleSubmit(buttonId) {
		// logger.info(buttonId);
		this.props.submitMethod(buttonId, this.refs.form);
	}

	closeFieldPicker() {
		this.props.showPropertiesButtons(true);
		if (this.state.postPickCallback) {
			this.state.postPickCallback();
		}
		this.setState({
			fieldPickerControl: {},
			showFieldPicker: false,
			postPickCallback: null
		});
	}

	openFieldPicker(evt, postPickerCallback) {
		this.props.showPropertiesButtons(false);
		this.setState({
			fieldPickerControl: JSON.parse(evt.currentTarget.dataset.control),
			showFieldPicker: true,
			postPickCallback: postPickerCallback
		});
	}

	validateConditions(dataModel, cellCoords) {
		this._validateVisible(dataModel, cellCoords);
		this._validateEnabled(dataModel, cellCoords);
	}

	_validateVisible(dataModel, cellCoords) {
		// visibleDefinition
		if (Object.keys(this.state.visibleDefinition).length > 0) {
			// logger.info("validate visible definitions");
			const controlValues = this.getControlValues();

			// convert the controlValues object structure to what UiConditions take
			const userInput = {};
			for (var visKey in controlValues) {
				if (visKey) {
					userInput[visKey] = controlValues[visKey];
				}
			}

			for (const visibleKey in this.state.visibleDefinition) {
				if (this.state.visibleDefinition[visibleKey].length > 0) {
					for (let i = 0; i < this.state.visibleDefinition[visibleKey].length; i++) {
						const visDefinition = this.state.visibleDefinition[visibleKey][i];
						const baseKey = this._getBaseParam(visibleKey);
						if (typeof this.refs[baseKey] !== "undefined") {
							if (!this._shouldEvaluate(visDefinition.definition.visible, cellCoords)) {
								continue;
							}
							const controlType = this.refs[baseKey].props.control.controlType;
							try {
								var visOutput = UiConditions.validateInput(visDefinition.definition, userInput, controlType, dataModel,
									cellCoords, this.state.requiredParameters);

								var visTmp = this.state.controlStates;
								if (visOutput === true) { // control should be visible
									for (let j = 0; j < visDefinition.definition.visible.parameter_refs.length; j++) {
										const paramRef = this._getParamReference(visDefinition.definition.visible.parameter_refs[j], cellCoords);
										if (paramRef && visTmp[paramRef] !== "visible") {
											delete visTmp[paramRef];
										}
									}
									this.setState({ controlStates: visTmp });
								} else { // control should be hidden
									for (let j = 0; j < visDefinition.definition.visible.parameter_refs.length; j++) {
										const paramRef = this._getParamReference(visDefinition.definition.visible.parameter_refs[j], cellCoords);
										visTmp[paramRef] = "hidden";
									}
									this.setState({ controlStates: visTmp });
								}
							} catch (error) {
								logger.warn("Error thrown in validation: " + error);
							}
						}
					}
				}
			}
		}
	}

	_validateEnabled(dataModel, cellCoords) {
		// enabledDefinitions
		if (Object.keys(this.state.enabledDefinitions).length > 0) {
			// logger.info("validate enabled definitions");
			const controlValues = this.getControlValues();

			// convert the controlValues object structure to what UiConditions take
			const userInput = {};
			for (var enbKey in controlValues) {
				if (enbKey) {
					userInput[enbKey] = controlValues[enbKey];
				}
			}

			for (const enabledKey in this.state.enabledDefinitions) {
				if (this.state.enabledDefinitions[enabledKey].length > 0) {
					for (let i = 0; i < this.state.enabledDefinitions[enabledKey].length; i++) {
						const enbDefinition = this.state.enabledDefinitions[enabledKey][i];
						const baseKey = this._getBaseParam(enabledKey);
						if (typeof this.refs[baseKey] !== "undefined") {
							if (!this._shouldEvaluate(enbDefinition.definition.enabled, cellCoords)) {
								continue;
							}
							const controlType = this.refs[baseKey].props.control.controlType;
							try {
								var enbOutput = UiConditions.validateInput(enbDefinition.definition, userInput, controlType, dataModel,
									cellCoords, this.state.requiredParameters);

								var tmp = this.state.controlStates;
								if (enbOutput === true) { // control should be enabled
									for (let j = 0; j < enbDefinition.definition.enabled.parameter_refs.length; j++) {
										const paramRef = this._getParamReference(enbDefinition.definition.enabled.parameter_refs[j], cellCoords);
										if (paramRef && tmp[paramRef] !== "hidden") {
											delete tmp[paramRef];
										}
									}
									this.setState({ controlStates: tmp });
								} else { // control should be disabled
									for (let j = 0; j < enbDefinition.definition.enabled.parameter_refs.length; j++) {
										const paramRef = this._getParamReference(enbDefinition.definition.enabled.parameter_refs[j], cellCoords);
										if (tmp[paramRef] !== "hidden") { // if control is hidden, no need to disable it
											tmp[paramRef] = "disabled";
										}
									}
									this.setState({ controlStates: tmp });
								}
							} catch (error) {
								logger.warn("Error thrown in validation: " + error);
							}
						}
					}
				}
			}
		}
	}

	_shouldEvaluate(definition, cellCoords) {
		if (!cellCoords) {
			return true;
		}
		return this._hasColumnEval(definition.evaluate, cellCoords.colIndex);
	}

	_hasColumnEval(evaluate, column) {
		const condition = evaluate.condition;
		if (condition) {
			const offset = condition.parameter_ref.indexOf("[");
			if (offset > -1) {
				return parseInt(condition.parameter_ref.substring(offset + 1), 10) === column;
			}
		} else {
			let andOr = evaluate.and;
			if (!andOr) {
				andOr = evaluate.or;
			}
			if (andOr) {
				for (let i = 0; i < andOr.length; i++) {
					if (this._hasColumnEval(andOr[i], column)) {
						return true;
					}
				}
			}
		}
		return false;
	}

	_getBaseParam(paramRef) {
		let baseParam = paramRef;
		const offset = paramRef.indexOf("[");
		if (offset > -1) {
			baseParam = paramRef.substring(0, offset);
		}
		return baseParam;
	}

	_getParamReference(paramRef, cellCoords) {
		let fullReference = paramRef;
		let subControlIndex = -1;
		const offset = paramRef.indexOf("[");
		if (offset > -1) {
			const paramName = paramRef.substring(0, offset);
			if (cellCoords && typeof cellCoords.rowIndex === "number") {
				subControlIndex = parseInt(paramRef.substring(offset + 1), 10);
				fullReference = paramName + "[" + cellCoords.rowIndex + "][" + subControlIndex + "]";
			} else {
				// If no cell coordinates but this is a cell-based condition then bail out
				fullReference = null;
			}
		}
		return fullReference;
	}

	retrieveValidationErrorMessage(controlName) {
		return this.state.controlErrorMessages[controlName];
	}

	updateValidationErrorMessage(controlName, message) {
		const tmp = this.state.controlErrorMessages;
		tmp[controlName] = message;
		this.setState({
			controlErrorMessages: tmp
		});
	}

	parseUiConditions(uiConditions) {
		var visibleDefinition = {};
		var enabledDefinitions = {};
		var validationDefinitions = {};

		for (let i = 0; i < uiConditions.length; i++) {
			if (uiConditions[i].visible) {
				visibleDefinition = UiConditionsParser.parseConditions(visibleDefinition, uiConditions[i], "visible");
			} else if (uiConditions[i].enabled) {
				enabledDefinitions = UiConditionsParser.parseConditions(enabledDefinitions, uiConditions[i], "enabled");
			} else if (uiConditions[i].validation) {
				validationDefinitions = UiConditionsParser.parseConditions(validationDefinitions, uiConditions[i], "validation");
			} else { // invalid
				logger.info("Invalid definition: " + JSON.stringify(uiConditions[i]));
			}
		}

		this.setState({
			visibleDefinition: visibleDefinition,
			enabledDefinitions: enabledDefinitions,
			validationDefinitions: validationDefinitions
		});
	}

	parseRequiredParameters(formData) {
		var requiredParameters = [];
		requiredParameters = UiConditionsParser.parseRequiredParameters(requiredParameters, formData);

		this.setState({ requiredParameters: requiredParameters });
	}

	render() {
		var content = this.genUIContent(this.state.formData.uiItems, "", this.getControlValue, this.state.formData.data.datasetMetadata);

		if (this.state.showFieldPicker) {
			const currentControlValues = this.getControlValues();
			const filteredDataset = this.getFilteredDataset(this.state.fieldPickerControl.name);
			content = (<div id="field-picker-table">
				<FieldPicker
					key="field-picker-control"
					closeFieldPicker={this.closeFieldPicker}
					getControlValue={this.getControlValue}
					currentControlValues={currentControlValues}
					dataModel={filteredDataset}
					updateControlValue={this.updateControlValue}
					control={this.state.fieldPickerControl}
					updateSelectedRows={this.updateSelectedRows}
					title={this.props.form.label}
				/>
			</div>);
		}

		var formButtons = [];
		return (
			<div className="well">
				<form id={"form-" + this.props.form.componentId} className="form-horizontal">
					<div className="section--light">
						{content}
					</div>
					<div>
						<ButtonToolbar>{formButtons}</ButtonToolbar>
					</div>
				</form>
			</div>
		);
	}
}

EditorForm.propTypes = {
	form: PropTypes.object,
	additionalComponents: PropTypes.object,
	useObjectModelInfo: PropTypes.object,
	submitMethod: PropTypes.func,
	showPropertiesButtons: PropTypes.func,
	customPanels: PropTypes.array
};
