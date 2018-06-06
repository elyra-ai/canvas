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
import TextInput from "carbon-components-react/lib/components/TextInput";
import ValidationMessage from "./../../components/validation-message";
import ControlUtils from "./../../util/control-utils";
import { STATES } from "./../../constants/constants.js";
import classNames from "classnames";

export default class PasswordControl extends React.Component {

	handleChange(evt) {
		this.props.controller.updatePropertyValue(this.props.propertyId, evt.target.value);
	}

	render() {
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		const value = controlValue ? controlValue : "";
		const state = this.props.controller.getControlState(this.props.propertyId);
		const messageInfo = this.props.controller.getErrorMessage(this.props.propertyId);

		const className = classNames("properties-pwdfield", "properties-input-control", { "hide": state === STATES.HIDDEN }, messageInfo ? messageInfo.type : null);

		return (
			<div className={className} data-id={ControlUtils.getDataId(this.props.propertyId)}>
				<TextInput
					autoComplete="off"
					id={ControlUtils.getControlId(this.props.propertyId)}
					disabled={state === STATES.DISABLED}
					placeholder={this.props.control.additionalText}
					onChange={this.handleChange.bind(this)}
					value={value}
					labelText={this.props.control.label ? this.props.control.label.text : ""}
					hideLabel
					type="password"
				/>
				<ValidationMessage inTable={this.props.tableControl} state={state} messageInfo={messageInfo} />
			</div>);
	}
}

PasswordControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	tableControl: PropTypes.bool
};
