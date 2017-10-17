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
import { Slider } from "ap-components-react/dist/ap-components-react";

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
		this.setState({ controlValue: val });
		this.props.updateControlValue(this.props.parameter, val);
	}
	render() {
		return (
			<div className="custom-slider">
				<Slider
					onChange={this.handleChange}
					start={this.state.controlValue}
					lower={0}
					upper={100}
					step={1}
				/>
			</div>
		);
	}
}

CustomCtrlSlider.propTypes = {
	value: PropTypes.string,
	parameter: PropTypes.string.isRequired,
	updateControlValue: PropTypes.func.isRequired
};
