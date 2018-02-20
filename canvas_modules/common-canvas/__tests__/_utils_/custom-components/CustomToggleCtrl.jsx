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
		let messageText = <div />;
		let iconContainer = <div className="icon" />;
		if (message && message.text && !this.props.table) {
			messageText = message.text;
			let icon = <div />;
			if (message.type === "warning") {
				icon = (<Icon type="warning" />);
			} else if (message.type === "error") {
				icon = (<Icon type="error-o" />);
			}
			iconContainer = (<div className="icon">{icon}</div>);
		}
		const state = this.props.controller.getControlState(this.props.propertyId);
		var visibility;
		var disabled = false;
		if (state === "hidden") {
			visibility = { visibility: "hidden" };
		} else if (state === "disabled") {
			disabled = true;
		}
		let label = <div className="text" />;
		if (!this.props.table) {
			label = (<div className="text">Toggle</div>);
		}
		let id = this.props.propertyId.name;
		if (typeof this.props.propertyId.row !== "undefined") {
			id += "_" + this.props.propertyId.row;
			if (typeof this.props.propertyId.col !== "undefined") {
				id += "_" + this.props.propertyId.col;
			}
		}
		return (
			<div style={visibility}>
				<div className="custom-toggle" >
					<ToggleButton
						disabled={disabled}
						id={id}
						checked={controlValue}
						onChange={this.handleChange}
					/>
					{label}
					{iconContainer}
				</div>
				{messageText}
			</div>
		);
	}
}

CustomToggleCtrl.propTypes = {
	controller: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	table: PropTypes.bool
};
