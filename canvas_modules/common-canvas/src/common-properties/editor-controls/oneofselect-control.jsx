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
			this.props.setCurrentControlValueSelected(this.props.control.name, this.props.controlValue, this.props.updateControlValue, this.props.selectedRows);
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

	genSelectOptions(control, selectedValue) {
		var options = [];
		var selectedOption = [];
		const optionsLength = control.values.length;
		for (var j = 0; j < optionsLength; j++) {
			options.push({
				value: control.values[j],
				label: control.valueLabels[j]
			});
		}
		options.forEach((option) => {
			if (option.value === selectedValue) {
				selectedOption = option;
			} else {
				selectedOption = selectedValue;
			}
		});
		return {
			options: options,
			selectedOption: selectedOption
		};
	}

	render() {
		var dropDown = {};
		var className = "Dropdown-control-panel";
		if (this.props.tableControl) {
			dropDown = this.genSelectOptions(this.props.columnDef, this.props.value);
			className = "Dropdown-control-table";
		} else {
			dropDown = this.genSelectOptions(this.props.control, this.state.controlValue);
		}

		return (
			<div onClick={this.onClick.bind(this)} className={className}>
					<Dropdown id={this.getControlID()}
						name={this.props.control.name}
						options={dropDown.options}
						onChange={this.handleChange}
						value={dropDown.selectedOption}
						placeholder={this.props.control.additionalText}
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
	rowIndex: React.PropTypes.number,
	columnIndex: React.PropTypes.number,
	controlValue: React.PropTypes.array,
	columnDef: React.PropTypes.object,
	value: React.PropTypes.string,
	updateControlValue: React.PropTypes.func,
	setCurrentControlValueSelected: React.PropTypes.func,
	selectedRows: React.PropTypes.array
};
