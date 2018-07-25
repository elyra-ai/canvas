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
import ControlUtils from "./../../util/control-utils";
import ConditionsUtils from "./../../ui-conditions/conditions-utils.js";
import ValidationMessage from "./../../components/validation-message";
import RadioButton from "carbon-components-react/lib/components/RadioButton";
import classNames from "classnames";
import { STATES } from "./../../constants/constants.js";
import { ORIENTATIONS } from "./../../constants/form-constants.js";
import uuid4 from "uuid/v4";

export default class RadiosetControl extends React.Component {
	constructor(props) {
		super(props);
		this.uuid = uuid4();
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

	handleChange(evt) {
		const oldVal = this.props.controller.getPropertyValue(this.props.propertyId);
		const newVal = this.convertTargetValue(evt);
		this.props.controller.updatePropertyValue(this.props.propertyId, newVal);

		if (oldVal !== newVal) {
			this.setEnabledStateOfOptionalPanels(newVal);
		}
	}

	render() {
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		const state = this.props.controller.getControlState(this.props.propertyId);
		const messageInfo = this.props.controller.getErrorMessage(this.props.propertyId);
		const messageType = (messageInfo) ? messageInfo.type : "info";

		if (!this.props.control.values && this.props.control.controlType === "radioset") {
			this.props.control.values = [true, false];
			this.props.control.valueLabels = ["true", "false"];
		}
		const buttons = [];
		let wasChecked = false;
		const valueSet = this.props.controller.getFilteredEnumItems(this.props.propertyId, this.props.control);
		for (var i = 0; i < valueSet.values.length; i++) {
			const checked = valueSet.values[i] === controlValue;
			// RadioButton only accepts values of type string || number
			const val = (this.props.control.valueDef.propType === "boolean") ? valueSet.values[i].toString() : valueSet.values[i];
			wasChecked = wasChecked || checked;
			const optionalPanel = this.getOptionalPanel(val);
			const id = {
				name: this.props.propertyId.name,
				row: i
			};
			buttons.push(
				<div key={i} className="properties-radioset-panel">
					<RadioButton
						key={i}
						id={ControlUtils.getControlId(id, this.uuid)}
						disabled={state === STATES.DISABLED}
						labelText={valueSet.valueLabels[i]}
						value={val}
						onChange={this.handleChange}
						checked={checked}
					/>
					{optionalPanel}
				</div>
			);
		}
		if (controlValue && controlValue.length > 0 && !wasChecked) {
			this.setEmptySelection = true;
		}

		return (
			<div data-id={ControlUtils.getDataId(this.props.control, this.props.propertyId)}
				className={classNames("properties-radioset ", { "hide": state === STATES.HIDDEN })}
			>
				<div
					className={classNames("properties-radio-button-group " + messageType,
						{ "horizontal": this.props.control.orientation !== ORIENTATIONS.VERTICAL })}
				>
					{buttons}
				</div>
				<ValidationMessage state={state} messageInfo={messageInfo} inTable={this.props.tableControl} />
			</div>
		);
	}
}

RadiosetControl.propTypes = {
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	control: PropTypes.object.isRequired,
	tableControl: PropTypes.bool
};
