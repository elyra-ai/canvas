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
import CustomMapCtrl from "./CustomMapCtrl";

class CustomMapPanel {
	static id() {
		return "custom-map-panel";
	}

	constructor(parameters, valueAccessor, updateControlValue, datarecordMetadata, condition) {
		this.parameters = parameters;
		this.valueAccessor = valueAccessor;
		this.updateControlValue = updateControlValue;
		this.datarecordMetadata = datarecordMetadata;
		this.condition = condition;
	}

	renderPanel() {
		const controlId = this.parameters[0];
		return (
			<CustomMapCtrl
				key={controlId}
				ref={controlId}
				parameter={controlId}
				value={this.valueAccessor(controlId)}
				updateControlValue={this.updateControlValue}
				condition={this.condition}
			/>
		);
	}
}

export default CustomMapPanel;
