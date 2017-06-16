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

const buttons = [{ id: "ok", text: "OK", isPrimary: true, url: "" }, { id: "cancel", text: "Cancel", isPrimary: false, url: "" }];

describe("Correct form should be created", () => {
	it("should create a form with a structure without key", () => {

		const primaryTabs = {
			"itemType": "primaryTabs",
			"tabs": [
				{
					"text": "Field Settings label: resource",
					"group": "fields-settings",
					"content": {
						"itemType": "panel",
						"panel": {
							"id": "fields-settings",
							"panelType": "general",
							"uiItems": [
								{
									"itemType": "panel",
									"panel": {
										"id": "field-allocation",
										"panelType": "columnAllocation",
										"uiItems": [
											{
												"itemType": "control",
												"control": {
													"name": "target",
													"label": {
														"text": "Target label: resource"
													},
													"controlType": "allocatedcolumn",
													"valueDef": {
														"propType": "string",
														"isList": false,
														"isMap": false
													},
													"separateLabel": true
												}
											},
											{
												"itemType": "control",
												"control": {
													"name": "inputs",
													"label": {
														"text": "inputs"
													},
													"controlType": "allocatedcolumns",
													"valueDef": {
														"propType": "string",
														"isList": true,
														"isMap": false
													},
													"separateLabel": true
												}
											}
										]
									}
								}
							]
						}
					}
				},
				{
					"text": "Parameter Settings label: default",
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
										"name": "enum_param",
										"label": {
											"text": "Enum label: resource"
										},
										"controlType": "radioset",
										"valueDef": {
											"propType": "string",
											"isList": false,
											"isMap": false
										},
										"orientation": "horizontal",
										"values": [
											"Include",
											"Discard"
										],
										"valueLabels": [
											"Include: resource",
											"Discard"
										],
										"separateLabel": true
									}
								},
								{
									"itemType": "panelSelector",
									"tabs": [
										{
											"text": "Include",
											"group": "Include",
											"content": {
												"itemType": "panel",
												"panel": {
													"id": "Include",
													"panelType": "general",
													"uiItems": [
														{
															"itemType": "control",
															"control": {
																"name": "int_param",
																"label": {
																	"text": "int_param.label"
																},
																"controlType": "numberfield",
																"valueDef": {
																	"propType": "integer",
																	"isList": false,
																	"isMap": false
																},
																"separateLabel": true
															}
														},
														{
															"itemType": "hSeparator"
														}
													]
												}
											}
										},
										{
											"text": "Discard",
											"group": "Discard",
											"content": {
												"itemType": "panel",
												"panel": {
													"id": "Discard",
													"panelType": "general",
													"uiItems": [
														{
															"itemType": "control",
															"control": {
																"name": "double_param",
																"label": {
																	"text": "double_param"
																},
																"controlType": "numberfield",
																"valueDef": {
																	"propType": "double",
																	"isList": false,
																	"isMap": false
																},
																"separateLabel": true
															}
														}
													]
												}
											}
										}
									],
									"dependsOn": "enum_param"
								},
								{
									"itemType": "panel",
									"panel": {
										"id": "boolean-settings",
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
											},
											{
												"itemType": "hSeparator"
											},
											{
												"itemType": "control",
												"control": {
													"name": "str_param",
													"label": {
														"text": "String label: default"
													},
													"controlType": "textfield",
													"valueDef": {
														"propType": "string",
														"isList": false,
														"isMap": false
													},
													"separateLabel": true
												}
											}
										]
									}
								}
							]
						}
					}
				}
			]
		};
		const expectedForm = new Form("TestOp", "TestOp label: resource", "large", [primaryTabs], buttons, {});

		const paramSpec = {
			"parameters": [
				{
					"name": "target",
					"type": "string",
					"role": "column"
				},
				{
					"name": "inputs",
					"type": "array[string]",
					"role": "column"
				},
				{
					"name": "enum_param",
					"enum": ["Include", "Discard"],
					"default": "Include"
				},
				{
					"name": "str_param",
					"type": "string"
				},
				{
					"name": "int_param",
					"type": "integer",
					"default": 1000
				},
				{
					"name": "double_param",
					"type": "double",
					"default": 50
				},
				{
					"name": "boolean_param",
					"type": "boolean",
					"default": false
				}
			],
			"uihints": {
				"name": "TestOp",
				"label": {
					"default": "TestOp label: default",
					"resourceKey": "testOp.label"
				},
				"icon": "./test.svg",
				"editorSize": "large",
				"parameter_info": [
					{
						"name": "enum_param",
						"label": {
							"default": "Enum label: default",
							"resourceKey": "enum_param.label"
						},
						"description": {
							"default": "Enum description: default",
							"resourceKey": "enum_param.desc"
						},
						"resourceKey": "enum_param.key",
						"orientation": "horizontal"
					},
					{
						"name": "str_param",
						"label": {
							"default": "String label: default"
						},
						"description": {
							"default": "String desciption: default"
						},
						"separator": "before"
					},
					{
						"name": "int_param",
						"label": {
							"default": "Int label: default",
							"resourceKey": "int_param.label"
						},
						"description": {
							"default": "Int description: default",
							"resourceKey": "int_param.desc"
						},
						"separator": "after"
					}
				],
				"group_info": [
					{
						"name": "fields-settings",
						"label": {
							"default": "Field Settings label: default",
							"resourceKey": "column-settings.label"
						},
						"type": "panels",
						"group_info": [
							{
								"name": "field-allocation",
								"type": "columnAllocation",
								"parameters": ["target", "inputs"]
							}
						]
					},
					{
						"name": "settings",
						"label": {
							"default": "Parameter Settings label: default"
						},
						"parameters": [
							"enum_param"
						],
						"group_info": [
							{
								"name": "enum-settings",
								"type": "panelSelector",
								"depends_on": "enum_param",
								"group_info": [
									{
										"name": "Include",
										"parameters": ["int_param"]
									},
									{
										"name": "Discard",
										"parameters": ["double_param"]
									}
								]
							},
							{
								"name": "boolean-settings",
								"parameters": ["boolean_param", "str_param"]
							}
						]
					}
				]
			},
			"resources": {
				"target.label": "Target label: resource",
				"target.desc": "Target field description: resource",
				"testOp.label": "TestOp label: resource",
				"enum_param.label": "Enum label: resource",
				"enum_param.Include.label": "Include: resource",
				"column-settings.label": "Field Settings label: resource"
			}
		};
		const generatedForm = Form.makeForm(paramSpec);
		// console.info("Expected: " + JSON.stringify(expectedForm));
		// console.info("Actual: " + JSON.stringify(generatedForm));
		// Work around since comparing the objects directly doesn't work.
		expect(_.isEqual(JSON.parse(JSON.stringify(expectedForm)), JSON.parse(JSON.stringify(generatedForm)))).to.be.true;
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
		// Work around since comparing the objects directly doesn't work.
		expect(_.isEqual(JSON.parse(JSON.stringify(expectedForm)), JSON.parse(JSON.stringify(generatedForm)))).to.be.true;
	}
	);
});
