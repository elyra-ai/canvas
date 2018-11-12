/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import CustomToggleCtrl from "../custom-components/CustomToggleCtrl";

class CustomToggleControl {
	static id() {
		return "harness-custom-toggle-control";
	}
	constructor(propertyId, controller, data, tableInfo) {
		this.propertyId = propertyId;
		this.controller = controller;
		this.data = data;
		this.tableInfo = tableInfo;
	}

	renderControl() {
		let key = this.propertyId.name;
		if (this.propertyId.row) {
			key += "_" + this.propertyId.row;
			if (this.propertyId.col) {
				key += "_" + this.propertyId.col;
			}
		}
		return (
			<CustomToggleCtrl
				key={"toggle-" + key}
				propertyId={this.propertyId}
				controller={this.controller}
				table={this.tableInfo ? this.tableInfo.table : false}
			/>
		);
	}
}

export default CustomToggleControl;
