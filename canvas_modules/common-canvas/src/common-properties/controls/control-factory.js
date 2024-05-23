/*
 * Copyright 2017-2023 Elyra Authors
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
import { STATES, CONTAINER_TYPE } from "./../constants/constants";
import classNames from "classnames";
import { PropertyDef } from "./../form/PropertyDef";
import { makeControl } from "./../form/EditorForm";
import { L10nProvider } from "./../util/L10nProvider";
import * as ControlUtils from "./../util/control-utils";
import { Layer } from "@carbon/react";

import TextfieldControl from "./textfield";
import ReadonlyControl from "./readonly";
import ToggletextControl from "./toggletext";
import TextareaControl from "./textarea";
import ListControl from "./list";
import ExpressionControl from "./expression";
import PasswordControl from "./passwordfield";
import NumberfieldControl from "./numberfield";
import DatefieldControl from "./datefield";
import DatepickerControl from "./datepicker";
import DatepickerRangeControl from "./datepicker-range";
import TimefieldControl from "./timefield";
import CheckboxControl from "./checkbox";
import ToggleControl from "./toggle";
import CheckboxsetControl from "./checkboxset";
import RadiosetControl from "./radioset";
import Dropdown from "./dropdown";
import MultiSelectControl from "./multiselect";
import SomeofselectControl from "./someofselect";
import SelectColumnsControl from "./selectcolumns";
import StructureEditorControl from "./structureeditor";
import StructureTableControl from "./structuretable";
import StructurelisteditorControl from "./structurelisteditor";
import ReadonlyTableControl from "./readonlytable";
import Slider from "./slider";

import ControlItem from "./../components/control-item";
import ActionFactory from "./../actions/action-factory.js";
import { has, get } from "lodash";

/*
* <ControlItem /> should be called from every control.
* After all controls are updated, delete accessibleControls array.
*/
const accessibleControls = [
	ControlType.CHECKBOXSET,
	ControlType.HIDDEN,
	ControlType.DATEFIELD,
	ControlType.DATEPICKER,
	ControlType.DATEPICKERRANGE,
	ControlType.NUMBERFIELD,
	ControlType.SPINNER,
	ControlType.PASSWORDFIELD,
	ControlType.TEXTAREA,
	ControlType.TEXTFIELD,
	ControlType.TIMEFIELD,
	ControlType.TOGGLETEXT,
	ControlType.LIST,
	ControlType.TOGGLE,
	ControlType.SOMEOFSELECT,
	ControlType.SELECTCOLUMNS,
	ControlType.READONLY,
	ControlType.READONLYTABLE,
	ControlType.TIMESTAMP,
	ControlType.EXPRESSION,
	ControlType.CODE,
	ControlType.ONEOFSELECT,
	ControlType.MULTISELECT,
	ControlType.SELECTSCHEMA,
	ControlType.SELECTCOLUMN,
	ControlType.SLIDER
];

const tableControls = [
	ControlType.LIST,
	ControlType.READONLYTABLE,
	ControlType.SOMEOFSELECT,
	ControlType.SELECTCOLUMNS,
	ControlType.STRUCTURETABLE,
	ControlType.STRUCTURELISTEDITOR
];

export default class ControlFactory {

	constructor(controller) {
		this.rightFlyout = controller ? get(controller.getPropertiesConfig(), "rightFlyout", false) : false;
		this.controller = controller;
		this.actionFactory = new ActionFactory(this.controller);
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
		const hidden = this.controller.getControlState(propertyId) === STATES.HIDDEN;
		if (hidden) {
			return null; // Do not render hidden controls
		}

		const controlObj = this.createControl(control, propertyId, tableInfo);
		const className = control.className ? control.className : "";

		/*
		* <ControlItem /> should be called from every control.
		* Adding this temporary condition so that we can change one control at a time.
		* After all controls are updated, remove if condition and delete return statement after if condition
		*/
		if (accessibleControls.includes(control.controlType)) {
			return controlObj;
		}
		// When control-item displays other controls, add padding on control-item
		return (
			<div key={"properties-ctrl-" + control.name} data-id={"properties-ctrl-" + control.name}
				className={classNames("properties-ctrl-wrapper", className)}
			>
				<ControlItem
					key={"ctrl-item-" + control.name}
					controller={this.controller}
					propertyId={propertyId}
					control={control}
					controlObj={controlObj}
					accessibleControls={accessibleControls}
					tableControl = {tableControls.includes(control.controlType)}
				/>
			</div>);
	}

	// Creates all controls that can be standalone or in tables
	createControl(control, propertyId, tableInfo) {
		if (!control || !propertyId) {
			return null;
		}
		// setup common properties used by all controls
		const controlKey = ControlUtils.getDataId(propertyId);
		const hidden = this.controller.getControlState(propertyId) === STATES.HIDDEN;
		const action = this.actionFactory.generateAction(0, control.action);
		const props = {};
		props.key = controlKey;
		props.control = control;
		props.controller = this.controller;
		props.propertyId = propertyId;
		props.controlItem = (
			<ControlItem
				key={"ctrl-item-" + control.name}
				controller={this.controller}
				propertyId={propertyId}
				control={control}
				accessibleControls={accessibleControls}
				tableControl = {tableControls.includes(control.controlType)}
			/>
		);
		if (tableInfo) {
			props.tableControl = tableInfo.table;
		}
		let createdControl;
		switch (control.controlType) {
		case (ControlType.HIDDEN):
			return null;
		case (ControlType.TEXTFIELD):
			createdControl = (<TextfieldControl {...props} />);
			break;
		case (ControlType.READONLY):
			createdControl = (<ReadonlyControl {...props} />);
			break;
		case (ControlType.TIMESTAMP):
			createdControl = (<ReadonlyControl {...props} />);
			break;
		case (ControlType.TEXTAREA):
			createdControl = (<TextareaControl {...props} />);
			break;
		case (ControlType.TOGGLE):
			createdControl = (<ToggleControl {...props} />);
			break;
		case (ControlType.LIST):
			createdControl = (<ListControl
				{...props}
				rightFlyout={this.rightFlyout}
			/>);
			break;
		case (ControlType.EXPRESSION):
			createdControl = (<ExpressionControl
				{...props}
				rightFlyout={this.rightFlyout}
			/>);
			break;
		case (ControlType.CODE):
			createdControl = (<ExpressionControl
				{...props}
				builder={false}
				validateLink={false}
				rightFlyout={this.rightFlyout}
			/>);
			break;
		case (ControlType.TOGGLETEXT):
			createdControl = (<ToggletextControl
				{...props}
			/>);
			break;
		case (ControlType.PASSWORDFIELD):
			createdControl = (<PasswordControl {...props} />);
			break;
		case (ControlType.NUMBERFIELD):
		case (ControlType.SPINNER):
			createdControl = (<NumberfieldControl {...props} />);
			break;
		case (ControlType.DATEFIELD):
			createdControl = (<DatefieldControl {...props} />);
			break;
		case (ControlType.DATEPICKER):
			createdControl = (<DatepickerControl {...props} />);
			break;
		case (ControlType.DATEPICKERRANGE):
			createdControl = (<DatepickerRangeControl {...props} />);
			break;
		case (ControlType.TIMEFIELD):
			createdControl = (<TimefieldControl {...props} />);
			break;
		case (ControlType.CHECKBOX):
			createdControl = (<CheckboxControl {...props} />);
			break;
		case (ControlType.CHECKBOXSET):
			if (!tableInfo) {
				createdControl = (<CheckboxsetControl {...props} />);
			} else {
				createdControl = (<ReadonlyControl {...props} />);
			}
			break;
		case (ControlType.RADIOSET):
			createdControl = (<RadiosetControl {...props} />);
			break;
		case (ControlType.ONEOFSELECT):
		case (ControlType.SELECTSCHEMA):
			createdControl = (<Dropdown
				{...props}
				rightFlyout={this.rightFlyout}
			/>);
			break;
		case (ControlType.MULTISELECT):
			createdControl = (<MultiSelectControl {...props} />);
			break;
		case (ControlType.SELECTCOLUMN):
			if (!tableInfo || (tableInfo && tableInfo.allowColumnControls)) {
				createdControl = (<Dropdown
					{...props}
					rightFlyout={this.rightFlyout}
				/>);
			} else {
				createdControl = (<ReadonlyControl {...props} />);
			}
			break;
		case (ControlType.SOMEOFSELECT):
			if (!tableInfo) {
				createdControl = (<SomeofselectControl {...props} />);
			} else {
				createdControl = (<ReadonlyControl {...props} />);
			}
			break;
		case (ControlType.SELECTCOLUMNS):
			if (!tableInfo) {
				createdControl = (<SelectColumnsControl
					{...props}
					openFieldPicker={this.openFieldPicker}
					rightFlyout={this.rightFlyout}
				/>);
			} else {
				createdControl = (<ReadonlyControl {...props} />);
			}
			break;
		case (ControlType.STRUCTURETABLE):
			if (!tableInfo) {
				createdControl = (<StructureTableControl
					{...props}
					buildUIItem={this.genUIItem}
					openFieldPicker={this.openFieldPicker}
					rightFlyout={this.rightFlyout}
				/>);
			} else {
				createdControl = (<ReadonlyControl {...props} />);
			}
			break;
		case (ControlType.STRUCTURELISTEDITOR):
			if (!tableInfo) {
				createdControl = (<StructurelisteditorControl
					{...props}
					buildUIItem={this.genUIItem}
					rightFlyout={this.rightFlyout}
				/>);
			} else {
				createdControl = (<ReadonlyControl {...props} />);
			}
			break;
		case (ControlType.READONLYTABLE):
			if (!tableInfo) {
				createdControl = (<ReadonlyTableControl
					{...props}
					buildUIItem={this.genUIItem}
					rightFlyout={this.rightFlyout}
				/>);
			} else {
				createdControl = (<ReadonlyControl {...props} />);
			}
			break;
		case (ControlType.CUSTOM):
			createdControl = (
				<div className="properties-custom-ctrl" key={controlKey}>
					{this.controller.getCustomControl(propertyId, control, tableInfo)}
				</div>
			);
			break;
		case (ControlType.STRUCTUREEDITOR):
			createdControl = (<StructureEditorControl
				{...props}
				buildUIItem={this.genUIItem}
				openFieldPicker={this.openFieldPicker}
				rightFlyout={this.rightFlyout}
			/>);
			break;
		case (ControlType.SLIDER):
			createdControl = (<Slider {...props} />);
			break;
		default:
			createdControl = (<ReadonlyControl {...props} />);
		}

		const createdControlLayered = (
			<Layer level={this.controller.getLight() && control.light ? 1 : 0} className="properties-control-layer">
				{createdControl}
			</Layer>
		);

		/*
		* <ControlItem /> should be called from every control.
		* Adding this temporary condition so that we can change one control at a time.
		* After all controls are updated, remove if condition and delete return statement after if condition
		*/
		// When other controls display control-item for a11y, add padding on controls
		if (accessibleControls.includes(control.controlType)) {
			if (tableInfo) {
				// Don't add padding when controls are displayed in a table
				return createdControl;
			}
			const className = control.className ? control.className : "";
			return (
				<div key={"properties-ctrl-" + control.name} data-id={"properties-ctrl-" + control.name}
					className={classNames(
						"properties-ctrl-wrapper",
						{ "hide": hidden, "action": has(control, "action.image.placement") },
						className
					)}
				>
					{createdControlLayered}
					{action}
				</div>
			);
		}
		return createdControlLayered;
	}

	/**
	* Used to create a control from a passed in paramDef.
	* Allows users to user a standard control in a custom control/panel
	* @param paramDef - see parameter-def schema
	* @param parameter - name of the parameter to pull from paramDef
	* @param light - if this control is light themed
	* @param containerType - the type of container common properties is rendering in
	* @return control object (form schema) used to create standard react controls
	*/
	createFormControl(paramDef, parameter, light = true, containerType = CONTAINER_TYPE.CUSTOM) {
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
			const additionalInfo = {
				light: light,
				containerType: containerType
			};
			const control = makeControl(propDef.parameterMetadata, parameter, null, structureDef, l10nProvider, null, null, null, additionalInfo);
			return control;
		}
		return null;
	}
}
