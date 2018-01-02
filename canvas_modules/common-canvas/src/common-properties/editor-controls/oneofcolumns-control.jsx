/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

// DEPRECATED CONTROL oneofcolumns
import React from "react";
import PropTypes from "prop-types";
import FormControl from "react-bootstrap/lib/FormControl";
import EditorControl from "./editor-control.jsx";

export default class OneofcolumnsControl extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {
		};
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(evt) {
		this.props.controller.updatePropertyValue(this.props.propertyId, evt.target.value);
	}

	render() {
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		const conditionProps = {
			propertyId: this.props.propertyId,
			controlType: "selection"
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

		var options = EditorControl.genColumnSelectOptions(this.props.dataModel.fields, [controlValue], true);

		return (
			<div style={stateStyle}>
				<div id={controlIconContainerClass}>
					<FormControl id={this.getControlID()}
						{...stateDisabled}
						style={stateStyle}
						componentClass="select"
						name={this.props.control.name}
						onChange={this.handleChange}
						value={controlValue}
						ref="input"
					>
						{options}
					</FormControl>
					{icon}
				</div>
				{errorMessage}
			</div>
		);
	}
}

OneofcolumnsControl.propTypes = {
	dataModel: PropTypes.object.isRequired,
	control: PropTypes.object.isRequired,
	controller: PropTypes.object,
	propertyId: PropTypes.object
};
