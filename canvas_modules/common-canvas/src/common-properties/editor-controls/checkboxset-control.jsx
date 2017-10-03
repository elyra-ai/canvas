/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

// import logger from "../../../utils/logger";
import React from "react";
import PropTypes from "prop-types";
import { Checkbox } from "ap-components-react/dist/ap-components-react";
import EditorControl from "./editor-control.jsx";
import { EDITOR_CONTROL } from "../constants/constants.js";

export default class CheckboxsetControl extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {
			controlValue: props.valueAccessor(props.control.name)
		};
		this.getControlValue = this.getControlValue.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(evt) {
		var values = this.state.controlValue;
		var index = values.indexOf(evt.target.id);
		if (evt.target.checked && index < 0) {
			// Add to values
			values = values.concat([evt.target.id]);
		}
		if (!(evt.target.checked) && index >= 0) {
			// Remove from values
			values.splice(index, 1);
		}
		this.setState({ controlValue: values });
		this.notifyValueChanged(this.props.control.name, values);
		this.props.updateControlValue(this.props.control.name, values);
	}

	getControlValue() {
		return this.state.controlValue;
	}

	render() {
		const controlName = this.getControlID().replace(EDITOR_CONTROL, "");
		const conditionProps = {
			controlName: controlName,
			controlType: "checkbox"
		};
		const conditionState = this.getConditionMsgState(conditionProps);

		const errorMessage = conditionState.message;
		const messageType = conditionState.messageType;
		const icon = conditionState.icon;
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;

		let controlIconContainerClass = "control-icon-container";
		if (messageType !== "info") {
			controlIconContainerClass = "control-icon-container-enabled";
		}
		var buttons = [];

		for (var i = 0; i < this.props.control.values.length; i++) {
			var val = this.props.control.values[i];
			var checked = (this.state.controlValue.indexOf(val) >= 0);
			var classType = "";
			if (this.state.validateErrorMessage && this.state.validateErrorMessage.type) {
				classType = this.state.validateErrorMessage.type;
			}
			buttons.push(<Checkbox ref={val}
				{...stateDisabled}
				className={"checkboxset-ui-conditions-state-" + classType}
				style={stateStyle}
				id={val}
				key={val + i}
				name={this.props.control.valueLabels[i]}
				onChange={this.handleChange}
				onBlur={this.validateInput}
				checked={checked}
			/>);
		}

		return (
			<div style={stateStyle}>
				<div id={controlIconContainerClass}>
					<div id={this.getControlID()} className="checkbox" style={stateStyle} >
						{buttons}
					</div>
					{icon}
				</div>
				{errorMessage}
			</div>
		);
	}
}

CheckboxsetControl.propTypes = {
	control: PropTypes.object,
	controlStates: PropTypes.object,
	validationDefinitions: PropTypes.object,
	requiredParameters: PropTypes.array,
	updateValidationErrorMessage: PropTypes.func,
	retrieveValidationErrorMessage: PropTypes.func,
	updateControlValue: PropTypes.func
};
