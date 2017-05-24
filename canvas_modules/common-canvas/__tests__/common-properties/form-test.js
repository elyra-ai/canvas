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

const resources = {
	"balance.label": "Balance",
	"balance.desc": "Corrects imbalances in the data using specified conditions",
	"balance.directives.label": "Balance Directives",
	"balance.training_data_only.label": "Only balance training data",
	"BalanceEntry.label": "Balance Settings",
	"BalanceEntry.factor.label": "Factor",
	"BalanceEntry.condition.label": "Condition",
	"basic-settings.label": "Settings",
	"basic-settings.desc": "Basic settings",
	"filter.label": "Filter",
	"filter.desc": "Renames and drops fields from the data set",
	"filter.defaultInclude.label": "Filter selected fields",
	"filter.selectFields.label": "Select Fields",
	"filter.renameFields.label": "Rename Fields",
	"RenameFieldEntry.label": "Rename",
	"RenameFieldEntry.field.label": "Field",
	"RenameFieldEntry.new_name.label": "New Name",
	"other-settings.label": "Other",
	"other-settings.desc": "Other settings",
	"filter-settings.label": "Filter",
	"filter-settings.desc": "Filter settings",
	"rename-settings.label": "Rename",
	"rename-settings.desc": "Rename settings"
};
const buttons = [{ id: "ok", text: "OK", isPrimary: true, url: "" }, { id: "cancel", text: "Cancel", isPrimary: false, url: "" }];
var undefinedVar;

describe("Correct form should be created", () => {
	it("should create a form with a structure without key", () => {

		const primaryTabs = {
			"itemType": "primaryTabs",
			"tabs": [{
				"text": "Settings",
				"group": "basic-settings",
				"content": {
					"itemType": "panel",
					"panel": {
						"id": "basic-settings",
						"panelType": "general",
						"uiItems": [
							{
								"itemType": "control",
								"control": {
									"name": "directives",
									"label": { "text": "Balance Directives" },
									"controlType": "structurelisteditor",
									"valueDef": { "propType": "structure", "isList": true, "isMap": false },
									"separateLabel": true,
									"subControls": [
										{
											"name": "factor",
											"label": { "text": "Factor" },
											"controlType": "numberfield",
											"valueDef": { "propType": "double", "isList": false, "isMap": false },
											"visible": true,
											"width": 16
										},
										{
											"name": "condition",
											"label": { "text": "Condition" },
											"controlType": "textfield",
											"valueDef": { "propType": "string", "isList": false, "isMap": false },
											"visible": true,
											"width": 32
										}],
									"keyIndex": -1,
									"defaultRow": ["1", "true"],
									"childItem": {
										"itemType": "additionalLink",
										"panel": {
											"id": "BalanceEntry",
											"panelType": "general",
											"uiItems": [
												{
													"itemType": "control",
													"control": {
														"name": "factor",
														"label": { "text": "Factor" },
														"controlType": "numberfield",
														"valueDef": { "propType": "double", "isList": false, "isMap": false },
														"separateLabel": true
													}
												},
												{
													"itemType": "control",
													"control": {
														"name": "condition",
														"label": { "text": "Condition" },
														"controlType": "expression",
														"valueDef": { "propType": "string", "isList": false, "isMap": false },
														"separateLabel": true
													}
												}
											]
										},
										"text": "...",
										"secondaryText": "Balance Settings"
									}
								}
							},
							{
								"itemType": "control",
								"control": {
									"name": "training_data_only",
									"label": { "text": "Only balance training data" },
									"controlType": "checkbox",
									"valueDef": { "propType": "boolean", "isList": false, "isMap": false },
									"separateLabel": false
								}
							}
						]
					}
				}
			}
		]
		};
		const expectedForm = new Form("balance", "Balance", "large", [primaryTabs], buttons, {});

		const paramSpec = {
			name: "balance",
			metadata: {
				structures: [{
					name: "BalanceEntry",
					uiHints: { icon: "images/balance.svg" },
					metadata: {
						arguments: [
							{ name: "factor", type: "double", resourceKey: "BalanceEntry.factor", required: true, uiHints: { columns: 16 }, default: 1 },
							{ name: "condition", type: "string", resourceKey: "BalanceEntry.condition", required: true, role: "expression",
								uiHints: { columns: 32 }, default: true }
						],
						uiHints: { editStyle: "subpanel" }
					}
				}],
				arguments: [
					{ name: "directives", type: "array[BalanceEntry]", resourceKey: "balance.directives" },
					{ name: "training_data_only", type: "boolean", resourceKey: "balance.training_data_only" }
				],
				argumentGroups: [
					{ name: "basic-settings", arguments: ["directives", "training_data_only"] }
				]
			}
		};
		const generatedForm = Form.makeForm(paramSpec, undefinedVar, undefinedVar, resources);
		// console.info("Expected: " + JSON.stringify(expectedForm));
		// console.info("Actual: " + JSON.stringify(generatedForm));
		// Work around since comparing the objects directly doesn't work.
		expect(_.isEqual(JSON.parse(JSON.stringify(expectedForm)), JSON.parse(JSON.stringify(generatedForm)))).to.be.true;
	}
	);

	it("should create a form with a structure with key", () => {

		const primaryTabs = { "itemType": "primaryTabs",
			"tabs": [{ "text": "Filter", "group": "filter-settings", "content": { "itemType": "panel", "panel": { "id": "filter-settings",
				"panelType": "general", "uiItems": [{ "itemType": "panel", "panel": { "id": "other-settings", "panelType": "general",
					"uiItems": [{ "itemType": "control", "control": { "name": "default_include", "label": { "text": "Filter selected fields" },
						"separateLabel": false, "controlType": "checkbox", "valueDef": { "propType": "boolean", "isList": false, "isMap": false } } }] } },
				{ "itemType": "panel", "panel": { "id": "data-settings", "panelType": "columnAllocation", "uiItems": [{ "itemType": "control", "control":
				{ "name": "selected_fields", "label": { "text": "Select Fields" }, "separateLabel": true, "controlType": "allocatedcolumns", "valueDef":
			{ "propType": "string", "isList": true, "isMap": false } } }] } }] } } },
			{ "text": "Rename", "group": "rename-settings", "content": { "itemType": "panel", "panel": { "id": "rename-settings", "panelType": "columnAllocation",
				"uiItems": [{ "itemType": "control", "control": { "name": "new_name", "label": { "text": "Rename Fields" },
					"separateLabel": true, "controlType": "allocatedstructures", "valueDef": { "propType": "structure", "isList": false, "isMap": true },
					"subControls": [{ "name": "field", "label": { "text": "Field" }, "visible": true, "width": 22, "controlType": "oneofcolumns",
						"valueDef": { "propType": "string", "isList": false, "isMap": false } },
					{ "name": "new_name", "label": { "text": "New Name" }, "visible": true, "width": 22, "controlType": "textfield",
						"valueDef": { "propType": "string", "isList": false, "isMap": false } }], "keyIndex": 0, "defaultRow": ["\"\""],
					"childItem": { "itemType": "additionalLink", "panel": { "id": "RenameFieldEntry", "panelType": "general",
						"uiItems": [{ "itemType": "control", "control": { "name": "new_name", "label": { "text": "New Name" },
							"separateLabel": true, "controlType": "textfield", "valueDef": { "propType": "string", "isList": false, "isMap": false } } }] }, "text": "...",
						"secondaryText": "Rename" } } }] } } }]
		};
		const expectedForm = new Form("filter", "Filter", "large", [primaryTabs], buttons, {});

		const paramSpec = {
			name: "filter",
			metadata: {
				operatorType: "transformer",
				categories: ["fieldOp"],
				uiHints: { icon: "images/filter.svg", editorSize: "large" },
				structures: [{
					name: "RenameFieldEntry",
					metadata: {
						keyDefinition: {
							name: "field", type: "string", role: "column", resourceKey: "RenameFieldEntry.field", uiHints: { columns: 22 }, default: ""
						},
						arguments: [
							{ name: "new_name", type: "string", resourceKey: "RenameFieldEntry.new_name", required: true, uiHints: { columns: 22 }, default: "" }
						],
						uiHints: { editStyle: "subpanel" }
					}
				}],
				arguments: [
					{ name: "default_include", type: "boolean", resourceKey: "filter.defaultInclude" },
					{ name: "selected_fields", type: "array[string]", role: "column", resourceKey: "filter.selectFields" },
					{ name: "new_name", type: "map[string,RenameFieldEntry]", resourceKey: "filter.renameFields" }
				],
				argumentGroups: [
					{
						name: "filter-settings",
						uiHints: { groupType: "panels" },
						subGroups: [
							{ name: "other-settings", arguments: ["default_include"] },
							{ name: "data-settings", uiHints: { groupType: "columnAllocation" }, arguments: ["selected_fields"] }
						]
					},
					{ name: "rename-settings", uiHints: { groupType: "columnAllocation" }, arguments: ["new_name"] }
				]
			}
		};
		const generatedForm = Form.makeForm(paramSpec, undefinedVar, undefinedVar, resources);
		// Work around since comparing the objects directly doesn't work.
		// console.info("Expected: " + JSON.stringify(expectedForm));
		// console.info("Actual: " + JSON.stringify(generatedForm));
		expect(_.isEqual(JSON.parse(JSON.stringify(expectedForm)), JSON.parse(JSON.stringify(generatedForm)))).to.be.true;
	}
	);

	it("should create a form with tabs since there is missing data", () => {
		const primaryTabs = {
			"itemType": "primaryTabs",
			"tabs": []
		};
		const expectedForm = new Form(undefinedVar, "undefined.label", "large", [primaryTabs], buttons, {});

		const paramSpec = {
			metadata: {
				arguments: [{
					name: "directives",
					type: "string",
					resourceKey: "balance.directives"
				}]
			}
		};
		const generatedForm = Form.makeForm(paramSpec, undefinedVar, undefinedVar, resources);
		// Work around since comparing the objects directly doesn't work.
		expect(_.isEqual(JSON.parse(JSON.stringify(expectedForm)), JSON.parse(JSON.stringify(generatedForm)))).to.be.true;
	}
	);
});
