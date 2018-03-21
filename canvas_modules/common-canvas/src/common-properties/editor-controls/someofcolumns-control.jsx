/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

// DEPRECATED control oneofcolumns
import React from "react";
import PropTypes from "prop-types";
import FormControl from "react-bootstrap/lib/FormControl";
import EditorControl from "./editor-control.jsx";

export default class SomeofcolumnsControl extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {
		};
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(evt) {
		const values = [].filter.call(evt.target.options, function(o) {
			return o.selected;
		}).map(function(o) {
			return o.value;
		});
		this.props.controller.updatePropertyValue(this.props.propertyId, values);
	}

	genColumnSelectOptions(selectedValues) {
		const options = [];
		for (let i = 0; i < this.props.fields.length; i++) {
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
		const conditionState = this.getConditionMsgState(conditionProps);

		const errorMessage = conditionState.message;
		const messageType = conditionState.messageType;
		const icon = conditionState.icon;
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;

		let controlIconContainerClass = "some-of-column-control-icon-container";
		if (messageType !== "info") {
			controlIconContainerClass = "some-of-column-control-icon-container-enabled";
		}

		const options = this.genColumnSelectOptions(controlValue);
		return (
			<div style={stateStyle}>
				<div id={controlIconContainerClass}>
					<FormControl id={this.getControlID()}
						{...stateDisabled}
						style={stateStyle}
						componentClass="select"
						multiple name={this.props.control.name}
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

SomeofcolumnsControl.propTypes = {
	fields: PropTypes.array.isRequired,
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired
};
