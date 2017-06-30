/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

 /* eslint complexity: ["error", 37] */
 /* eslint max-depth: ["error", 5] */

import { Control, SubControl } from "./ControlInfo";
import { UIItem } from "./UIItem";
import { GroupType, PanelType, Type, ControlType, ParamRole } from "./form-constants";

/**
 * The Editor is the primary container for the editing controls. It defines the tabs within the
 * form which themselves contain the controls and other UI artifacts.
 */
export class EditorTab {
	constructor(label, cname, uiItem) {
		this.text = label;
		this.group = cname;
		this.content = uiItem;
	}
}

class ValueDef {
	constructor(propType, isList, isMap) {
		this.propType = propType;
		this.isList = isList;
		this.isMap = isMap;
	}
	static make(parameter) {
		return new ValueDef(parameter.propType(), parameter.isList(), parameter.isMapValue());
	}
}
class Label {
	constructor(text) {
		this.text = text;
	}
}
class ControlPanel {
	constructor(id, panelType, controls) {
		this.id = id;
		this.panelType = panelType;
		this.uiItems = controls;
	}
}

/**
 * Creates tab based on parameter definition
 */
function makePrimaryTab(propertyDef, group, l10nProvider) {
	const label = l10nProvider.l10nLabel(group, group.name);
	return new EditorTab(label, group.name, _makeUIItem(propertyDef.parameterMetadata, group, propertyDef.structureMetadata, l10nProvider));
}

function _makeUIItem(parameterMetadata, group, structureMetadata, l10nProvider) {
	const groupName = group.name;
	let groupItem = null;
	let groupLabel = null;
	switch (group.groupType()) {
	case GroupType.CONTROLS:
		return UIItem.makePanel(new ControlPanel(groupName, PanelType.GENERAL, _makeControls(parameterMetadata, group, structureMetadata, l10nProvider)));
	case GroupType.COLUMN_ALLOCATION:
		return UIItem.makePanel(new ControlPanel(groupName, PanelType.COLUMN_ALLOCATION, _makeControls(parameterMetadata, group, structureMetadata, l10nProvider)));
	case GroupType.COLUMN_SELECTION:
		return UIItem.makePanel(new ControlPanel(groupName, PanelType.COLUMN_SELECTION, _makeControls(parameterMetadata, group, structureMetadata, l10nProvider)));
	case GroupType.ADDITIONAL: {
		const panel = new ControlPanel(groupName, PanelType.GENERAL, _makeControls(parameterMetadata, group, structureMetadata, l10nProvider));
		groupLabel = l10nProvider.l10nLabel(group, group.name);
		return UIItem.makeAdditionalLink(groupLabel, groupLabel, panel);
	}
	case GroupType.SUB_TABS: {
		// Defines a sub-tab group where each child group represents a sub-tab.
		const subTabItems = [];
		group.subGroups.forEach(function(subGroup) {
			const subGroupName = subGroup.name;
			groupItem = _makeUIItem(parameterMetadata, subGroup, structureMetadata, l10nProvider);
			groupLabel = l10nProvider.l10nLabel(subGroup, subGroup.name);
			subTabItems.push(new EditorTab(groupLabel, subGroupName, groupItem));
		});
		return UIItem.makeSubTabs(subTabItems);
	}
	case GroupType.PANEL_SELECTOR: {
		// Defines a sub-tab group where each child group represents a sub-tab.
		const panSelSubItems = [];
		group.subGroups.forEach(function(subGroup) {
			const subGroupName = subGroup.name;
			groupItem = _makeUIItem(parameterMetadata, subGroup, structureMetadata, l10nProvider);
			groupLabel = l10nProvider.l10nLabel(subGroup, subGroup.name);
			panSelSubItems.push(new EditorTab(groupLabel, subGroupName, groupItem));
		});
		return UIItem.makePanelSelector(panSelSubItems, group.dependsOn);
	}
	case GroupType.PANELS: {
		const panSubItems = [];
		group.subGroups.forEach(function(subGroup) {
			groupItem = _makeUIItem(parameterMetadata, subGroup, structureMetadata, l10nProvider);
			panSubItems.push(groupItem);
		});
		return UIItem.makePanel(new ControlPanel(groupName, PanelType.GENERAL, panSubItems));
	}
	default:
		return UIItem.makeStaticText("(Unknown group type '" + group.groupType() + "')");
	}
}

/**
 * Called on a base property group.
 */
function _makeControls(parameterMetadata, group, structureMetadata, l10nProvider) {
	const uiItems = [];
	group.parameterNames().forEach(function(paramName) {
		// Assume property definition exists
		const prop = parameterMetadata.getParameter(paramName);
		let structureDef;
		if (prop.propType() === Type.STRUCTURE && structureMetadata) {
			structureDef = structureMetadata.getStructure(prop.baseType());
		}
		const control = UIItem.makeControl(_makeControl(parameterMetadata, paramName, group, structureDef, l10nProvider));
		if (prop.separatorBefore() || prop.separatorAfter()) {
			if (prop.separatorBefore()) {
				uiItems.push(UIItem.makeHSeparator());
			}
			uiItems.push(control);
			if (prop.separatorAfter()) {
				uiItems.push(UIItem.makeHSeparator());
			}
		} else {
			uiItems.push(control);
		}
	});
	if (group.subGroups) {
		group.subGroups.forEach(function(eachGroup) {
			const subGroup = _makeUIItem(parameterMetadata, eachGroup, structureMetadata, l10nProvider);
			uiItems.push(subGroup);
		});
	}
	return uiItems;
}

/**
 * Creates a control for the supplied property.
 */
function _makeControl(parameterMetadata, paramName, group, structureDef, l10nProvider) {
	// Assume the property is defined
	const parameter = parameterMetadata.getParameter(paramName);

	const additionalText = parameter.getAdditionalText(l10nProvider);
	const orientation = parameter.orientation;
	const controlLabel = new Label(l10nProvider.l10nLabel(parameter, parameter.name));

	// The role is used to modify the behaviour of certain controls
	let role;
	let separateLabel = true;
	let subControls;
	let keyIndex;
	let defaultRow;
	let childItem;
	let controlType;

	// The control type defines the basic UI element that should be used to edit the property
	if (parameter.getRole() === ParamRole.CUSTOM) {
		controlType = ControlType.CUSTOM;
	} else {
		switch (parameter.propType()) {
		case Type.STRING:
			if (parameter.isList()) {
				switch (parameter.getRole()) {
				case ParamRole.TEXT:
					controlType = ControlType.TEXTAREA;
					break;
				case ParamRole.ENUM:
					if (parameter.getValidValueCount() < 5) {
						controlType = ControlType.CHECKBOXSET;
					} else {
						controlType = ControlType.SOMEOFSELECT;
					}
					break;
				case ParamRole.COLUMN:
					if (group.groupType() === GroupType.COLUMN_ALLOCATION) {
						controlType = ControlType.ALLOCATEDCOLUMNS;
					} else if (group.groupType() === GroupType.COLUMN_SELECTION) {
						controlType = ControlType.COLUMNSELECT;
					} else {
						controlType = ControlType.SOMEOFCOLUMNS;
					}
					break;
				default:
					controlType = ControlType.TEXTAREA;
				}
			} else {
				switch (parameter.getRole()) {
				case ParamRole.TEXT:
					controlType = ControlType.TEXTAREA;
					break;
				case ParamRole.ENUM:
					if (parameter.getValidValueCount() < 5) {
						controlType = ControlType.RADIOSET;
					} else {
						controlType = ControlType.ONEOFSELECT;
					}
					break;
				case ParamRole.COLUMN:
					if (group.groupType() === GroupType.COLUMN_ALLOCATION) {
						controlType = ControlType.ALLOCATEDCOLUMN;
					} else {
						controlType = ControlType.ONEOFCOLUMNS;
					}
					break;
				case ParamRole.EXPRESSION:
					controlType = ControlType.EXPRESSION;
					break;
				case ParamRole.EMAIL:
					role = ParamRole.EMAIL;
					controlType = ControlType.TEXTFIELD;
					break;
				case ParamRole.URL:
					role = ParamRole.URL;
					controlType = ControlType.TEXTFIELD;
					break;
				case ParamRole.COLOR:
					role = ParamRole.COLOR;
					controlType = ControlType.TEXTFIELD;
					break;
				default:
					controlType = ControlType.TEXTFIELD;
				}
			}
			break;
		case Type.PASSWORD:
			controlType = ControlType.PASSWORDFIELD;
			break;
		case Type.BOOLEAN:
			separateLabel = false;
			controlType = ControlType.CHECKBOX;
			break;
		case Type.INTEGER:
			if (parameter.isList()) {
				controlType = ControlType.TEXTAREA;
			} else {
				controlType = ControlType.NUMBERFIELD;
			}
			break;
		case Type.LONG:
			if (parameter.isList()) {
				controlType = ControlType.TEXTAREA;
			} else {
				controlType = ControlType.NUMBERFIELD;
			}
			break;
		case Type.DOUBLE:
			if (parameter.isList()) {
				controlType = ControlType.TEXTAREA;
			} else {
				controlType = ControlType.NUMBERFIELD;
			}
			break;
		case Type.DATE:
			role = Type.DATE;
			if (parameter.isList()) {
				controlType = ControlType.TEXTAREA;
			} else {
				controlType = ControlType.TEXTFIELD;
			}
			break;
		case Type.STRUCTURE:
			if (structureDef) {
				if (structureDef.isEditStyleSubpanel()) {
					childItem = _makeEditStyleSubPanel(structureDef, l10nProvider);
				}
				keyIndex = structureDef.keyAttributeIndex();
				// The defaultRow allows the UI to create a new row with sensible settings
				// when needed
				defaultRow = structureDef.defaultStructure(parameter.isList());
				// For inline/row editing, create definitions for all the columns that can be edited
				subControls = [];
				structureDef.parameterMetadata.paramDefs.forEach(function(param) {
					subControls.push(_makeSubControl(param, l10nProvider));
				});
				// If the property is a keyed property or a structure list then the key should not be included in the
				// structure definition. However it will still need to be included in the table column definitions.
				if ((parameter.isMapValue() || parameter.isList()) && structureDef.keyDefinition) {
					subControls.unshift(_makeSubControl(structureDef.keyDefinition, l10nProvider));
				}
				if (parameter.isList() || parameter.isMapValue()) {
					if (group.groupType() === GroupType.COLUMN_ALLOCATION) {
						controlType = ControlType.ALLOCATEDSTRUCTURES;
					} else if (group.groupType() === GroupType.COLUMN_SELECTION) {
						controlType = ControlType.STRUCTURETABLE;
					} else {
						controlType = ControlType.STRUCTURELISTEDITOR;
					}
				} else {
					controlType = ControlType.STRUCTUREEDITOR;
				}
			} else {
				controlType = ControlType.TEXTFIELD;
			}
			break;
		default:
			role = "???" + parameter.propType() + "???";
			controlType = ControlType.TEXTAREA;
		}
	}
	let valueLabels;
	if (parameter.getRole() === ParamRole.ENUM) {
		valueLabels = _parameterValueLabels(parameter, l10nProvider);
	}
	return new Control(parameter.name,
		controlLabel,
		separateLabel,
		parameter.getControl(controlType),
		ValueDef.make(parameter),
		role, additionalText,
		orientation,
		parameter.getValidValues(),
		valueLabels,
		parameter.charLimit,
		subControls,
		keyIndex,
		defaultRow,
		childItem
	);
}

function _makeEditStyleSubPanel(structureDef, l10nProvider) {
	var structureMetadata;
	// If we"re not editing in-line then create a sub-panel that can be used to edit the attributes
	const panel = new ControlPanel(
		structureDef.name,
		PanelType.GENERAL,
		_makeControls(structureDef.parameterMetadata,
			structureDef,
			structureMetadata,
			l10nProvider)
	);
	const groupLabel = l10nProvider.l10nLabel(structureDef, structureDef.name);
	return UIItem.makeAdditionalLink("...", groupLabel, panel);
}

/**
 * Creates a column control for the supplied property/attribute.
 */
function _makeSubControl(parameter, l10nProvider) {
	const additionalText = parameter.getAdditionalText(l10nProvider);
	const orientation = parameter.orientation;
	const controlLabel = new Label(l10nProvider.l10nLabel(parameter, parameter.name));
	let role;
	let controlType;
	switch (parameter.propType()) {
	case Type.STRING:
		switch (parameter.getRole()) {
		case ParamRole.ENUM:
			controlType = ControlType.ONEOFSELECT;
			break;
		case ParamRole.COLUMN:
			controlType = ControlType.ONEOFCOLUMNS;
			break;
		default:
			controlType = ControlType.TEXTFIELD;
		}
		break;
	case Type.PASSWORD:
		controlType = ControlType.PASSWORDFIELD;
		break;
	case Type.BOOLEAN:
		controlType = ControlType.CHECKBOX;
		break;
	case Type.INTEGER:
		controlType = ControlType.NUMBERFIELD;
		break;
	case Type.LONG:
		controlType = ControlType.NUMBERFIELD;
		break;
	case Type.DOUBLE:
		controlType = ControlType.NUMBERFIELD;
		break;
	case Type.DATE:
		role = "date";
		controlType = ControlType.TEXTFIELD;
		break;
	default:
		role = "???" + parameter.propType() + "???";
		controlType = ControlType.TEXTFIELD;
	}

	let valueLabels;
	if (parameter.getRole() === ParamRole.ENUM) {
		valueLabels = _parameterValueLabels(parameter, l10nProvider);
	}

	return new SubControl(parameter.name,
		controlLabel,
		parameter.visible,
		parameter.columns(8),
		parameter.getControl(controlType),
		ValueDef.make(parameter),
		role,
		additionalText,
		orientation,
		parameter.getValidValues(),
		valueLabels,
		parameter.charLimit
	);
}

function _parameterValueLabels(parameter, l10nProvider) {
	if (parameter.valueRestriction) {
		let key;
		if (parameter.resourceKey) {
			key = parameter.resourceKey;
		} else {
			key = parameter.name;
		}
		const paramLabels = [];
		parameter.getValidValues().forEach(function(paramValue) {
			paramLabels.push(l10nProvider.l10nValueLabel(key, paramValue));
		});
		return paramLabels;
	}
}

module.exports.makePrimaryTab = makePrimaryTab;
