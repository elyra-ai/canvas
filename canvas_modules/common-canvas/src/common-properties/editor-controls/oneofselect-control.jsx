/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import Dropdown from "react-dropdown";
import EditorControl from "./editor-control.jsx";
import { EDITOR_CONTROL } from "../constants/constants.js";

export default class OneofselectControl extends EditorControl {
	constructor(props) {
		super(props);
		if (props.tableControl) {
			this.state = { controlValue: this.props.value };
		} else {
			this.state = { controlValue: props.valueAccessor(props.control.name) };
		}
		if (!this.state.controlValue && typeof props.control.valueDef.defaultValue !== "undefined") {
			this.state.controlValue = props.control.valueDef.defaultValue;
		}
		this.getControlValue = this.getControlValue.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(evt) {
		if (this.props.tableControl) {
			this.props.controlValue[this.props.rowIndex][this.props.columnIndex] = evt.value;
			this.props.setCurrentControlValueSelected(this.props.control.name, this.props.controlValue, this.props.updateControlValue, this.props.selectedRows);
		} else {
			this.notifyValueChanged(this.props.control.name, evt.value);
			this.setState({ controlValue: evt.value });
			this.props.updateControlValue(this.props.control.name, evt.value);
		}
	}
	// Added to prevent entire row being selected in table
	onClick(evt) {
		if (this.props.tableControl) {
			evt.stopPropagation();
		}
		this.validateInput();
	}

	getControlValue() {
		return this.state.controlValue;
	}

	genSelectOptions(control, selectedValue) {
		var options = [];
		var selectedOption = [];
		const optionsLength = control.values.length;
		for (var j = 0; j < optionsLength; j++) {
			options.push({
				value: control.values[j],
				label: control.valueLabels[j]
			});
		}
		options.forEach((option) => {
			if (option.value === selectedValue) {
				selectedOption = option;
			} else {
				selectedOption = selectedValue;
			}
		});
		return {
			options: options,
			selectedOption: selectedOption
		};
	}

	render() {
		const controlName = this.getControlID().replace(EDITOR_CONTROL, "");
		const conditionProps = {
			controlName: controlName,
			controlType: "dropdown"
		};
		const conditionState = this.getConditionMsgState(conditionProps);

		const errorMessage = conditionState.message;
		const messageType = conditionState.messageType;
		const icon = this.props.tableControl ? <div /> : conditionState.icon;
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;

		let controlIconContainerClass = "control-icon-container";
		if (messageType !== "info") {
			controlIconContainerClass = "control-icon-container-enabled";
		}

		var dropDown = {};
		var className = "Dropdown-control-panel";
		if (this.props.tableControl) {
			dropDown = this.genSelectOptions(this.props.columnDef, this.props.value);
			className = "Dropdown-control-table";
		} else {
			dropDown = this.genSelectOptions(this.props.control, this.state.controlValue);
		}

		return (
			<div id="oneofselect-control-container">
				<div id={controlIconContainerClass}>
					<div>
						<div onClick={this.onClick.bind(this)} className={className} style={stateStyle}>
							<Dropdown {...stateDisabled}
								id={this.getControlID()}
								name={this.props.control.name}
								options={dropDown.options}
								onChange={this.handleChange}
								onBlur={this.validateInput}
								value={dropDown.selectedOption}
								placeholder={this.props.control.additionalText}
								ref="input"
							/>
						</div>
					</div>
					{icon}
				</div>
				{errorMessage}
			</div>
		);
	}
}

OneofselectControl.propTypes = {
	control: PropTypes.object.isRequired,
	updateControlValue: PropTypes.func,
	// Optional used when embedded in table
	tableControl: PropTypes.bool,
	rowIndex: PropTypes.number,
	columnIndex: PropTypes.number,
	controlValue: PropTypes.array,
	columnDef: PropTypes.object,
	value: PropTypes.string,
	setCurrentControlValueSelected: PropTypes.func,
	selectedRows: PropTypes.array,
	controlStates: PropTypes.object,
	validationDefinitions: PropTypes.array,
	updateValidationErrorMessage: PropTypes.func,
	retrieveValidationErrorMessage: PropTypes.func
};
