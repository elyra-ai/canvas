/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/


class ControlDef {
	constructor(cname, label, controlType, valueDef, role, additionalText, orientation, values, valueLabels, valueIcons, charLimit) {
		this.name = cname;
		this.label = label;
		this.controlType = controlType;
		this.valueDef = valueDef;
		this.role = role;
		this.additionalText = additionalText;
		this.orientation = orientation;
		this.values = values;
		this.valueLabels = valueLabels;
		this.valueIcons = valueIcons;
		this.charLimit = charLimit;
	}
}

export class Control extends ControlDef {
	constructor(cname, label, separateLabel, controlType, valueDef, role, additionalText, orientation, values, valueLabels, valueIcons, charLimit,
		subControls, keyIndex, defaultRow, childItem) {
		super(cname, label, controlType, valueDef, role, additionalText, orientation, values, valueLabels, valueIcons, charLimit);
		this.separateLabel = separateLabel;
		this.subControls = subControls;
		this.keyIndex = keyIndex;
		this.defaultRow = defaultRow;
		this.childItem = childItem;
	}
}

export class SubControl extends ControlDef {
	constructor(cname, label, visible, width, controlType, valueDef, role, additionalText, orientation, values, valueLabels, valueIcons, charLimit) {
		super(cname, label, controlType, valueDef, role, additionalText, orientation, values, valueLabels, valueIcons, charLimit);
		this.visible = visible;
		this.width = width;
	}
}
