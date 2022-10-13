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
import { Toggle } from "carbon-components-react";
import ValidationMessage from "./../../components/validation-message";
import * as ControlUtils from "./../../util/control-utils";
import { STATES, MESSAGE_KEYS } from "./../../constants/constants.js";
import classNames from "classnames";
import { formatMessage } from "./../../util/property-utils";


class ToggleControl extends React.Component {
	constructor(props) {
		super(props);
		this.id = ControlUtils.getControlId(this.props.propertyId);
	}


	handleChange(value) {
		this.props.controller.updatePropertyValue(this.props.propertyId, value);
	}

	render() {
		const overrideLabelKeyOn = `${this.props.control.name}.toggle.on.label`;
		const overrideLabelKeyOff = `${this.props.control.name}.toggle.off.label`;

		const defaultOnEditLabel = formatMessage(this.reactIntl, MESSAGE_KEYS.TOGGLE_ON_LABEL);
		const defaultOffEditLabel = formatMessage(this.reactIntl, MESSAGE_KEYS.TOGGLE_OFF_LABEL);

		const labelOn = this.props.controller.getResource(overrideLabelKeyOn, defaultOnEditLabel);
		const labelOff = this.props.controller.getResource(overrideLabelKeyOff, defaultOffEditLabel);
		const size = this.props.tableControl ? "sm" : "md";
		const toggleControl = (<Toggle
			id={this.id}
			size={size}
			disabled={this.props.state === STATES.DISABLED}
			toggled={Boolean(this.props.value)}
			labelB={labelOn}
			labelA={labelOff}
			onToggle={this.handleChange.bind(this)}
			labelText={this.props.tableControl ? null : this.props.controlItem}
		/>);
		const className = classNames("properties-toggle", { "hide": this.props.state === STATES.HIDDEN }, this.props.messageInfo ? this.props.messageInfo.type : null);
		return (
			<div className={className} data-id={ControlUtils.getDataId(this.props.propertyId)}>
				{toggleControl}
				<ValidationMessage inTable={this.props.tableControl} state={this.props.state} messageInfo={this.props.messageInfo} />
			</div>

		);
	}
}

ToggleControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	controlItem: PropTypes.element,
	tableControl: PropTypes.bool,
	state: PropTypes.string, // pass in by redux
	value: PropTypes.bool, // pass in by redux
	messageInfo: PropTypes.object // pass in by redux
};

const mapStateToProps = (state, ownProps) => ({
	value: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(ToggleControl);
