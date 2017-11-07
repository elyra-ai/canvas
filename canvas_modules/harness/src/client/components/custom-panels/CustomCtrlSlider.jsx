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
import { Slider, Icon } from "ap-components-react/dist/ap-components-react";

export default class CustomCtrlSlider extends React.Component {
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

	handleChange(evt, val) {
		var message;
		if (parseInt(val, 10) > 60 && parseInt(val, 10) <= 90) {
			message = { type: "warning", text: "Slider greater then 60" };
		} else if (parseInt(val, 10) > 90) {
			message = { type: "error", text: "Slider greater then 90" };
		}
		this.props.condition.updateValidationErrorMessage(this.props.parameter, message);
		this.setState({ controlValue: val });
		this.props.updateControlValue(this.props.parameter, val);
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
		return (
			<div>
				<div className="custom-slider">
					<div className="slider">
						<Slider
							onChange={this.handleChange}
							start={this.state.controlValue}
							lower={0}
							upper={100}
							step={1}
						/>
					</div>
					<div className="icon">
						{icon}
					</div>
				</div>
				<div style={{ "marginTop": "-15px" }}>
					{messageText}
				</div>
			</div>
		);
	}
}

CustomCtrlSlider.propTypes = {
	value: PropTypes.string,
	parameter: PropTypes.string.isRequired,
	updateControlValue: PropTypes.func.isRequired,
	condition: PropTypes.object
};
