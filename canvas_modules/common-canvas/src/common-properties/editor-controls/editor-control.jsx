/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2016
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/

import logger from "../../../utils/logger";
import React from "react";
import UiConditions from "../ui-conditions/ui-conditions.js";

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
				<option key={-1} value={""}>...</option>
			);
		}

		for (var i = 0; i < fields.length; i++) {
			options.push(
				<option key={i} value={fields[i].name}>{fields[i].name}</option>
			);
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
		this.state = {
			validateErrorMessage: {
				type: "info",
				text: ""
			}
		};
		this.getControlID = this.getControlID.bind(this);
		this.setValueListener = this.setValueListener.bind(this);
		this.clearValueListener = this.clearValueListener.bind(this);
		this.notifyValueChanged = this.notifyValueChanged.bind(this);
		this.validateInput = this.validateInput.bind(this);
		this.clearValidateMsg = this.clearValidateMsg.bind(this);

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
	getCharLimit(defaultLimit) {
		let limit = defaultLimit;
		if (this.props.control.charLimit) {
			limit = this.props.control.charLimit;
		}
		return limit;
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

	validateInput(evt) {
		var controlName = this.getControlID().split(".")[1];
		if (typeof this.props.controlStates[controlName] === "undefined" && this.props.validationDefinitions[controlName]) {
			var userInput = {
				[controlName]: this.state.controlValue // evt.target.value
			};

			try {
				var output = UiConditions.validateInput(this.props.validationDefinitions[controlName], userInput);
				logger.info("validated input field " + controlName + " to be " + output);

				if (output === true) {
					this.setState({
						validateErrorMessage: {
							type: "info",
							text: ""
						}
					});
				} else {
					this.setState({
						validateErrorMessage: {
							type: "invalid",
							text: output
						}
					});
				}
			} catch (error) {
				logger.info("Error thrown in validation: " + error);
			}
		}
	}

	clearValidateMsg() {
		this.setState({
			validateErrorMessage: {
				type: "info",
				text: ""
			}
		});
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
	validationDefinitions: React.PropTypes.array
};
