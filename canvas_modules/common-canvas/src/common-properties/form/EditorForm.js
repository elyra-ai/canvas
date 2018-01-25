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
import { GroupType, PanelType, Type, ControlType, ParamRole } from "../constants/form-constants";
import logger from "../../../utils/logger";
import { StructureDef } from "./StructureInfo";
import { Action } from "./ActionInfo";

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
	constructor(propType, isList, isMap, defaultValue) {
		this.propType = propType;
		this.isList = isList;
		this.isMap = isMap;
		this.defaultValue = defaultValue;
	}
	static make(parameter) {
		return new ValueDef(parameter.propType(), parameter.isList(),
			parameter.isMapValue(), parameter.defaultValue);
	}
}

class Label {
	constructor(text, numberGenerator) {
		this.text = text;
		if (numberGenerator) {
			this.numberGenerator = numberGenerator;
		}
	}
}

class Description {
	constructor(text, placement) {
		this.text = text;
		if (placement) {
			this.placement = placement;
		}
	}
}

class ControlPanel {
	constructor(id, panelType, controls, label) {
		this.id = id;
		this.panelType = panelType;
		this.uiItems = controls;
		if (label) {
			this.label = label;
		}
	}
}

class ActionPanel {
	constructor(id, panelType, actions) {
		this.id = id;
		this.panelType = panelType;
		this.uiItems = actions;
	}
}

class CustomControlPanel {
	constructor(id, panelType, parameters, data) {
		this.id = id;
		this.panelType = panelType;
		this.parameters = parameters;
		this.data = data;
	}
}

/**
 * Creates tab based on parameter definition
 */
function makePrimaryTab(propertyDef, group, l10nProvider) {
	const label = l10nProvider.l10nLabel(group, group.name);
	return new EditorTab(label, group.name, _makeUIItem(propertyDef.parameterMetadata, propertyDef.actionMetadata, group, propertyDef.structureMetadata, l10nProvider));
}

function _makeUIItem(parameterMetadata, actionMetadata, group, structureMetadata, l10nProvider) {
	const groupName = group.name;
	let groupItem = null;
	let groupLabel = null;
	switch (group.groupType()) {
	case GroupType.CONTROLS:
		return UIItem.makePanel(new ControlPanel(groupName, PanelType.GENERAL, _makeControls(parameterMetadata, actionMetadata, group, structureMetadata, l10nProvider)));
	case GroupType.COLUMN_ALLOCATION:
		return UIItem.makePanel(new ControlPanel(groupName, PanelType.COLUMN_ALLOCATION, _makeControls(parameterMetadata, actionMetadata, group, structureMetadata, l10nProvider)));
	case GroupType.COLUMN_SELECTION:
		return UIItem.makePanel(new ControlPanel(groupName, PanelType.COLUMN_SELECTION, _makeControls(parameterMetadata, actionMetadata, group, structureMetadata, l10nProvider)));
	case GroupType.ADDITIONAL: {
		const panel = new ControlPanel(groupName, PanelType.GENERAL, _makeControls(parameterMetadata, actionMetadata, group, structureMetadata, l10nProvider));
		groupLabel = l10nProvider.l10nLabel(group, group.name);
		return UIItem.makeAdditionalLink(groupLabel, groupLabel, panel);
	}
	case GroupType.SUB_TABS: {
		// Defines a sub-tab group where each child group represents a sub-tab.
		const subTabItems = [];
		group.subGroups.forEach(function(subGroup) {
			const subGroupName = subGroup.name;
			groupItem = _makeUIItem(parameterMetadata, actionMetadata, subGroup, structureMetadata, l10nProvider);
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
			groupItem = _makeUIItem(parameterMetadata, actionMetadata, subGroup, structureMetadata, l10nProvider);
			groupLabel = l10nProvider.l10nLabel(subGroup, subGroup.name);
			panSelSubItems.push(new EditorTab(groupLabel, subGroupName, groupItem));
		});
		return UIItem.makePanelSelector(panSelSubItems, group.dependsOn);
	}
	case GroupType.PANELS: {
		const panSubItems = [];
		group.subGroups.forEach(function(subGroup) {
			groupItem = _makeUIItem(parameterMetadata, actionMetadata, subGroup, structureMetadata, l10nProvider);
			panSubItems.push(groupItem);
		});
		return UIItem.makePanel(new ControlPanel(groupName, PanelType.GENERAL, panSubItems));
	}
	case GroupType.CHECKBOX_PANEL: {
		return UIItem.makeCheckboxPanel(new ControlPanel(groupName, PanelType.CHECKBOX_PANEL,
			_makeControls(parameterMetadata, actionMetadata, group, structureMetadata, l10nProvider), new Label(l10nProvider.l10nLabel(group, group.name))));
	}
	case GroupType.CUSTOM_PANEL: {
		return UIItem.makeCustomPanel(new CustomControlPanel(groupName, PanelType.CUSTOM, group.parameterNames(), group.data));
	}
	case GroupType.SUMMARY_PANEL: {
		groupLabel = l10nProvider.l10nLabel(group, group.name);
		const panSubItems = [];
		group.subGroups.forEach(function(subGroup) {
			groupItem = _makeUIItem(parameterMetadata, actionMetadata, subGroup, structureMetadata, l10nProvider);
			panSubItems.push(groupItem);
		});
		return UIItem.makeSummaryPanel(new ControlPanel(groupName, PanelType.SUMMARY, panSubItems, groupLabel));
	}
	case GroupType.ACTION_PANEL: {
		return UIItem.makePanel(new ActionPanel(groupName, PanelType.ACTION_PANEL, _makeActions(parameterMetadata, actionMetadata, group, structureMetadata, l10nProvider)));
	}
	case GroupType.TEXT_PANEL: {
		groupLabel = l10nProvider.l10nResource(group.label);
		const groupDesc = l10nProvider.l10nDesc(group, group.name);
		return UIItem.makeTextPanel(new Label(groupLabel), new Description(groupDesc));
	}
	default:
		return UIItem.makeStaticText("(Unknown group type '" + group.groupType() + "')");
	}
}

/**
 * Called on a base property group.
 */
function _makeControls(parameterMetadata, actionMetadata, group, structureMetadata, l10nProvider) {
	const uiItems = [];
	group.parameterNames().forEach(function(paramName) {
		// Assume property definition exists
		const prop = parameterMetadata.getParameter(paramName);
		let structureDef;
		if (prop.propType() === Type.STRUCTURE && structureMetadata) {
			structureDef = structureMetadata.getStructure(prop.baseType());
		}
		if (!(group instanceof StructureDef) || (group instanceof StructureDef && prop.isSubPanelEdit())) {
			const control = UIItem.makeControl(_makeControl(parameterMetadata, paramName, group, structureDef, l10nProvider));
			if (prop.separatorBefore()) {
				uiItems.push(UIItem.makeHSeparator());
			}
			if (prop.textBefore) {
				uiItems.push(UIItem.makeStaticText(prop.getTextBefore(l10nProvider), prop.getTextBeforeType()));
			}
			uiItems.push(control);
			if (prop.textAfter) {
				uiItems.push(UIItem.makeStaticText(prop.getTextAfter(l10nProvider), prop.getTextAfterType()));
			}
			if (prop.separatorAfter()) {
				uiItems.push(UIItem.makeHSeparator());
			}
		}
	});
	// panel selector groups
	if (group.subGroups) {
		group.subGroups.forEach(function(eachGroup) {
			const subGroup = _makeUIItem(parameterMetadata, actionMetadata, eachGroup, structureMetadata, l10nProvider);
			uiItems.push(subGroup);
		});
	}
	return uiItems;
}

function _makeStringControl(parameter, group) {
	let controlType;
	let role;
	if (parameter.isList()) {
		const controlObj = _processListParameter(parameter, group);
		controlType = controlObj.controlType;
		if (controlObj.role) {
			role = controlObj.role;
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
				controlType = ControlType.SELECTCOLUMN;
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
	return { controlType: controlType, role: role };
}

/**
 * Creates a control for the supplied property.
 */
function _makeControl(parameterMetadata, paramName, group, structureDef, l10nProvider) {
	// Assume the property is defined
	const parameter = parameterMetadata.getParameter(paramName);

	const additionalText = parameter.getAdditionalText(l10nProvider);
	const orientation = parameter.orientation;
	const required = parameter.required;
	const controlLabel = new Label(l10nProvider.l10nLabel(parameter, parameter.name), parameter.numberGenerator);
	let controlDesc;
	if (parameter.description) {
		controlDesc = new Description(l10nProvider.l10nDesc(parameter, parameter.name),
			parameter.description ? parameter.description.placement : null);
	}

	// The role is used to modify the behaviour of certain controls
	let role;
	let separateLabel = true;
	let subControls;
	let keyIndex;
	let defaultRow;
	let childItem;
	let controlType;
	let moveableRows = parameter.moveableRows;
	let rowSelection;
	let addRemoveRows;

	// The control type defines the basic UI element that should be used to edit the property
	if (parameter.getRole() === ParamRole.CUSTOM) {
		controlType = ControlType.CUSTOM;
	} else {
		switch (parameter.propType()) {
		case Type.STRING: {
			const returnObject = _makeStringControl(parameter, group);
			controlType = returnObject.controlType;
			role = returnObject.role;
			break;
		}
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
				if (structureDef.hasSubPanel()) {
					childItem = _makeEditStyleSubPanel(structureDef, l10nProvider);
				}
				keyIndex = structureDef.keyAttributeIndex();
				// The defaultRow allows the UI to create a new row with sensible settings
				// when needed
				defaultRow = structureDef.defaultStructure();
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
					} else if (group.groupType() === GroupType.COLUMN_SELECTION ||
							parameter.control === ControlType.STRUCTURETABLE) {
						controlType = ControlType.STRUCTURETABLE;
						moveableRows = structureDef.moveableRows;
						rowSelection = structureDef.rowSelection;
						addRemoveRows = structureDef.addRemoveRows;
					} else {
						controlType = ControlType.STRUCTURELISTEDITOR;
						moveableRows = structureDef.moveableRows;
						rowSelection = structureDef.rowSelection;
						addRemoveRows = structureDef.addRemoveRows;
					}
				} else {
					logger.warn("Complex types should be arrays or maps.  Found: " + parameter.propType());
					controlType = ControlType.STRUCTUREEDITOR;
				}
			} else {
				controlType = ControlType.TEXTFIELD;
			}
			break;
		default:
			role = "???" + parameter.propType() + "???";
			controlType = ControlType.TEXTAREA;
			break;
		}
	}
	let valueLabels;
	if (parameter.getRole() === ParamRole.ENUM) {
		valueLabels = _parameterValueLabels(parameter, l10nProvider);
	}
	return new Control(parameter.name,
		controlLabel,
		separateLabel,
		controlDesc,
		parameter.getControl(controlType),
		ValueDef.make(parameter),
		role, additionalText,
		orientation,
		parameter.getValidValues(),
		valueLabels,
		parameter.valueIcons,
		parameter.sortable,
		parameter.filterable,
		parameter.charLimit,
		subControls,
		keyIndex,
		defaultRow,
		childItem,
		moveableRows,
		required,
		parameter.language,
		parameter.summary,
		rowSelection,
		parameter.generatedValues,
		addRemoveRows
	);
}

function _processListParameter(parameter, group) {
	const controlObj = {};
	switch (parameter.getRole()) {
	case ParamRole.TEXT:
		controlObj.controlType = ControlType.TEXTAREA;
		break;
	case ParamRole.ENUM:
		if (parameter.getValidValueCount() < 5) {
			controlObj.controlType = ControlType.CHECKBOXSET;
		} else {
			controlObj.controlType = ControlType.SOMEOFSELECT;
		}
		break;
	case ParamRole.COLUMN:
		if (group.groupType() === GroupType.COLUMN_ALLOCATION) {
			controlObj.controlType = ControlType.ALLOCATEDCOLUMNS;
		} else {
			controlObj.role = ParamRole.COLUMN;
			controlObj.controlType = ControlType.SELECTCOLUMNS;
		}
		break;
	default:
		controlObj.controlType = ControlType.TEXTAREA;
	}
	return controlObj;
}

function _makeEditStyleSubPanel(structureDef, l10nProvider) {
	var structureMetadata;
	// If we"re not editing in-line then create a sub-panel that can be used to edit the attributes
	const panel = new ControlPanel(
		structureDef.name,
		PanelType.GENERAL,
		_makeControls(structureDef.parameterMetadata,
			structureDef.actionMetadata,
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
	let controlDesc;
	if (parameter.description) {
		controlDesc = new Description(l10nProvider.l10nDesc(parameter, parameter.name),
			parameter.description ? parameter.description.placement : null);
	}

	let role;
	let controlType;
	switch (parameter.propType()) {
	case Type.STRING:
		role = parameter.getRole();
		switch (role) {
		case ParamRole.ENUM:
			controlType = ControlType.ONEOFSELECT;
			break;
		case ParamRole.COLUMN:
			role = ParamRole.COLUMN;
			controlType = ControlType.SELECTCOLUMN;
			break;
		case ParamRole.NEW_COLUMN:
			controlType = ControlType.TEXTFIELD;
			break;
		case ParamRole.EXPRESSION:
			controlType = ControlType.EXPRESSION;
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
		controlDesc,
		parameter.visible,
		parameter.columns(8),
		parameter.getControl(controlType),
		ValueDef.make(parameter),
		role,
		additionalText,
		orientation,
		parameter.getValidValues(),
		valueLabels,
		parameter.valueIcons,
		parameter.sortable,
		parameter.filterable,
		parameter.charLimit,
		parameter.editStyle,
		parameter.isKey,
		parameter.dmDefault,
		parameter.language,
		parameter.summary,
		parameter.generatedValues
	);
}

/**
 * Called on a base property group.
 */
function _makeActions(parameterMetadata, actionMetadata, group, structureMetadata, l10nProvider) {
	const uiItems = [];
	group.actionIds().forEach(function(actionId) {
		// Assume property definition exists
		const action = UIItem.makeAction(_makeAction(actionMetadata.getAction(actionId), l10nProvider));
		uiItems.push(action);
	});
	return uiItems;
}

function _makeAction(action, l10nProvider) {
	const actionLabel = new Label(l10nProvider.l10nLabel(action, action.id));
	let actionDesc;
	if (action.description) {
		actionDesc = new Description(l10nProvider.l10nDesc(action, action.id));
	}
	return new Action(action.id, actionLabel, actionDesc, action.control, action.data);
}

function _parameterValueLabels(parameter, l10nProvider) {
	if (parameter.valueRestriction) {
		let key;
		if (parameter.resource_key) {
			key = parameter.resource_key;
		} else {
			key = parameter.name;
		}
		const paramLabels = [];
		parameter.getValidValues().forEach(function(paramValue) {
			paramLabels.push(l10nProvider.l10nValueLabel(key, paramValue));
		});
		return paramLabels;
	}
	return null;
}

module.exports.makePrimaryTab = makePrimaryTab;
