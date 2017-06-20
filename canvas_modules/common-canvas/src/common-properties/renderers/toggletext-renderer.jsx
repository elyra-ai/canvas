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
// import logger from "../../../utils/logger";
import React from "react";
import ToggletextControl from "../editor-controls/toggletext-control.jsx";

export default class ToggletextRenderer {

	constructor(columnDef, control, controlValue, columnNumber, updateControlValue,
							setCurrentControlValue) {

		this.columnDef = columnDef;
		this.control = control;
		this.controlValue = controlValue;
		this.columnNumber = columnNumber;
		this.updateControlValue = updateControlValue;
		this.setCurrentControlValue = setCurrentControlValue;
	}

	render(value, rowIndex) {
		return (
			<ToggletextControl
				rowIndex={rowIndex}
				control={this.control}
				columnDef={this.columnDef}
				controlValue={this.controlValue}
				value={value}
				updateControlValue={this.updateControlValue}
				columnIndex={this.columnNumber}
				setCurrentControlValue={this.setCurrentControlValue}
			/>
		);
	}
}
