/*
 * Copyright 2017-2024 Elyra Authors
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

/* eslint max-depth: ["error", 5] */

import { Control } from "./ControlInfo";
import { UIItem } from "./UIItem";
import { GroupType, PanelType, Type, ControlType, ParamRole, ORIENTATIONS, EditStyle } from "../constants/form-constants";
import { CONTAINER_TYPE, ROW_SELECTION } from "../constants/constants";
import logger from "../../../utils/logger";
import { StructureDef } from "./StructureInfo";
import { Action } from "./ActionInfo";
import { Button } from "./ButtonInfo";
import { get } from "lodash";

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
		this.propType = propType === Type.OBJECT ? Type.STRUCTURE : propType;
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
	constructor(text, placement, link) {
		this.text = text;
		if (placement) {
			this.placement = placement;
		}
		if (link) {
			this.link = link;
		}
	}
}

class ControlPanel {
	constructor(id, panelType, className, nestedPanel, controls, label, copen = false) {
		this.id = id;
		this.panelType = panelType;
		this.nestedPanel = nestedPanel;
		this.uiItems = controls;
		this.open = copen;
		if (label) {
			this.label = label;
		}
		if (className) {
			this.className = className;
		}
	}
}

class ActionPanel {
	constructor(id, panelType, className, nestedPanel, actions, label, description) {
		this.id = id;
		this.panelType = panelType;
		this.nestedPanel = nestedPanel;
		this.uiItems = actions;
		if (className) {
			this.className = className;
		}
		if (label) {
			this.label = label;
		}
		if (description) {
			this.description = description;
		}
	}
}

class CustomControlPanel {
	constructor(id, panelType, className, nestedPanel, parameters, data) {
		this.id = id;
		this.panelType = panelType;
		this.nestedPanel = nestedPanel;
		this.parameters = parameters;
		this.data = data;
		if (className) {
			this.className = className;
		}
	}
}

class NumberGenerator {
	constructor(text, numberGenerator) {
		this.text = text;
		if (numberGenerator.range) {
			this.range = numberGenerator.range;
		}
	}
}

/**
 * Creates tab based on parameter definition
 */
function makePrimaryTab(propertyDef, group, l10nProvider, containerType) {
	const label = l10nProvider.l10nLabel(group, group.name);
	const additionalInfo = {
		light: true,
		containerType
	};
	return new EditorTab(label, group.name,
		_makeUIItem(propertyDef.parameterMetadata, propertyDef.actionMetadata, group, propertyDef.structureMetadata, l10nProvider, additionalInfo));
}

function _makeUIItem(parameterMetadata, actionMetadata, group, structureMetadata, l10nProvider, additionalInfo) {
	const groupName = group.name;
	let groupItem = null;
	let groupLabel = null;
	const groupClassName = group.className;
	const nestedPanel = get(group, "nestedPanel", false);
	switch (group.groupType()) {
	case GroupType.CONTROLS:
		return UIItem.makePanel(new ControlPanel(groupName, PanelType.GENERAL, groupClassName, nestedPanel,
			_makeControls(parameterMetadata, actionMetadata, group, structureMetadata, l10nProvider, additionalInfo, EditStyle.SUBPANEL)));
	case GroupType.COLUMN_SELECTION:
		return UIItem.makePanel(new ControlPanel(groupName, PanelType.COLUMN_SELECTION, groupClassName, nestedPanel,
			_makeControls(parameterMetadata, actionMetadata, group, structureMetadata, l10nProvider, additionalInfo, EditStyle.SUBPANEL)));
	case GroupType.ADDITIONAL: {
		const panel = new ControlPanel(groupName, PanelType.GENERAL, groupClassName, nestedPanel,
			_makeControls(parameterMetadata, actionMetadata, group, structureMetadata, l10nProvider, additionalInfo, EditStyle.SUBPANEL));
		groupLabel = l10nProvider.l10nLabel(group, group.name);
		return UIItem.makeAdditionalLink(groupLabel, groupLabel, panel);
	}
	case GroupType.SUB_TABS: {
		// Defines a sub-tab group where each child group represents a sub-tab.
		const subTabItems = [];
		if (Array.isArray(group.subGroups)) {
			group.subGroups.forEach(function(subGroup) {
				const subGroupName = subGroup.name;
				groupItem = _makeUIItem(parameterMetadata, actionMetadata, subGroup, structureMetadata, l10nProvider, additionalInfo);
				groupLabel = l10nProvider.l10nLabel(subGroup, subGroup.name);
				subTabItems.push(new EditorTab(groupLabel, subGroupName, groupItem));
			});
		}
		return UIItem.makeSubTabs(subTabItems, groupClassName, nestedPanel);
	}
	case GroupType.PANEL_SELECTOR: {
		// Defines a sub-tab group where each child group represents a sub-tab.
		const panSelSubItems = _genPanelSelectorPanels(group, parameterMetadata, actionMetadata, structureMetadata, l10nProvider, additionalInfo);
		return UIItem.makePanelSelector(groupName, panSelSubItems, group.dependsOn, groupClassName);
	}
	case GroupType.PANELS: {
		const panSubItems = [];
		if (Array.isArray(group.subGroups)) {
			group.subGroups.forEach(function(subGroup) {
				groupItem = _makeUIItem(parameterMetadata, actionMetadata, subGroup, structureMetadata, l10nProvider, additionalInfo);
				panSubItems.push(groupItem);
			});
		}
		return UIItem.makePanel(new ControlPanel(groupName, PanelType.GENERAL, groupClassName, nestedPanel, panSubItems));
	}
	case GroupType.COLUMN_PANEL: {
		const panSubItems = [];
		if (Array.isArray(group.subGroups)) {
			group.subGroups.forEach(function(subGroup) {
				groupItem = _makeUIItem(parameterMetadata, actionMetadata, subGroup, structureMetadata, l10nProvider, additionalInfo);
				panSubItems.push(groupItem);
			});
		}
		return UIItem.makePanel(new ControlPanel(groupName, PanelType.COLUMN_PANEL, groupClassName, nestedPanel, panSubItems));
	}
	case GroupType.CUSTOM_PANEL: {
		return UIItem.makeCustomPanel(new CustomControlPanel(groupName, PanelType.CUSTOM, groupClassName, nestedPanel, group.parameterNames(), group.data));
	}
	case GroupType.SUMMARY_PANEL: {
		groupLabel = l10nProvider.l10nLabel(group, group.name);
		const panSubItems = [];
		if (Array.isArray(group.subGroups)) {
			group.subGroups.forEach(function(subGroup) {
				groupItem = _makeUIItem(parameterMetadata, actionMetadata, subGroup, structureMetadata, l10nProvider, additionalInfo);
				panSubItems.push(groupItem);
			});
		}
		return UIItem.makePanel(new ControlPanel(groupName, PanelType.SUMMARY, groupClassName, nestedPanel, panSubItems, groupLabel));
	}
	case GroupType.ACTION_PANEL: {
		groupLabel = l10nProvider.l10nResource(group.label);
		let groupDesc;
		if (group.description) {
			groupDesc = new Description(l10nProvider.l10nResource(group.description),
				null,
				group.description ? group.description.link : null);
		}
		return UIItem.makePanel(new ActionPanel(groupName, PanelType.ACTION_PANEL, groupClassName, nestedPanel,
			_makeActions(parameterMetadata, actionMetadata, group, structureMetadata, l10nProvider), groupLabel, groupDesc));
	}
	case GroupType.TEXT_PANEL: {
		groupLabel = l10nProvider.l10nResource(group.label);
		let groupDesc;
		if (group.description) {
			groupDesc = new Description(l10nProvider.l10nResource(group.description),
				group.description ? group.description.placement : null,
				group.description ? group.description.link : null);
		}
		return UIItem.makeTextPanel(groupName, groupLabel, groupDesc, groupClassName, nestedPanel);
	}
	case GroupType.TWISTY_PANEL: {
		groupLabel = l10nProvider.l10nLabel(group, group.name);
		const panSubItems = [];
		if (Array.isArray(group.subGroups)) {
			group.subGroups.forEach(function(subGroup) {
				groupItem = _makeUIItem(parameterMetadata, actionMetadata, subGroup, structureMetadata, l10nProvider, additionalInfo);
				panSubItems.push(groupItem);
			});
		}
		return UIItem.makePanel(new ControlPanel(groupName, PanelType.TWISTY_PANEL, groupClassName, nestedPanel, panSubItems, groupLabel, group.open));
	}
	case GroupType.TEARSHEET_PANEL: {
		groupLabel = l10nProvider.l10nLabel(group, group.name);
		let groupDesc;
		if (group.description) {
			groupDesc = new Description(l10nProvider.l10nResource(group.description));
		}
		const panSubItems = [];
		if (Array.isArray(group.subGroups)) {
			group.subGroups.forEach(function(subGroup) {
				const additionalInfoUpdated = Object.assign({}, additionalInfo, { light: false });
				groupItem = _makeUIItem(parameterMetadata, actionMetadata, subGroup, structureMetadata, l10nProvider, additionalInfoUpdated);
				panSubItems.push(groupItem);
			});
		}
		return UIItem.makeTearsheetPanel(new ControlPanel(groupName, PanelType.TEARSHEET, groupClassName, nestedPanel, panSubItems, groupLabel, false), groupDesc);
	}
	default:
		logger.warn("(Unknown group type '" + group.groupType() + "')");
		return null;
	}
}

/**
 * Called on a base property group.
 */
function _makeControls(parameterMetadata, actionMetadata, group, structureMetadata, l10nProvider, additionalInfo, editStyle) {
	const uiItems = [];
	const panelInsertedFor = [];
	if (!Array.isArray(group.parameterNames())) {
		return uiItems;
	}
	group.parameterNames().forEach(function(paramName) {
		// Assume property definition exists
		const prop = parameterMetadata.getParameter(paramName);
		// Edit attributes in subpanel when edit_style = "subpanel" or multi select edit rows having edit_style = "inline"
		const parameterEditStyle = (editStyle === EditStyle.SUBPANEL) ? prop.isSubPanelEdit() : prop.isInlineEdit();
		let structureDef;
		if (prop.propType() === Type.STRUCTURE && structureMetadata) {
			structureDef = structureMetadata.getStructure(prop.baseType());
		}
		if (!(group instanceof StructureDef) || (group instanceof StructureDef && parameterEditStyle)) {
			const ctrl = _makeControl(parameterMetadata, paramName, group, structureDef, l10nProvider, actionMetadata, structureMetadata, null, additionalInfo);
			const control = UIItem.makeControl(ctrl);
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

			// If this control is a vertical radio button set and any element of
			// the associated subgroups is a panel of type panelSelector which has
			// the insertPanels boolean set to true and has its 'depends on' field
			// set to the name of the parameter being displayed by this radio
			// button control, then process the subgroup in the usual way but add
			// each to the additionalItems in the control. This allows them to be
			// inserted into the radio button set at display time.
			if (group.subGroups && group.subGroups.length > 0) {
				for (var i = 0; i < group.subGroups.length; i++) {
					if (control.control.controlType === ControlType.RADIOSET &&
							control.control.orientation === ORIENTATIONS.VERTICAL &&
							group.subGroups[i].type === GroupType.PANEL_SELECTOR &&
							group.subGroups[i].insertPanels === true &&
							group.subGroups[i].dependsOn === control.control.name) {
						panelInsertedFor.push(group.subGroups[i].dependsOn);
						control.additionalItems =
							_genPanelSelectorPanels(group.subGroups[i], parameterMetadata, actionMetadata, structureMetadata, l10nProvider, additionalInfo);
					}
				}
			}
		}
	});

	// Process any subgroups which have not already been inserted into a
	// radio button set (see code in loop above).
	if (Array.isArray(group.subGroups)) {
		group.subGroups.forEach(function(subGroup) {
			if (!_hasPanelBeenInserted(panelInsertedFor, subGroup.dependsOn)) {
				const uiItem = _makeUIItem(parameterMetadata, actionMetadata, subGroup, structureMetadata, l10nProvider, additionalInfo);
				uiItems.push(uiItem);
			}
		});
	}
	return uiItems;
}

/* Returns true if the panelInsertedFor array contains the dependsOn
 * value passed in.
 */
function _hasPanelBeenInserted(panelInsertedFor, dependsOn) {
	if (dependsOn) {
		for (var i = 0; i < panelInsertedFor.length; i++) {
			if (panelInsertedFor[i] === dependsOn) {
				return true;
			}
		}
	}
	return false;
}

/* Creates a set of panel objects for a panelSelector panel. The UIItem for
 * each panel is wrapped in an EditorTab object which pairs together the UIItem
 * and its ID. The ID is subsequently used by the radioset control to decide
 * which panel is displayed with which radio button.
 */
function _genPanelSelectorPanels(group, parameterMetadata, actionMetadata, structureMetadata, l10nProvider, additionalInfo) {
	const panSelSubItems = [];
	if (Array.isArray(group.subGroups)) {
		group.subGroups.forEach(function(subGroup) {
			const subGroupName = subGroup.name;
			const groupItem = _makeUIItem(parameterMetadata, actionMetadata, subGroup, structureMetadata, l10nProvider, additionalInfo);
			const groupLabel = l10nProvider.l10nLabel(subGroup, subGroup.name);
			panSelSubItems.push(new EditorTab(groupLabel, subGroupName, groupItem));
		});
	}
	return panSelSubItems;
}

function _makeStringControl(parameter, isSubControl) {
	let controlType;
	let role = parameter.getRole();
	if (parameter.isList()) {
		const controlObj = _processListParameter(parameter);
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
			// show oneofselect when inside a table cell
			if (parameter.getValidValueCount() > 4 || (isSubControl && !_isEmbeddedOption(parameter))) {
				controlType = ControlType.ONEOFSELECT;
			} else {
				controlType = ControlType.RADIOSET;
			}
			break;
		case ParamRole.COLUMN:
			role = ParamRole.COLUMN;
			if (isSubControl && _isEmbeddedMultiOption(parameter)) {
				controlType = ControlType.SELECTCOLUMNS;
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
function _makeControl(parameterMetadata, paramName, group, structureDefinition, l10nProvider, actionMetadata, structureMetadata, subControl, additionalInfo) {
	const isSubControl = typeof subControl !== "undefined" && subControl;

	// Assume the property is defined
	const parameter = isSubControl ? subControl : parameterMetadata.getParameter(paramName);

	const additionalText = parameter.getAdditionalText(l10nProvider);
	const additionalHelperText = parameter.getAdditionalHelperText(l10nProvider);
	const orientation = parameter.orientation;
	const required = parameter.required;
	if (parameter.numberGenerator) {
		parameter.numberGenerator = new NumberGenerator(l10nProvider.l10nLabel(parameter.numberGenerator, parameter.name), parameter.numberGenerator);
	}
	const controlLabel = new Label(l10nProvider.l10nLabel(parameter, parameter.name), parameter.numberGenerator);
	let controlDesc;
	if (parameter.description) {
		controlDesc = new Description(l10nProvider.l10nDesc(parameter, parameter.name),
			parameter.description ? parameter.description.placement : null,
			parameter.description ? parameter.description.link : null);
	}

	// The role is used to modify the behaviour of certain controls
	let labelVisible = true;
	let role;
	let controlType;
	let subControls;
	let keyIndex;
	let defaultRow;
	let childItem;
	let multiSelectEditChildItem;
	let moveableRows = parameter.moveableRows;
	let rowSelection;
	let addRemoveRows;
	let header;
	let includeAllFields;
	let layout;
	let buttons;
	let structureType = parameter.structureType;

	// The control type defines the basic UI element that should be used to edit the property
	if (!isSubControl && parameter.getRole() === ParamRole.CUSTOM) {
		controlType = ControlType.CUSTOM;
	} else {
		switch (parameter.propType()) {
		case Type.STRING: {
			const returnObject = _makeStringControl(parameter, isSubControl);
			controlType = returnObject.controlType;
			role = returnObject.role;
			break;
		}
		case Type.PASSWORD:
			controlType = ControlType.PASSWORDFIELD;
			break;
		case Type.BOOLEAN:
			if (!parameter.control || parameter.control === ControlType.CHECKBOX) {
				labelVisible = false;
				controlType = ControlType.CHECKBOX;
			}
			break;
		case Type.INTEGER:
		case Type.LONG:
		case Type.DOUBLE:
			if (parameter.isList()) {
				controlType = ControlType.TEXTAREA;
			} else {
				controlType = ControlType.NUMBERFIELD;
			}
			break;
		case Type.DATE:
			role = Type.DATE;
			if (parameter.control === ControlType.DATEPICKER) {
				controlType = ControlType.DATEPICKER;
			} else if (parameter.control === ControlType.DATEPICKERRANGE) {
				controlType = ControlType.DATEPICKERRANGE;
			} else if (parameter.isList()) {
				controlType = ControlType.TEXTAREA;
			} else {
				controlType = ControlType.DATEFIELD;
			}
			break;
		case Type.TIME:
			role = Type.TIME;
			if (parameter.isList()) {
				controlType = ControlType.TEXTAREA;
			} else {
				controlType = ControlType.TIMEFIELD;
			}
			break;
		case Type.TIMESTAMP:
			controlType = ControlType.TIMESTAMP;
			break;
		case Type.STRUCTURE: {
			const structureDef = isSubControl && structureMetadata ? structureMetadata.getStructure(parameter.baseType()) : structureDefinition;

			if (structureDef) {
				// Subpanel for editing attributes having editStyle: subpanel
				if (structureDef.hasSubPanel()) {
					childItem = _makeEditStyleSubPanel(structureDef, l10nProvider, structureMetadata, additionalInfo);
				}
				// Multi select edit Subpanel for editing attributes having editStyle: inline
				if (structureDef.rowSelection === ROW_SELECTION.MULTIPLE && structureDef.hasInlinePanel()) {
					multiSelectEditChildItem = _makeInlineEditStyleSubPanel(structureDef, l10nProvider, structureMetadata, additionalInfo);
				}
				keyIndex = structureDef.keyAttributeIndex();
				// The defaultRow allows the UI to create a new row with sensible settings
				// when needed
				defaultRow = structureDef.defaultStructure();
				// For inline/row editing, create definitions for all the columns that can be edited
				subControls = [];
				if (structureDef.parameterMetadata && Array.isArray(structureDef.parameterMetadata.paramDefs)) {
					structureDef.parameterMetadata.paramDefs.forEach(function(param) {
						const newSubControl = _makeSubControl(param, l10nProvider, structureMetadata, additionalInfo);
						subControls.push(newSubControl);
					});
				}
				// If the property is a keyed property or a structure list then the key should not be included in the
				// structure definition. However it will still need to be included in the table column definitions.
				if ((parameter.isMapValue() || parameter.isList()) && structureDef.keyDefinition) {
					const newSubControl = _makeSubControl(structureDef.keyDefinition, l10nProvider, structureMetadata, additionalInfo);
					subControls.unshift(newSubControl);
				}
				if (parameter.isList() || parameter.isMapValue()) {
					if ((!isSubControl && group && typeof group.groupType !== "undefined" && group.groupType() === GroupType.COLUMN_SELECTION) ||
							parameter.control === ControlType.STRUCTURETABLE ||
							parameter.getRole() === ParamRole.COLUMN) {
						controlType = ControlType.STRUCTURETABLE;
						moveableRows = structureDef.moveableRows;
						rowSelection = structureDef.rowSelection;
						addRemoveRows = structureDef.addRemoveRows;
						header = structureDef.header;
						includeAllFields = structureDef.includeAllFields;
					} else {
						controlType = ControlType.STRUCTURELISTEDITOR;
						moveableRows = structureDef.moveableRows;
						rowSelection = structureDef.rowSelection;
						addRemoveRows = structureDef.addRemoveRows;
						header = structureDef.header;
					}

					if (structureDef.buttons) {
						buttons = _makeButtons(structureDef.buttons, l10nProvider);
					}
				} else {
					controlType = ControlType.STRUCTUREEDITOR;
					if (structureDef.layout) {
						layout = structureDef.layout;
					}
				}

				structureType = structureDef.type;
			} else {
				controlType = ControlType.TEXTFIELD;
			}
			break;
		}
		case Type.OBJECT:
			if (isSubControl) {
				role = parameter.getRole();
				if (role === ParamRole.COLUMN) {
					controlType = ControlType.SELECTCOLUMN;
				} else {
					logger.warn("Complex subControl type that is not a field! Name: " + parameter.name);
					controlType = ControlType.READONLY;
				}
			} else if (parameter.isCompoundField()) {
				const returnObject = _makeStringControl(parameter, isSubControl);
				controlType = returnObject.controlType;
				role = returnObject.role;
			} else {
				logger.warn("Complex parameter type that is not a field! Name: " + parameter.name);
				controlType = ControlType.READONLY;
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

	let valueDescs;
	if (parameter.getRole() === ParamRole.ENUM) {
		valueDescs = _parameterValueDescription(parameter, l10nProvider);
	}
	let action;
	if (!isSubControl && parameter.actionRef) {
		action = _makeAction(actionMetadata.getAction(parameter.actionRef), l10nProvider);
	}
	const settings = {};
	settings.name = parameter.name;
	settings.label = controlLabel;
	settings.description = controlDesc;
	settings.labelVisible = typeof parameter.labelVisible === "boolean" ? parameter.labelVisible : labelVisible;
	settings.controlType = parameter.getControl(controlType);
	settings.valueDef = ValueDef.make(parameter);
	settings.structureType = structureType;
	settings.role = role;
	settings.additionalText = additionalText;
	settings.orientation = orientation;
	settings.values = parameter.getValidValues();
	settings.valueLabels = valueLabels;
	settings.valueDescs = valueDescs;
	settings.valueIcons = parameter.valueIcons;
	settings.sortable = parameter.sortable;
	settings.filterable = parameter.filterable;
	settings.resizable = parameter.resizable;
	settings.charLimit = parameter.charLimit;
	settings.subControls = subControls;
	settings.keyIndex = keyIndex;
	settings.defaultRow = defaultRow;
	settings.childItem = childItem;
	settings.multiSelectEditChildItem = multiSelectEditChildItem;
	settings.moveableRows = moveableRows;
	settings.required = required;
	settings.language = parameter.language;
	settings.enableMaximize = parameter.enableMaximize;
	settings.summary = parameter.summary;
	settings.increment = parameter.increment;
	settings.minValue = parameter.minValue;
	settings.maxValue = parameter.maxValue;
	settings.rowSelection = rowSelection;
	settings.generatedValues = parameter.generatedValues;
	settings.addRemoveRows = addRemoveRows;
	settings.dateFormat = parameter.dateFormat;
	settings.timeFormat = parameter.timeFormat;
	settings.customControlId = parameter.customControlId;
	settings.data = parameter.data;
	settings.rows = parameter.rows;
	settings.displayChars = parameter.displayChars;
	settings.header = header;
	settings.uionly = parameter.uionly;
	settings.includeAllFields = includeAllFields;
	settings.layout = layout;
	settings.dmImage = parameter.dmImage;
	settings.action = action;
	settings.customValueAllowed = parameter.customValueAllowed;
	settings.shouldFilterItem = parameter.shouldFilterItem;
	settings.className = parameter.className;
	settings.buttons = buttons;
	settings.helperText = additionalHelperText;
	settings.readOnly = parameter.readOnly;
	settings.light = _isControlLight(additionalInfo.light, additionalInfo.containerType, parameter.isSubPanelEdit());
	if (isSubControl) {
		settings.visible = parameter.visible;
		settings.width = parameter.columns(8);
		settings.editStyle = parameter.editStyle;
		settings.isKeyField = parameter.isKey;
		settings.dmDefault = parameter.dmDefault;
	}
	return new Control(settings);
}

function _isControlLight(light, containerType, isSubPanelEdit) {
	return light &&
		(containerType !== CONTAINER_TYPE.TEARSHEET || // Controls displayed in a Tearsheet are not light themed
		(containerType === CONTAINER_TYPE.TEARSHEET && isSubPanelEdit)); // Controls inside a subpanel of tearsheet container are light themed
}

function _processListParameter(parameter) {
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
		controlObj.role = ParamRole.COLUMN;
		controlObj.controlType = ControlType.SELECTCOLUMNS;
		break;
	default:
		controlObj.controlType = ControlType.TEXTAREA;
	}
	return controlObj;
}

function _makeEditStyleSubPanel(structureDef, l10nProvider, structureMetadata, additionalInfo) {
	// If we"re not editing in-line then create a sub-panel that can be used to edit the attributes
	const panel = new ControlPanel(
		structureDef.name,
		PanelType.GENERAL,
		"properties-editstyle-sub-panel",
		false,
		_makeControls(structureDef.parameterMetadata,
			structureDef.actionMetadata,
			structureDef,
			structureMetadata,
			l10nProvider,
			additionalInfo,
			EditStyle.SUBPANEL)
	);
	const groupLabel = l10nProvider.l10nLabel(structureDef, structureDef.name);
	return UIItem.makeAdditionalLink("...", groupLabel, panel);
}

function _makeInlineEditStyleSubPanel(structureDef, l10nProvider, structureMetadata, additionalInfo) {
	// For multi select edit, create a subpanel that can be used to update the inline attributes affecting selected rows
	const panel = new ControlPanel(
		structureDef.name,
		PanelType.GENERAL,
		"properties-editstyle-inline",
		false,
		_makeControls(structureDef.parameterMetadata,
			structureDef.actionMetadata,
			structureDef,
			structureMetadata,
			l10nProvider,
			additionalInfo,
			EditStyle.INLINE)
	);
	const groupLabel = l10nProvider.l10nLabel(structureDef, structureDef.name);
	return UIItem.makeAdditionalLink("...", groupLabel, panel);
}

/**
 * Creates a column control for the supplied property/attribute.
 */
function _makeSubControl(parameter, l10nProvider, structureMetadata, additionalInfo) {
	const parameterMetadata = null;
	const paramName = null;
	const group = null;
	const structureDef = parameter.propType() === Type.STRUCTURE && structureMetadata ? structureMetadata.getStructure(parameter.baseType()) : null;
	const actionMetadata = null;
	const subControl = parameter;
	return _makeControl(parameterMetadata, paramName, group, structureDef, l10nProvider, actionMetadata, structureMetadata, subControl, additionalInfo);
}

/**
 * Returns true if the given parameter is a multi-option type that can be embedded within a table cell.
 */
function _isEmbeddedMultiOption(parameter) {
	if (parameter.isList() || parameter.isMapValue()) {
		return _isEmbeddedOption(parameter);
	}
	return false;
}

/**
 * Returns true if the given parameter is a multi-option type that can be embedded within a table cell.
 */
function _isEmbeddedOption(parameter) {
	return parameter.editStyle === "on_panel" || parameter.editStyle === "subpanel";
}

/**
 * Called on a base property group.
 */
function _makeActions(parameterMetadata, actionMetadata, group, structureMetadata, l10nProvider) {
	const uiItems = [];
	if (Array.isArray(group.actionIds())) {
		group.actionIds().forEach(function(actionId) {
			// Assume property definition exists
			const action = UIItem.makeAction(_makeAction(actionMetadata.getAction(actionId), l10nProvider));
			uiItems.push(action);
		});
	}
	return uiItems;
}

function _makeAction(action, l10nProvider) {
	const actionLabel = new Label(l10nProvider.l10nLabel(action, action.id));
	let actionDesc;
	if (action.description) {
		actionDesc = new Description(l10nProvider.l10nDesc(action, action.id));
	}
	return new Action(action.id, actionLabel, actionDesc, action.control, action.data, action.image, action.button, action.className, action.customActionId);
}

function _makeButtons(buttonMetadata, l10nProvider) {
	const buttons = [];
	buttonMetadata.buttonDefs.forEach((buttonDef) => {
		buttons.push(_makeButton(buttonMetadata.getButton(buttonDef.id), l10nProvider));
	});
	return buttons;
}

function _makeButton(button, l10nProvider) {
	let buttonLabel;
	if (button.label) {
		buttonLabel = new Label(l10nProvider.l10nLabel(button, button.id));
	}
	let buttonDescription;
	if (button.description) {
		buttonDescription = new Description(l10nProvider.l10nDesc(button, button.description));
	}
	return new Button(button.id, buttonLabel, buttonDescription, button.icon, button.carbonIcon, button.enabled, button.divider);
}

function _parameterValueLabels(parameter, l10nProvider) {
	if (Array.isArray(parameter.getValidValues())) {
		let key;
		if (parameter.resource_key) {
			key = parameter.resource_key;
		} else {
			key = parameter.name;
		}
		const paramLabels = [];
		parameter.getValidValues().forEach(function(paramValue) {
			paramLabels.push(l10nProvider.l10nValueLabel(key, String(paramValue)));
		});
		return paramLabels;
	}
	return [];
}

function _parameterValueDescription(parameter, l10nProvider) {
	if (Array.isArray(parameter.getValidValues())) {
		let key;
		if (parameter.resource_key) {
			key = parameter.resource_key;
		} else {
			key = parameter.name;
		}
		const paramDescs = [];
		parameter.getValidValues().forEach(function(paramValue) {
			paramDescs.push(l10nProvider.l10nValueDesc(key, String(paramValue)));
		});
		return paramDescs;
	}
	return [];
}


export {
	makePrimaryTab, _makeControl as makeControl, _makeActions as makeActions
};
