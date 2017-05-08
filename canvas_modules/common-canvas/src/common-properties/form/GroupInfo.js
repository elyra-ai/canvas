/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

 import {UIInfo} from "./UIInfo"
 import {GroupType} from "./form-constants"
 import _ from "underscore";

class Group extends UIInfo{
	constructor(name, parameters, uiHints, subGroups){
		super(undefined, undefined, undefined, uiHints);
		this.name = name;
		this.parameters = parameters;
		this.uiHints = uiHints;
		this.subGroups = subGroups;
	}

	parameterNames(){
		return this.parameters;
	}

	groupType(){
		if (_.has(this.uiHints, "groupType")){
			return this.uiHints.groupType;
		}else{
			return GroupType.CONTROLS;
		}
	}

	static makeGroup(groupOp){
		if (groupOp){
			let subGroups;
			if (_.has(groupOp,"subGroups")){
				subGroups = [];
				for (let group of groupOp.subGroups){
					subGroups.push(Group.makeGroup(group));
				}
			}
			return new Group(
				_.propertyOf(groupOp)("name"),
				_.propertyOf(groupOp)("arguments"),
				_.propertyOf(groupOp)("uiHints"),
				subGroups)
		}
	}
}

export class GroupMetadata{
	constructor(groups){
		this.groups = groups;
	}

	static makeGroupMetadata(groupsOp){
		if (groupsOp){
			let groups = [];
			for (let group of groupsOp){
				groups.push(Group.makeGroup(group));
			}
			return new GroupMetadata(groups);
		}
	}
}
