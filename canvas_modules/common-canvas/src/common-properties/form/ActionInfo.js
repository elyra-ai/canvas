/*
 * Copyright 2017-2023 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import { ResourceDef } from "../util/L10nProvider";

export class Action {
	constructor(actionName, label, description, control, data, image, button, className, customActionId) {
		this.name = actionName;
		this.label = label;
		this.description = description;
		this.actionType = control;
		this.data = data;
		this.image = image;
		this.button = button;
		this.className = className;
		this.customActionId = customActionId;
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
			actionDef.image = action.image;
			actionDef.button = action.button;
			actionDef.className = action.class_name;
			actionDef.customActionId = action.custom_action_id;
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
