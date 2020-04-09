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
import isEqual from "lodash/isEqual";
import ControlUtils from "./../../util/control-utils";
import ConditionsUtils from "./../../ui-conditions/conditions-utils.js";
import ValidationMessage from "./../../components/validation-message";
import { RadioButton } from "carbon-components-react";
import classNames from "classnames";
import { STATES } from "./../../constants/constants.js";
import { ORIENTATIONS } from "./../../constants/form-constants.js";
import uuid4 from "uuid/v4";

class RadiosetControl extends React.Component {
	constructor(props) {
		super(props);
		this.uuid = uuid4();
		this.handleChange = this.handleChange.bind(this);
		this.updateValueFromFilterEnum = this.updateValueFromFilterEnum.bind(this);
	}

	componentDidMount() {
		this.updateValueFromFilterEnum(true);
		const val = this.props.controller.getPropertyValue(this.props.propertyId);
		this.setEnabledStateOfOptionalPanels(val);
		if (typeof this.props.value !== "undefined" && this.props.value !== null) {
			this.handleCheckedDisabled(this.props.value, this.isRadioButtonDisabled(String(this.props.value)));
		}
	}

	componentDidUpdate(prevProps) {
		// only update if filter options have changed. Fixes issue where filter options are updated after value in setProperties
		if (!isEqual(this.props.controlOpts, prevProps.controlOpts)) {
			this.updateValueFromFilterEnum();
		}
		if (typeof this.props.value !== "undefined" && this.props.value !== null) {
			this.handleCheckedDisabled(this.props.value, this.isRadioButtonDisabled(String(this.props.value)));
		}
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
			const valueSet = this.props.controlOpts;
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

	// this is needed in order to reset the property value when a value is filtered out.
	updateValueFromFilterEnum(skipValidateInput) {
		if (this.props.value !== null && typeof this.props.value !== "undefined" &&
			!this.props.controlOpts.values.includes(this.props.value)) {
			let defaultValue = null;
			// set to default value if default value is in filtered enum list
			if (this.props.control.valueDef && this.props.control.valueDef.defaultValue && this.props.controlOpts.values.includes(this.props.control.valueDef.defaultValue)) {
				defaultValue = this.props.control.valueDef.defaultValue;
			}
			this.props.controller.updatePropertyValue(this.props.propertyId, defaultValue, skipValidateInput);
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

	handleChange(evt) {
		const oldVal = this.props.controller.getPropertyValue(this.props.propertyId);
		const newVal = this.convertTargetValue(evt);
		this.props.controller.updatePropertyValue(this.props.propertyId, newVal);

		if (oldVal !== newVal) {
			this.setEnabledStateOfOptionalPanels(newVal);
		}
	}

	isRadioButtonDisabled(radioValue) {
		const propState = this.props.valueStates;
		if (propState && propState[radioValue] && propState[radioValue].value) {
			return propState[radioValue].value === STATES.DISABLED;
		}
		return false;
	}

	/**
	 * Handles those cases where a radio button is both checked and disabled -
	 * Will attempt to select another enabled radio button if possible.
	 *
	 * @param val A radio button enumeration value that is selected
	 * @param itemDisabled True if the radio button is disabled
	 */
	handleCheckedDisabled(val, itemDisabled) {
		if (typeof val !== "undefined" && val !== null && itemDisabled && this.props.state !== STATES.DISABLED) {
			const control = this.props.controller.getControl(this.props.propertyId);
			let newRadioSelection;
			const defaultValue = this.props.control.valueDef.defaultValue;
			if (defaultValue && !this.isRadioButtonDisabled(defaultValue)) {
				newRadioSelection = defaultValue;
			} else {
				for (const radioValue of control.values) {
					if (radioValue !== val && !this.isRadioButtonDisabled(radioValue)) {
						newRadioSelection = radioValue;
						break;
					}
				}
			}
			if (newRadioSelection) {
				this.props.controller.updatePropertyValue(this.props.propertyId, newRadioSelection);
			}
		}
	}

	render() {
		if (!this.props.control.values && this.props.control.controlType === "radioset") {
			this.props.control.values = [true, false];
			this.props.control.valueLabels = ["true", "false"];
		}
		const buttons = [];
		let wasChecked = false;
		const valueSet = this.props.controlOpts;
		for (var i = 0; i < valueSet.values.length; i++) {
			const checked = valueSet.values[i] === this.props.value;
			// RadioButton only accepts values of type string || number
			const val = (this.props.control.valueDef.propType === "boolean") ? String(valueSet.values[i]) : valueSet.values[i];
			wasChecked = wasChecked || checked;
			const itemDisabled = this.isRadioButtonDisabled(val);
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
						disabled={this.props.state === STATES.DISABLED || itemDisabled}
						labelText={valueSet.valueLabels[i]}
						value={val}
						onChange={this.handleChange}
						checked={checked}
					/>
					{optionalPanel}
				</div>
			);
		}

		return (
			<div data-id={ControlUtils.getDataId(this.props.control, this.props.propertyId)}
				className={classNames("properties-radioset ", { "hide": this.props.state === STATES.HIDDEN })}
			>
				<div
					className={classNames("properties-radio-button-group", this.props.messageInfo ? this.props.messageInfo.type : null,
						{ "horizontal": this.props.control.orientation !== ORIENTATIONS.VERTICAL })}
				>
					{buttons}
				</div>
				<ValidationMessage state={this.props.state} messageInfo={this.props.messageInfo} inTable={this.props.tableControl} />
			</div>
		);
	}
}

RadiosetControl.propTypes = {
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	control: PropTypes.object.isRequired,
	tableControl: PropTypes.bool,
	state: PropTypes.string, // pass in by redux
	valueStates: PropTypes.object, // pass in by redux
	value: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.number,
		PropTypes.bool
	]), // pass in by redux
	messageInfo: PropTypes.object, // pass in by redux
	controlOpts: PropTypes.object // pass in by redux
};

const mapStateToProps = (state, ownProps) => ({
	value: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	valueStates: ownProps.controller.getControlValueStates(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId),
	controlOpts: ownProps.controller.getFilteredEnumItems(ownProps.propertyId, ownProps.control)
});

export default connect(mapStateToProps, null)(RadiosetControl);
