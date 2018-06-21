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
import isEmpty from "lodash/isEmpty";
import Checkbox from "carbon-components-react/lib/components/Checkbox";
import ValidationMessage from "./../../components/validation-message";
import ControlUtils from "./../../util/control-utils";
import { TOOL_TIP_DELAY, STATES } from "./../../constants/constants.js";
import Tooltip from "./../../../tooltip/tooltip.jsx";
import uuid4 from "uuid/v4";
import classNames from "classnames";

export default class CheckboxControl extends React.Component {

	constructor(props) {
		super(props);
		this.id = ControlUtils.getControlId(this.props.propertyId);
	}

	handleChange(value) {
		this.props.controller.updatePropertyValue(this.props.propertyId, value);
	}

	render() {
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		const state = this.props.controller.getControlState(this.props.propertyId);

		const label = this.props.control.label ? this.props.control.label.text : "";
		const tooltipId = uuid4() + "-tooltip-" + this.props.control.name;
		let tooltip = "";
		if (this.props.control.description && !(state === STATES.DISABLED || state === STATES.HIDDEN) && !this.props.tableControl) {
			tooltip = (
				<span >{this.props.control.description.text}</span>
			);
		}
		return (
			<div className={classNames("properties-checkbox", { "hide": state === STATES.HIDDEN })} data-id={ControlUtils.getDataId(this.props.propertyId)} >
				<div className="properties-tooltips-container">
					<Tooltip
						id={tooltipId}
						tip={tooltip}
						direction="right"
						delay={TOOL_TIP_DELAY}
						className="properties-tooltips"
						disable={isEmpty(tooltip)}
					>
						<Checkbox
							disabled={state === STATES.DISABLED}
							id={this.id}
							labelText={label}
							onChange={this.handleChange.bind(this)}
							checked={Boolean(controlValue)}
							hideLabel={this.props.tableControl}
						/>
					</Tooltip>
				</div>
				<ValidationMessage inTable={this.props.tableControl} state={state} messageInfo={this.props.controller.getErrorMessage(this.props.propertyId)} />
			</div>
		);
	}
}

CheckboxControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	tableControl: PropTypes.bool
};
