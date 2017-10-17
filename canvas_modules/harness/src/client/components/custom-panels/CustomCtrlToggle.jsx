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
import { ToggleButton } from "ap-components-react/dist/ap-components-react";

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
	handleChange(evt) {
		this.setState({ controlValue: evt.target.checked });
		this.props.updateControlValue(this.props.parameter, evt.target.checked);
	}
	render() {
		return (
			<div className="custom-toggle">
				<ToggleButton
					id={this.props.parameter}
					checked={this.state.controlValue}
					onChange={this.handleChange}
				/>
				<div className="text">{"Toggle"}</div>
			</div>
		);
	}
}

CustomCtrlToggle.propTypes = {
	value: PropTypes.bool,
	parameter: PropTypes.string.isRequired,
	updateControlValue: PropTypes.func.isRequired
};
