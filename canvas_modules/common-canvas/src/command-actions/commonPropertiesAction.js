/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";

export default class CommonPropertiesAction extends Action {
	constructor(newValues, initialValues, appData, applyPropertyChanges) {
		super(newValues);
		this.newValues = newValues;
		this.initialValues = initialValues;
		this.appData = appData;
		this.applyPropertyChanges = applyPropertyChanges;
	}

	// Standard methods
	do() {
		this.applyPropertyChanges(this.newValues.properties, this.appData, this.newValues.messages);
	}

	undo() {
		this.applyPropertyChanges(this.initialValues.properties, this.appData, this.initialValues.messages);
	}

	redo() {
		this.applyPropertyChanges(this.newValues.properties, this.appData, this.newValues.messages);
	}

}
