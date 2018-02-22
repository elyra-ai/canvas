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
import EditorControl from "./editor-control.jsx";

export default class RadiosetControl extends EditorControl {
	constructor(props) {
		super(props);
		this.setEmptySelection = false;
		this.handleChange = this.handleChange.bind(this);
	}

	componentDidMount() {
		if (this.setEmptySelection) {
			this.setEmptySelection = false;
			this.props.controller.updatePropertyValue(this.props.propertyId, "");
		}
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
		let wasChecked = false;
		const valueSet = this.props.controller.getFilteredEnumItems(this.props.propertyId, this.props.control);
		for (var i = 0; i < valueSet.values.length; i++) {
			var val = valueSet.values[i];
			var checked = val === controlValue;
			wasChecked = wasChecked || checked;
			buttons.push(
				<label key={i} className={cssClasses}>
					<input type="radio"
						{...stateDisabled}
						name={this.props.control.name}
						value={val}
						onChange={this.handleChange}
						checked={checked}
					/>
					{valueSet.valueLabels[i]}
					<div className={cssIndicator} />
				</label>
			);
		}
		if (controlValue && controlValue.length > 0 && !wasChecked) {
			this.setEmptySelection = true;
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
