/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import Icon from "carbon-components-react/lib/components/Icon";
import Toggle from "carbon-components-react/lib/components/Toggle";
import ToggleSmall from "carbon-components-react/lib/components/ToggleSmall";

export default class CustomToggleCtrl extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(checked) {
		this.props.controller.updatePropertyValue(this.props.propertyId, checked);
	}
	render() {
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		const message = this.props.controller.getErrorMessage(this.props.propertyId);
		let messageText;
		let icon;
		if (message && message.text && !this.props.table) {
			messageText = message.text;
			if (message.type === "warning") {
				icon = (<Icon className="warning" name="warning--glyph" />);
			} else if (message.type === "error") {
				icon = (<Icon className="error" name="error--glyph" />);
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
		let id = this.props.propertyId.name;
		if (typeof this.props.propertyId.row !== "undefined") {
			id += "_" + this.props.propertyId.row;
			if (typeof this.props.propertyId.col !== "undefined") {
				id += "_" + this.props.propertyId.col;
			}
		}
		let toggle = (
			<Toggle
				disabled={disabled}
				id={id}
				toggled={controlValue}
				onToggle={this.handleChange}
			/>
		);
		if (this.props.table) {
			toggle = (<ToggleSmall
				disabled={disabled}
				id={id}
				toggled={controlValue}
				onToggle={this.handleChange}
			/>);
		}
		return (
			<div style={visibility}>
				<div className="custom-toggle" >
					{toggle}
				</div>
				<div className="condition">
					<div className="icon">{icon}</div>
					<div>{messageText}</div>
				</div>
			</div>
		);
	}
}

CustomToggleCtrl.propTypes = {
	controller: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	table: PropTypes.bool
};
