/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import Dropdown from "react-dropdown";
import EditorControl from "./editor-control.jsx";

export default class OneofselectControl extends EditorControl {
	constructor(props) {
		super(props);
		if (props.tableControl) {
			this.state = { controlValue: this.props.value };
		} else {
			this.state = { controlValue: props.valueAccessor(props.control.name)[0] };
		}
		this.getControlValue = this.getControlValue.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(evt) {
		if (this.props.tableControl) {
			this.props.controlValue[this.props.rowIndex][this.props.columnIndex] = evt.value;
			this.props.setCurrentControlValue(this.props.control.name, this.props.controlValue, this.props.updateControlValue);
		} else {
			this.notifyValueChanged(this.props.control.name, evt.value);
			this.setState({ controlValue: evt.value });
			this.props.updateControlValue(this.props.control.name, evt.value);
		}
	}
	// Added to prevent entire row being selected in table
	onClick(evt) {
		if (this.props.tableControl) {
			evt.stopPropagation();
		}
	}
	getControlValue() {
		return [this.state.controlValue];
	}

	render() {
		var options = [];
		var dropdownOption = [];
		var optionsLength;
		if (this.props.tableControl) {
			optionsLength = this.props.columnDef.values.length;
			for (var i = 0; i < optionsLength; i++) {
				options.push({
					value: this.props.columnDef.values[i],
					label: this.props.columnDef.valueLabels[i]
				});
			}
			options.forEach((option) => {
				if (option.value === this.props.value) {
					dropdownOption = option;
				}
			});
		} else {
			optionsLength = this.props.control.values.length;
			for (var j = 0; j < optionsLength; j++) {
				options.push({
					value: this.props.control.values[j],
					label: this.props.control.valueLabels[j]
				});
			}
			options.forEach((option) => {
				if (option.value === this.state.controlValue) {
					dropdownOption = option;
				} else {
					dropdownOption = this.state.controlValue;
					if (dropdownOption.length === 0) {
						dropdownOption = this.props.control.additionalText;
					}
				}
			});
		}

		return (
			<div onClick={this.onClick.bind(this)}>
					<Dropdown id={this.getControlID()}
						name={this.props.control.name}
						options={options}
						onChange={this.handleChange}
						value={dropdownOption}
						ref="input"
					/>
			</div>
		);
	}
}

OneofselectControl.propTypes = {
	control: React.PropTypes.object.isRequired,
	// Optional used when embedded in table
	tableControl: React.PropTypes.bool,
	setCurrentControlValue: React.PropTypes.func,
	rowIndex: React.PropTypes.number,
	columnIndex: React.PropTypes.number,
	controlValue: React.PropTypes.array,
	columnDef: React.PropTypes.object,
	value: React.PropTypes.string,
	updateControlValue: React.PropTypes.func
};
