/*
 * Copyright 2017-2019 IBM Corporation
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
import ControlUtils from "./../../util/control-utils";
import ValidationMessage from "./../../components/validation-message";
import { STATES, TOOL_TIP_DELAY, DATA_TYPE } from "./../../constants/constants.js";
import Tooltip from "./../../../tooltip/tooltip.jsx";
import Icon from "./../../../icons/icon.jsx";
import uuid4 from "uuid/v4";
import moment from "moment";

import { ControlType } from "./../../constants/form-constants";

import classNames from "classnames";
import PropertyUtils from "./../../util/property-utils";

class ReadonlyControl extends React.Component {
	render() {
		let controlValue = this.props.value;
		if (typeof controlValue === "undefined" || controlValue === null) {
			controlValue = "";
		} else if (typeof controlValue === "object" && controlValue.link_ref) {
			controlValue = PropertyUtils.stringifyFieldValue(controlValue, this.props.control);
		} else if (Array.isArray(controlValue)) {
			// this is needed to comma separate an array of readonly strings.
			controlValue = controlValue.join(", ");
		} else if (typeof controlValue === "boolean") {
			controlValue = controlValue.toString();
		}
		if (this.props.columnDef) {
			if (this.props.columnDef.controlType === ControlType.CUSTOM) {
				controlValue = this.props.controller.getCustomControl(this.props.propertyId, this.props.columnDef, { table: true, editStyle: "summary" });
			}
		}
		if (this.props.control.controlType === ControlType.TIMESTAMP ||
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
	columnDef: PropTypes.object,
	state: PropTypes.string, // pass in by redux
	value: PropTypes.any, // pass in by redux
	messageInfo: PropTypes.object // pass in by redux
};

const mapStateToProps = (state, ownProps) => ({
	value: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(ReadonlyControl);
