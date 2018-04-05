/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

// DEPRECATED CONTROL. Replaced by selectcolumn
import React from "react";
import PropTypes from "prop-types";
import FormControl from "react-bootstrap/lib/FormControl";
import ControlUtils from "./../../util/control-utils";

export default class OneofcolumnsControl extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(evt) {
		this.props.controller.updatePropertyValue(this.props.propertyId, evt.target.value);
	}

	genColumnSelectOptions(selectedValues, includeEmpty) {
		const options = [];
		options.push(
			<option key={-1} disabled value={""}>...</option>
		);
		for (var i = 0; i < this.props.fields.length; i++) {
			options.push(
				<option key={i} value={this.props.fields[i].name}>{this.props.fields[i].name}</option>
			);
		}
		return options;
	}

	render() {
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		const conditionProps = {
			propertyId: this.props.propertyId,
			controlType: "selection"
		};
		const conditionState = ControlUtils.getConditionMsgState(this.props.controller, conditionProps);

		const errorMessage = conditionState.message;
		const messageType = conditionState.messageType;
		const icon = conditionState.icon;
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;

		let controlIconContainerClass = "control-icon-container";
		if (messageType !== "info") {
			controlIconContainerClass = "control-icon-container-enabled";
		}

		const options = this.genColumnSelectOptions([controlValue], true);

		return (
			<div style={stateStyle}>
				<div id={controlIconContainerClass}>
					<FormControl id={ControlUtils.getControlID(this.props.control, this.props.propertyId)}
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
	fields: PropTypes.array.isRequired,
	control: PropTypes.object.isRequired,
	controller: PropTypes.object,
	propertyId: PropTypes.object
};
