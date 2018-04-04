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
import EditorControl from "./editor-control.jsx";
import ConditionsUtils from "../ui-conditions/conditions-utils.js";
import { ORIENTATIONS, STATES } from "../constants/constants.js";

export default class RadiosetControl extends EditorControl {
	constructor(props) {
		super(props);
		this.setEmptySelection = false;
		this.handleChange = this.handleChange.bind(this);
	}

	componentDidMount() {
		if (this.setEmptySelection) {
			this.setEmptySelection = false;
			this.props.controller.updatePropertyValue(this.props.propertyId, "");
		}
		const val = this.props.controller.getPropertyValue(this.props.propertyId);
		this.setEnabledStateOfOptionalPanels(val);
	}

	handleChange(evt) {
		const oldVal = this.props.controller.getPropertyValue(this.props.propertyId);
		const newVal = this.convertTargetValue(evt.target.value);
		this.props.controller.updatePropertyValue(this.props.propertyId, newVal);

		if (oldVal !== newVal) {
			this.setEnabledStateOfOptionalPanels(newVal);
		}
	}

	convertTargetValue(targetValue) {
		if (this.props.control.valueDef.propType === "boolean") {
			return (targetValue === "true");
		} else if (this.props.control.valueDef.propType === "integer" ||
								this.props.control.valueDef.propType === "long"	||
								this.props.control.valueDef.propType === "double") {
			return Number(targetValue);
		}
		return targetValue;
	}

	/*
	* Sets the enabled and disabled states of the optional panels so the
	* selected button's panel is enabled and the others are disabled. This
	* will only do anything if there are some optional panels to insert
	* after each radio button provided by a SelectorPanel with its insert_panels
	* field set to true.
	*/
	setEnabledStateOfOptionalPanels(targetValue) {
		if (this.props.control.optionalPanels) {
			const valueSet = this.props.controller.getFilteredEnumItems(this.props.propertyId, this.props.control);
			const refState = this.props.controller.getPanelStates();

			// This populates the control.panelTree with the panels passed in and
			// associates them with any children they have.
			this.props.controller.parsePanelTree();


			for (let i = 0; i < valueSet.values.length; i++) {
				const val = valueSet.values[i];
				const state = valueSet.values[i] === targetValue ? STATES.ENABLED : STATES.DISABLED;
				ConditionsUtils.updateState(refState, { "name": val }, state, val);
			}

			this.props.controller.setPanelStates(refState);

			// Pass values as panel Ids to updatePanelChildrenStatesForPanelIds()
			// becuase each radio button value must be the same as the ID of its inserted panel.
			ConditionsUtils.updatePanelChildrenStatesForPanelIds(valueSet.values, this.props.controller);
		}
	}

	getOptionalPanel(val) {
		return this.props.control.optionalPanels ? this.props.control.optionalPanels[val] : null;
	}

	render() {
		var controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
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

		let controlIconContainerClass = "control-icon-container";
		if (messageType !== "info") {
			controlIconContainerClass = "control-icon-container-enabled";
		}

		var buttons = [];
		let cssClasses = "control";
		let cssIndicator;
		if (stateDisabled.disabled === true) {
			cssIndicator = "control__indicator nohover";
		} else {
			cssIndicator = "control__indicator";
		}
		if (this.props.control.orientation === ORIENTATIONS.VERTICAL) {
			cssClasses += " control-radio-block";
			cssIndicator += " control__indicator-block";
		} else {
			cssClasses += " radio_horizontal_label";
		}

		if (!this.props.control.values && this.props.control.controlType === "radioset") {
			this.props.control.values = [true, false];
			this.props.control.valueLabels = ["true", "false"];
		}
		let wasChecked = false;
		const valueSet = this.props.controller.getFilteredEnumItems(this.props.propertyId, this.props.control);
		for (var i = 0; i < valueSet.values.length; i++) {
			var val = valueSet.values[i];
			var checked = val === controlValue;
			wasChecked = wasChecked || checked;
			var optionalPanel = this.getOptionalPanel(val);
			buttons.push(
				<span key={i}>
					<label key={i} className={cssClasses}>
						<input type="radio"
							{...stateDisabled}
							name={this.props.control.name}
							value={val}
							onChange={this.handleChange}
							checked={checked}
						/>
						{valueSet.valueLabels[i]}
						<div className={cssIndicator} />
					</label>
					{optionalPanel}
				</span>
			);
		}
		if (controlValue && controlValue.length > 0 && !wasChecked) {
			this.setEmptySelection = true;
		}
		return (
			<div id={this.getControlID()} className="radio" style={stateStyle} >
				<div id={controlIconContainerClass} >
					<div id="radioset-control-container">{buttons}</div>
					{icon}
				</div>
				{errorMessage}
			</div>
		);
	}
}

RadiosetControl.propTypes = {
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	control: PropTypes.object.isRequired
};
