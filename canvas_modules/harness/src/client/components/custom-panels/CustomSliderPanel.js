/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* eslint-disable no-empty-function */
import React from "react";
import CustomCtrlSlider from "./CustomCtrlSlider";

class CustomSliderPanel {
	static id() {
		return "custom-slider-panel";
	}
	constructor(parameters, valueAccessor, updateControlValue, datarecordMetadata) {
		this.parameters = parameters;
		this.valueAccessor = valueAccessor;
		this.updateControlValue = updateControlValue;
		this.datarecordMetadata = datarecordMetadata;
	}

	renderPanel() {
		const controlId = this.parameters[0];
		return (
			<CustomCtrlSlider
				key={controlId}
				ref={controlId}
				parameter={controlId}
				value={this.valueAccessor(controlId)}
				updateControlValue={this.updateControlValue}
			/>
		);
	}
}

export default CustomSliderPanel;
