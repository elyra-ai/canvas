/*
 * Copyright 2017-2020 IBM Corporation
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
import { TextInput } from "carbon-components-react";
import ValidationMessage from "./../../components/validation-message";
import * as ControlUtils from "./../../util/control-utils";
import moment from "moment";
import { DEFAULT_TIME_FORMAT, STATES } from "./../../constants/constants.js";
import classNames from "classnames";
import { formatMessage } from "./../../util/property-utils.js";


class TimefieldControl extends React.Component {
	constructor(props) {
		super(props);
		this.id = ControlUtils.getControlId(props.propertyId);
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

	render() {

		let displayValue = "";
		if (this.props.value) {
			const format = this.props.control.timeFormat || DEFAULT_TIME_FORMAT;
			const mom = moment.utc(this.props.value, "HH:mm:ssZ", true);

			if (mom.isValid()) {
				try {
					displayValue = mom.format(format);
				} catch (err) { // This will only happen if the caller provides something other than a string as the format.
					displayValue = formatMessage(this.props.controller.getReactIntl(), "datetimefield.format.error.message");
				}
			} else {
				displayValue = this.props.value;
			}
		}
		const className = classNames("properties-timefield", "properties-input-control", { "hide": this.props.state === STATES.HIDDEN },
			this.props.messageInfo ? this.props.messageInfo.type : null);
		return (
			<div className={className} data-id={ControlUtils.getDataId(this.props.propertyId)}>
				<TextInput
					autoComplete="off"
					id={this.id}
					disabled={this.props.state === STATES.DISABLED}
					placeholder={this.props.control.additionalText}
					onChange={this.handleChange.bind(this)}
					value={displayValue}
					labelText={this.props.control.label ? this.props.control.label.text : ""}
					hideLabel
					light
				/>
				<ValidationMessage inTable={this.props.tableControl} state={this.props.state} messageInfo={this.props.messageInfo} />
			</div>
		);
	}
}

TimefieldControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
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

export default connect(mapStateToProps, null)(TimefieldControl);
