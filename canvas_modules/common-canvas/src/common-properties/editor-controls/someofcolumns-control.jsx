/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import { FormControl } from "react-bootstrap";
import EditorControl from "./editor-control.jsx";
import { EDITOR_CONTROL } from "../constants/constants.js";

export default class SomeofcolumnsControl extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {
			controlValue: props.valueAccessor(props.control.name)
		};
		this.getControlValue = this.getControlValue.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(evt) {
		const values = [].filter.call(evt.target.options, function(o) {
			return o.selected;
		}).map(function(o) {
			return o.value;
		});
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
			controlType: "selection"
		};
		const conditionState = this.getConditionMsgState(conditionProps);

		const errorMessage = conditionState.message;
		const messageType = conditionState.messageType;
		const icon = conditionState.icon;
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;

		let controlIconContainerClass = "some-of-column-control-icon-container";
		if (messageType !== "info") {
			controlIconContainerClass = "some-of-column-control-icon-container-enabled";
		}

		var options = EditorControl.genColumnSelectOptions(this.props.dataModel.fields, this.state.controlValue, false);
		return (
			<div style={stateStyle}>
				<div id={controlIconContainerClass}>
					<FormControl id={this.getControlID()}
						{...stateDisabled}
						style={stateStyle}
						componentClass="select"
						multiple name={this.props.control.name}
						onChange={this.handleChange}
						onBlur={this.validateInput}
						value={this.state.controlValue}
						ref="input"
					>
						{options}
					</FormControl>
					{icon}
				</div>
				{errorMessage}
			</div>
		);
	}
}

SomeofcolumnsControl.propTypes = {
	dataModel: PropTypes.object,
	control: PropTypes.object,
	updateControlValue: PropTypes.func,
	controlStates: PropTypes.object,
	updateValidationErrorMessage: PropTypes.func,
	retrieveValidationErrorMessage: PropTypes.func,
	validationDefinitions: PropTypes.array
};
