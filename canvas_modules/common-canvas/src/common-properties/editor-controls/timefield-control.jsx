/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import TextField from "ap-components-react/dist/components/TextField";
import EditorControl from "./editor-control.jsx";
import moment from "moment/min/moment.min.js";
import { DEFAULT_TIME_FORMAT } from "../constants/constants.js";

export default class TimefieldControl extends EditorControl {
	constructor(props) {
		super(props);
		this.stringValue = null;
		this.handleChange = this.handleChange.bind(this);
		this.clearValue = this.clearValue.bind(this);
	}

	handleChange(evt) {
		let stringValue = null;

		if (evt.target.value) {
			const format = this.props.control.timeFormat || DEFAULT_TIME_FORMAT;
			const mom = moment.utc(evt.target.value, format, true);
			if (mom.isValid()) {
				stringValue = mom.format("HH:mm:ssZ"); // If moment is valid save as ISO format
			} else {
				stringValue = evt.target.value; // Otherwise just save as invalid entered string
			}
		} else {
			stringValue = null;
		}

		this.props.controller.updatePropertyValue(this.props.propertyId, stringValue);
	}

	clearValue() {
		this.props.controller.updatePropertyValue(this.props.propertyId, null);
	}

	render() {
		const stringValue = this.props.controller.getPropertyValue(this.props.propertyId);

		const conditionProps = {
			propertyId: this.props.propertyId,
			controlType: "time"
		};
		const conditionState = this.getConditionMsgState(conditionProps);

		const errorMessage = this.props.tableControl ? null : conditionState.message;
		const messageType = conditionState.messageType;
		const icon = this.props.tableControl ? <div /> : conditionState.icon;
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;

		let controlIconContainerClass = "control-icon-container";
		if (messageType !== "info") {
			controlIconContainerClass = "control-icon-container-enabled";
		}

		let displayValue = "";
		if (stringValue) {
			const format = this.props.control.timeFormat || DEFAULT_TIME_FORMAT;
			const mom = moment.utc(stringValue, "HH:mm:ssZ", true);

			if (mom.isValid()) {
				try {
					displayValue = mom.format(format);
				} catch (err) { // This will only happen if the caller provides something other than a string as the format.
					displayValue = "Invalid format object provided. Check input definitions.";
				}
			} else {
				displayValue = stringValue;
			}
		}

		return (
			<div className="editor_control_area" style={stateStyle}>
				<div id={controlIconContainerClass}>
					<TextField {...stateDisabled}
						style={stateStyle}
						type="text"
						id={this.getControlID()}
						placeholder={this.props.control.additionalText}
						disabledPlaceholderAnimation
						onChange={this.handleChange}
						value={displayValue}
						onReset={() => this.clearValue()}
					/>
					{icon}
				</div>
				{errorMessage}
			</div>
		);
	}
}

TimefieldControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired
};
