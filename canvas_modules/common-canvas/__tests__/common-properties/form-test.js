/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { expect } from "chai";
import _ from "underscore";
import Form from "../../src/common-properties/form/Form";
import formResource from "../test_resources/json/form-test.json";
import formStructuredTable from "../test_resources/json/form-structure-test.json";
import formStructuredTable2 from "../test_resources/json/form-structure2-test.json";
import conditionResource from "../test_resources/json/form-test-condition.json";
import editStyleResource from "../test_resources/json/form-editstyle-test.json";
import placementResource from "../test_resources/json/form-placement-test.json";


const buttons = [{ id: "ok", text: "OK", isPrimary: true, url: "" }, { id: "cancel", text: "Cancel", isPrimary: false, url: "" }];

describe("Correct form should be created", () => {
	it("should create a form with basic options", () => {
		const generatedForm = Form.makeForm(formResource.paramDef);
		// console.info("Expected: " + JSON.stringify(formResource.expectedResult));
		// console.info("Actual  : " + JSON.stringify(generatedForm) + "\n\n");
		// Work around since comparing the objects directly doesn't wor// k.
		expect(_.isEqual(JSON.parse(JSON.stringify(formResource.expectedResult)), JSON.parse(JSON.stringify(generatedForm)))).to.be.true;
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
							"uiItems": [
								{
									"itemType": "control",
									"control": {
										"name": "boolean_param",
										"label": {
											"text": "boolean_param"
										},
										"controlType": "checkbox",
										"valueDef": {
											"propType": "boolean",
											"isList": false,
											"isMap": false
										},
										"separateLabel": false,
										"required": false
									}
								}
							]
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
		const expectedForm = new Form("TestOp", "TestOp", "small", [primaryTabs], buttons, data);

		const paramSpec = {
			"currentParameters": {
				"boolean_param": true
			},
			"parameters": [
				{
					"name": "boolean_param",
					"type": "boolean"
				}
			],
			"uihints": {
				"name": "TestOp",
				"icon": "./test.svg",
				"editorSize": "small",
				"group_info": [
					{
						"name": "settings",
						"parameters": ["boolean_param"]
					}
				]
			}
		};
		const generatedForm = Form.makeForm(paramSpec);
		// console.info("Expected: " + JSON.stringify(expectedForm));
		// console.info("Actual  : " + JSON.stringify(generatedForm) + "\n\n");
		expect(_.isEqual(JSON.parse(JSON.stringify(expectedForm)), JSON.parse(JSON.stringify(generatedForm)))).to.be.true;
	});

	it("should create a form with a structure", () => {
		const generatedForm = Form.makeForm(formStructuredTable.paramDef);
		// console.info("Expected: " + JSON.stringify(formStructuredTable.expectedResult));
		// console.info("Actual  : " + JSON.stringify(generatedForm) + "\n\n");
		expect(_.isEqual(JSON.parse(JSON.stringify(formStructuredTable.expectedResult)), JSON.parse(JSON.stringify(generatedForm)))).to.be.true;
	});

	it("should create a form with a structure with moveableRows and valueIcons", () => {
		const generatedForm = Form.makeForm(formStructuredTable2.paramDef);
		// console.info("Expected: " + JSON.stringify(formStructuredTable2.expectedResult));
		// console.info("Actual  : " + JSON.stringify(generatedForm) + "\n\n");
		expect(_.isEqual(JSON.parse(JSON.stringify(formStructuredTable2.expectedResult)), JSON.parse(JSON.stringify(generatedForm)))).to.be.true;
	});

	it("should create a form with translated condition message", () => {
		const generatedForm = Form.makeForm(conditionResource.paramDef);
		// console.info("Expected: " + JSON.stringify(conditionResource.expectedResult));
		// console.info("Actual  : " + JSON.stringify(generatedForm) + "\n\n");
		expect(_.isEqual(JSON.parse(JSON.stringify(conditionResource.expectedResult)), JSON.parse(JSON.stringify(generatedForm)))).to.be.true;
	});

	it("should create a form with editStyle set to subpanel", () => {
		const generatedForm = Form.makeForm(editStyleResource.paramDef);
		// console.info("Expected: " + JSON.stringify(editStyleResource.expectedResult));
		// console.info("Actual  : " + JSON.stringify(generatedForm) + "\n\n");
		expect(_.isEqual(JSON.parse(JSON.stringify(editStyleResource.expectedResult)), JSON.parse(JSON.stringify(generatedForm)))).to.be.true;
	});

	it("should create a form with description placement set to on_panel", () => {
		const generatedForm = Form.makeForm(placementResource.paramDef);
		// console.info("Expected: " + JSON.stringify(placementResource.expectedResult));
		// console.info("Actual  : " + JSON.stringify(generatedForm) + "\n\n");
		expect(_.isEqual(JSON.parse(JSON.stringify(placementResource.expectedResult)), JSON.parse(JSON.stringify(generatedForm)))).to.be.true;
	});

});
