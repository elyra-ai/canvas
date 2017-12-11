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
import { Checkbox } from "ap-components-react/dist/ap-components-react";
import EditorControl from "./editor-control.jsx";
import { TOOL_TIP_DELAY } from "../constants/constants.js";
import ReactTooltip from "react-tooltip";

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
		if (typeof controlValue !== "undefined" || controlValue !== null) {
			checked = controlValue.toString() === "true";
		}
		const conditionProps = {
			propertyId: this.props.propertyId,
			controlType: "checkbox"
		};
		const conditionState = this.getConditionMsgState(conditionProps);

		const errorMessage = conditionState.message;
		const messageType = conditionState.messageType;
		const icon = conditionState.icon;
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;

		let controlIconContainerId = "control-icon-container";
		if (messageType !== "info") {
			controlIconContainerId = "control-icon-container-enabled";
		}
		let containerClass = "";
		if (this.props.tableControl) {
			containerClass = "text-align-center";
		}

		const label = this.props.tableControl ? "" : this.props.control.label.text;
		var cb = (<Checkbox {...stateDisabled}
			style={stateStyle}
			id={this.getControlID()}
			name={label}
			onChange={this.handleChange}
			checked={checked}
		/>);
		const tooltipId = "tooltip-" + this.props.control.name;
		let tooltip;
		if (this.props.control.description && conditionState.showTooltip && !this.props.tableControl) {
			tooltip = this.props.control.description.text;
		}
		return (
			<div className="checkbox editor_control_area" style={stateStyle}>
				<div id={controlIconContainerId} className={containerClass}>
					<div>
						<div className="properties-tooltips-container" data-tip={tooltip} data-for={tooltipId}>
							{cb}
						</div>
						<ReactTooltip
							id={tooltipId}
							place="right"
							type="light"
							effect="solid"
							border
							className="properties-tooltips"
							delayShow={TOOL_TIP_DELAY}
						/>
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
	controller: PropTypes.object.isRequired
};
