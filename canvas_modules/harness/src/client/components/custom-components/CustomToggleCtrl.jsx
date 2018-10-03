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
import { connect } from "react-redux";

class CustomToggleCtrl extends React.Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(checked) {
		this.props.controller.updatePropertyValue(this.props.propertyId, checked);
	}
	render() {
		let messageText;
		let icon;
		if (this.props.messageInfo && this.props.messageInfo.text && !this.props.table) {
			messageText = this.props.messageInfo.text;
			if (this.props.messageInfo.type === "warning") {
				icon = (<Icon className="warning" name="warning--glyph" />);
			} else if (this.props.messageInfo.type === "error") {
				icon = (<Icon className="error" name="error--glyph" />);
			}
		}
		let visibility;
		let disabled = false;
		if (this.props.state === "hidden") {
			visibility = { visibility: "hidden" };
		} else if (this.props.state === "disabled") {
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
				toggled={this.props.controlValue}
				onToggle={this.handleChange}
			/>
		);
		if (this.props.table) {
			toggle = (<ToggleSmall
				disabled={disabled}
				id={id}
				toggled={this.props.controlValue}
				onToggle={this.handleChange}
				ariaLabel={"toggle"}
			/>);
		}
		return (
			<div style={visibility}>
				<div className="harness-custom-control-custom-toggle" >
					{toggle}
				</div>
				<div className="harness-custom-control-condition">
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
	table: PropTypes.bool,
	state: PropTypes.string, // pass in by redux
	controlValue: PropTypes.bool, // pass in by redux
	messageInfo: PropTypes.object // pass in by redux
};

const mapStateToProps = (state, ownProps) => ({
	controlValue: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(CustomToggleCtrl);
