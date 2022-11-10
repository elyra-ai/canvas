/*
 * Copyright 2017-2022 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { PasswordInput, Form } from "carbon-components-react";
import ValidationMessage from "./../../components/validation-message";
import * as ControlUtils from "./../../util/control-utils";
import { STATES, MESSAGE_KEYS } from "./../../constants/constants.js";
import classNames from "classnames";

import { formatMessage } from "./../../util/property-utils";
class PasswordControl extends React.Component {
	constructor(props) {
		super(props);
		this.id = ControlUtils.getControlId(this.props.propertyId);
	}

	handleChange(evt) {
		this.props.controller.updatePropertyValue(this.props.propertyId, evt.target.value);
	}

	render() {
		const overrideShowPasswordLabel = `${this.props.control.name}.password.showPasswordLabel.tooltip`;
		const overrideHidePasswordLabel = `${this.props.control.name}.password.hidePasswordLabel.tooltip`;
		const defaultShowLabel = formatMessage(this.reactIntl, MESSAGE_KEYS.SHOW_PASSWORD_TOOLTIP);
		const defaultHidelabel = formatMessage(this.reactIntl, MESSAGE_KEYS.HIDE_PASSWORD_TOOLTIP);

		const showPassword = this.props.controller.getResource(overrideShowPasswordLabel, defaultShowLabel);
		const hidePassword = this.props.controller.getResource(overrideHidePasswordLabel, defaultHidelabel);

		const value = this.props.value ? this.props.value : "";
		const className = classNames("properties-pwdfield", "properties-input-control", { "hide": this.props.state === STATES.HIDDEN },
			this.props.messageInfo ? this.props.messageInfo.type : null);
		const validationProps = ControlUtils.getValidationProps(this.props.messageInfo, this.props.tableControl);
		return (
			<div className={className} data-id={ControlUtils.getDataId(this.props.propertyId)}>
				<Form>
					<PasswordInput
						{...validationProps}
						autoComplete="off"
						id={this.id}
						disabled={this.props.state === STATES.DISABLED}
						placeholder={this.props.control.additionalText}
						onChange={this.handleChange.bind(this)}
						value={value}
						labelText={this.props.controlItem}
						hideLabel={this.props.tableControl}
						light={this.props.controller.getLight() && !this.props.control.light}
						tooltipAlignment="end"
						showPasswordLabel={showPassword ? showPassword : "Show password"}
						hidePasswordLabel={hidePassword ? hidePassword : "Hide password"}
					/>
				</Form>
				<ValidationMessage inTable={this.props.tableControl} tableOnly state={this.props.state} messageInfo={this.props.messageInfo} />
			</div>);
	}
}

PasswordControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	controlItem: PropTypes.element,
	tableControl: PropTypes.bool,
	state: PropTypes.string, // pass in by redux
	value: PropTypes.string, // pass in by redux
	messageInfo: PropTypes.object // pass in by redux
};

const mapStateToProps = (state, ownProps) => ({
	value: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(PasswordControl);
