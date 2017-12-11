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
import CustomSliderCtrl from "./CustomSliderCtrl";

class CustomSliderPanel {
	static id() {
		return "custom-slider-panel";
	}
	constructor(parameters, controller) {
		this.parameters = parameters;
		this.controller = controller;
	}

	renderPanel() {
		const controlId = this.parameters[0];
		return (
			<CustomSliderCtrl
				key={controlId}
				ref={controlId}
				propertyId={{ name: controlId }}
				controller={this.controller}
			/>
		);
	}
}

export default CustomSliderPanel;
