/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/


import React from "react";
import OneofselectControl from "../editor-controls/oneofselect-control.jsx";

export default class OneofselectRenderer {

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
			<OneofselectControl
				rowIndex={rowIndex}
				control={this.control}
				columnDef={this.columnDef}
				controlValue={this.controlValue}
				value={value}
				updateControlValue={this.updateControlValue}
				columnIndex={this.columnNumber}
				setCurrentControlValue={this.setCurrentControlValue}
				tableControl
			/>
		);
	}
}
