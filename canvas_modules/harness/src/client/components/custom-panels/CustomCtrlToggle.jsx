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
import { ToggleButton, Icon } from "ap-components-react/dist/ap-components-react";

export default class CustomCtrlToggle extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			controlValue: props.value
		};
		this.getControlValue = this.getControlValue.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	getControlValue() {
		return this.state.controlValue;
	}

	validateInput() {
		this.props.condition.validateCustomControl(this.props.parameter);
	}

	handleChange(evt) {
		this.setState({ controlValue: evt.target.checked });
		this.props.updateControlValue(this.props.parameter, evt.target.checked);
	}
	render() {
		const message = this.props.condition.retrieveValidationErrorMessage(this.props.parameter);
		var messageText;
		var icon;
		if (message && message.text) {
			messageText = message.text;
			if (message.type === "warning") {
				icon = (<Icon type="warning" />);
			} else if (message.type === "error") {
				icon = (<Icon type="error-o" />);
			}
		}
		const state = this.props.condition.getControlState(this.props.parameter);
		var visibility;
		var disabled = false;
		if (state === "hidden") {
			visibility = { visibility: "hidden" };
		} else if (state === "disabled") {
			disabled = true;
		}
		return (
			<div style={visibility}>
				<div className="custom-toggle" >
					<ToggleButton
						disabled={disabled}
						id={this.props.parameter}
						checked={this.state.controlValue}
						onChange={this.handleChange}
					/>
					<div className="text">Toggle</div>
					<div className="icon">
						{icon}
					</div>
				</div>
				{messageText}
			</div>
		);
	}
}

CustomCtrlToggle.propTypes = {
	value: PropTypes.bool,
	parameter: PropTypes.string.isRequired,
	updateControlValue: PropTypes.func.isRequired,
	condition: PropTypes.object
};
