/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

 import { GroupType } from "./form-constants";
 import { ResourceDef } from "./L10nProvider";
 import _ from "underscore";

class Group {
	constructor(cname, parameters, type, label, flow, separator, dependsOn, subGroups) {
		this.name = cname;
		this.parameters = parameters;
		this.type = type;
		this.label = ResourceDef.make(label);
		this.flow = flow; // currently not part of form.json spec
		this.separator = separator;
		this.dependsOn = dependsOn;
		this.subGroups = subGroups;
	}

	parameterNames() {
		return this.parameters;
	}

	groupType() {
		return (this.type ? this.type : GroupType.CONTROLS);
	}

	/**
	 * Returns the "separatorAfter" attribute which can be used to insert a horizontal
	 * separator before the control in the UI.
	 */
	separatorAfter() {
		if (this.separator === "after") {
			return true;
		}
		return false;
	}

	/**
	 * Returns the "separatorBefore" attribute which can be used to insert a horizontal
	 * separator before the control in the UI.
	 */
	separatorBefore() {
		if (this.separator === "before") {
			return true;
		}
		return false;
	}

	static makeGroup(uiGroup) {
		if (uiGroup) {
			let subGroups;
			if (_.has(uiGroup, "group_info")) {
				subGroups = [];
				for (const group of uiGroup.group_info) {
					const newGroup = Group.makeGroup(group);
					if (newGroup !== null) {
						subGroups.push(newGroup);
					}
				}
			}
			return new Group(
				_.propertyOf(uiGroup)("name"),
				_.propertyOf(uiGroup)("parameters"),
				_.propertyOf(uiGroup)("type"),
				_.propertyOf(uiGroup)("label"),
				_.propertyOf(uiGroup)("flow"),
				_.propertyOf(uiGroup)("separator"),
				_.propertyOf(uiGroup)("depends_on"),
				subGroups);
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
