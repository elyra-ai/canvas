/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import { FormControl } from "react-bootstrap";
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
			this.props.controlValue[this.props.rowIndex][this.props.columnIndex] = evt.target.value;
			this.props.setCurrentControlValue(this.props.control.name, this.props.controlValue, this.props.updateControlValue);
		} else {
			this.notifyValueChanged(this.props.control.name, evt.target.value);
			this.setState({ controlValue: evt.target.value });
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
		var options;
		var value;
		if (this.props.tableControl) {
			options = EditorControl.genSelectOptions(this.props.columnDef, [this.props.value]);
			value = this.props.value;
		} else {
			options = EditorControl.genSelectOptions(this.props.control, [this.state.controlValue]);
			value = this.state.controlValue;
		}

		return (
			<div onClick={this.onClick.bind(this)}>
				<FormControl id={this.getControlID()}
					componentClass="select"
					name={this.props.control.name}
					onChange={this.handleChange}
					value={value}
					ref="input"
				>
					{options}
				</FormControl>
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
