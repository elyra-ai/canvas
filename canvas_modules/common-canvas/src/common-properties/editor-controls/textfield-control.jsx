/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import { TextField } from "ap-components-react/dist/ap-components-react";
import EditorControl from "./editor-control.jsx";
import { CHARACTER_LIMITS } from "../constants/constants.js";

export default class TextfieldControl extends EditorControl {
	constructor(props) {
		super(props);
		const value = props.valueAccessor ? props.valueAccessor(props.control.name)[0] : props.value;
		this.state = {
			controlValue: value
		};
		this.getControlValue = this.getControlValue.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(evt) {
		this.setState({ controlValue: evt.target.value });
		if (this.props.updateControlValue) {
			const ctrlName = this.props.columnDef ? this.props.columnDef.name : this.props.control.name;
			this.props.updateControlValue(ctrlName, evt.target.value, this.props.rowIndex);
		}
	}

	getControlValue() {
		return [this.state.controlValue];
	}

	render() {
		const controlName = this.getControlID().split(".")[1];
		const conditionProps = {
			controlName: controlName,
			controlType: "textfield"
		};
		const conditionState = this.getConditionMsgState(conditionProps);

		const errorMessage = !this.props.columnDef ? conditionState.message : null;
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;

		const charLimit = this.getCharLimit(CHARACTER_LIMITS.NODE_PROPERTIES_DIALOG_TEXT_FIELD);
		let displayedCharLimit;
		let cellvalue = this.state.controlValue;
		if (!this.props.tableControl) {
			displayedCharLimit = charLimit;
		} else {
			cellvalue = this.props.value;
		}
		cellvalue = cellvalue ? cellvalue : "";
		return (
			<div className="editor_control_area" style={stateStyle}>
				<TextField {...stateDisabled}
					style={stateStyle}
					id={this.getControlID()}
					onBlur={this.validateInput}
					disabledPlaceholderAnimation
					placeholder={this.props.control.additionalText}
					onChange={this.handleChange}
					value={cellvalue}
					maxCount={displayedCharLimit}
					maxLength={charLimit}
				/>
				{errorMessage}
			</div>
		);
	}
}

TextfieldControl.propTypes = {
	control: React.PropTypes.object.isRequired,
	controlStates: React.PropTypes.object,
	validationDefinitions: React.PropTypes.object,
	validateConditions: React.PropTypes.func,
	updateValidationErrorMessage: React.PropTypes.func,
	retrieveValidationErrorMessage: React.PropTypes.func,
	updateControlValue: React.PropTypes.func,
	// Optional used when embedded in table
	tableControl: React.PropTypes.bool,
	rowIndex: React.PropTypes.number,
	columnDef: React.PropTypes.object,
	value: React.PropTypes.string
};
