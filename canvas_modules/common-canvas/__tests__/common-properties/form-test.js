/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** NextGen Workbench
**
** (c) Copyright IBM Corp. 2017
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/

import { expect } from "chai";
import _ from "underscore";
import Form from "../../src/common-properties/form/Form";
import formResource from "../test_resources/json/form-test.json";
import formStructuredTable from "../test_resources/json/form-structure-test.json";

const buttons = [{ id: "ok", text: "OK", isPrimary: true, url: "" }, { id: "cancel", text: "Cancel", isPrimary: false, url: "" }];

describe("Correct form should be created", () => {
	it("should create a form with a structure without key", () => {
		const paramSpec = formResource.paramDef;
		const generatedForm = Form.makeForm(paramSpec);
		// console.info("Expected: " + JSON.stringify(formResource.expectedResult));
		// console.info("Actual: " + JSON.stringify(generatedForm));
		// Work around since comparing the objects directly doesn't work.
		expect(_.isEqual(JSON.parse(JSON.stringify(formResource.expectedResult)), JSON.parse(JSON.stringify(generatedForm)))).to.be.true;
	}
	);

	it("should create a form with tabs since there is missing data", () => {
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
										"separateLabel": false
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
		// console.info("Actual: " + JSON.stringify(generatedForm));
		// Work around since comparing the objects directly doesn't work.
		expect(_.isEqual(JSON.parse(JSON.stringify(expectedForm)), JSON.parse(JSON.stringify(generatedForm)))).to.be.true;
	}
	);

	it("should create a form with a structure", () => {
		const generatedForm = Form.makeForm(formStructuredTable.paramDef);
		// console.info("Expected: " + JSON.stringify(formStructuredTable.expectedResult));
		// console.info("Actual: " + JSON.stringify(generatedForm));
		// Work around since comparing the objects directly doesn't work.
		expect(_.isEqual(JSON.parse(JSON.stringify(formStructuredTable.expectedResult)), JSON.parse(JSON.stringify(generatedForm)))).to.be.true;
	}
	);
});
