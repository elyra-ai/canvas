/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint max-depth: ["error", 7] */
/* eslint complexity: ["error", 17] */

import logger from "../../../utils/logger";
import React from "react";
import PropTypes from "prop-types";
import ValidationMessage from "./validation-message.jsx";
import ValidationIcon from "./validation-icon.jsx";
import UiConditions from "../ui-conditions/ui-conditions.js";
import PropertyUtils from "../util/property-utils.js";
import { DEFAULT_VALIDATION_MESSAGE, VALIDATION_MESSAGE, EDITOR_CONTROL } from "../constants/constants.js";

export default class EditorControl extends React.Component {

	static splitNewlines(text) {
		if (text.length > 0) {
			const split = text.split("\n");
			if (Array.isArray(split)) {
				return split;
			}
			return [split];
		}
		return [];
	}

	static joinNewlines(list) {
		if (Array.isArray(list)) {
			return list.length === 0 ? [] : list.join("\n");
		}
		return list;
	}

	static genSelectOptions(control, selectedValues) {
		var options = [];
		for (var i = 0; i < control.values.length; i++) {
			options.push(
				<option key={i} value={control.values[i]}>{control.valueLabels[i]}</option>
			);
		}
		return options;
	}

	static genColumnSelectOptions(fields, selectedValues, includeEmpty) {
		var options = [];
		if (includeEmpty) {
			options.push(
				<option key={-1} disabled value={""}>...</option>
			);
		}

		for (var i = 0; i < fields.length; i++) {
			options.push(
				<option key={i} value={fields[i].name}>{fields[i].name}</option>
			);
		}
		return options;
	}

	static genColumnSelectDropdownOptions(fields, selectedValues) {
		var options = [];

		for (var j = 0; j < fields.length; j++) {
			options.push({
				value: fields[j].name,
				label: fields[j].name
			});
		}

		return options;
	}

	static genStringSelectOptions(values, selectedValues) {
		var options = [];
		for (var i = 0; i < values.length; i++) {
			options.push(
				<option key={i} value={values[i]}>{values[i]}</option>
			);
		}
		return options;
	}

	static handleTableRowClick(evt, rowIndex, selection) {
		// logger.info(selection);
		var selected = selection;
		const index = selected.indexOf(rowIndex);

		if (evt.metaKey === true || evt.ctrlKey === true) {
			// If already selected then remove otherwise add
			if (index >= 0) {
				selected.splice(index, 1);
			} else {
				selected = selected.concat(rowIndex);
			}
		} else if (evt.shiftKey === true) {
			const anchor = selected.length > 0 ? selected[0] : rowIndex;
			const start = anchor > rowIndex ? rowIndex : anchor;
			const end = (anchor > rowIndex ? anchor : rowIndex) + 1;
			const newSelns = [];
			for (let i = start; i < end; i++) {
				newSelns.push(i);
			}
			selected = newSelns;
		} else {
			selected = [rowIndex];
		}
		return selected;
	}

	constructor(props) {
		super(props);
		this.getControlID = this.getControlID.bind(this);
		this.setValueListener = this.setValueListener.bind(this);
		this.clearValueListener = this.clearValueListener.bind(this);
		this.notifyValueChanged = this.notifyValueChanged.bind(this);
		this.validateInput = this.validateInput.bind(this);
		this.shouldEvaluate = this.shouldEvaluate.bind(this);
		this.getUserInput = this.getUserInput.bind(this);
		this.clearTableErrorState = this.clearTableErrorState.bind(this);
		this.getTableErrorState = this.getTableErrorState.bind(this);
		this.setTableErrorState = this.setTableErrorState.bind(this);
		this.evaluateInput = this.evaluateInput.bind(this);
		this.doGroupValidationUpdate = this.doGroupValidationUpdate.bind(this);
		this.updateCellConditions = this.updateCellConditions.bind(this);

		this._valueListener = null;
	}

	getControlID() {
		return EDITOR_CONTROL + this.props.control.name;
	}

	/*
	 * Sub-classes must override this function to return the value of the control as an array of strings.
	 */
	getControlValue() {
		return [];
	}


	getConditionMsgState(conditionProps) {
		let message = DEFAULT_VALIDATION_MESSAGE;
		if (this.props.retrieveValidationErrorMessage) {
			message = this.props.retrieveValidationErrorMessage(conditionProps.controlName);
			if (typeof message === "undefined") {
				message = DEFAULT_VALIDATION_MESSAGE;
			}
		}
		let errorMessage = (<ValidationMessage
			validateErrorMessage={message}
			controlType={conditionProps.controlType}
		/>);
		const errorIcon = (<ValidationIcon
			validateErrorMessage={message}
			controlType={conditionProps.controlType}
		/>);
		const stateDisabled = {};
		let showTooltip = true;
		let stateStyle = {};

		let messageType = "info";
		if (typeof message !== "undefined") {
			messageType = message.type;
			switch (message.type) {
			case "warning":
				stateStyle = {
					// color: VALIDATION_MESSAGE.WARNING,
					borderColor: VALIDATION_MESSAGE.WARNING
				};
				break;
			case "error":
				stateStyle = {
					// color: VALIDATION_MESSAGE.ERROR,
					borderColor: VALIDATION_MESSAGE.ERROR
				};
				break;
			default:
			}
		}

		if (this.props.controlStates && typeof this.props.controlStates[conditionProps.controlName] !== "undefined") {
			switch (this.props.controlStates[conditionProps.controlName]) {
			case "disabled":
				stateDisabled.disabled = true;
				stateStyle = {
					color: VALIDATION_MESSAGE.DISABLED,
					borderColor: VALIDATION_MESSAGE.DISABLED
				};
				showTooltip = false;
				break;
			case "hidden":
				stateStyle.visibility = "hidden";
				showTooltip = false;
				break;
			default:
			}
			errorMessage = <div />;
		}

		if (this.props.tableControl) {
			// If this is a control in a table cell, refer to disabled and visible directly
			if (this.props.disabled) {
				stateDisabled.disabled = true;
				stateStyle = {
					color: VALIDATION_MESSAGE.DISABLED,
					borderColor: VALIDATION_MESSAGE.DISABLED
				};
			} else if (this.props.hidden) {
				stateStyle.visibility = "hidden";
			}
		} else {
			// Check for cell level operations for tables, which are added to the base control state
			this.updateCellConditions(conditionProps, stateDisabled, stateStyle);
		}

		return {
			message: errorMessage,
			messageType: messageType,
			icon: errorIcon,
			disabled: stateDisabled,
			style: stateStyle,
			showTooltip: showTooltip
		};
	}

	getCharLimit(defaultLimit) {
		let limit = defaultLimit;
		if (this.props.control.charLimit) {
			limit = this.props.control.charLimit;
		}
		return limit;
	}

	getUserInput() {
		const userInput = {};
		const controlValues = this.props.getControlValues();
		for (const key in controlValues) {
			if (key) {
				userInput[key] = controlValues[key];
			}
		}

		const subControlValues = this.props.getSubControlValues();
		for (const key in subControlValues) {
			if (key) {
				userInput[key] = subControlValues[key];
			}
		}

		return userInput;
	}

	setValueListener(listener) {
		// Listener is expected to define handleValueChanged(controlName, value);
		this._valueListener = listener;
	}

	getTableErrorState(row, column) {
		if (this.tableErrorState && row < this.tableErrorState.length && column < this.tableErrorState[row].length) {
			return this.tableErrorState[row][column];
		}
		return true;
	}

	setTableErrorState(row, column, errorMessageObject) {
		for (let i = this.tableErrorState.length; i <= row; i++) {
			this.tableErrorState.push([]);
		}
		for (let i = this.tableErrorState[row].length; i <= column; i++) {
			this.tableErrorState[row].push(true);
		}
		this.tableErrorState[row][column] = errorMessageObject;
	}

	clearTableErrorState() {
		this.tableErrorState = [];
	}

	clearValueListener() {
		this._valueListener = null;
	}

	updateCellConditions(conditionProps, stateDisabled, stateStyle) {
		if (this.props.control.valueDef && this.props.control.valueDef.isMap) {
			for (var key in this.props.controlStates) {
				if (this.props.controlStates.hasOwnProperty(key)) {
					// Separate any complex type sub-control reference
					let paramName = key;
					let offset = key.indexOf("[");
					if (offset > -1) {
						paramName = key.substring(0, offset);
						const rowIndex = parseInt(key.substring(offset + 1), 10);
						offset = key.indexOf("[", offset + 1);
						const colIndex = offset > -1 ? parseInt(key.substring(offset + 1), 10) : -1;
						if (conditionProps.controlName === paramName && rowIndex > -1) {
							this._updateHiddenDisabled(this.props.controlStates[key],
								rowIndex, colIndex, stateDisabled, stateStyle);
						}
					}
				}
			}
		}
	}

	_updateHiddenDisabled(controlState, rowIndex, colIndex, stateDisabled, stateStyle) {
		if (controlState === "disabled") {
			if (!stateDisabled[rowIndex]) {
				stateDisabled[rowIndex] = {};
			}
			if (!stateStyle[rowIndex]) {
				stateStyle[rowIndex] = {};
			}
			if (colIndex > -1) {
				stateDisabled[rowIndex][colIndex] = { disabled: true };
				stateStyle[rowIndex][colIndex] = {
					color: VALIDATION_MESSAGE.DISABLED,
					borderColor: VALIDATION_MESSAGE.DISABLED
				};
			} else {
				stateDisabled[rowIndex].disabled = true;
				stateStyle[rowIndex].color = VALIDATION_MESSAGE.DISABLED;
				stateStyle[rowIndex].borderColor = VALIDATION_MESSAGE.DISABLED;
			}
		} else if (controlState === "hidden") {
			if (!stateStyle[rowIndex]) {
				stateStyle[rowIndex] = {};
			}
			if (colIndex > -1) {
				stateStyle[rowIndex][colIndex] = { visibility: "hidden" };
			} else {
				stateStyle[rowIndex].visibility = "hidden";
			}
		}
	}

	notifyValueChanged(controlName, value) {
		// logger.info("notifyValueChanged(): control=" + controlName);
		// logger.info(value);
		if (this._valueListener !== null) {
			// logger.info("notifyValueChanged(): notifying value listener");
			this._valueListener.handleValueChanged(controlName, value);
		} else {
			// logger.info("notifyValueChanged(): no listener");
		}
	}

	shouldEvaluate(validation) {
		let evaluate = true;
		if (typeof validation.params === "object") {
			for (const control of validation.params) {
				if (typeof this.props.controlStates[control] !== "undefined") {
					evaluate = false;
					break;
				}
			}
		}
		return evaluate;
	}

	evaluateInput(validation, userInput) {
		let output;
		const coordinates = {};
		if (this.props.control.valueDef.isMap) {
			// For tables we need to evaluate all non-keyDef cells
			const cellValues = userInput[this.props.control.name];
			for (let row = 0; row < cellValues.length; row++) {
				for (let col = 0; col < cellValues[row].length; col++) {
					if (col === this.props.control.keyIndex) {
						// We don't evaluate the key column
						continue;
					}
					coordinates.rowIndex = row;
					coordinates.colIndex = col;
					coordinates.skipVal = cellValues[row][this.props.control.keyIndex];
					const tmp = UiConditions.validateInput(validation.definition, userInput, this.props.control.controlType, this.props.dataModel, coordinates);
					const isError = PropertyUtils.toType(tmp) === "object";
					if (!output || PropertyUtils.toType(output) === "boolean") {
						// Set the return value with preference to errors
						output = tmp;
					}
					if (PropertyUtils.toType(this.rowIndex) === "number" && PropertyUtils.toType(this.colIndex) === "number") {
						// If we have current cell coordinates, they take precedence
						if (row === this.rowIndex && col === this.colIndex && isError) {
							output = tmp;
							output.isActiveCell = true;
						}
					}
					if (isError) {
						this.setTableErrorState(row, col, tmp);
					}
				}
			}
			// validate on table-level if cell validation didn't result in an error already
			if (!output || PropertyUtils.toType(output) === "boolean") {
				output = UiConditions.validateInput(validation.definition, userInput, this.props.control.controlType, this.props.dataModel, coordinates);
			}
		} else {
			output = UiConditions.validateInput(validation.definition, userInput, this.props.control.controlType, this.props.dataModel, coordinates);
		}
		return output;
	}

	doGroupValidationUpdate(validation, errorMessage, output, controlName) {
		if (typeof validation.params === "object") {
			for (const control of validation.params) {
				let groupMessage = errorMessage;
				if (output === true) {
					groupMessage = DEFAULT_VALIDATION_MESSAGE;
				}
				if (control !== controlName) {
					this.props.updateValidationErrorMessage(control, groupMessage);
				}
			}
		}
	}

	validateInput(cellCoords) {
		const controlName = this.getControlID().replace(EDITOR_CONTROL, "");
		if (!this.props.validationDefinitions) {
			return;
		}
		if (this.props.validateConditions) {
			// run visible and enabled condition validations
			this.props.validateConditions(this.props.dataModel, cellCoords);
		}
		if (this.props.control.valueDef.isMap) {
			this.clearTableErrorState(); 	// Clear table error state
		}
		const validations = this.props.validationDefinitions[controlName];
		if (this.props.controlStates && typeof this.props.controlStates[controlName] === "undefined" && Array.isArray(validations)) {
			try {
				const userInput = this.getUserInput();
				let output = false;
				let errorMessage = DEFAULT_VALIDATION_MESSAGE;
				let validationSet = false;
				let errorSet = false;

				for (const validation of validations) {
					if (this.shouldEvaluate(validation)) {
						output = this.evaluateInput(validation, userInput);
						let isError = false;
						// logger.info("validated input field " + controlName + " to be " + JSON.stringify(output));
						if (typeof output === "object") {
							isError = true;
							errorMessage = {
								type: output.type,
								text: output.text
							};
						}
						if (!validationSet || output.isActiveCell || (isError && !errorSet)) {
							this.props.updateValidationErrorMessage(controlName, errorMessage);
							validationSet = true;
							if (isError) {
								errorSet = true;
							}
						}
						this.doGroupValidationUpdate(validation, errorMessage, output, controlName);
					}
				}
			} catch (error) {
				logger.warn("Error thrown in validation: " + error);
			}
		}
	}

	render() {
		return (
			<div key="editor-control" />
		);
	}
}

EditorControl.propTypes = {
	control: PropTypes.object.isRequired,
	controlStates: PropTypes.object,
	valueAccessor: PropTypes.func.isRequired,
	validationDefinitions: PropTypes.object,
	tableControl: PropTypes.boolean,
	disabled: PropTypes.boolean,
	hidden: PropTypes.boolean,
	columnDef: PropTypes.object,
	validateConditions: PropTypes.func,
	updateValidationErrorMessage: PropTypes.func,
	retrieveValidationErrorMessage: PropTypes.func,
	dataModel: PropTypes.object,
	getControlValues: PropTypes.func,
	getSubControlValues: PropTypes.func
};
