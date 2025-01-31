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
import { isEmpty } from "lodash";
import { Checkbox } from "@carbon/react";
import ValidationMessage from "./../../components/validation-message";
import * as ControlUtils from "./../../util/control-utils";
import { STATES, CARBON_ICONS } from "./../../constants/constants.js";
import Tooltip from "./../../../tooltip/tooltip.jsx";
import classNames from "classnames";
import Icon from "./../../../icons/icon";

class CheckboxControl extends React.Component {

	constructor(props) {
		super(props);
		this.id = ControlUtils.getControlId(this.props.propertyId);
	}

	handleChange(evt, { checked, id }) {
		this.props.controller.updatePropertyValue(this.props.propertyId, checked);
	}

	render() {
		const label = this.props.control.label ? this.props.control.label.text : "";
		const tooltipId = "tooltip-" + this.props.control.name;
		let tooltip = "";
		if (this.props.control.description && !(this.props.state === STATES.DISABLED || this.props.state === STATES.HIDDEN) && !this.props.tableControl) {
			tooltip = (
				<span >{this.props.control.description.text}</span>
			);
			// If tooltip has a link, add propertyId in the link object
			if (this.props.control.description.link) {
				this.props.control.description.link.propertyId = this.props.propertyId;
			}
		}
		const tooltipIcon = isEmpty(tooltip) ? "" : (
			<Tooltip
				id={tooltipId}
				tip={tooltip}
				link={this.props.control.description.link ? this.props.control.description.link : null}
				tooltipLinkHandler={this.props.controller.getHandlers().tooltipLinkHandler}
				direction="bottom"
				className="properties-tooltips"
				showToolTipOnClick
			>
				<Icon type={CARBON_ICONS.INFORMATION} className="properties-control-description-icon-info" />
			</Tooltip>
		);
		const checkboxLabel = (
			<span className="properties-checkbox-label">
				{label}
			</span>
		);
		return (
			<div data-id={ControlUtils.getDataId(this.props.propertyId)}>
				<div className={classNames("properties-checkbox", { "hide": this.props.state === STATES.HIDDEN }, this.props.messageInfo ? this.props.messageInfo.type : null)}>
					<Checkbox
						disabled={this.props.state === STATES.DISABLED}
						id={this.id}
						labelText={checkboxLabel}
						onChange={this.handleChange.bind(this)}
						checked={Boolean(this.props.value)}
						hideLabel={this.props.tableControl}
						helperText={this.props.control.helperText}
						readOnly={this.props.readOnly}
						aria-label={this.props.control.labelVisible ? null : this.props.control?.label?.text}
					/>
					{tooltipIcon}
				</div>
				<ValidationMessage inTable={this.props.tableControl} state={this.props.state} messageInfo={this.props.controller.getErrorMessage(this.props.propertyId)} />
			</div>
		);
	}
}

CheckboxControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	tableControl: PropTypes.bool,
	state: PropTypes.string, // pass in by redux
	value: PropTypes.bool, // pass in by redux
	messageInfo: PropTypes.object, // pass in by redux
	readOnly: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => ({
	value: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(CheckboxControl);
