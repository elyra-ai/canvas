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
import Dropdown from "carbon-components-react/lib/components/DropdownV2";
import ControlUtils from "./../../util/control-utils";
import ValidationMessage from "./../../components/validation-message";
import classNames from "classnames";
import PropertyUtils from "./../../util/property-utils.js";
import { ControlType } from "./../../constants/form-constants";
import { STATES } from "./../../constants/constants.js";


export default class DropDown extends React.Component {
	constructor(props) {
		super(props);
		this.emptyLabel = "...";
		if (props.control.additionalText) {
			this.emptyLabel = props.control.additionalText;
		}
		this.handleChange = this.handleChange.bind(this);
		this.genSchemaSelectOptions = this.genSchemaSelectOptions.bind(this);
		this.genSelectOptions = this.genSelectOptions.bind(this);
		this.genFieldSelectOptions = this.genFieldSelectOptions.bind(this);
	}

	getSelectedOption(options, selectedValue) {
		const value = PropertyUtils.stringifyFieldValue(selectedValue, this.props.control);
		let selectedOption = options.find(function(option) {
			return option.value === value;
		});
		selectedOption = typeof selectedOption === "undefined" ? null : selectedOption;
		return selectedOption;
	}

	genSchemaSelectOptions(selectedValue) {
		const schemaNames = this.props.controller.getDatasetMetadataSchemas();
		const options = [];
		// allow for user to not select a schema
		options.push({
			value: "",
			label: this.emptyLabel
		});
		if (Array.isArray(schemaNames)) {
			for (const schemaName of schemaNames) {
				options.push({
					value: schemaName,
					label: schemaName
				});
			}
		}
		const selectedOption = this.getSelectedOption(options, selectedValue);
		return {
			options: options,
			selectedOption: selectedOption
		};
	}

	genFieldSelectOptions(selectedValue) {
		const options = [];
		// allow for user to not select a field
		options.push({
			value: "",
			label: this.emptyLabel
		});
		for (const field of this.props.fields) {
			options.push({
				value: field.name,
				label: field.name
			});
		}
		const selectedOption = this.getSelectedOption(options, selectedValue);
		return {
			options: options,
			selectedOption: selectedOption
		};
	}

	genSelectOptions(selectedValue) {
		const options = [];
		// Allow for enumeration replacement
		const controlOpts = this.props.controller.getFilteredEnumItems(this.props.propertyId, this.props.control);
		for (let j = 0; j < controlOpts.values.length; j++) {
			options.push({
				value: controlOpts.values[j],
				label: controlOpts.valueLabels[j]
			});
		}
		const selectedOption = this.getSelectedOption(options, selectedValue);
		return {
			options: options,
			selectedOption: selectedOption
		};
	}


	handleChange(evt) {
		let value = evt.selectedItem.value;
		if (this.props.control.controlType === ControlType.SELECTCOLUMN) {
			value = PropertyUtils.fieldStringToValue(value, this.props.control, this.props.controller);
		}
		this.props.controller.updatePropertyValue(this.props.propertyId, value);
	}

	render() {
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		const state = this.props.controller.getControlState(this.props.propertyId);
		const messageInfo = this.props.controller.getErrorMessage(this.props.propertyId);
		const dropdownType = (this.props.tableControl) ? "inline" : "default";
		const messageType = (messageInfo) ? messageInfo.type : "info";

		let dropDown;
		if (this.props.control.controlType === ControlType.SELECTSCHEMA) {
			dropDown = this.genSchemaSelectOptions(controlValue);
		} else if (this.props.control.controlType === ControlType.SELECTCOLUMN) {
			dropDown = this.genFieldSelectOptions(controlValue);
		} else {
			dropDown = this.genSelectOptions(controlValue);
		}

		return (
			<div data-id={ControlUtils.getDataId(this.props.propertyId)}
				className={classNames("properties-dropdown " + messageType, { "hide": state === STATES.HIDDEN })}
			>
				<Dropdown
					disabled={state === STATES.DISABLED}
					type={dropdownType}
					items={dropDown.options}
					onChange={this.handleChange}
					selectedItem={dropDown.selectedOption}
					label={this.emptyLabel}
				/>
				<ValidationMessage state={state} messageInfo={messageInfo} inTable={this.props.tableControl} />
			</div>
		);
	}
}

DropDown.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	tableControl: PropTypes.bool,
	fields: PropTypes.array
};
