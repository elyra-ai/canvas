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
import { connect } from "react-redux";
import Dropdown from "carbon-components-react/lib/components/DropdownV2";
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

		let ourDropDown = (<Dropdown
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
			for (const option of dropDown.options) {
				options.push(<option className="bx--select-option" value={option.value} key={option.value}>{option.label}</option>);
			}
			ourDropDown =
			(<div className="bx--select">
				<select className="bx--select-input properties-table-dropdown" onChange={this.handleChange} value={selection}>
					{options}
				</select>
				<svg className="bx--select__arrow" width="10" height="5" viewBox="0 0 10 5">
					<path d="M0 0l5 4.998L10 0z" fillRule="evenodd" />
				</svg>
			</div>);
		}

		return (
			<div data-id={ControlUtils.getDataId(this.props.propertyId)}
				className={classNames("properties-dropdown", { "hide": this.props.state === STATES.HIDDEN }, this.props.messageInfo ? this.props.messageInfo.type : null)}
			>
				{ourDropDown}
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
