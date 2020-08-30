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
import * as ControlUtils from "./../../util/control-utils";
import ValidationMessage from "./../../components/validation-message";
import { STATES, TOOL_TIP_DELAY, DATA_TYPE } from "./../../constants/constants";
import Tooltip from "./../../../tooltip/tooltip";
import Icon from "./../../../icons/icon";
import { v4 as uuid4 } from "uuid";
import moment from "moment";
import { isEqual, intersection } from "lodash";

import { ControlType } from "./../../constants/form-constants";

import classNames from "classnames";
import { stringifyFieldValue } from "./../../util/property-utils";

class ReadonlyControl extends React.Component {
	constructor(props) {
		super(props);
		this.updateValueFromFilterEnum = this.updateValueFromFilterEnum.bind(this);
	}

	componentDidMount() {
		this.updateValueFromFilterEnum(true);
	}

	componentDidUpdate(prevProps) {
		// only update if filter options have changed. Fixes issue where filter options are updated after value in setProperties
		if (!isEqual(this.props.controlOpts, prevProps.controlOpts)) {
			this.updateValueFromFilterEnum();
		}
	}

	// this is needed in order to reset the property value when a value is filtered out.
	updateValueFromFilterEnum(skipValidateInput) {
		// update property value if value isn't in current enum value.  Don't filter custom control values.
		if (Array.isArray(this.props.value) && Array.isArray(this.props.controlOpts.values) && this.props.control.controlType !== ControlType.CUSTOM) {
			const newValue = intersection(this.props.value, this.props.controlOpts.values);
			if (!isEqual(this.props.value, newValue)) {
				this.props.controller.updatePropertyValue(this.props.propertyId, newValue, skipValidateInput);
			}
		}
	}

	render() {
		let controlValue = this.props.value;

		// Use label for controlValue if possible
		if (this.props.control.values && this.props.control.valueLabels) {
			const controlIndex = this.props.control.values.indexOf(this.props.value);
			if (controlIndex > -1 && this.props.control.valueLabels[controlIndex]) {
				controlValue = this.props.control.valueLabels[controlIndex];
			}
		}
		if (typeof controlValue === "undefined" || controlValue === null) {
			controlValue = "";
		} else if (typeof controlValue === "object" && controlValue.link_ref) {
			controlValue = stringifyFieldValue(controlValue, this.props.control);
		} else if (Array.isArray(controlValue)) {
			// this is needed to comma separate an array of readonly strings.
			controlValue = controlValue.join(", ");
		} else if (typeof controlValue === "boolean") {
			controlValue = controlValue.toString();
		}
		if (this.props.control.controlType === ControlType.CUSTOM) {
			controlValue = this.props.controller.getCustomControl(this.props.propertyId, this.props.control, { table: true, editStyle: "summary" });
		} else if (this.props.control.controlType === ControlType.TIMESTAMP ||
			(this.props.control.valueDef && this.props.control.valueDef.propType === DATA_TYPE.TIMESTAMP)) {
			const mom = moment(controlValue); // timestamp in ms
			if (mom.isValid()) {
				controlValue = mom.format("LLLL");
			} else {
				controlValue = ""; // invalid timestamp
			}
		}
		const readOnly = <span className="properties-field-type" disabled={this.props.state === STATES.DISABLED}>{controlValue}</span>;
		let display = readOnly;
		if (this.props.tableControl) {
			const tooltipId = uuid4() + "-tooltip-column-" + this.props.propertyId.toString();
			let disabled = true;
			if (controlValue) {
				disabled = false;
			}
			const tooltip = (
				<div className="properties-tooltips">
					{String(controlValue)}
				</div>
			);
			let content = readOnly;
			if (this.props.control.icon) {
				content = (
					<div className={"properties-field-readonly"}>
						<div className={"properties-field-type-icon"}>
							<Icon type={this.props.control.icon} />
						</div>
						{readOnly}
					</div>);
			}
			display = (<Tooltip
				id={tooltipId}
				tip={tooltip}
				direction="top"
				delay={TOOL_TIP_DELAY}
				className="properties-tooltips"
				disable={disabled}
			>
				{content}
			</Tooltip>);
		}
		return (
			<div
				className={classNames("properties-readonly", { "hide": this.props.state === STATES.HIDDEN })}
				data-id={ControlUtils.getDataId(this.props.propertyId)}
			>
				{display}
				<ValidationMessage inTable={this.props.tableControl} state={this.props.state} messageInfo={this.props.messageInfo} />
			</div>
		);
	}
}

ReadonlyControl.propTypes = {
	icon: PropTypes.string,
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	tableControl: PropTypes.bool,
	state: PropTypes.string, // pass in by redux
	value: PropTypes.any, // pass in by redux
	controlOpts: PropTypes.oneOfType([
		PropTypes.object,
		PropTypes.array
	]), // pass in by redux
	messageInfo: PropTypes.object // pass in by redux
};

const mapStateToProps = (state, ownProps) => {
	const props = {
		value: ownProps.controller.getPropertyValue(ownProps.propertyId),
		state: ownProps.controller.getControlState(ownProps.propertyId),
		messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId)
	};
	props.controlOpts = ownProps.controller.getFilteredEnumItems(ownProps.propertyId, ownProps.control);
	return props;
};

export default connect(mapStateToProps, null)(ReadonlyControl);
