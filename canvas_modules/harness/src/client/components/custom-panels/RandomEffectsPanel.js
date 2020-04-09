/*
 * Copyright 2017-2020 IBM Corporation
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
import { Button, Dropdown } from "carbon-components-react";
import isEqual from "lodash/isEqual";
import CustomEffectsCtrl from "../ctrl/CustomEffectsCtrl.jsx";

class RandomEffectsPanel {
	static id() {
		return "random-effects-panel";
	}

	constructor(parameters, controller, data) {
		this.parameters = parameters;
		this.controller = controller;
		this.data = data;
		// this.UI_LIST_ID = { name: this.data[1] };
		this.arrayIndex = this.controller.getPropertyValue({ name: "randomEffectsIndex" });
		if (typeof this.arrayIndex === "undefined") {
			this.arrayIndex = 0;
			const that = this;
			setTimeout(function() {
				that.controller.updatePropertyValue({ name: "randomEffectsIndex" }, 0);
			}, 100);
		}
		this.handleDropdownChange = this.handleDropdownChange.bind(this);
		this.previousEffect = this.previousEffect.bind(this);
		this.nextEffect = this.nextEffect.bind(this);
	}

	getRandomEffectsParameterDefinition() {
		return ({
			"parameters": [
			],
			"complex_types": [
				{
					"id": "source_field_list_item",
					"parameters": [
						{
							"id": "field",
							"type": "string",
							"role": "column",
							"default": ""
						}
					]
				},
				{
					"id": "effectsString",
					"parameters": [
						{
							"id": "effect",
							"type": "string",
							"default": ""
						}
					]
				}
			],
			"uihints": {
				"ui_parameters": [
					{
						"id": "random_source_fields",
						"type": "array[source_field_list_item]"
					},
					{
						"id": "random_effects_ui_list",
						"type": "array[effectsString]"
					}
				],
				"parameter_info": [
					{
						"parameter_ref": "random_source_fields",
						"label": {
							"resource_key": "random_source_fields.label"
						},
						"description": {
							"resource_key": "random_source_fields.desc"
						},
						"control": "structuretable"
					},
					{
						"parameter_ref": "random_effects_ui_list",
						"label": {
							"resource_key": "random_effects_ui_list.label"
						},
						"description": {
							"resource_key": "random_effects_ui_list.desc"
						},
						"rows": 5,
						"control": "structurelisteditor"
					}
				],
				"complex_type_info": [
					{
						"complex_type_ref": "source_field_list_item",
						"moveable_rows": false,
						"include_all_fields": true,
						"add_remove_rows": false,
						"parameters": [
							{
								"parameter_ref": "field",
								"label": {
									"resource_key": "source_field_list_item.field.label"
								},
								"summary": false
							}
						]
					},
					{
						"complex_type_ref": "effectsString",
						"moveable_rows": true,
						"add_remove_rows": false,
						"header": false,
						"parameters": [
							{
								"parameter_ref": "effect",
								"control": "readonly"
							}
						]
					}
				]
			},
			"resources": {
				"random_source_fields.label": "Fields",
				"random_source_fields.desc": "Source fields for building effects",
				"random_effects_ui_list.label": "Effect builder:",
				"random_effects_ui_list.desc": "Add and remove effects here",
				"source_field_list_item.field.label": "Name"
			}
		});
	}

	getParamDef() {
		return ({
			"parameters": [
				{
					"id": "random_effects_list",
					"type": "array[random_effects_listStructure]"
				}
			],
			"complex_types": [
				{
					"id": "random_effects_listStructure",
					"parameters": [
						{
							"id": "EffectList",
							"type": "array[effectStructure]"
						},
						{
							"id": "Intercept",
							"type": "boolean",
							"default": false
						},
						{
							"id": "SubjectSpec",
							"type": "effectStructure"
						},
						{
							"id": "GroupSpec",
							"type": "array[string]",
							"role": "column"
						},
						{
							"id": "CovarianceType",
							"enum": [
								"AR1",
								"ARMA11",
								"CS",
								"DIAG",
								"ID",
								"TP",
								"UN",
								"VC"
							],
							"default": "VC"
						},
						{
							"id": "CovarianceTBand",
							"type": "integer",
							"default": 2
						},
						{
							"id": "ShowEBLUPs",
							"type": "boolean",
							"default": false
						}
					]
				}
			],
			"uihints": {
				"parameter_info": [
					{
						"parameter_ref": "random_effects_list",
						"separator": "before"
					}
				],
				"complex_type_info": [
					{
						"complex_type_ref": "random_effects_listStructure",
						"parameters": [
							{
								"parameter_ref": "EffectList",
								"label": {
									"resource_key": "random_effects_listStructure.EffectList"
								}
							},
							{
								"parameter_ref": "Intercept",
								"label": {
									"resource_key": "random_effects_listStructure.Intercept"
								}
							},
							{
								"parameter_ref": "SubjectSpec",
								"label": {
									"resource_key": "random_effects_listStructure.SubjectSpec"
								}
							},
							{
								"parameter_ref": "GroupSpec",
								"label": {
									"resource_key": "random_effects_listStructure.GroupSpec"
								},
								"control": "selectcolumns"
							},
							{
								"parameter_ref": "CovarianceType",
								"label": {
									"resource_key": "CovarianceType.label"
								}
							},
							{
								"parameter_ref": "CovarianceTBand",
								"visible": false
							},
							{
								"parameter_ref": "ShowEBLUPs",
								"label": {
									"resource_key": "random_effects_listStructure.ShowEBLUPs"
								}
							}
						]
					}
				]
			},
			"resources": {
				"random_effects_listStructure.Intercept": "Include intercept",
				"random_effects_listStructure.SubjectSpec": "Subject combination:",
				"random_effects_listStructure.GroupSpec": "Define covariance groups by:",
				"random_effects_listStructure.CovarianceType": "Covariance type:",
				"random_effects_listStructure.ShowEBLUPs":
					"Display parameter predictions for this set of random effects",
				"CovarianceType.label": "Random effect covariance type:",
				"CovarianceType.AR1.label": "First-order autoregressive (AR1)",
				"CovarianceType.ARMA11.label": "Autoregressive moving average (1,1) (ARMA11)",
				"CovarianceType.CS.label": "Compound symmetry",
				"CovarianceType.DIAG.label": "Diagonal",
				"CovarianceType.ID.label": "Scaled identity",
				"CovarianceType.TP.label": "Toeplitz",
				"CovarianceType.UN.label": "Unstructured",
				"CovarianceType.VC.label": "Variance component",
			}
		});
	}

	previousEffect() {
		if (this.arrayIndex > 0) {
			this.arrayIndex--;
			const propertyValue = this.controller.getPropertyValue({ name: "random_effects_list" });
			this.controller.updatePropertyValue({ name: "randomEffectsIndex" }, this.arrayIndex);
			this.controller.updatePropertyValue({ name: "random_effects_list" }, propertyValue);
		}
	}

	nextEffect() {
		const propertyValue = this.controller.getPropertyValue({ name: "random_effects_list" });
		const length = propertyValue ? propertyValue.length : 1;
		const atEnd = this.arrayIndex === length - 1;
		if (atEnd) {
			propertyValue.push([[], false, [], [], "VC", 2, false]);
		}
		this.arrayIndex++;
		this.controller.updatePropertyValue({ name: "randomEffectsIndex" }, this.arrayIndex);
		this.controller.updatePropertyValue({ name: "random_effects_list" }, propertyValue);
	}

	handleDropdownChange(evt) {
		const value = evt.selectedItem.value;
		const propertyId = { name: "random_effects_list", row: this.arrayIndex, col: 2 };
		this.controller.updatePropertyValue(propertyId, value);
	}

	makePanelIndexPanel() {
		const propertyValue = this.controller.getPropertyValue({ name: "random_effects_list" });
		const length = propertyValue ? propertyValue.length : 1;
		const text = "Random Effect " + (this.arrayIndex + 1) + " of " + length;
		return (<div className="glmm-panel-index-div">
			<span className="glmm-panel-index-span">{text}</span></div>);
	}

	makeButtonPanel() {
		const prevButton = (<Button
			type="button"
			small
			kind="ghost"
			onClick={this.previousEffect}
			disabled={this.arrayIndex === 0}
		>
			{"Back"}
		</Button>);
		const propertyValue = this.controller.getPropertyValue({ name: "random_effects_list" });
		const length = propertyValue ? propertyValue.length : 1;
		const atEnd = this.arrayIndex === length - 1;
		const hasIntercept = propertyValue ? propertyValue[this.arrayIndex][1] : false;
		const effects = propertyValue ? propertyValue[this.arrayIndex][0] : null;
		const effectsLen = effects ? effects.length : 0;
		const disableNext = atEnd && !(hasIntercept || effectsLen);
		const nextButton = (<Button
			type="button"
			small
			kind="ghost"
			onClick={this.nextEffect}
			disabled={disableNext}
		>
			{"Next"}
		</Button>);
		return (<div>{prevButton}{"\xa0"}{nextButton}</div>);
	}

	makeHSeparator() {
		return (<hr key={"h-separator." + String(this.arrayIndex)} className="glmm-hr-style" />);
	}

	makeUseInterceptControl() {
		const propertyId = { name: "random_effects_list", row: this.arrayIndex, col: 1 };
		const control = this.controller.getControlFactory().createFormControl(
			this.getParamDef(), "random_effects_list");
		const checkbox = this.controller.getControlFactory().createControlItem(control.subControls[1], propertyId);
		return (<div>{checkbox}</div>);
	}

	makeeBlupsCtrl() {
		const propertyId = { name: "random_effects_list", row: this.arrayIndex, col: 6 };
		const control = this.controller.getControlFactory().createFormControl(
			this.getParamDef(), "random_effects_list");
		const checkbox = this.controller.getControlFactory().createControlItem(control.subControls[6], propertyId);
		return (<div>{checkbox}</div>);
	}

	makeCovarianceGroupsControl() {
		const propertyId = { name: "random_effects_list", row: this.arrayIndex, col: 3 };
		const control = this.controller.getControlFactory().createFormControl(
			this.getParamDef(), "random_effects_list");
		const selectColumns = this.controller.getControlFactory().createControlItem(control.subControls[3], propertyId);
		return (<div>{selectColumns}</div>);
	}

	makeCovarianceTypeControl() {
		const propertyId = { name: "random_effects_list", row: this.arrayIndex, col: 4 };
		const control = this.controller.getControlFactory().createFormControl(
			this.getParamDef(), "random_effects_list");
		const covarianceType = this.controller.getControlFactory().createControlItem(control.subControls[4],
			propertyId);
		return (<div>{covarianceType}</div>);
	}

	makeSubjectSpecControl() {
		const options = [{
			value: null,
			label: "(none)"
		}];
		let selectedObject = null;
		// this.subjectCombinations = [];
		const propertyId = { name: "random_effects_list", row: this.arrayIndex, col: 2 };
		let subjectCombo = this.controller.getPropertyValue(propertyId);
		if (!subjectCombo) {
			subjectCombo = [[], []];
		}
		let label = "...";
		const subjects = this.controller.getPropertyValue({ name: "residual_subject_ui_spec" });
		if (Array.isArray(subjects)) {
			for (let idx = 0; idx < subjects.length; idx++) {
				const combo = [[], []];
				let fieldNames = "";
				for (let id2 = 0; id2 <= idx; id2++) {
					if (fieldNames.length) {
						fieldNames += "*";
					}
					fieldNames += subjects[id2];
					combo[0].push(subjects[id2]);
					combo[1].push(0);
				}
				const option = { value: combo, label: fieldNames };
				options.push(option);
				if (isEqual(subjectCombo[0], combo[0])) {
					selectedObject = option;
					label = fieldNames;
				}
			}
		}
		const dropdownComponent = (<Dropdown
			id="harness-custom-random-ctrl-dropdown"
			disabled={false}
			type={"default"}
			items={options}
			onChange={this.handleDropdownChange}
			selectedItem={selectedObject}
			label={label}
		/>);
		const paramDef = this.getParamDef();
		const ctrlLabel = paramDef.resources["random_effects_listStructure.SubjectSpec"];
		// const propertyId = { name: "random_effects_list", row: this.arrayIndex, col: 2 };
		return (<div>
			<div className="properties-label-container"><span>{ctrlLabel}</span></div>
			<div className="properties-dropdown">{dropdownComponent}</div>
		</div>);
	}

	renderPanel() {
		const propertyId = { name: this.parameters[0] };
		const topText = this.makePanelIndexPanel();
		const buttonPanel = this.makeButtonPanel();
		const hSeparator = this.makeHSeparator();
		const effectsCtrl = (<CustomEffectsCtrl
			controller={this.controller}
			propertyId={propertyId}
			arrayIndex={this.arrayIndex}
			data={this.data}
			parameterDefinition={this.getRandomEffectsParameterDefinition()}
		/>);
		const useIntercept = this.makeUseInterceptControl();
		const showeBlups = this.makeeBlupsCtrl();
		const covariancePicker = this.makeCovarianceGroupsControl();
		const covarianceType = this.makeCovarianceTypeControl();
		const subjectSpec = this.makeSubjectSpecControl();
		return (
			<div>
				{topText}
				{buttonPanel}
				{hSeparator}
				{effectsCtrl}
				{useIntercept}
				{showeBlups}
				<table>
					<tbody>
						<tr>
							<td className="glmm-random-effects-subjects-cell">{subjectSpec}</td>
							<td className="glmm-random-effects-covariance-cell">{covarianceType}</td>
						</tr>
						<tr>
							<td colSpan="2">{covariancePicker}</td>
						</tr>
					</tbody>
				</table>
			</div>
		);
	}
}

export default RandomEffectsPanel;
