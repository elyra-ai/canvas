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
import CustomMapCtrl from "../custom-components/CustomMapCtrl";
import CustomMapSummary from "../custom-components/CustomMapSummary";

class CustomMapPanel {
	static id() {
		return "harness-custom-map-panel";
	}

	constructor(parameters, controller, data) {
		this.parameters = parameters;
		this.controller = controller;
		this.data = data;
	}

	renderPanel() {
		const controlId = this.parameters[0];
		const propertyId = { name: controlId };
		const currentValue = this.controller.getPropertyValue(propertyId);
		const mapSummary = (<CustomMapSummary lng={currentValue[1]} lat={currentValue[0]} zoom={currentValue[2]} />);
		this.controller.updateCustPropSumPanelValue(propertyId,
			{ value: mapSummary, label: "Map" });
		return (
			<CustomMapCtrl
				key={"map-" + controlId}
				propertyId={propertyId}
				controller={this.controller}
				data={this.data}
			/>
		);
	}
}

export default CustomMapPanel;
