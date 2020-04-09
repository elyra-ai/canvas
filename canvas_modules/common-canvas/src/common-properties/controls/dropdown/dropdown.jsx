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
import { Dropdown, Select, SelectItem } from "carbon-components-react";
import isEqual from "lodash/isEqual";
import ControlUtils from "./../../util/control-utils";
import ValidationMessage from "./../../components/validation-message";
import classNames from "classnames";
import PropertyUtils from "./../../util/property-utils.js";
import { ControlType } from "./../../constants/form-constants";
import { STATES } from "./../../constants/constants.js";

class DropDown extends React.Component {
	constructor(props) {
		super(props);
		this.emptyLabel = "...";
		if (props.control.additionalText) {
			this.emptyLabel = props.control.additionalText;
		}
		this.id = ControlUtils.getControlId(this.props.propertyId);
		this.handleChange = this.handleChange.bind(this);
		this.genSchemaSelectOptions = this.genSchemaSelectOptions.bind(this);
		this.genSelectOptions = this.genSelectOptions.bind(this);
		this.genFieldSelectOptions = this.genFieldSelectOptions.bind(this);
		this.updateValueFromFilterEnum = this.updateValueFromFilterEnum.bind(this);
	}

	componentDidMount() {
		this.updateValueFromFilterEnum(true);
	}

	componentDidUpdate(prevProps) {
		// only update if filter options have changed. Fixes issue where filter options are updated after value in setProperties
		if (!isEqual(this.props.controlOpts, prevProps.controlOpts)) {
			this.updateValueFromFilterEnum();
		}
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
		const options = [];
		// allow for user to not select a schema
		options.push({
			value: "",
			label: this.emptyLabel
		});
		if (Array.isArray(this.props.controlOpts)) {
			for (const schemaName of this.props.controlOpts) {
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
		for (const field of this.props.controlOpts) {
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
		for (let j = 0; j < this.props.controlOpts.values.length; j++) {
			options.push({
				value: this.props.controlOpts.values[j],
				label: this.props.controlOpts.valueLabels[j]
			});
		}
		const selectedOption = this.getSelectedOption(options, selectedValue);
		return {
			options: options,
			selectedOption: selectedOption
		};
	}
	// this is needed in order to reset the property value when a value is filtered out.
	updateValueFromFilterEnum(skipValidateInput) {
		// update property value if value isn't in current enum value.  Should only be used for oneofselect
		if (this.props.control.controlType === ControlType.ONEOFSELECT && this.props.value !== null && typeof this.props.value !== "undefined" &&
			!this.props.controlOpts.values.includes(this.props.value)) {
			let defaultValue = null;
			// set to default value if default value is in filtered enum list
			if (this.props.control.valueDef && this.props.control.valueDef.defaultValue && this.props.controlOpts.values.includes(this.props.control.valueDef.defaultValue)) {
				defaultValue = this.props.control.valueDef.defaultValue;
			}
			this.props.controller.updatePropertyValue(this.props.propertyId, defaultValue, skipValidateInput);
		}
	}

	handleChange(evt) {
		let value = this.props.tableControl ? evt.target.value : evt.selectedItem.value;
		if (this.props.control.controlType === ControlType.SELECTCOLUMN) {
			value = PropertyUtils.fieldStringToValue(value, this.props.control, this.props.controller);
		}
		this.props.controller.updatePropertyValue(this.props.propertyId, value);
	}

	render() {
		const dropdownType = (this.props.tableControl) ? "inline" : "default";

		let dropDown;
		if (this.props.control.controlType === ControlType.SELECTSCHEMA) {
			dropDown = this.genSchemaSelectOptions(this.props.value);
		} else if (this.props.control.controlType === ControlType.SELECTCOLUMN) {
			dropDown = this.genFieldSelectOptions(this.props.value);
		} else {
			dropDown = this.genSelectOptions(this.props.value);
		}

		let dropdownComponent = (<Dropdown
			id={`${ControlUtils.getDataId(this.props.propertyId)}-dropdown`}
			disabled={this.props.state === STATES.DISABLED}
			type={dropdownType}
			items={dropDown.options}
			onChange={this.handleChange}
			selectedItem={dropDown.selectedOption}
			label={this.emptyLabel}
		/>);

		if (this.props.tableControl) {
			const options = [];
			const selection = dropDown.selectedOption && dropDown.selectedOption.value ? dropDown.selectedOption.value : "";
			if (!dropDown.selectedOption) {
				// need to add null option when no value set.  Shouldn't be an option for the user to select otherwise
				options.push(<SelectItem text={this.emptyLabel} key="" value="" />);
			}
			for (const option of dropDown.options) {
				options.push(<SelectItem text={option.label} key={option.value} value={option.value} />);
			}
			dropdownComponent = (<Select
				id={this.id}
				hideLabel
				inline
				labelText={this.props.control.label ? this.props.control.label.text : ""}
				disabled={this.props.state === STATES.DISABLED}
				onChange={this.handleChange}
				value={selection}
			>
				{ options }
			</Select>);
		}

		return (
			<div data-id={ControlUtils.getDataId(this.props.propertyId)}
				className={classNames("properties-dropdown", { "hide": this.props.state === STATES.HIDDEN }, this.props.messageInfo ? this.props.messageInfo.type : null)}
			>
				{dropdownComponent}
				<ValidationMessage state={this.props.state} messageInfo={this.props.messageInfo} inTable={this.props.tableControl} />
			</div>
		);
	}
}

DropDown.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	tableControl: PropTypes.bool,
	controlOpts: PropTypes.oneOfType([
		PropTypes.object,
		PropTypes.array
	]), // pass in by redux
	state: PropTypes.string, // pass in by redux
	value: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.object
	]), // pass in by redux
	messageInfo: PropTypes.object // pass in by redux
};

const mapStateToProps = (state, ownProps) => {
	const props = {
		value: ownProps.controller.getPropertyValue(ownProps.propertyId),
		state: ownProps.controller.getControlState(ownProps.propertyId),
		messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId),
	};
	if (ownProps.control.controlType === ControlType.SELECTSCHEMA) {
		props.controlOpts = ownProps.controller.getDatasetMetadataSchemas();
	} else if (ownProps.control.controlType === ControlType.SELECTCOLUMN) {
		props.controlOpts = ownProps.controller.getFilteredDatasetMetadata(ownProps.propertyId);
	} else {
		props.controlOpts = ownProps.controller.getFilteredEnumItems(ownProps.propertyId, ownProps.control);
	}
	return props;
};

export default connect(mapStateToProps, null)(DropDown);
