/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2017
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/

import React from "react";

export default class TextBoxRenderer {

	constructor(columnDef, control, controlValue, columnIndex, updateControlValue,
							setCurrentControlValue) {
		this.columnDef = columnDef;
		this.control = control;
		this.controlValue = controlValue;
		this.columnIndex = columnIndex;
		this.updateControlValue = updateControlValue;
		this.setCurrentControlValue = setCurrentControlValue;
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(rowIndex) {
		const that = this;
		return function(evt) {
			that.controlValue[rowIndex][that.columnIndex] = evt.target.value;
			that.setCurrentControlValue(that.control.name, that.controlValue, that.updateControlValue);
		};
	}

	render(value, rowIndex) {
		// const val = this.controlValue[rowIndex][this.columnIndex];
		return (
			<input type="text" value={value} onChange={this.handleChange(rowIndex)} className="inline-textbox" />
		);
	}
}
