/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

 import { UIInfo } from "./UIInfo";
 import { GroupType } from "./form-constants";
 import _ from "underscore";

class Group extends UIInfo {
	constructor(cname, parameters, uiHints, subGroups) {
		super({ uiHints: uiHints });
		this.name = cname;
		this.parameters = parameters;
		this.uiHints = uiHints;
		this.subGroups = subGroups;
	}

	parameterNames() {
		return this.parameters;
	}

	groupType() {
		if (_.has(this.uiHints, "groupType")) {
			return this.uiHints.groupType;
		}
		return GroupType.CONTROLS;
	}

	static makeGroup(groupOp) {
		if (groupOp) {
			let subGroups;
			if (_.has(groupOp, "subGroups")) {
				subGroups = [];
				for (const group of groupOp.subGroups) {
					const newGroup = Group.makeGroup(group);
					if (newGroup !== null) {
						subGroups.push(newGroup);
					}
				}
			}
			return new Group(
				_.propertyOf(groupOp)("name"),
				_.propertyOf(groupOp)("arguments"),
				_.propertyOf(groupOp)("uiHints"),
				subGroups);
		}
		return null;
	}
}

export class GroupMetadata {
	constructor(groups) {
		this.groups = groups;
	}

	static makeGroupMetadata(groupsOp) {
		if (groupsOp) {
			const groups = [];
			for (const group of groupsOp) {
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
