/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";

import ButtonAction from "./button";
import ImageAction from "./image";


export default class ActionFactory {

	constructor(controller) {
		this.controller = controller;
	}


	generateAction(key, action) {
		if (action) {
			if (action.actionType === "button") {
				return (
					<ButtonAction
						key={"action." + key}
						action={action}
						controller={this.controller}
					/>
				);
			} else if (action.actionType === "image") {
				return (
					<ImageAction
						key={"action." + key}
						action={action}
						controller={this.controller}
					/>
				);
			}
		}
		return null;
	}
}
