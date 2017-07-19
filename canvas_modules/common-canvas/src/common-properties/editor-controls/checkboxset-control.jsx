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
import { Checkbox } from "ap-components-react/dist/ap-components-react";
import EditorControl from "./editor-control.jsx";

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
		// logger.info("CheckboxsetControl.handleChange()");
		// logger.info(evt.target);
		// logger.info(evt.target.id);
		// logger.info(evt.target.checked);

		var values = this.state.controlValue;
		var index = values.indexOf(evt.target.id);

		// logger.info("Checkboxset: orig values");
		// logger.info(values);
		// logger.info(index);

		if (evt.target.checked && index < 0) {
			// Add to values
			values = values.concat(evt.target.id);
		}
		if (!(evt.target.checked) && index >= 0) {
			// Remove from values
			values.splice(index, 1);
		}
		// logger.info("Checkboxset: new values");
		// logger.info(values);

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
				name={this.props.control.valueLabels[i]}
				onChange={this.handleChange}
				checked={checked}
			/>);
		}

		return (
			<div style={stateStyle}>
				<div id={this.getControlID()}
					className="checkbox"
					style={stateStyle}
				>
					{buttons}
				</div>
				{errorMessage}
			</div>
		);
	}
}

CheckboxsetControl.propTypes = {
	control: React.PropTypes.object,
	controlStates: React.PropTypes.object,
	validationDefinitions: React.PropTypes.object,
	updateValidationErrorMessage: React.PropTypes.func,
	retrieveValidationErrorMessage: React.PropTypes.func,
	updateControlValue: React.PropTypes.func
};
