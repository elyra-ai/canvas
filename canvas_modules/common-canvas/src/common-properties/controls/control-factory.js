/*
 * Copyright 2017-2020 Elyra Authors
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

import React from "react";

import { Type, ControlType } from "./../constants/form-constants";
import { PropertyDef } from "./../form/PropertyDef";
import { makeControl } from "./../form/EditorForm";
import { L10nProvider } from "./../util/L10nProvider";
import * as ControlUtils from "./../util/control-utils";

import TextfieldControl from "./textfield";
import ReadonlyControl from "./readonly";
import ToggletextControl from "./toggletext";
import TextareaControl from "./textarea";
import ListControl from "./list";
import ExpressionControl from "./expression";
import PasswordControl from "./passwordfield";
import NumberfieldControl from "./numberfield";
import DatefieldControl from "./datefield";
import TimefieldControl from "./timefield";
import CheckboxControl from "./checkbox";
import CheckboxsetControl from "./checkboxset";
import RadiosetControl from "./radioset";
import Dropdown from "./dropdown";
import SomeofselectControl from "./someofselect";
import SelectColumnsControl from "./selectcolumns";
import StructureEditorControl from "./structureeditor";
import StructureTableControl from "./structuretable";
import StructurelisteditorControl from "./structurelisteditor";
import ReadonlyTableControl from "./readonlytable";

import ControlItem from "./../components/control-item";

export default class ControlFactory {

	constructor(controller) {
		this.rightFlyout = true;
		this.controller = controller;
	}

	setFunctions(openFieldPicker, genUIItem) {
		this.genUIItem = genUIItem;
		this.openFieldPicker = openFieldPicker;
	}

	setRightFlyout(rightFlyout) {
		this.rightFlyout = rightFlyout;
	}

	/*
	* @param control
	* @param propertyId
	* @param tableInfo
	*/
	createControlItem(control, propertyId, tableInfo) {
		const controlObj = this.createControl(control, propertyId, tableInfo);
		return (
			<ControlItem
				key={"ctrl-item-" + control.name}
				controller={this.controller}
				propertyId={propertyId}
				control={control}
				controlObj={controlObj}
			/>);
	}

	// Creates all controls that can be standalone or in tables
	createControl(control, propertyId, tableInfo) {
		if (!control || !propertyId) {
			return null;
		}
		// setup common properties used by all controls
		const controlKey = ControlUtils.getDataId(propertyId);
		const props = {};
		props.key = controlKey;
		props.control = control;
		props.controller = this.controller;
		props.propertyId = propertyId;
		if (tableInfo) {
			props.tableControl = tableInfo.table;
		}
		switch (control.controlType) {
		case (ControlType.HIDDEN):
			return null;
		case (ControlType.TEXTFIELD):
			return (<TextfieldControl {...props} />);
		case (ControlType.READONLY):
			return (<ReadonlyControl {...props} />);
		case (ControlType.TIMESTAMPFIELD):
			return (<ReadonlyControl {...props} />);
		case (ControlType.TEXTAREA):
			return (<TextareaControl {...props} />);
		case (ControlType.LIST):
			return (<ListControl {...props} />);
		case (ControlType.EXPRESSION):
			return (<ExpressionControl
				{...props}
				rightFlyout={this.rightFlyout}
			/>);
		case (ControlType.CODE):
			return (<ExpressionControl
				{...props}
				builder={false}
				validateLink={false}
				rightFlyout={this.rightFlyout}
			/>);
		case (ControlType.TOGGLETEXT):
			return (<ToggletextControl
				{...props}
			/>);
		case (ControlType.PASSWORDFIELD):
			return (<PasswordControl {...props} />);
		case (ControlType.NUMBERFIELD):
		case (ControlType.SPINNER):
			return (<NumberfieldControl {...props} />);
		case (ControlType.DATEFIELD):
			return (<DatefieldControl {...props} />);
		case (ControlType.TIMEFIELD):
			return (<TimefieldControl {...props} />);
		case (ControlType.CHECKBOX):
			return (<CheckboxControl {...props} />);
		case (ControlType.CHECKBOXSET):
			if (!tableInfo) {
				return (<CheckboxsetControl {...props} />);
			}
			return (<ReadonlyControl {...props} />);
		case (ControlType.RADIOSET):
			return (<RadiosetControl {...props} />);
		case (ControlType.ONEOFSELECT):
		case (ControlType.SELECTSCHEMA):
			return (<Dropdown
				{...props}
				rightFlyout={this.rightFlyout}
			/>);
		case (ControlType.SELECTCOLUMN):
			if (!tableInfo || (tableInfo && tableInfo.allowColumnControls)) {
				return (<Dropdown
					{...props}
					rightFlyout={this.rightFlyout}
				/>);
			}
			return (<ReadonlyControl {...props} />);
		case (ControlType.SOMEOFSELECT):
			if (!tableInfo) {
				return (<SomeofselectControl {...props} />);
			}
			return (<ReadonlyControl {...props} />);
		case (ControlType.SELECTCOLUMNS):
			if (!tableInfo) {
				return (<SelectColumnsControl
					{...props}
					openFieldPicker={this.openFieldPicker}
					rightFlyout={this.rightFlyout}
				/>);
			}
			return (<ReadonlyControl {...props} />);
		case (ControlType.STRUCTURETABLE):
			if (!tableInfo) {
				return (<StructureTableControl
					{...props}
					buildUIItem={this.genUIItem}
					openFieldPicker={this.openFieldPicker}
					rightFlyout={this.rightFlyout}
				/>);
			}
			return (<ReadonlyControl {...props} />);
		case (ControlType.STRUCTURELISTEDITOR):
			if (!tableInfo) {
				return (<StructurelisteditorControl
					{...props}
					buildUIItem={this.genUIItem}
					rightFlyout={this.rightFlyout}
				/>);
			}
			return (<ReadonlyControl {...props} />);
		case (ControlType.READONLYTABLE):
			if (!tableInfo) {
				return (<ReadonlyTableControl
					{...props}
					buildUIItem={this.genUIItem}
					rightFlyout={this.rightFlyout}
				/>);
			}
			return (<ReadonlyControl {...props} />);
		case (ControlType.CUSTOM):
			return (
				<div className="properties-custom-ctrl" key={controlKey}>
					{this.controller.getCustomControl(propertyId, control, tableInfo)}
				</div>
			);
		case (ControlType.STRUCTUREEDITOR):
			return (<StructureEditorControl
				{...props}
				buildUIItem={this.genUIItem}
				openFieldPicker={this.openFieldPicker}
				rightFlyout={this.rightFlyout}
			/>);
		default:
			return (<ReadonlyControl {...props} />);
		}
	}

	/**
	* Used to create a control from a passed in paramDef.
	* Allows users to user a standard control in a custom control/panel
	* @param paramDef - see parameter-def schema
	* @param parameter - name of the parameter to pull from paramDef
	* @return control object (form schema) used to create standard react controls
	*/
	createFormControl(paramDef, parameter) {
		if (!paramDef) {
			return null;
		}
		const propDef = PropertyDef.makePropertyDef(null, paramDef.parameters, paramDef.complex_types, paramDef.uihints);
		if (propDef && propDef.parameterMetadata) {
			const l10nProvider = new L10nProvider(paramDef.resources);
			const prop = propDef.parameterMetadata.getParameter(parameter);
			let structureDef;
			if (prop.propType() === Type.STRUCTURE && propDef.structureMetadata) {
				structureDef = propDef.structureMetadata.getStructure(prop.baseType());
			}
			const control = makeControl(propDef.parameterMetadata, parameter, null, structureDef, l10nProvider);
			return control;
		}
		return null;
	}
}
