/*
 * Copyright 2017-2023 Elyra Authors
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
import { TextInput } from "@carbon/react";
import { parse, format, isValid } from "date-fns";
import classNames from "classnames";

import ValidationMessage from "./../../components/validation-message";
import * as ControlUtils from "./../../util/control-utils";
import { DEFAULT_TIME_FORMAT, STATES } from "./../../constants/constants";

class TimefieldControl extends React.Component {
	constructor(props) {
		super(props);
		this.id = ControlUtils.getControlId(props.propertyId);

		this.value = props.value;
		if (!this.value) {
			this.value = "";
		} else {
			const date = parse(this.value, "HH:mm:ss:xxx", new Date());
			if (isValid(date)) {
				this.value = format(date, this.getTimeFormat());
			}
		}

		this.getTimeFormat = this.getTimeFormat.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	getTimeFormat() {
		const timeFormat = this.props.control.timeFormat || DEFAULT_TIME_FORMAT;
		return timeFormat;
	}

	handleChange(evt) {
		let formattedValue = null;
		this.value = "";

		if (evt.target.value) {
			this.value = evt.target.value;
			const time = parse(evt.target.value, this.getTimeFormat(), new Date());
			if (isValid(time)) {
				formattedValue = format(time, "HH:mm:ss:xxx"); // If moment is valid save as ISO format
			} else {
				formattedValue = evt.target.value; // Otherwise just save as invalid entered string
			}
		}
		this.props.controller.updatePropertyValue(this.props.propertyId, formattedValue);
	}

	render() {
		const className = classNames("properties-timefield", "properties-input-control", { "hide": this.props.state === STATES.HIDDEN },
			this.props.messageInfo ? this.props.messageInfo.type : null);
		const validationProps = ControlUtils.getValidationProps(this.props.messageInfo, this.props.tableControl);
		return (
			<div className={className} data-id={ControlUtils.getDataId(this.props.propertyId)}>
				<TextInput
					{...validationProps}
					autoComplete="off"
					id={this.id}
					disabled={this.props.state === STATES.DISABLED}
					placeholder={this.props.control.additionalText}
					onChange={this.handleChange.bind(this)}
					value={this.value}
					labelText={this.props.controlItem}
					hideLabel={this.props.tableControl}
					helperText={this.props.control.helperText}
				/>
				<ValidationMessage inTable={this.props.tableControl} tableOnly state={this.props.state} messageInfo={this.props.messageInfo} />
			</div>
		);
	}
}

TimefieldControl.propTypes = {
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

export default connect(mapStateToProps, null)(TimefieldControl);
