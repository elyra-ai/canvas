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
import ValidationMessage from "./validation-message.jsx";
import UiConditions from "../ui-conditions/ui-conditions.js";
import { DEFAULT_VALIDATION_MESSAGE, VALIDATION_MESSAGE } from "../constants/constants.js";

export default class EditorControl extends React.Component {

	static splitNewlines(text) {
		return text.split("\n");
	}

	static joinNewlines(list) {
		return list.join("\n");
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

	// Structures are supplied to the UI as an array of strings where each string represents
	// an array of values within the structure. This parses those sub-strings into individual arrays.
	static parseStructureStrings(values) {
		var structures = [];
		for (var i = 0; i < values.length; i++) {
			structures.push(JSON.parse(values[i]));
		}
		return structures;
	}

	// Structures are returned from the UI as an array of strings where each string represents
	// an array of values within the structure. This converts each array of row values into a JSON string.
	static stringifyStructureStrings(values) {
		var structures = [];
		for (var i = 0; i < values.length; i++) {
			structures.push(JSON.stringify(values[i]));
		}
		return structures;
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
		this.getCurrentTableCoordinates = this.getCurrentTableCoordinates.bind(this);
		this.getUserInput = this.getUserInput.bind(this);

		this._valueListener = null;
	}

	getControlID() {
		return "editor-control." + this.props.control.name;
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
				message = { type: "info", text: "" };
			}
		}
		let errorMessage = (<ValidationMessage
			validateErrorMessage={message}
			controlType={conditionProps.controlType}
		/>);
		const stateDisabled = {};
		let stateStyle = {};

		if (typeof message !== "undefined") {
			switch (message.type) {
			case "warning":
				stateStyle = {
					color: VALIDATION_MESSAGE.WARNING,
					borderColor: VALIDATION_MESSAGE.WARNING
				};
				break;
			case "error":
				stateStyle = {
					color: VALIDATION_MESSAGE.ERROR,
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
				break;
			case "hidden":
				stateStyle.visibility = "hidden";
				break;
			default:
			}
			errorMessage = <div></div>;
		}

		return {
			message: errorMessage,
			disabled: stateDisabled,
			style: stateStyle
		};
	}

	getCharLimit(defaultLimit) {
		let limit = defaultLimit;
		if (this.props.control.charLimit) {
			limit = this.props.control.charLimit;
		}
		return limit;
	}

	getCurrentTableCoordinates() {
		if (typeof this.rowIndex === "number" && typeof this.colIndex === "number") {
			return { rowIndex: this.rowIndex, colIndex: this.colIndex, skipVal: this.skipVal };
		}
		return {};
	}

	getUserInput() {
		const userInput = {};
		const controlValues = this.props.getControlValues();
		for (const key in controlValues) {
			if (typeof controlValues[key][0] === "undefined") {
				userInput[key] = [];
			} else {
				userInput[key] = controlValues[key][0];
			}
		}
		return userInput;
	}

	setValueListener(listener) {
		// Listener is expected to define handleValueChanged(controlName, value);
		this._valueListener = listener;
	}

	clearValueListener() {
		this._valueListener = null;
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

	validateInput() {
		var controlName = this.getControlID().split(".")[1];
		if (!this.props.validationDefinitions) {
			return;
		}
		if (this.props.validateConditions) {
			this.props.validateConditions(); // run visible and enabled condition validations
		}

		const validations = this.props.validationDefinitions[controlName];
		if (this.props.controlStates && typeof this.props.controlStates[controlName] === "undefined" && validations) {
			try {
				const userInput = this.getUserInput();
				let output = false;
				let errorMessage = DEFAULT_VALIDATION_MESSAGE;

				for (const validation of validations) {
					if (this.shouldEvaluate(validation)) {
						const coordinates = this.getCurrentTableCoordinates();
						output = UiConditions.validateInput(validation.definition, userInput, this.props.dataModel, coordinates);
						// logger.info("validated input field " + controlName + " to be " + JSON.stringify(output));
						if (typeof output === "object") {
							errorMessage = {
								type: output.type,
								text: output.text
							};
						}
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
						this.props.updateValidationErrorMessage(controlName, errorMessage);

						if (typeof output === "object" && errorMessage.type === "error") {
							// Break on the first error
							break;
						}
					}
				}
			} catch (error) {
				logger.info("Error thrown in validation: " + error);
			}
		}
	}

	render() {
		return (
			<div key="editor-control"></div>
		);
	}
}

EditorControl.propTypes = {
	control: React.PropTypes.object.isRequired,
	controlStates: React.PropTypes.object,
	valueAccessor: React.PropTypes.func.isRequired,
	validationDefinitions: React.PropTypes.array,
	validateConditions: React.PropTypes.func,
	updateValidationErrorMessage: React.PropTypes.func,
	retrieveValidationErrorMessage: React.PropTypes.func,
	dataModel: React.PropTypes.object,
	getControlValues: React.PropTypes.func
};
