/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import isEmpty from "lodash/isEmpty";
import Checkbox from "ap-components-react/dist/components/Checkbox";
import EditorControl from "./editor-control.jsx";
import { TOOL_TIP_DELAY } from "../constants/constants.js";
import Tooltip from "../../tooltip/tooltip.jsx";
import uuid4 from "uuid/v4";

export default class CheckboxControl extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {};
		this.handleChange = this.handleChange.bind(this);
		this.getControlID = this.getControlID.bind(this);
	}

	handleChange(evt) {
		this.props.controller.updatePropertyValue(this.props.propertyId, evt.target.checked);
	}
	// id needs to be unique inside of a panel.
	getControlID() {
		let id = EditorControl.prototype.getControlID.call(this);
		if (this.props.tableControl) {
			id += "_" + this.props.propertyId.name + "_" + this.props.propertyId.row + "_" + this.props.propertyId.col;
		}
		return id;
	}

	render() {
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		var checked = false;
		if (controlValue) {
			checked = controlValue.toString() === "true";
		}
		const conditionProps = {
			propertyId: this.props.propertyId,
			controlType: "checkbox"
		};
		const conditionState = this.getConditionMsgState(conditionProps);

		const errorMessage = this.props.tableControl ? null : conditionState.message;
		const messageType = conditionState.messageType;
		const icon = this.props.tableControl ? <div /> : conditionState.icon;
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;

		let controlIconContainerId = "control-icon-container";
		if (messageType !== "info") {
			controlIconContainerId = "control-icon-container-enabled";
		}

		const label = this.props.tableControl ? "" : this.props.control.label.text;
		var cb = (<Checkbox {...stateDisabled}
			style={stateStyle}
			id={this.getControlID()}
			name={label}
			onChange={this.handleChange}
			checked={checked}
		/>);
		const tooltipId = uuid4() + "-tooltip-" + this.props.control.name;
		let tooltip = "";
		if (this.props.control.description && conditionState.showTooltip && !this.props.tableControl) {
			tooltip = (
				<div className="properties-tooltips">
					{this.props.control.description.text}
				</div>
			);
		}

		return (
			<div className="checkbox editor_control_area" style={stateStyle}>
				<div id={controlIconContainerId}>
					<div>
						<div className="properties-tooltips-container">
							<Tooltip
								id={tooltipId}
								tip={tooltip}
								direction="right"
								delay={TOOL_TIP_DELAY}
								className="properties-tooltips"
								disable={isEmpty(tooltip)}
							>
								{cb}
							</Tooltip>
						</div>
					</div>
					{icon}
				</div>
				{errorMessage}
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
