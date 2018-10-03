/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import CustomTableCtrl from "../custom-components/CustomTableCtrl";

class CustomTableControl {
	static id() {
		return "harness-custom-table-control";
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
			<CustomTableCtrl
				key={"table-" + key}
				propertyId={this.propertyId}
				controller={this.controller}
				editStyle={this.tableInfo ? this.tableInfo.editStyle : null}
			/>
		);
	}
}

export default CustomTableControl;
