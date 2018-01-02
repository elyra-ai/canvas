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
import TextField from "ap-components-react/dist/components/TextField";
import EditorControl from "./editor-control.jsx";

export default class NumberfieldControl extends EditorControl {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
		this.clearValue = this.clearValue.bind(this);
	}
	componentWillMount() {
		// needed since in a number like 10.0 the .0 is stripped off so users couldn't enter 10.02
		this.stringValue = "";
		const numValue = this.props.controller.getPropertyValue(this.props.propertyId);
		if (typeof numValue !== "undefined" && numValue !== null) {
			this.stringValue = numValue.toString();
		}
	}

	handleChange(evt) {
		// needed since in a number like 10.0 the .0 is stripped off so users couldn't enter 10.02
		this.stringValue = evt.target.value;
		var numValue = parseFloat(this.stringValue);
		if (isNaN(numValue) || (evt.target.value === "")) {
			numValue = null;
		}
		this.props.controller.updatePropertyValue(this.props.propertyId, numValue);

	}

	clearValue() {
		// number values should be null of not set
		this.props.controller.updatePropertyValue(this.props.propertyId, null);
	}

	render() {
		// needed since in a number like 10.0 the .0 is stripped off so users couldn't enter 10.02
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		// we should reset the string value in case the values was updated outside of the control
		if (parseFloat(controlValue) !== parseFloat(this.stringValue)) {
			this.stringValue = controlValue;
		}
		if (typeof this.stringValue === "undefined" || this.stringValue === null) {
			this.stringValue = "";
		}
		const conditionProps = {
			propertyId: this.props.propertyId,
			controlType: "number"
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

		return (
			<div className="editor_control_area" style={stateStyle}>
				<div id={controlIconContainerClass}>
					<TextField {...stateDisabled}
						style={stateStyle}
						type="number"
						id={this.getControlID()}
						placeholder={this.props.control.additionalText}
						disabledPlaceholderAnimation
						onChange={this.handleChange}
						value={this.stringValue}
						onReset={() => this.clearValue()}
					/>
					{icon}
				</div>
				{errorMessage}
			</div>
		);
	}
}

NumberfieldControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired
};
