/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import CustomToggleCtrl from "../custom-components/CustomToggleCtrl";
import paramDef from "./standardControls_paramDef.json";

class CustomTogglePanel {
	static id() {
		return "custom-toggle-panel";
	}
	constructor(parameters, controller) {
		this.parameters = parameters;
		this.controller = controller;
	}

	renderPanel() {
		const controlId = this.parameters[0]; // toggle
		let textField = (<div />);
		if (this.parameters.length === 2) {
			textField = this.controller.createControl({ name: this.parameters[1] }, paramDef, this.parameters[1]);
		}
		return (
			<div key={"toggle-container-" + controlId}>
				{textField}
				<CustomToggleCtrl
					key={"toggle-" + controlId}
					propertyId={{ name: controlId }}
					controller={this.controller}
				/>
			</div>
		);
	}
}

export default CustomTogglePanel;
