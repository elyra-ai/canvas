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
import { EDITOR_CONTROL } from "../constants/constants.js";
import ReactTooltip from "react-tooltip";

export default class CheckboxControl extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {
			controlValue: props.valueAccessor(props.control.name)
		};
		this.getControlValue = this.getControlValue.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(evt) {
		var newValue = evt.target.checked;
		var that = this;
		this.setState({
			controlValue: newValue
		}, function() {
			that.validateInput();
		});
		this.notifyValueChanged(this.props.control.name, newValue);
		this.props.updateControlValue(this.props.control.name, newValue);
	}

	getControlValue() {
		return this.state.controlValue;
	}

	render() {
		var checked = this.state.controlValue;
		const controlName = this.getControlID().replace(EDITOR_CONTROL, "");
		const conditionProps = {
			controlName: controlName,
			controlType: "checkbox"
		};
		const conditionState = this.getConditionMsgState(conditionProps);

		const errorMessage = conditionState.message;
		const messageType = conditionState.messageType;
		const icon = conditionState.icon;
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;

		let controlIconContainerClass = "control-icon-container";
		if (messageType !== "info") {
			controlIconContainerClass = "control-icon-container-enabled";
		}

		var cb = (<Checkbox {...stateDisabled}
			style={stateStyle}
			id={this.getControlID()}
			name={this.props.control.label.text}
			onChange={this.handleChange}
			onBlur={this.validateInput}
			checked={checked}
		/>);
		const tooltipId = "tooltip-" + this.props.control.name;
		let tooltip;
		if (this.props.control.description && conditionState.showTooltip) {
			tooltip = this.props.control.description.text;
		}
		return (
			<div className="checkbox editor_control_area" style={stateStyle}>
				<div id={controlIconContainerClass}>
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
	control: PropTypes.object,
	controlStates: PropTypes.object,
	validationDefinitions: PropTypes.array,
	updateValidationErrorMessage: PropTypes.func,
	retrieveValidationErrorMessage: PropTypes.func,
	updateControlValue: PropTypes.func
};
