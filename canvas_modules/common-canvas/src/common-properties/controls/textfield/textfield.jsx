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
import ControlUtils from "./../../util/control-utils";
import { CHARACTER_LIMITS } from "./../../constants/constants.js";

export default class TextfieldControl extends React.Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
		this.keyPress = this.keyPress.bind(this);
	}

	handleChange(evt) {
		this.props.controller.updatePropertyValue(this.props.propertyId, evt.target.value);
	}

	keyPress(e) {
		if (e.keyCode === 13) {
			// See: https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/issues/819
			e.preventDefault();
		}
	}

	render() {
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		const value = controlValue ? controlValue : "";

		const conditionProps = {
			propertyId: this.props.propertyId,
			controlType: "textfield"
		};
		const conditionState = ControlUtils.getConditionMsgState(this.props.controller, conditionProps);

		const errorMessage = this.props.tableControl ? null : conditionState.message;
		const messageType = conditionState.messageType;
		const icon = this.props.tableControl ? <div /> : conditionState.icon;
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;
		stateStyle.paddingBottom = "2px";

		let controlIconContainerClass = "control-icon-container";
		if (messageType !== "info") {
			controlIconContainerClass = "control-icon-container-enabled";
		}

		let charLimit;
		if (!this.props.tableControl) {
			charLimit = ControlUtils.getCharLimit(this.props.control, CHARACTER_LIMITS.NODE_PROPERTIES_DIALOG_TEXT_FIELD);
		}
		return (
			<div className="editor_control_area" style={stateStyle}>
				<div id={controlIconContainerClass}>
					<TextField {...stateDisabled}
						style={stateStyle}
						id={ControlUtils.getControlID(this.props.control, this.props.propertyId)}
						disabledPlaceholderAnimation
						placeholder={this.props.control.additionalText}
						onChange={this.handleChange}
						onKeyDown={this.keyPress}
						value={value}
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

TextfieldControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	tableControl: PropTypes.bool
};
