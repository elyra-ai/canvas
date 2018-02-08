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
import EditorControl from "./editor-control.jsx";

export default class RadiosetControl extends EditorControl {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(evt) {
		if (this.props.control.valueDef.propType === "boolean") {
			this.props.controller.updatePropertyValue(this.props.propertyId, (evt.target.value === "true"));
		} else if (this.props.control.valueDef.propType === "integer" ||
							this.props.control.valueDef.propType === "long"	||
						this.props.control.valueDef.propType === "double") {
			const targetNumberValue = Number(evt.target.value);
			this.props.controller.updatePropertyValue(this.props.propertyId, targetNumberValue);
		} else {
			this.props.controller.updatePropertyValue(this.props.propertyId, evt.target.value);
		}
	}

	render() {
		var controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		const conditionProps = {
			propertyId: this.props.propertyId,
			controlType: "checkbox"
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

		var buttons = [];
		let cssClasses = "control";
		let cssIndicator;
		if (stateDisabled.disabled === true) {
			cssIndicator = "control__indicator nohover";
		} else {
			cssIndicator = "control__indicator";
		}
		if (this.props.control.orientation === "vertical") {
			cssClasses += " control-radio-block";
			cssIndicator += " control__indicator-block";
		}

		if (!this.props.control.values && this.props.control.controlType === "radioset") {
			this.props.control.values = [true, false];
			this.props.control.valueLabels = ["true", "false"];
		}
		for (var i = 0; i < this.props.control.values.length; i++) {
			var val = this.props.control.values[i];
			var checked = val === controlValue;
			buttons.push(
				<label key={i} className={cssClasses}>
					<input type="radio"
						{...stateDisabled}
						name={this.props.control.name}
						value={val}
						onChange={this.handleChange}
						checked={checked}
					/>
					{this.props.control.valueLabels[i]}
					<div className={cssIndicator} />
				</label>
			);
		}
		return (
			<div id={this.getControlID()} className="radio" style={stateStyle} >
				<div id={controlIconContainerClass} >
					<div id="radioset-control-container">{buttons}</div>
					{icon}
				</div>
				{errorMessage}
			</div>
		);
	}
}

RadiosetControl.propTypes = {
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	control: PropTypes.object.isRequired
};
