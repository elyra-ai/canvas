/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { GroupType } from "../constants/form-constants";
import { ResourceDef } from "./L10nProvider";
import propertyOf from "lodash/propertyOf";
import has from "lodash/has";

class Group {
	constructor(cname, parameters, actions, type, label, dependsOn, subGroups, description) {
		this.name = cname;
		this.parameters = parameters;
		this.actions = actions;
		this.type = type;
		this.label = ResourceDef.make(label);
		this.dependsOn = dependsOn;
		this.subGroups = subGroups;
		this.description = ResourceDef.make(description);
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
				subGroups,
				propertyOf(uiGroup)("description"));
		}
		return null;
	}
}

export class GroupMetadata {
	constructor(groups) {
		this.groups = groups;
	}

	static makeGroupMetadata(uiGroups) {
		if (uiGroups) {
			const groups = [];
			for (const group of uiGroups) {
				const newGroup = Group.makeGroup(group);
				if (newGroup !== null) {
					groups.push(newGroup);
				}
			}
			return new GroupMetadata(groups);
		}
		return null;
	}
}
