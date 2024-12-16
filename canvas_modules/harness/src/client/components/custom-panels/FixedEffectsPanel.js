/*
 * Copyright 2017-2025 Elyra Authors
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
import CustomEffectsCtrl from "../ctrl/CustomEffectsCtrl.jsx";


class FixedEffectsPanel {
	static id() {
		return "fixed-effects-panel";
	}

	constructor(parameters, controller, data) {
		this.parameters = parameters;
		this.controller = controller;
		this.data = data;
	}

	getFixedEffectsParameterDefinition() {
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
						"id": "fixed_source_fields",
						"type": "array[source_field_list_item]"
					},
					{
						"id": "fixed_effects_ui_list",
						"type": "array[effectsString]"
					}
				],
				"parameter_info": [
					{
						"parameter_ref": "fixed_source_fields",
						"label": {
							"resource_key": "fixed_source_fields.label"
						},
						"description": {
							"resource_key": "fixed_source_fields.desc"
						},
						"control": "structuretable"
					},
					{
						"parameter_ref": "fixed_effects_ui_list",
						"label": {
							"resource_key": "fixed_effects_ui_list.label"
						},
						"description": {
							"resource_key": "fixed_effects_ui_list.desc"
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
				"source_field_list_item.field.label": "Name",
				"fixed_effects_ui_list.label": "Effect builder:",
				"fixed_effects_ui_list.desc": "Add and remove effects here",
				"fixed_source_fields.label": "Fields:",
				"fixed_source_fields.desc": "Source fields for building effects"
			}
		});
	}

	getInterceptParamDef() {
		return ({
			"parameters": [
				{
					"id": "use_intercept",
					"type": "boolean",
					"default": true
				}
			],
			"uihints": {
				"parameter_info": [
					{
						"parameter_ref": "use_intercept",
						"label": {
							"resource_key": "use_intercept.label"
						}
					}
				]
			},
			"resources": {
				"use_intercept.label": "Include intercept"
			}
		});
	}

	makeUseInterceptControl() {
		const propertyId = { name: this.parameters[1] };
		const checkbox = this.controller.createControl(propertyId, this.getInterceptParamDef(), "use_intercept");
		return (<div>{checkbox}</div>);
	}

	renderPanel() {
		const propertyId = { name: this.parameters[0] };
		const effectsCtrl = (<CustomEffectsCtrl
			controller={this.controller}
			propertyId={propertyId}
			arrayIndex={-1}
			data={this.data}
			parameterDefinition={this.getFixedEffectsParameterDefinition()}
		/>);
		const useIntercept = this.makeUseInterceptControl();
		return (
			<div>
				{effectsCtrl}
				{useIntercept}
			</div>
		);
	}
}

export default FixedEffectsPanel;
