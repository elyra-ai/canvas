/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { GroupType } from "../constants/form-constants";
import { ResourceDef } from "../util/L10nProvider";
import propertyOf from "lodash/propertyOf";
import has from "lodash/has";
import uuid4 from "uuid/v4";

class Group {
	constructor(cname, parameters, actions, type, label, dependsOn, insertPanels, subGroups, description, data) {
		this.name = cname;
		this.parameters = parameters;
		this.actions = actions;
		this.type = type;
		this.label = ResourceDef.make(label);
		this.dependsOn = dependsOn;
		this.insertPanels = insertPanels;
		this.subGroups = subGroups;
		this.description = ResourceDef.make(description);
		this.data = data;
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
				subGroups,
				propertyOf(uiGroup)("description"),
				propertyOf(uiGroup)("data"));
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
