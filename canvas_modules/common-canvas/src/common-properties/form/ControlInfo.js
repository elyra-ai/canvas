/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

class ControlDef{
	constructor(name, label, controlType, valueDef, role, additionalText, orientation, values, valueLabels) {
    this.name = name;
		this.label = label
		this.controlType = controlType;
		this.valueDef = valueDef;
		this.role = role;
		this.additionalText = additionalText;
		this.orientation = orientation;
		this.values = values;
		this.valueLabels = valueLabels;
	}
}
export class Control extends ControlDef{
	constructor(name, label, separateLabel, controlType, valueDef, role, additionalText, orientation, values, valueLabels, subControls, keyIndex, defaultRow, childItem) {
		super(name, label, controlType, valueDef, role, additionalText, orientation, values, valueLabels);
		this.separateLabel = separateLabel;
		this.subControls = subControls;
		this.keyIndex = keyIndex;
		this.defaultRow = defaultRow;
		this.childItem = childItem;
	}
}
export class SubControl extends ControlDef{
	constructor(name, label, visible, width, controlType, valueDef, role, additionalText, orientation, values, valueLabels){
		super(name, label, controlType, valueDef, role, additionalText, orientation, values, valueLabels);
		this.visible = visible;
		this.width = width;
	}
}
