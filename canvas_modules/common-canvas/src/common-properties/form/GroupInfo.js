/*
 * Copyright 2017-2025 Elyra Authors
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

import { GroupType } from "../constants/form-constants";
import { ResourceDef } from "../util/L10nProvider";
import { has, propertyOf } from "lodash";
import { v4 as uuid4 } from "uuid";

class Group {
	constructor(cname, parameters, actions, type, label, dependsOn, insertPanels, nestedPanel, subGroups, description, data, className, copen) {
		this.name = cname;
		this.parameters = parameters;
		this.actions = actions;
		this.type = type;
		this.label = ResourceDef.make(label);
		this.dependsOn = dependsOn;
		this.insertPanels = insertPanels;
		this.nestedPanel = nestedPanel;
		this.subGroups = subGroups;
		this.description = ResourceDef.make(description);
		this.data = data;
		this.className = className;
		this.open = copen;
	}

	parameterNames() {
		return this.parameters;
	}

	actionIds() {
		return this.actions;
	}

	groupType() {
		return (this.type ? this.type : GroupType.CONTROLS);
	}

	static makeGroup(uiGroup) {
		if (uiGroup) {
			let subGroups;
			if (has(uiGroup, "group_info")) {
				subGroups = [];
				for (const group of uiGroup.group_info) {
					const newGroup = Group.makeGroup(group);
					if (newGroup !== null) {
						subGroups.push(newGroup);
					}
				}
			}
			return new Group(
				propertyOf(uiGroup)("id"),
				propertyOf(uiGroup)("parameter_refs"),
				propertyOf(uiGroup)("action_refs"),
				propertyOf(uiGroup)("type"),
				propertyOf(uiGroup)("label"),
				propertyOf(uiGroup)("depends_on_ref"),
				propertyOf(uiGroup)("insert_panels"),
				propertyOf(uiGroup)("nested_panel"),
				subGroups,
				propertyOf(uiGroup)("description"),
				propertyOf(uiGroup)("data"),
				propertyOf(uiGroup)("class_name"),
				propertyOf(uiGroup)("open")
			);
		}
		return null;
	}
}

export class GroupMetadata {
	constructor(groups) {
		this.groups = groups;
	}

	static makeGroupMetadata(uiGroups, parameters) {
		const groups = [];
		if (uiGroups) {
			for (const group of uiGroups) {
				const newGroup = Group.makeGroup(group);
				if (newGroup !== null) {
					groups.push(newGroup);
				}
			}

		} else {
			// if no group create a default group with controls
			groups.push(new Group(uuid4(), parameters, null, GroupType.CONTROLS));
		}
		return new GroupMetadata(groups);
	}
}
