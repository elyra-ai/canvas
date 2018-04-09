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
import TextField from "ap-components-react/dist/components/TextField";
import { CHARACTER_LIMITS } from "./../../constants/constants.js";
import ControlUtils from "./../../util/control-utils";

export default class TextareaControl extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(evt) {
		let input = evt.target.value;
		if (this.props.control.valueDef && this.props.control.valueDef.isList) { // array
			input = this.splitNewlines(evt.target.value);
		}
		this.props.controller.updatePropertyValue(this.props.propertyId, input);
	}

	splitNewlines(text) {
		if (text.length > 0) {
			const split = text.split("\n");
			if (Array.isArray(split)) {
				return split;
			}
			return [split];
		}
		return [];
	}

	joinNewlines(list) {
		if (Array.isArray(list)) {
			return list.length === 0 ? [] : list.join("\n");
		}
		return list;
	}

	render() {
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		const conditionProps = {
			propertyId: this.props.propertyId,
			controlType: "textfieldbox"
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

		let value = this.joinNewlines(controlValue);
		if (value && value.toString() === "") {
			value = "";
		}

		const charLimit = ControlUtils.getCharLimit(this.props.control, CHARACTER_LIMITS.NODE_PROPERTIES_DIALOG_TEXT_AREA);
		return (
			<div className="editor_control_area" style={stateStyle}>
				<div id={controlIconContainerClass}>
					<TextField {...stateDisabled}
						style={stateStyle}
						type="textarea"
						id={ControlUtils.getControlID(this.props.control, this.props.propertyId)}
						placeholder={this.props.control.additionalText}
						onChange={this.handleChange}
						value={value}
						rows={4}
						maxCount={charLimit}
						maxLength={charLimit}
					/>
					{icon}
				</div>
				{errorMessage}
			</div>
		);
	}
}

TextareaControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired
};
