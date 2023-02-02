/*
 * Copyright 2017-2022 Elyra Authors
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

import { expect } from "chai";
import isEqual from "lodash/isEqual";
import Form from "./../../../src/common-properties/form/Form";
import formResource from "./../../test_resources/json/form-test.json";
import formStructuredTable from "./../../test_resources/json/form-structure-test.json";
import formStructuredTable2 from "./../../test_resources/json/form-structure2-test.json";
import conditionResource from "./../../test_resources/json/form-test-condition.json";
import editStyleResource from "./../../test_resources/json/form-editstyle-test.json";
import placementResource from "./../../test_resources/json/form-placement-test.json";
import actionResource from "./../../test_resources/json/form-actions-test.json";


const buttons = [{ id: "ok", text: "OK", isPrimary: true, url: "" }, { id: "cancel", text: "Cancel", isPrimary: false, url: "" }];

describe("Correct form should be created", () => {
	it("should create a form with basic options", () => {
		const generatedForm = Form.makeForm(formResource.paramDef);
		// console.info("Expected: " + JSON.stringify(formResource.expectedResult));
		// console.info("Actual  : " + JSON.stringify(generatedForm));
		// console.info("\n\n");
		// Work around since comparing the objects directly doesn't work.
		expect(isEqual(JSON.parse(JSON.stringify(formResource.expectedResult)), JSON.parse(JSON.stringify(generatedForm)))).to.be.true;
	});

	it("should create a form with minimum paramSpec options", () => {
		const primaryTabs = {
			"itemType": "primaryTabs",
			"tabs": [
				{
					"text": "settings",
					"group": "settings",
					"content": {
						"itemType": "panel",
						"panel": {
							"id": "settings",
							"panelType": "general",
							"nestedPanel": false,
							"uiItems": [
								{
									"itemType": "control",
									"control": {
										"name": "boolean_param",
										"label": {
											"text": "boolean_param"
										},
										"light": true,
										"labelVisible": false,
										"controlType": "checkbox",
										"showRequiredLabel": true,
										"valueDef": {
											"propType": "boolean",
											"isList": false,
											"isMap": false
										},
										"values": [
											true,
											false
										],
										"valueLabels": [
											"true",
											"false"
										],
										"valueDescs": [
											null,
											null
										]
									}
								}
							],
							"open": false,
						}
					}
				}
			]
		};
		const data = {
			"currentParameters": {
				"boolean_param": true
			}
		};
		let help;
		let pixelWidth; // Pass in an undefined pixelWidth to simulate it missing from ParamDefs.
		let conditions;
		let resources;
		const expectedForm = new Form("TestOp", "TestOp", true, help, "small", pixelWidth, [primaryTabs], buttons, data, conditions, resources, "./test.svg");

		const paramSpec = {
			"current_parameters": {
				"boolean_param": true
			},
			"titleDefinition": {
				"title": "TestOp"
			},
			"parameters": [
				{
					"id": "boolean_param",
					"type": "boolean"
				}
			],
			"uihints": {
				"id": "TestOp",
				"icon": "./test.svg",
				"editor_size": "small",
				"group_info": [
					{
						"id": "settings",
						"parameter_refs": ["boolean_param"]
					}
				]
			}
		};
		const generatedForm = Form.makeForm(paramSpec);
		// console.info("Expected: " + JSON.stringify(expectedForm, null, 2));
		// console.info("Actual  : " + JSON.stringify(generatedForm, null, 2));
		// console.info("\n\n");
		expect(isEqual(JSON.parse(JSON.stringify(expectedForm)), JSON.parse(JSON.stringify(generatedForm)))).to.be.true;
	});

	it("should create a form with a structure", () => {
		const generatedForm = Form.makeForm(formStructuredTable.paramDef);
		// console.info("Expected: " + JSON.stringify(formStructuredTable.expectedResult));
		// console.info("Actual  : " + JSON.stringify(generatedForm) + "\n\n");
		// console.info("\n\n");
		expect(isEqual(JSON.parse(JSON.stringify(formStructuredTable.expectedResult)), JSON.parse(JSON.stringify(generatedForm)))).to.be.true;
	});

	it("should create a form with a structure with moveable_rows and value_icons", () => {
		const generatedForm = Form.makeForm(formStructuredTable2.paramDef);
		// console.info("Expected: " + JSON.stringify(formStructuredTable2.expectedResult));
		// console.info("Actual  : " + JSON.stringify(generatedForm));
		// console.info("\n\n");
		expect(isEqual(JSON.parse(JSON.stringify(formStructuredTable2.expectedResult)), JSON.parse(JSON.stringify(generatedForm)))).to.be.true;
	});

	it("should create a form with translated condition message", () => {
		const generatedForm = Form.makeForm(conditionResource.paramDef);
		// console.info("Expected: " + JSON.stringify(conditionResource.expectedResult));
		// console.info("Actual  : " + JSON.stringify(generatedForm) + "\n\n");
		// console.info("\n\n");
		expect(isEqual(JSON.parse(JSON.stringify(conditionResource.expectedResult)), JSON.parse(JSON.stringify(generatedForm)))).to.be.true;
	});

	it("should create a form with editStyle set to subpanel and checkbox panel", () => {
		const generatedForm = Form.makeForm(editStyleResource.paramDef);
		// console.info("Expected: " + JSON.stringify(editStyleResource.expectedResult));
		// console.info("Actual  : " + JSON.stringify(generatedForm) + "\n\n");
		// console.info("\n\n");
		expect(isEqual(JSON.parse(JSON.stringify(editStyleResource.expectedResult)), JSON.parse(JSON.stringify(generatedForm)))).to.be.true;
	});

	it("should create a form with description placement set to on_panel", () => {
		const generatedForm = Form.makeForm(placementResource.paramDef);
		// console.info("Expected: " + JSON.stringify(placementResource.expectedResult));
		// console.info("Actual  : " + JSON.stringify(generatedForm) + "\n\n");
		// console.info("\n\n");
		expect(isEqual(JSON.parse(JSON.stringify(placementResource.expectedResult)), JSON.parse(JSON.stringify(generatedForm)))).to.be.true;
	});

	it("should create a form with actions and summaryPanel", () => {
		const generatedForm = Form.makeForm(actionResource.paramDef);
		// console.info("Expected: " + JSON.stringify(actionResource.expectedResult));
		// console.info("Actual  : " + JSON.stringify(generatedForm) + "\n\n");
		// console.info("\n\n");
		expect(isEqual(JSON.parse(JSON.stringify(actionResource.expectedResult)), JSON.parse(JSON.stringify(generatedForm)))).to.be.true;
	});

});
