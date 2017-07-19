/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import { FormControl } from "react-bootstrap";
import EditorControl from "./editor-control.jsx";
import ReactDOM from "react-dom";

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
		const select = ReactDOM.findDOMNode(this.refs.input);
		const values = [].filter.call(select.options, function(o) {
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
		const controlName = this.getControlID().split(".")[1];
		const conditionProps = {
			controlName: controlName,
			controlType: "selection"
		};
		const conditionState = this.getConditionMsgState(conditionProps);

		const errorMessage = conditionState.message;
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;

		var options = EditorControl.genColumnSelectOptions(this.props.dataModel.fields, this.state.controlValue, false);
		return (
			<div style={stateStyle}>
				<FormControl id={this.getControlID()}
					{...stateDisabled}
					style={stateStyle}
					componentClass="select"
					multiple name={this.props.control.name}
					help={this.props.control.additionalText}
					onChange={this.handleChange}
					value={this.state.controlValue}
					ref="input"
				>
					{options}
				</FormControl>
				{errorMessage}
			</div>
		);
	}
}

SomeofcolumnsControl.propTypes = {
	dataModel: React.PropTypes.object,
	control: React.PropTypes.object,
	updateControlValue: React.PropTypes.func,
	controlStates: React.PropTypes.object,
	updateValidationErrorMessage: React.PropTypes.func,
	retrieveValidationErrorMessage: React.PropTypes.func,
	validationDefinitions: React.PropTypes.object
};
