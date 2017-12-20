/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/


import { ResourceDef } from "./L10nProvider";

export class Action {
	constructor(actionName, label, description, control, data) {
		this.name = actionName;
		this.label = label;
		this.description = description;
		this.actionType = control;
		this.data = data;
	}
}

class ActionDef {
	static makeActionDef(action) {
		if (action) {
			const actionDef = new ActionDef();
			actionDef.id = action.id;
			actionDef.label = ResourceDef.make(action.label);
			actionDef.description = ResourceDef.make(action.description);
			actionDef.control = action.control;
			actionDef.data = action.data;
			return actionDef;
		}
		return null;
	}
}

export class ActionMetadata {
	constructor(actionDefs) {
		this.actionDefs = actionDefs;
	}

	// Return a single action
	getAction(actionId) {
		let actionDef;
		this.actionDefs.forEach(function(action) {
			if (action.id === actionId) {
				actionDef = action;
			}
		});
		return actionDef;
	}

	static makeActionMetadata(uihintsActions) {
		if (uihintsActions) {
			const actionsDefs = [];
			for (const action of uihintsActions) {
				const actionDef = ActionDef.makeActionDef(action);
				if (actionDef) {
					actionsDefs.push(actionDef);
				}
			}
			return new ActionMetadata(actionsDefs);
		}
		return null;
	}
}
