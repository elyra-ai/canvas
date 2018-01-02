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
import Icon from "ap-components-react/dist/components/Icon";
import ToggleButton from "ap-components-react/dist/components/ToggleButton";

export default class CustomToggleCtrl extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(evt) {
		this.props.controller.updatePropertyValue(this.props.propertyId, evt.target.checked);
	}
	render() {
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		const message = this.props.controller.getErrorMessage(this.props.propertyId);
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
		const state = this.props.controller.getControlState(this.props.propertyId);
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
						id={this.props.propertyId.name}
						checked={controlValue}
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

CustomToggleCtrl.propTypes = {
	controller: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired
};
