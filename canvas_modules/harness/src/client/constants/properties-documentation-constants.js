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

"use strict";

// Private Methods ------------------------------------------------------------>

function _defineConstant(id, value) {
	Object.defineProperty(module.exports, id, {
		value: value,
		enumerable: true,
		writable: false
	});
}

const fields = [
	{
		"name": "Age",
		"type": "integer",
		"metadata": {
			"description": "",
			"measure": "range",
			"modeling_role": "input"
		}
	},
	{
		"name": "AGE",
		"type": "integer",
		"metadata": {
			"description": "",
			"measure": "range",
			"modeling_role": "input"
		}
	},
	{
		"name": "Sex",
		"type": "string",
		"metadata": {
			"description": "",
			"measure": "discrete",
			"modeling_role": "input"
		}
	},
	{
		"name": "BP",
		"type": "string",
		"metadata": {
			"description": "",
			"measure": "discrete",
			"modeling_role": "input"
		}
	},
	{
		"name": "Cholesterol",
		"type": "string",
		"metadata": {
			"description": "",
			"measure": "discrete",
			"modeling_role": "input"
		}
	},
	{
		"name": "Na",
		"type": "double",
		"metadata": {
			"description": "",
			"measure": "range",
			"modeling_role": "input"
		}
	},
	{
		"name": "K",
		"type": "double",
		"metadata": {
			"description": "",
			"measure": "range",
			"modeling_role": "input"
		}
	},
	{
		"name": "Drug",
		"type": "string",
		"metadata": {
			"description": "",
			"measure": "discrete",
			"modeling_role": "input"
		}
	},
	{
		"name": "Height",
		"type": "double",
		"metadata": {
			"description": "",
			"measure": "range",
			"modeling_role": "input"
		}
	},
	{
		"name": "Weight",
		"type": "double",
		"metadata": {
			"description": "",
			"measure": "range",
			"modeling_role": "input"
		}
	},
	{
		"name": "BMI",
		"type": "double",
		"metadata": {
			"description": "",
			"measure": "range",
			"modeling_role": "input"
		}
	},
	{
		"name": "Name",
		"type": "string",
		"metadata": {
			"description": "",
			"measure": "range",
			"modeling_role": "input"
		}
	},
	{
		"name": "DOB",
		"type": "date",
		"metadata": {
			"description": "",
			"measure": "range",
			"modeling_role": "input"
		}
	}
];
const fields2 = [
	{
		"name": "Age",
		"type": "integer",
		"metadata": {
			"description": "",
			"measure": "range",
			"modeling_role": "input"
		}
	},
	{
		"name": "AGE",
		"type": "integer",
		"metadata": {
			"description": "",
			"measure": "range",
			"modeling_role": "input"
		}
	},
	{
		"name": "School",
		"type": "string",
		"metadata": {
			"description": "",
			"measure": "discrete",
			"modeling_role": "input"
		}
	},
	{
		"name": "City",
		"type": "string",
		"metadata": {
			"description": "",
			"measure": "discrete",
			"modeling_role": "input"
		}
	}
];

// Public Methods ------------------------------------------------------------->
_defineConstant("CONTAINERS_RIGHT_FLYOUT_PROPERTIES", "const rightFlyoutContent =(<CommonProperties \n" +
"    propertiesConfig={this.propertiesConfig} \n" +
"    propertiesInfo={this.propertiesInfo} \n" +
"/>);");

_defineConstant("CONTAINERS_RIGHT_FLYOUT_PROPERTIES_CONFIG", "this.propertiesConfig = { \n" +
"    containerType=\"Custom\" \n" +
"    rightFlyout \n" +
"};");

_defineConstant("CONTAINERS_RIGHT_FLYOUT_PROPERTIES_INFO", "this.propertiesInfo = { \n" +
"    parameterDef: someParameterDefinition \n" +
"};");

_defineConstant("CONTAINERS_RIGHT_FLYOUT_CANVAS", "<CommonCanvas \n" +
"    canvasController={this.canvasController} \n" +
"    rightFlyoutContent={rightFlyoutContent} \n" +
"    showRightFlyout={showRightFlyoutProperties} \n" +
"/>");

_defineConstant("CONTROLS_PROPS_INFO", {
	"title": "Group Type: controls",
	"parameterDef": {
		"titleDefinition": {
			"title": "Group: Controls",
			"editable": false
		},
		"current_parameters": {
			"textfieldControlName": "textfieldPlaceholderText",
			"numberfieldControlName": -1
		},
		"parameters": [
			{
				"id": "textfieldControlName",
				"type": "string",
				"default": "textfieldControlNamePlaceholderText",
				"role": "new_column",
				"required": true
			},
			{
				"id": "numberfieldControlName",
				"type": "integer",
				"default": 0
			}
		],
		"uihints": {
			"id": "ControlsPanel",
			"parameter_info": [
				{
					"parameter_ref": "textfieldControlName",
					"label": {
						"default": "Textfield Control Name"
					},
					"description": {
						"default": "Textfield test"
					}
				},
				{
					"parameter_ref": "numberfieldControlName",
					"label": {
						"default": "Numberfield Control Name"
					},
					"description": {
						"default": "Numberfield test"
					}
				}
			],
			"group_info": [
				{
					"id": "Controls Panel",
					"type": "controls",
					"parameter_refs": [
						"textfieldControlName",
						"numberfieldControlName"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		]
	}
});
_defineConstant("TABS_PROPS_INFO", {
	"title": "Group Type: tabs",
	"parameterDef": {
		"titleDefinition": {
			"title": "Group: tabs",
			"editable": false
		},
		"current_parameters": {
			"textfieldControlName": "textfieldPlaceholderText",
			"numberfieldControlName": -1
		},
		"parameters": [
			{
				"id": "textfieldControlName",
				"type": "string",
				"default": "textfieldControlNamePlaceholderText",
				"role": "new_column",
				"required": true
			},
			{
				"id": "numberfieldControlName",
				"type": "integer",
				"default": 0
			}
		],
		"uihints": {
			"id": "TabsPanel",
			"parameter_info": [
				{
					"parameter_ref": "textfieldControlName",
					"label": {
						"default": "Textfield Control Name"
					},
					"description": {
						"default": "Textfield test"
					}
				},
				{
					"parameter_ref": "numberfieldControlName",
					"label": {
						"default": "Numberfield Control Name"
					},
					"description": {
						"default": "Numberfield test"
					}
				}
			],
			"group_info": [
				{
					"id": "Tab 1",
					"parameter_refs": [
						"textfieldControlName"
					]
				},
				{
					"id": "Tab 2",
					"parameter_refs": [
						"numberfieldControlName"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		]
	}
});
_defineConstant("SUBTABS_PROPS_INFO", {
	"title": "Group Type: subTabs",
	"parameterDef": {
		"titleDefinition": {
			"title": "Group: subTabs",
			"editable": false
		},
		"current_parameters": {
			"textfieldControlName": "textfieldPlaceholderText",
			"numberfieldControlName": -1
		},
		"parameters": [
			{
				"id": "textfieldControlName",
				"type": "string",
				"default": "textfieldControlNamePlaceholderText",
				"role": "new_column",
				"required": true
			},
			{
				"id": "numberfieldControlName",
				"type": "integer",
				"default": 0
			}
		],
		"uihints": {
			"id": "SubTabsPanel",
			"parameter_info": [
				{
					"parameter_ref": "textfieldControlName",
					"label": {
						"default": "Textfield Control Name"
					},
					"description": {
						"default": "Textfield test"
					}
				},
				{
					"parameter_ref": "numberfieldControlName",
					"label": {
						"default": "Numberfield Control Name"
					},
					"description": {
						"default": "Numberfield test"
					}
				}
			],
			"group_info": [
				{
					"id": "SubTabs Panels",
					"type": "subTabs",
					"group_info": [
						{
							"id": "SubTab 1",
							"parameter_refs": [
								"textfieldControlName"
							]
						},
						{
							"id": "SubTab 2",
							"parameter_refs": [
								"numberfieldControlName"
							]
						}
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		]
	}
});
_defineConstant("PANELS_PROPS_INFO", {
	"title": "Group Type: panels",
	"parameterDef": {
		"titleDefinition": {
			"title": "Group: panels",
			"editable": false
		},
		"current_parameters": {
			"textfieldControlName": "textfieldPlaceholderText",
			"numberfieldControlName": -1
		},
		"parameters": [
			{
				"id": "textfieldControlName",
				"type": "string",
				"default": "textfieldControlNamePlaceholderText",
				"role": "new_column",
				"required": true
			},
			{
				"id": "numberfieldControlName",
				"type": "integer",
				"default": 0
			}
		],
		"uihints": {
			"id": "PanelsPanel",
			"parameter_info": [
				{
					"parameter_ref": "textfieldControlName",
					"label": {
						"default": "Textfield Control Name"
					},
					"description": {
						"default": "Textfield test"
					}
				},
				{
					"parameter_ref": "numberfieldControlName",
					"label": {
						"default": "Numberfield Control Name"
					},
					"description": {
						"default": "Numberfield test"
					}
				}
			],
			"group_info": [
				{
					"id": "Panels",
					"type": "panels",
					"group_info": [
						{
							"id": "Panels Type",
							"type": "controls",
							"parameter_refs": [
								"textfieldControlName"
							]
						},
						{
							"id": "Panels Type",
							"type": "panels",
							"group_info": [
								{
									"id": "Panels Type",
									"type": "controls",
									"parameter_refs": [
										"textfieldControlName"
									]
								},
								{
									"id": "Panels Type",
									"type": "controls",
									"parameter_refs": [
										"numberfieldControlName"
									]
								}
							]
						}
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		]
	}
});
_defineConstant("PANEL_SELECTOR_PROPS_INFO", {
	"title": "Group Type: panelSelector",
	"parameterDef": {
		"titleDefinition": {
			"title": "Group: panelSelector",
			"editable": false
		},
		"current_parameters": {
			"radioset": "red",
			"strawberries": 1,
			"oranges": 2,
			"lemons": 3,
			"apples": 4
		},
		"parameters": [
			{
				"id": "radioset",
				"enum": [
					"red",
					"orange",
					"yellow",
					"green"
				]
			},
			{
				"id": "strawberries",
				"type": "integer",
				"default": 1
			},
			{
				"id": "oranges",
				"type": "integer",
				"default": 2
			},
			{
				"id": "lemons",
				"type": "double",
				"default": 3
			},
			{
				"id": "apples",
				"type": "double",
				"default": 4
			}
		],
		"uihints": {
			"id": "Panel Selector",
			"parameter_info": [
				{
					"parameter_ref": "radioset",
					"label": {
						"default": "Radioset Control Name"
					},
					"description": {
						"default": "radioset test"
					}
				},
				{
					"parameter_ref": "strawberries",
					"label": {
						"default": "Strawberries"
					},
					"description": {
						"default": "Number of Strawberries"
					}
				},
				{
					"parameter_ref": "oranges",
					"label": {
						"default": "Oranges"
					},
					"description": {
						"default": "Number of Oranges"
					}
				},
				{
					"parameter_ref": "lemons",
					"label": {
						"default": "Lemons"
					},
					"description": {
						"default": "Number of Lemons"
					}
				},
				{
					"parameter_ref": "apples",
					"label": {
						"default": "Apples"
					},
					"description": {
						"default": "Number of Apples"
					}
				}
			],
			"group_info": [
				{
					"id": "Panel Selector",
					"parameter_refs": [
						"radioset"
					],
					"group_info": [
						{
							"id": "panelSelectorSettings",
							"type": "panelSelector",
							"depends_on_ref": "radioset",
							"group_info": [
								{
									"id": "red",
									"parameter_refs": [
										"strawberries"
									]
								},
								{
									"id": "orange",
									"parameter_refs": [
										"oranges"
									]
								},
								{
									"id": "yellow",
									"parameter_refs": [
										"lemons"
									]
								},
								{
									"id": "green",
									"parameter_refs": [
										"apples"
									]
								}
							]
						}
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		]
	}
});
_defineConstant("PANEL_SELECTOR_INSERT_PROPS_INFO", {
	"title": "Group Type: panelSelector",
	"parameterDef": {
		"titleDefinition": {
			"title": "Group: panelSelector",
			"editable": false
		},
		"current_parameters": {
			"radioset": "red",
			"strawberries": 1,
			"oranges": 2,
			"lemons": 3,
			"apples": 4
		},
		"parameters": [
			{
				"id": "radioset",
				"enum": [
					"red",
					"orange",
					"yellow",
					"green"
				]
			},
			{
				"id": "strawberries",
				"type": "integer",
				"default": 1
			},
			{
				"id": "oranges",
				"type": "integer",
				"default": 2
			},
			{
				"id": "lemons",
				"type": "double",
				"default": 3
			},
			{
				"id": "apples",
				"type": "double",
				"default": 4
			}
		],
		"uihints": {
			"id": "Panel Selector",
			"parameter_info": [
				{
					"parameter_ref": "radioset",
					"label": {
						"default": "Radioset Control Name"
					},
					"description": {
						"default": "radioset test"
					},
					"orientation": "vertical"
				},
				{
					"parameter_ref": "strawberries",
					"label": {
						"default": "Strawberries"
					},
					"description": {
						"default": "Number of Strawberries"
					}
				},
				{
					"parameter_ref": "oranges",
					"label": {
						"default": "Oranges"
					},
					"description": {
						"default": "Number of Oranges"
					}
				},
				{
					"parameter_ref": "lemons",
					"label": {
						"default": "Lemons"
					},
					"description": {
						"default": "Number of Lemons"
					}
				},
				{
					"parameter_ref": "apples",
					"label": {
						"default": "Apples"
					},
					"description": {
						"default": "Number of Apples"
					}
				}
			],
			"group_info": [
				{
					"id": "Panel Selector",
					"parameter_refs": [
						"radioset"
					],
					"group_info": [
						{
							"id": "panelSelectorSettings",
							"type": "panelSelector",
							"depends_on_ref": "radioset",
							"insert_panels": true,
							"group_info": [
								{
									"id": "red",
									"parameter_refs": [
										"strawberries"
									]
								},
								{
									"id": "orange",
									"parameter_refs": [
										"oranges"
									]
								},
								{
									"id": "yellow",
									"parameter_refs": [
										"lemons"
									]
								},
								{
									"id": "green",
									"parameter_refs": [
										"apples"
									]
								}
							]
						}
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		]
	}
});

_defineConstant("SUMMARY_PANEL_PROPS_INFO", {
	"title": "Group Type: summaryPanel",
	"parameterDef": {
		"titleDefinition": {
			"title": "Group: summaryPanel",
			"editable": false
		},
		"current_parameters": {
			"structuretableRenameFields": [
				[
					"Age",
					"Age",
					"",
					"string"
				],
				[
					"BP",
					"BP-1",
					"blood pressure",
					""
				]
			]
		},
		"parameters": [
			{
				"id": "structuretableRenameFields",
				"type": "map[string,structuretableRenameFields]",
				"role": "column",
				"default": []
			}
		],
		"complex_types": [
			{
				"id": "structuretableRenameFields",
				"key_definition": {
					"id": "field",
					"type": "string",
					"role": "column"
				},
				"parameters": [
					{
						"id": "new_name",
						"type": "string",
						"role": "new_column"
					},
					{
						"id": "new_label",
						"type": "string",
						"default": ""
					},
					{
						"id": "new_type",
						"enum": [
							"string",
							"number",
							"boolean",
							"time",
							"date"
						],
						"default": "string"
					}
				]
			}
		],
		"uihints": {
			"id": "PanelsPanel",
			"parameter_info": [
				{
					"parameter_ref": "textfieldControlName",
					"label": {
						"default": "Textfield Control Name"
					},
					"description": {
						"default": "Textfield test"
					}
				},
				{
					"parameter_ref": "numberfieldControlName",
					"label": {
						"default": "Numberfield Control Name"
					},
					"description": {
						"default": "Numberfield test"
					}
				},
				{
					"parameter_ref": "structuretableSortOrder",
					"required": true,
					"label": {
						"default": "Sort by"
					},
					"description": {
						"default": "Use arrows to reorder the sorting priority",
						"placement": "on_panel"
					}
				},
				{
					"parameter_ref": "structuretableRenameFields",
					"label": {
						"default": "Rename Field"
					},
					"description": {
						"default": "Complex table control with inline edit and subpanel edit"
					}
				}
			],
			"complex_type_info": [
				{
					"complex_type_ref": "structuretableRenameFields",
					"label": {
						"default": "Rename Subpanel"
					},
					"key_definition": {
						"parameter_ref": "field",
						"label": {
							"resource_key": "structuretableRenameFields.field.label"
						},
						"width": 26,
						"summary": true
					},
					"parameters": [
						{
							"parameter_ref": "new_name",
							"label": {
								"resource_key": "structuretableRenameFields.new_name.label"
							},
							"description": {
								"resource_key": "structuretableRenameFields.new_name.desc"
							},
							"width": 26,
							"edit_style": "inline",
							"filterable": true,
							"summary": true
						},
						{
							"parameter_ref": "new_label",
							"label": {
								"default": "Label"
							},
							"width": 26,
							"edit_style": "subpanel"
						},
						{
							"parameter_ref": "new_type",
							"label": {
								"default": "Type"
							},
							"description": {
								"default": "Select data type"
							},
							"width": 26,
							"edit_style": "inline"
						}
					]
				}
			],
			"group_info": [{
				"id": "Tables",
				"type": "panels",
				"group_info": [
					{
						"id": "structuretableRenameFields-summary-panel",
						"label": {
							"default": "Configure Tables"
						},
						"type": "summaryPanel",
						"group_info": [{
							"id": "structuretableRenameFields",
							"label": {
								"default": "Tables"
							},
							"type": "columnSelection",
							"parameter_refs": [
								"structuretableRenameFields"
							]
						}]
					}
				]
			}]
		},
		"dataset_metadata": [
			{
				"fields": fields
			}
		],
		"resources": {
			"structuretableRenameFields.rename.label": "Rename Columns",
			"structuretableRenameFields.field.label": "Input name",
			"structuretableRenameFields.new_name.label": "Output name",
			"structuretableRenameFields.new_name.desc": "New field name"
		}
	}
});
_defineConstant("TWISTY_PANEL_PROPS_INFO", {
	"title": "Panel Type: TwistyPanel",
	"parameterDef": {
		"titleDefinition": {
			"title": "Group: twistyPanel",
			"editable": false
		},
		"current_parameters": {
			"fromValue": 2,
			"toValue": 1
		},
		"parameters": [
			{
				"id": "fromValue",
				"type": "doubler",
				"required": true
			},
			{
				"id": "toValue",
				"type": "integer",
				"required": true
			}
		],
		"complex_types": [],
		"uihints": {
			"id": "Twist.test",
			"icon": "images/modelbuildspark.svg",
			"label": {
				"default": "Twisty Test"
			},
			"description": {
				"default": "Test Twisty Panel"
			},
			"parameter_info": [
				{
					"parameter_ref": "fromValue",
					"label": {
						"default": "From"
					},
					"description": {
						"default": "Double value for From range"
					}
				},
				{
					"parameter_ref": "toValue",
					"label": {
						"default": "Step"
					},
					"description": {
						"default": "Step value"
					},
					"control": "readonly"
				}
			],
			"action_info": [
				{
					"id": "increment",
					"label": {
						"resource_key": "increment"
					},
					"control": "button",
					"data": {
						"parameter_ref": "toValue"
					}
				}
			],
			"complex_type_info": [],
			"group_info": [
				{
					"id": "TwistyPanel",
					"label": {
						"default": "Twisty Panel Test"
					},
					"type": "panels",
					"group_info": [
						{
							"id": "TwistyPanel",
							"label": {
								"default": "Automatic Reclassify"
							},
							"type": "twistyPanel",
							"group_info": [
								{
									"id": "Range-fields",
									"type": "controls",
									"label": {
										"default": "Range Fields"
									},
									"parameter_refs": [
										"fromValue",
										"toValue"
									]
								},
								{
									"id": "increment-action-panel",
									"type": "actionPanel",
									"action_refs": [
										"increment"
									]
								}
							]
						}
					]
				}
			]
		},
		"conditions": [],
		"dataset_metadata": {},
		"resources": {
			"increment": "Increase Step"
		}
	}
});
_defineConstant("TEARSHEET_PANEL_PROPS_INFO", {
	"title": "Panel Type: Tearsheet",
	"parameterDef": {
		"current_parameters": {
			"code": "Age >= 55"
		},
		"parameters": [
			{
				"id": "code",
				"type": "string"
			}
		],
		"uihints": {
			"parameter_info": [{
				"parameter_ref": "code",
				"language": "text/x-python",
				"enable_maximize": true,
				"data": {
					"tearsheet_ref": "tearsheet1"
				},
				"label": {
					"default": "Code"
				},
				"description": {
					"default": "Enter Python code"
				},
				"text_before": {
					"default": "Press ctrl-space to autocomplete"
				},
				"control": "code",
				"class_name": "code-control-class"
			}],
			"group_info": [{
				"id": "tearsheet-code",
				"label": {
					"default": "Expression with Maximize"
				},
				"parameter_refs": [
					"code"
				]
			}, {
				"id": "tearsheet1",
				"label": {
					"default": "Python"
				},
				"description": {
					"default": "Your change is automatically saved."
				},
				"type": "tearsheetPanel",
				"group_info": [{
					"id": "tearsheet-code-2",
					"parameter_refs": [
						"code"
					]
				}]
			}]
		}
	}
});
_defineConstant("TEARSHEET_PANEL_FROM_HOST_PROPS_INFO", {
	"title": "Panel Type: Tearsheet",
	"parameterDef": {
		"uihints": {
			"group_info": [{
				"id": "tearsheet0",
				"label": {
					"default": "Python"
				},
				"description": {
					"default": "Your change is automatically saved."
				},
				"type": "tearsheetPanel",
				"group_info": [{
					"id": "orange",
					"type": "textPanel",
					"label": {
						"default": "Oranges"
					},
					"description": {
						"default": "An orange tree can grow to reach 30 feet and live for over a hundred years."
					}
				}]
			}]
		}
	}
});
_defineConstant("COLUMN_PANEL_PROPS_INFO", {
	"title": "Panel Type: ColumnPanel",
	"parameterDef": {
		"titleDefinition": {
			"title": "Group: columnPanel",
			"editable": false
		},
		"current_parameters": {
			"col1_ctrl1": "blue",
			"col1_ctrl2": 1,
			"col2_ctrl1": "red",
			"col2_ctrl2": 5
		},
		"parameters": [
			{
				"id": "col1_ctrl1",
				"enum": [
					"red",
					"blue",
					"yellow"
				]
			},
			{
				"id": "col1_ctrl2",
				"type": "double"
			},
			{
				"id": "col2_ctrl1",
				"enum": [
					"red",
					"blue",
					"yellow"
				]
			},
			{
				"id": "col2_ctrl2",
				"type": "double"
			}
		],
		"uihints": {
			"id": "ColumnPanel.test",
			"icon": "images/na.svg",
			"label": {
				"default": "ColumnPanel Test"
			},
			"description": {
				"default": "Test Column Panel"
			},
			"parameter_info": [
				{
					"parameter_ref": "col1_ctrl1",
					"label": {
						"default": "Fruit Color"
					},
					"control": "oneofselect"
				},
				{
					"parameter_ref": "col1_ctrl2",
					"label": {
						"default": "number"
					}
				},
				{
					"parameter_ref": "col2_ctrl1",
					"label": {
						"default": "Fruit Color"
					},
					"control": "oneofselect"
				},
				{
					"parameter_ref": "col2_ctrl2",
					"label": {
						"default": "number"
					}
				}
			],
			"group_info": [
				{
					"id": "panel-columns",
					"label": {
						"default": "Column Panels"
					},
					"type": "columnPanel",
					"group_info": [
						{
							"id": "panel1-values",
							"type": "controls",
							"parameter_refs": [
								"col1_ctrl1",
								"col1_ctrl2"
							]
						},
						{
							"id": "panel2-values",
							"type": "controls",
							"parameter_refs": [
								"col2_ctrl1",
								"col2_ctrl2"
							]
						}
					]
				}
			]
		},
		"conditions": [],
		"dataset_metadata": {},
		"resources": {}
	}
});
_defineConstant("COLUMNSELECTION_PROPS_INFO", {
	"title": "Group Types: ColumnSelection",
	"parameterDef": {
		"titleDefinition": {
			"title": "Group: columnSelection",
			"editable": false
		},
		"current_parameters": {
			"selectcolumnsList1": ["BP"],
			"selectcolumnsList2": ["Age"]
		},
		"parameters": [
			{
				"id": "selectcolumnsList1",
				"type": "array[string]",
				"default": [],
				"role": "column"
			},
			{
				"id": "selectcolumnsList2",
				"type": "array[string]",
				"default": [],
				"role": "column"
			}
		],
		"uihints": {
			"id": "ColumnSelectionPanel",
			"parameter_info": [
				{
					"parameter_ref": "selectcolumnsList1",
					"label": {
						"default": "SelectColumns1 Control Name"
					},
					"description": {
						"default": "selectcolumns test"
					}
				},
				{
					"parameter_ref": "selectcolumnsList2",
					"label": {
						"default": "SelectColumns2 Control Name"
					},
					"description": {
						"default": "selectcolumns test"
					}
				}
			],
			"group_info": [
				{
					"id": "ColumnSelection Panel",
					"type": "columnSelection",
					"parameter_refs": [
						"selectcolumnsList1",
						"selectcolumnsList2"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": fields
			}
		]
	}
});

_defineConstant("TEXT_PANEL_PROPS_INFO", {
	"title": "Group Types: Text Panel",
	"parameterDef": {
		"titleDefinition": {
			"title": "Group: textPanel",
			"editable": false
		},
		"parameters": [
		],
		"uihints": {
			"id": "TextPanelId",
			"parameter_info": [],
			"group_info": [
				{
					"id": "text-panels",
					"label": {
						"default": "Text Panels"
					},
					"type": "panels",
					"group_info": [
						{
							"id": "orange",
							"type": "textPanel",
							"label": {
								"default": "Oranges"
							},
							"description": {
								"default": "An orange tree can grow to reach 30 feet and live for over a hundred years."
							}
						},
						{
							"id": "avocado",
							"type": "textPanel",
							"label": {
								"default": "Avocados"
							},
							"description": {
								"default": "An avocado tree can range from 15 to 30 feet tall.",
								"placement": "as_tooltip"
							}
						}
					]
				}
			]
		}
	}
});

_defineConstant("TEXTFIELD_PROPS_INFO", {
	"title": "TextField Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: textfield",
			"editable": false
		},
		"current_parameters": {
			"textfieldControlName": "textfieldPlaceholderText"
		},
		"parameters": [
			{
				"id": "textfieldControlName",
				"type": "string",
				"default": "textfieldControlNamePlaceholderText",
				"role": "new_column",
				"required": true
			}
		],
		"uihints": {
			"id": "textfieldControlName",
			"parameter_info": [
				{
					"parameter_ref": "textfieldControlName",
					"label": {
						"default": "Textfield Control Name"
					},
					"description": {
						"default": "Textfield test"
					}
				}
			],
			"group_info": [
				{
					"id": "Textfield Control",
					"type": "controls",
					"parameter_refs": [
						"textfieldControlName"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		]
	},
	"resources": {
		"textfieldControlName_not_empty": "Textfield Control cannot be empty"
	}
});
_defineConstant("TEXTAREA_PROPS_INFO", {
	"title": "Textarea Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: textarea",
			"editable": false
		},
		"current_parameters": {
			"textareaControlName": []
		},
		"parameters": [
			{
				"id": "textareaControlName",
				"type": "array[string]",
				"default": "textareaPlaceholderText",
				"role": "new_column"
			}
		],
		"uihints": {
			"id": "textareaControlName",
			"parameter_info": [
				{
					"parameter_ref": "textareaControlName",
					"label": {
						"default": "Textarea Control Name"
					},
					"description": {
						"default": "Textarea test"
					}
				}
			],
			"group_info": [
				{
					"id": "Textarea Control",
					"type": "controls",
					"parameter_refs": [
						"textareaControlName"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		]
	},
	"resources": {
		"textareaControlName_not_empty": "Textarea Control cannot be empty"
	}
});
_defineConstant("LIST_PROPS_INFO", {
	"title": "List Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: list",
			"editable": false
		},
		"current_parameters": {
			"listControlName": [
				"list item 1"
			]
		},
		"parameters": [
			{
				"id": "listControlName",
				"type": "array[string]",
				"default": "listPlaceholderText"
			}
		],
		"uihints": {
			"id": "listControlName",
			"parameter_info": [
				{
					"parameter_ref": "listControlName",
					"label": {
						"default": "List Control Name"
					},
					"description": {
						"default": "List test"
					},
					"control": "list",
					"moveable_rows": true,
					"rows": 6
				}
			],
			"group_info": [
				{
					"id": "List Control",
					"type": "controls",
					"parameter_refs": [
						"listControlName"
					]
				}
			]
		}
	}
});
_defineConstant("PASSWORD_FIELD_PROPS_INFO", {
	"title": "Password Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: password",
			"editable": false
		},
		"current_parameters": {
			"passwordField": ""
		},
		"parameters": [
			{
				"id": "passwordField",
				"type": "password",
				"default": "",
				"role": "new_column"
			}
		],
		"uihints": {
			"id": "passwordField",
			"parameter_info": [
				{
					"parameter_ref": "passwordField",
					"label": {
						"default": "Password Control Name"
					},
					"description": {
						"default": "Password test"
					}
				}
			],
			"group_info": [
				{
					"id": "Password Control",
					"type": "controls",
					"parameter_refs": [
						"passwordField"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		]
	}
});
_defineConstant("EXPRESSION_PROPS_INFO", {
	"title": "Expression Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: Expression",
			"editable": false
		},
		"current_parameters": {
			"expressionBox": "is_real(salbegin)  and  gender  = \"F\" or BP = 120\n"
		},
		"parameters": [
			{
				"id": "expressionBox",
				"type": "string",
				"default": "a / b",
				"role": "expression"
			}
		],
		"uihints": {
			"id": "expressionBox",
			"parameter_info": [
				{
					"parameter_ref": "expressionBox",
					"language": "CLEM",
					"label": {
						"default": "Expression Control Name"
					},
					"description": {
						"default": "Expression test"
					}
				}
			],
			"group_info": [
				{
					"id": "Expression Control",
					"type": "controls",
					"parameter_refs": [
						"expressionBox"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": [
					{
						"name": "Age",
						"type": "integer",
						"metadata": {
							"description": "",
							"measure": "range",
							"modeling_role": "input",
							"range": {
								"min": 21,
								"max": 55
							}
						}
					},
					{
						"name": "Sex",
						"type": "string",
						"metadata": {
							"description": "",
							"measure": "discrete",
							"modeling_role": "input",
							"values": [
								"male",
								"female",
								"not specified"
							]
						}
					},
					{
						"name": "BP",
						"type": "string",
						"metadata": {
							"description": "",
							"measure": "discrete",
							"modeling_role": "input",
							"values": [
								"very high",
								"high",
								"normal",
								"low",
								"very low"
							]
						}
					},
					{
						"name": "Cholesterol",
						"type": "string",
						"metadata": {
							"description": "",
							"measure": "discrete",
							"modeling_role": "input",
							"values": [
								"hdl good",
								"hdl bad",
								"ldl good",
								"ldl bad"
							]
						}
					},
					{
						"name": "Ag",
						"type": "integer",
						"metadata": {
							"description": "",
							"measure": "range",
							"modeling_role": "input",
							"range": {
								"min": 18,
								"max": 35
							}
						}
					}
				]
			}
		]
	}
});
_defineConstant("CODE_PROPS_INFO", {
	"title": "Code Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: Code",
			"editable": false
		},
		"current_parameters": {
			"code": "print(bool(4 > 2))"
		},
		"parameters": [
			{
				"id": "code",
				"type": "string"
			}
		],
		"uihints": {
			"id": "expressionBox",
			"parameter_info": [
				{
					"parameter_ref": "code",
					"language": "text/x-python",
					"label": {
						"default": "Code Control Name"
					},
					"control": "code",
					"description": {
						"default": "Code test"
					}
				}
			],
			"group_info": [
				{
					"id": "Code-Control",
					"type": "controls",
					"parameter_refs": [
						"code"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": [
					{
						"name": "Age",
						"type": "integer",
						"metadata": {
							"description": "",
							"measure": "range",
							"modeling_role": "input",
							"range": {
								"min": 21,
								"max": 55
							}
						}
					},
					{
						"name": "Sex",
						"type": "string",
						"metadata": {
							"description": "",
							"measure": "discrete",
							"modeling_role": "input",
							"values": [
								"male",
								"female",
								"not specified"
							]
						}
					},
					{
						"name": "BP",
						"type": "string",
						"metadata": {
							"description": "",
							"measure": "discrete",
							"modeling_role": "input",
							"values": [
								"very high",
								"high",
								"normal",
								"low",
								"very low"
							]
						}
					},
					{
						"name": "Cholesterol",
						"type": "string",
						"metadata": {
							"description": "",
							"measure": "discrete",
							"modeling_role": "input",
							"values": [
								"hdl good",
								"hdl bad",
								"ldl good",
								"ldl bad"
							]
						}
					},
					{
						"name": "Ag",
						"type": "integer",
						"metadata": {
							"description": "",
							"measure": "range",
							"modeling_role": "input",
							"range": {
								"min": 18,
								"max": 35
							}
						}
					}
				]
			}
		]
	}
});
_defineConstant("HIDDEN_PROPS_INFO", {
	"title": "Hidden Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: hidden",
			"editable": false
		},
		"current_parameters": {
			"hidden_param": "The more I study, the more insatiable do I feel my genius for it to be. 'Ada Lovelace'"
		},
		"parameters": [
			{
				"id": "hidden_param",
				"type": "string"
			}
		],
		"uihints": {
			"id": "hidden_param-control",
			"parameter_info": [
				{
					"parameter_ref": "hidden_param",
					"label": {
						"default": "Hidden Field"
					},
					"description": {
						"default": "Hidden field that can't be edited"
					},
					"control": "hidden"
				}
			],
			"group_info": [
				{
					"id": "hidden-group",
					"label": {
						"default": "Hidden Tab"
					},
					"type": "controls",
					"parameter_refs": [
						"hidden_param"
					]
				}
			]
		}
	}
});
_defineConstant("READONLY_PROPS_INFO", {
	"title": "Readonly Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: readonly",
			"editable": false
		},
		"current_parameters": {
			"readonly_param": "The more I study, the more insatiable do I feel my genius for it to be. 'Ada Lovelace'"
		},
		"parameters": [
			{
				"id": "readonly_param",
				"type": "string"
			}
		],
		"uihints": {
			"id": "readonly_param-control",
			"parameter_info": [
				{
					"parameter_ref": "readonly_param",
					"label": {
						"default": "Readonly Field"
					},
					"description": {
						"default": "Readonly field that can't be edited"
					},
					"control": "readonly"
				}
			],
			"group_info": [
				{
					"id": "readonly-group",
					"label": {
						"default": "Readonly Tab"
					},
					"type": "controls",
					"parameter_refs": [
						"readonly_param"
					]
				}
			]
		}
	}
});
_defineConstant("NUMBERFIELD_PROPS_INFO", {
	"title": "NumberField Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: numberfield",
			"editable": false
		},
		"current_parameters": {
			"numberfieldControlName": 0
		},
		"parameters": [
			{
				"id": "numberfieldControlName",
				"type": "integer",
				"default": 0
			}
		],
		"uihints": {
			"id": "numberfieldControlName",
			"parameter_info": [
				{
					"parameter_ref": "numberfieldControlName",
					"label": {
						"default": "Numberfield Control Name"
					},
					"description": {
						"default": "Numberfield test"
					}
				}
			],
			"group_info": [
				{
					"id": "Numberfield Control",
					"type": "controls",
					"parameter_refs": [
						"numberfieldControlName"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		]
	}
});
_defineConstant("SPINNER_PROPS_INFO", {
	"title": "Spinner Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: spinner",
			"editable": false
		},
		"current_parameters": {
			"spinner_int": 10,
		},
		"parameters": [
			{
				"id": "spinner_int",
				"type": "integer",
				"required": true
			}
		],
		"uihints": {
			"id": "SpinnerControlName",
			"parameter_info": [
				{
					"parameter_ref": "spinner_int",
					"label": {
						"default": "Integer"
					},
					"description": {
						"default": "spinner with increment=1 should increment/decrement by 1"
					},
					"control": "spinner",
					"increment": 1
				}
			],
			"group_info": [
				{
					"id": "Spinner Control",
					"type": "controls",
					"parameter_refs": [
						"spinner_int"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		]
	}
});
_defineConstant("NUMBERFIELD_GENERATOR_PROPS_INFO", {
	"title": "NumberField Generator Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: numberfield",
			"editable": false
		},
		"current_parameters": {
			"numberfieldControlName": 0
		},
		"parameters": [
			{
				"id": "numberfieldControlName",
				"type": "integer",
				"default": 0
			}
		],
		"uihints": {
			"id": "numberfieldControlName",
			"parameter_info": [
				{
					"parameter_ref": "numberfieldControlName",
					"label": {
						"default": "Numberfield Control Name"
					},
					"description": {
						"default": "Numberfield test"
					},
					"number_generator": {
						"label": {
							"default": "Generate",
							"resource_key": "numberGenerator"
						},
						"range": {
							"min": 100,
							"max": 9999
						}
					}
				}
			],
			"group_info": [
				{
					"id": "Numberfield Control",
					"type": "controls",
					"parameter_refs": [
						"numberfieldControlName"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		],
		"resources": {
			"numberGenerator.label": "Generate",
			"numberGenerator.desc": "Generate a random number for use as a seed value"
		}
	}
});
_defineConstant("DATEFIELD_PROPS_INFO", {
	"title": "DateField Title",
	"parameterDef": {
		"current_parameters": {
			"datefieldControlName": "2018-02-15"
		},
		"parameters": [
			{
				"id": "datefieldControlName",
				"type": "date"
			}
		],
		"uihints": {
			"id": "datefields",
			"parameter_info": [
				{
					"parameter_ref": "datefieldControlName",
					"label": {
						"default": "Datefield Control Name"
					},
					"description": {
						"default": "Datefield test"
					},
					"date_format": "YYYY-M-D"
				}
			],
			"group_info": [
				{
					"id": "Datefield Control",
					"type": "controls",
					"parameter_refs": [
						"datefieldControlName"
					]
				}
			]
		},
		"dataset_metadata": {
			"fields": []
		}
	}
});
_defineConstant("TIMEFIELD_PROPS_INFO", {
	"title": "TimeField Title",
	"parameterDef": {
		"current_parameters": {
			"timefieldControlName": "10:05:20Z"
		},
		"parameters": [
			{
				"id": "timefieldControlName",
				"type": "time"
			}
		],
		"uihints": {
			"id": "timefields",
			"parameter_info": [
				{
					"parameter_ref": "timefieldControlName",
					"label": {
						"default": "Timefield Control Name"
					},
					"description": {
						"default": "Timefield test"
					},
					"time_format": "HH:mm:ss"
				}
			],
			"group_info": [
				{
					"id": "Timefield Control",
					"type": "controls",
					"parameter_refs": [
						"timefieldControlName"
					]
				}
			]
		},
		"dataset_metadata": {
			"fields": []
		}
	}
});
_defineConstant("DATEPICKER_PROPS_INFO", {
	"title": "Datepicker Title",
	"parameterDef": {
		"current_parameters": {
			"datepickerControlName": "2023-03-25T00:00:00.00"
		},
		"parameters": [
			{
				"id": "datepickerControlName",
				"type": "date",
				"required": true
			}
		],
		"uihints": {
			"id": "datepickers",
			"parameter_info": [
				{
					"parameter_ref": "datepickerControlName",
					"label": {
						"default": "Datepicker Control Name"
					},
					"description": {
						"default": "Datepicker test"
					},
					"control": "datepicker",
					"date_format": "Y-m-d",
					"place_holder_text": {
						"default": "yyyy-mm-dd"
					}
				}
			],
			"group_info": [
				{
					"id": "Datepicker Control",
					"type": "controls",
					"parameter_refs": [
						"datepickerControlName"
					]
				}
			]
		},
		"resources": {
			"datepickerControlName.helper": "Helper text provided through resource label `{parameter_ref}.helper`."
		}
	}
});
_defineConstant("DATEPICKER_RANGE_PROPS_INFO", {
	"title": "Datepicker Range",
	"parameterDef": {
		"current_parameters": {
			"datepickerControlName": ["2023-03-25T00:00:00.00", "2023-03-30T00:00:00.00"]
		},
		"parameters": [
			{
				"id": "datepickerControlName",
				"type": "date"
			}
		],
		"uihints": {
			"id": "datepickers",
			"parameter_info": [
				{
					"parameter_ref": "datepickerControlName",
					"label": {
						"default": "Datepicker Control Name"
					},
					"description": {
						"default": "Datepicker simple test"
					},
					"control": "datepickerRange",
					"date_format": "Y-m-d",
					"place_holder_text": {
						"default": "yyyy-mm-dd"
					}
				}
			],
			"group_info": [
				{
					"id": "Datepicker Range Control",
					"type": "controls",
					"parameter_refs": [
						"datepickerControlName"
					]
				}
			]
		},
		"resources": {
			"datepickerControlName.range.start.label": "Start",
			"datepickerControlName.range.start.desc": "Start description provided through resource label `{parameter_ref}.range.start.desc`.",
			"datepickerControlName.range.start.helper": "Start helper",
			"datepickerControlName.range.end.label": "End",
			"datepickerControlName.range.end.desc": "End description provided through resource label `{parameter_ref}.range.end.desc`.",
			"datepickerControlName.range.end.helper": "End helper text."
		}
	}
});
_defineConstant("CHECKBOX_SINGLE_PROPS_INFO", {
	"title": "Checkbox Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: checkbox",
			"editable": false
		},
		"current_parameters": {
			"checkboxSingle": false
		},
		"parameters": [
			{
				"id": "checkboxSingle",
				"type": "boolean",
				"enum": [
					"Single Checkbox Label"
				]
			}
		],
		"uihints": {
			"id": "checkboxSingle",
			"parameter_info": [
				{
					"parameter_ref": "checkboxSingle",
					"label": {
						"default": "Checkbox Control Name"
					},
					"description": {
						"default": "This is a single checkbox"
					}
				}
			],
			"group_info": [
				{
					"id": "Checkbox Control",
					"type": "controls",
					"parameter_refs": [
						"checkboxSingle"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		]
	}
});
_defineConstant("CHECKBOX_SET_PROPS_INFO", {
	"title": "Checkbox Set Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: checkboxSet",
			"editable": false
		},
		"current_parameters": {
			"checkboxSet": []
		},
		"parameters": [
			{
				"id": "checkboxSet",
				"type": "array[string]",
				"enum": [
					"integer",
					"string",
					"boolean",
					"date"
				]
			}
		],
		"uihints": {
			"id": "checkboxSet",
			"parameter_info": [
				{
					"parameter_ref": "checkboxSet",
					"label": {
						"default": "Checkbox Set Control Name"
					},
					"description": {
						"default": "This is a set of checkboxes"
					}
				}
			],
			"group_info": [
				{
					"id": "Checkbox Set Control",
					"type": "controls",
					"parameter_refs": [
						"checkboxSet"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		]
	}
});
_defineConstant("RADIOSET_HORIZONTAL_PROPS_INFO", {
	"title": "Radioset Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: radioSet",
			"editable": false
		},
		"current_parameters": {
			"radioset": ""
		},
		"parameters": [
			{
				"id": "radioset",
				"enum": [
					"red",
					"orange",
					"yellow",
					"green"
				]
			}
		],
		"uihints": {
			"id": "radioset",
			"parameter_info": [
				{
					"parameter_ref": "radioset",
					"label": {
						"default": "Radioset Control Name"
					},
					"description": {
						"default": "radioset test"
					}
				}
			],
			"group_info": [
				{
					"id": "Radioset Control",
					"type": "controls",
					"parameter_refs": [
						"radioset"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		]
	}
});
_defineConstant("RADIOSET_VERTICAL_PROPS_INFO", {
	"title": "Radioset Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: radioSet",
			"editable": false
		},
		"current_parameters": {
			"radioset": 2
		},
		"parameters": [
			{
				"id": "radioset",
				"enum": [
					1,
					2,
					3,
					4
				],
				"type": "integer"
			}
		],
		"uihints": {
			"id": "radioset",
			"parameter_info": [
				{
					"parameter_ref": "radioset",
					"label": {
						"default": "Radioset Control Name"
					},
					"description": {
						"default": "radioset test"
					},
					"control": "radioset",
					"orientation": "vertical"
				}
			],
			"group_info": [
				{
					"id": "Radioset Control",
					"type": "controls",
					"parameter_refs": [
						"radioset"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		]
	}
});
_defineConstant("ONEOFSELECT_PROPS_INFO", {
	"title": "One of Select Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: oneofselect",
			"editable": false
		},
		"current_parameters": {
			"oneofselectList": ""
		},
		"parameters": [
			{
				"id": "oneofselectList",
				"enum": [
					"red",
					"orange",
					"yellow",
					"green",
					"blue",
					"purple"
				],
				"default": "yellow"
			}
		],
		"uihints": {
			"id": "oneofselectList",
			"parameter_info": [
				{
					"parameter_ref": "oneofselectList",
					"label": {
						"default": "One of Select Control Name"
					},
					"description": {
						"default": "oneofselect test"
					}
				}
			],
			"group_info": [
				{
					"id": "Oneofselect Control",
					"type": "controls",
					"parameter_refs": [
						"oneofselectList"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		]
	}
});
_defineConstant("ONEOFSELECT_CUSTOM_VALUE_PROPS_INFO", {
	"title": "One of Select Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: oneofselect",
			"editable": false
		},
		"current_parameters": {
			"oneofselectList": "custom"
		},
		"parameters": [
			{
				"id": "oneofselectList",
				"enum": [
					"red",
					"orange",
					"yellow",
					"green",
					"blue",
					"purple"
				],
				"default": "yellow"
			}
		],
		"uihints": {
			"id": "oneofselectList",
			"parameter_info": [
				{
					"parameter_ref": "oneofselectList",
					"label": {
						"default": "One of Select Control Name"
					},
					"description": {
						"default": "oneofselect test"
					},
					"custom_value_allowed": true
				}
			],
			"group_info": [
				{
					"id": "Oneofselect Control",
					"type": "controls",
					"parameter_refs": [
						"oneofselectList"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		]
	}
});
_defineConstant("FORCED_RADIOSET_PROPS_INFO", {
	"title": "One of Select Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: radioSet",
			"editable": false
		},
		"current_parameters": {
			"oneofselectList": ""
		},
		"parameters": [
			{
				"id": "oneofselectList",
				"enum": [
					"red",
					"orange",
					"yellow",
					"green",
					"blue",
					"purple"
				],
				"default": "yellow"
			}
		],
		"uihints": {
			"id": "oneofselectList",
			"parameter_info": [
				{
					"parameter_ref": "oneofselectList",
					"control": "radioset",
					"orientation": "vertical",
					"label": {
						"default": "One of Select Control Name"
					},
					"description": {
						"default": "oneofselect test"
					}
				}
			],
			"group_info": [
				{
					"id": "Oneofselect Control",
					"type": "controls",
					"parameter_refs": [
						"oneofselectList"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		]
	}
});
_defineConstant("MULTISELECT_PROPS_INFO", {
	"title": "Multiselect Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: multiselect",
			"editable": false
		},
		"current_parameters": {
			"multiselectList": ["blue"]
		},
		"parameters": [
			{
				"id": "multiselectList",
				"enum": [
					"red",
					"orange",
					"yellow",
					"green",
					"blue",
					"purple"
				],
				"default": ["yellow"]
			}
		],
		"uihints": {
			"id": "multiselectList",
			"parameter_info": [
				{
					"parameter_ref": "multiselectList",
					"label": {
						"default": "Multiselect Control Name"
					},
					"description": {
						"default": "multiselect test"
					},
					"control": "multiselect"
				}
			],
			"group_info": [
				{
					"id": "Multiselect Control",
					"type": "controls",
					"parameter_refs": [
						"multiselectList"
					]
				}
			]
		}
	}
});
_defineConstant("MULTISELECT_FILTERABLE_PROPS_INFO", {
	"title": "Multiselect Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: multiselect",
			"editable": false
		},
		"current_parameters": {
			"multiselectList": []
		},
		"parameters": [
			{
				"id": "multiselectList",
				"enum": [
					"red",
					"orange",
					"yellow",
					"green",
					"blue",
					"purple"
				],
				"default": ["yellow"]
			}
		],
		"uihints": {
			"id": "multiselectList",
			"parameter_info": [
				{
					"parameter_ref": "multiselectList",
					"label": {
						"default": "Multiselect Control Name"
					},
					"description": {
						"default": "multiselect test"
					},
					"control": "multiselect",
					"filterable": true
				}
			],
			"group_info": [
				{
					"id": "Multiselect Control",
					"type": "controls",
					"parameter_refs": [
						"multiselectList"
					]
				}
			]
		}
	}
});
_defineConstant("SOMEOFSELECT_PROPS_INFO", {
	"title": "Some of Select Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: someofselect",
			"editable": false
		},
		"current_parameters": {
			"someofselectList": []
		},
		"parameters": [
			{
				"id": "someofselectList",
				"type": "array[string]",
				"enum": [
					"red",
					"orange",
					"yellow",
					"green",
					"blue",
					"purple"
				]
			}
		],
		"uihints": {
			"id": "someofselectList",
			"parameter_info": [
				{
					"parameter_ref": "someofselectList",
					"label": {
						"default": "Some of Select Control Name"
					},
					"description": {
						"default": "someofselect test"
					}
				}
			],
			"group_info": [
				{
					"id": "Someofselect Control",
					"type": "controls",
					"parameter_refs": [
						"someofselectList"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		]
	}
});
_defineConstant("FORCED_CHECKBOX_SET_PROPS_INFO", {
	"title": "Forced Checkboxset Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: checkboxSet",
			"editable": false
		},
		"current_parameters": {
			"someofselectList": []
		},
		"parameters": [
			{
				"id": "someofselectList",
				"type": "array[string]",
				"enum": [
					"red",
					"orange",
					"yellow",
					"green",
					"blue",
					"purple"
				]
			}
		],
		"uihints": {
			"id": "someofselectList",
			"parameter_info": [
				{
					"parameter_ref": "someofselectList",
					"control": "checkboxset",
					"label": {
						"default": "Some of Select Control Name"
					},
					"description": {
						"default": "someofselect test"
					}
				}
			],
			"group_info": [
				{
					"id": "Someofselect Control",
					"type": "controls",
					"parameter_refs": [
						"someofselectList"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		]
	}
});
_defineConstant("SELECTSCHEMA_PROPS_INFO", {
	"title": "SelectSchema Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: selectschema",
			"editable": false
		},
		"current_parameters": {
			"selectschemaList": "Drugs_2"
		},
		"parameters": [
			{
				"id": "selectschemaList"
			}
		],
		"uihints": {
			"id": "selectschemaList",
			"parameter_info": [
				{
					"parameter_ref": "selectschemaList",
					"label": {
						"default": "SelectSchema Control Name"
					},
					"description": {
						"default": "SelectSchema test"
					},
					"control": "selectschema"
				}
			],
			"group_info": [
				{
					"id": "SelectSchema Control",
					"type": "controls",
					"parameter_refs": [
						"selectschemaList"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"name": "Drugs",
				"fields": fields
			},
			{
				"name": "",
				"fields": fields
			},
			{
				"name": "Drugs",
				"fields": fields
			},
			{
				"name": "Private",
				"fields": fields
			},
			{
				"name": null,
				"fields": fields
			}
		]
	}
});
_defineConstant("SELECTSCHEMA_EMPTY_PROPS_INFO", {
	"title": "SelectSchema Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: empty list selectschema",
			"editable": false
		},
		"current_parameters": {
		},
		"parameters": [
			{
				"id": "selectschema"
			},
			{
				"id": "selectschemaEmptyPlaceholder"
			}
		],
		"uihints": {
			"id": "selectschemaList",
			"parameter_info": [
				{
					"parameter_ref": "selectschema",
					"label": {
						"default": "SelectSchema Empty list Control"
					},
					"description": {
						"default": "selectschema control without dataset_metadata."
					},
					"control": "selectschema"
				},
				{
					"parameter_ref": "selectschemaEmptyPlaceholder",
					"label": {
						"default": "Disabled SelectSchema Empty list Control with custom placeholder"
					},
					"description": {
						"default": "selectschema control without dataset_metadata. Showing custom placeholder text. This control should be disabled."
					},
					"control": "selectschema"
				}
			],
			"group_info": [
				{
					"id": "SelectSchema Control",
					"type": "controls",
					"parameter_refs": [
						"selectschema",
						"selectschemaEmptyPlaceholder"
					]
				}
			]
		},
		"resources": {
			"selectschemaEmptyPlaceholder.emptyList.placeholder": "Custom empty list placeholder text"
		}
	}
});
_defineConstant("SELECTCOLUMN_PROPS_INFO", {
	"title": "Select Column Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: selectcolumn",
			"editable": false
		},
		"current_parameters": {
			"selectcolumnList": ""
		},
		"parameters": [
			{
				"id": "selectcolumnList",
				"type": "string",
				"default": "",
				"role": "column"
			}
		],
		"uihints": {
			"id": "selectcolumnList",
			"parameter_info": [
				{
					"parameter_ref": "selectcolumnList",
					"label": {
						"default": "Select Column Control Name"
					},
					"description": {
						"default": "selectcolumn test"
					}
				}
			],
			"group_info": [
				{
					"id": "SelectColumn Control",
					"type": "controls",
					"parameter_refs": [
						"selectcolumnList"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": fields
			}
		]
	}
});
_defineConstant("SELECTCOLUMN_EMPTY_PROPS_INFO", {
	"title": "Select Column Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: empty selectcolumn",
			"editable": false
		},
		"current_parameters": {
			"selectcolumn": ""
		},
		"parameters": [
			{
				"id": "selectcolumn",
				"type": "string",
				"default": "",
				"role": "column"
			},
			{
				"id": "selectcolumnEmptyPlaceholder",
				"type": "string",
				"default": "",
				"role": "column"
			}
		],
		"uihints": {
			"id": "selectcolumn",
			"parameter_info": [
				{
					"parameter_ref": "selectcolumn",
					"label": {
						"default": "Select Column Empty list Control"
					},
					"description": {
						"default": "selectcolumn control without dataset_metadata."
					}
				},
				{
					"parameter_ref": "selectcolumnEmptyPlaceholder",
					"label": {
						"default": "Disabled Empty list Control with custom placeholder"
					},
					"description": {
						"default": "selectcolumn control without dataset_metadata. Showing custom placeholder text. This control should be disabled."
					}
				}
			],
			"group_info": [
				{
					"id": "SelectColumn Control",
					"type": "controls",
					"parameter_refs": [
						"selectcolumn",
						"selectcolumnEmptyPlaceholder"
					]
				}
			]
		},
		"resources": {
			"selectcolumnEmptyPlaceholder.emptyList.placeholder": "Custom empty list placeholder text"
		}
	}
});
_defineConstant("SELECTCOLUMN_MULTI_INPUT_PROPS_INFO", {
	"title": "Select Column Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: selectcolumn",
			"editable": false
		},
		"current_parameters": {
			"selectcolumnList": ""
		},
		"parameters": [
			{
				"id": "selectcolumnList",
				"type": "string",
				"default": "",
				"role": "column"
			}
		],
		"uihints": {
			"id": "selectcolumnList",
			"parameter_info": [
				{
					"parameter_ref": "selectcolumnList",
					"label": {
						"default": "Select Column Control Name"
					},
					"description": {
						"default": "selectcolumn test"
					}
				}
			],
			"group_info": [
				{
					"id": "SelectColumn Control",
					"type": "controls",
					"parameter_refs": [
						"selectcolumnList"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"name": "schema1",
				"fields": fields2
			},
			{
				"name": "schema2",
				"fields": fields
			}
		]
	}
});
_defineConstant("SELECTCOLUMNS_PROPS_INFO", {
	"title": "SelectColumns Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: selectcolumns",
			"editable": false
		},
		"current_parameters": {
			"selectcolumnsList": ["BP"]
		},
		"parameters": [
			{
				"id": "selectcolumnsList",
				"type": "array[string]",
				"default": [],
				"role": "column"
			}
		],
		"uihints": {
			"id": "selectcolumnsList",
			"parameter_info": [
				{
					"parameter_ref": "selectcolumnsList",
					"label": {
						"default": "SelectColumns Control Name"
					},
					"description": {
						"default": "selectcolumns test"
					}
				}
			],
			"group_info": [
				{
					"id": "SelectColumns Control",
					"type": "columnSelection",
					"parameter_refs": [
						"selectcolumnsList"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": fields
			}
		]
	}
});
_defineConstant("SELECTCOLUMNS_MULTI_INPUT_PROPS_INFO", {
	"title": "SelectColumns Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: selectcolumns",
			"editable": false
		},
		"current_parameters": {
			"selectcolumnsList": ["schema1.Age", "schema1.AGE"]
		},
		"parameters": [
			{
				"id": "selectcolumnsList",
				"type": "array[string]",
				"default": [],
				"role": "column"
			}
		],
		"uihints": {
			"id": "selectcolumnsList",
			"parameter_info": [
				{
					"parameter_ref": "selectcolumnsList",
					"label": {
						"default": "SelectColumns Control Name"
					},
					"description": {
						"default": "selectcolumns test"
					}
				}
			],
			"group_info": [
				{
					"id": "SelectColumns Control",
					"type": "columnSelection",
					"parameter_refs": [
						"selectcolumnsList"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"name": "schema1",
				"fields": fields2
			},
			{
				"name": "schema2",
				"fields": fields
			},
			{
				"name": "schema2",
				"fields": fields
			}
		]
	}
});
_defineConstant("TOGGLETEXT_PROPS_INFO", {
	"title": "Toggletext Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: toggletext",
			"editable": false
		},
		"current_parameters": {
			"toggletextOption": "On"
		},
		"parameters": [
			{
				"id": "toggletextOption",
				"enum": [
					"On",
					"Off"
				],
				"default": "On"
			}
		],
		"uihints": {
			"id": "toggletextOption",
			"parameter_info": [
				{
					"parameter_ref": "toggletextOption",
					"control": "toggletext",
					"label": {
						"default": "Toggletext Control Name"
					},
					"description": {
						"default": "toggletext test"
					}
				}
			],
			"group_info": [
				{
					"id": "Toggletext Control",
					"parameter_refs": [
						"toggletextOption"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		]
	}
});

_defineConstant("TOGGLE_PROPS_INFO", {
	"title": "Toggle Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: toggle",
			"editable": false
		},
		"current_parameters": {
			"toggle_default": false,
		},
		"parameters": [
			{
				"id": "toggle_default",
				"default": false,
				"type": "boolean"
			}
		],
		"uihints": {
			"id": "toggle_default",
			"parameter_info": [
				{
					"parameter_ref": "toggle_default",
					"control": "toggle",
					"label": {
						"default": "Toggle Control Name"
					},
					"description": {
						"default": "toggle test"
					}
				}
			],
			"group_info": [
				{
					"id": "Toggle Control",
					"parameter_refs": [
						"toggle_default"
					]
				}
			]
		}
	},
});
_defineConstant("TOGGLETEXTICONS_PROPS_INFO", {
	"title": "Toggletext Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: toggletext",
			"editable": false
		},
		"current_parameters": {
			"toggletextOption": "On"
		},
		"parameters": [
			{
				"id": "toggletextOption",
				"enum": [
					"On",
					"Off"
				],
				"default": "On"
			}
		],
		"uihints": {
			"id": "toggletextOption",
			"parameter_info": [
				{
					"parameter_ref": "toggletextOption",
					"control": "toggletext",
					"label": {
						"default": "Toggletext Control Name"
					},
					"description": {
						"default": "toggletext test"
					},
					"value_icons": [
						"/images/light-on.svg",
						"/images/light-off.svg"
					]
				}
			],
			"group_info": [
				{
					"id": "Toggletext Control",
					"parameter_refs": [
						"toggletextOption"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		]
	}
});

_defineConstant("READONLYTABLE_PROPS_INFO", {
	"title": "ReadonlyTable Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Control: readonlyTable",
			"editable": false
		},
		"current_parameters": {
			"readonlyStructurelistTableControl": [
				[
					1,
					"Hello",
					"World",
					"string",
					"Readonly phrase"
				],
				[
					2,
					"hi",
					"world",
					"boolean",
					"some phrase"
				]
			]
		},
		"parameters": [
			{
				"id": "readonlyStructurelistTableControl",
				"type": "array[readonlyStructurelistTableControl]",
				"default": []
			}
		],
		"complex_types": [
			{
				"id": "readonlyStructurelistTableControl",
				"parameters": [
					{
						"id": "readonly_numbered_column_index",
						"type": "integer"
					},
					{
						"id": "name",
						"type": "string",
						"role": "new_column"
					},
					{
						"id": "description",
						"type": "string",
						"role": "new_column"
					},
					{
						"id": "data_type",
						"enum": [
							"string",
							"number",
							"boolean",
							"time",
							"date"
						],
						"default": ""
					},
					{
						"id": "readonly",
						"type": "string"
					}
				]
			}
		],
		"uihints": {
			"id": "readonly_param-control",
			"parameter_info": [
				{
					"parameter_ref": "readonlyStructurelistTableControl",
					"label": {
						"default": "ReadonlyTable - structurelisteditor"
					},
					"description": {
						"default": "This is an example of a structureListEditor that has control set to a readonlyTable control.",
						"placement": "on_panel"
					},
					"control": "readonlyTable"
				}
			],
			"complex_type_info": [
				{
					"complex_type_ref": "readonlyStructurelistTableControl",
					"parameters": [
						{
							"parameter_ref": "readonly_numbered_column_index",
							"label": {
								"default": " "
							},
							"width": 5,
							"generated_values": {
								"operation": "index"
							},
							"control": "readonly",
							"summary": true
						},
						{
							"parameter_ref": "name",
							"label": {
								"default": "Name"
							},
							"width": 15,
							"edit_style": "subpanel",
							"summary": true
						},
						{
							"parameter_ref": "description",
							"label": {
								"default": "Description"
							},
							"width": 15,
							"edit_style": "subpanel"
						},
						{
							"parameter_ref": "data_type",
							"label": {
								"default": "Type"
							},
							"width": 15,
							"edit_style": "subpanel"
						},
						{
							"parameter_ref": "readonly",
							"label": {
								"default": "ReadOnly"
							},
							"control": "readonly",
							"width": 20
						}
					],
					"row_selection": "single"
				}
			],
			"group_info": [
				{
					"id": "readonly-group",
					"label": {
						"default": "Readonly Tab"
					},
					"type": "controls",
					"parameter_refs": [
						"readonlyStructurelistTableControl"
					]
				}
			]
		},
		"resources": {
			"readonlyStructurelistTableControl.edit.button.label": "Edit - custom label"
		}
	}
});
_defineConstant("STRUCTURETABLE_INLINE_TOGGLE_PROPS_INFO", {
	"title": "StructureTableToggle Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Complex: structuretable",
			"editable": false
		},
		"current_parameters": {
			"structureInlineToggleList": [["Cholesterol", "Ascending"]]
		},
		"parameters": [
			{
				"id": "structureInlineToggleList",
				"type": "array[structureInlineToggle]"
			}
		],
		"complex_types": [
			{
				"id": "structureInlineToggle",
				"key_definition": {
					"id": "field",
					"type": "string",
					"role": "column",
					"default": ""
				},
				"parameters": [
					{
						"id": "structure_toggle_list",
						"enum": [
							"Ascending",
							"Descending"
						],
						"default": "Ascending"
					}
				]
			}
		],
		"uihints": {
			"id": "structureInlineToggleList",
			"parameter_info": [
				{
					"parameter_ref": "structure_toggle_list"
				}
			],
			"complex_type_info": [
				{
					"complex_type_ref": "structureInlineToggle",
					"key_definition": {
						"parameter_ref": "field",
						"width": 28,
						"label": {
							"resource_key": "structureInlineToggleList.field.label"
						}
					},
					"parameters": [
						{
							"parameter_ref": "structure_toggle_list",
							"width": 16,
							"label": {
								"resource_key": "structureInlineToggleList.sort_order.label"
							},
							"edit_style": "inline",
							"control": "toggletext",
							"value_icons": [
								"/images/up-triangle.svg",
								"/images/down-triangle.svg"
							]
						}
					]
				}
			],
			"group_info": [
				{
					"id": "structureInlineToggleList",
					"type": "columnSelection",
					"parameter_refs": [
						"structureInlineToggleList"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": fields
			}
		],
		"resources": {
			"structureInlineToggleList.field.label": "Field",
			"structureInlineToggleList.sort_order.label": "Order",
			"structureInlineToggleList.sort_order.Ascending.label": "Ascending",
			"structureInlineToggleList.sort_order.Descending.label": "Descending"
		}
	}
});
_defineConstant("STRUCTURETABLE_INLINE_TEXTFIELD_PROPS_INFO", {
	"title": "StructureTableInlineTextfield Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Attribute: inline",
			"editable": false
		},
		"current_parameters": {
			"structureInlineTextfieldList": [["BP", "BP-1"]]
		},
		"parameters": [
			{
				"id": "structureInlineTextfieldList",
				"type": "array[structureInlineTextfield]",
				"role": "column",
				"default": []
			}
		],
		"complex_types": [
			{
				"id": "structureInlineTextfield",
				"key_definition": {
					"id": "field",
					"type": "string",
					"role": "column"
				},
				"parameters": [
					{
						"id": "inline_textfield",
						"type": "string",
						"role": "new_column"
					}
				]
			}
		],
		"uihints": {
			"id": "structureInlineTextfieldList",
			"parameter_info": [
				{
					"parameter_ref": "structureInlineTextfieldList"
				}
			],
			"complex_type_info": [
				{
					"complex_type_ref": "structureInlineTextfield",
					"key_definition": {
						"parameter_ref": "field",
						"width": 20,
						"label": {
							"default": "StructureInline Name",
							"resource_key": "structureInlineTextfield.field.label"
						}
					},
					"parameters": [
						{
							"parameter_ref": "inline_textfield",
							"label": {
								"resource_key": "structureInlineTextfield.inline_textfield.label"
							},
							"width": 30,
							"edit_style": "inline"
						}
					]
				}
			],
			"group_info": [
				{
					"id": "Structure Table Inline Control",
					"type": "columnSelection",
					"parameter_refs": [
						"structureInlineTextfieldList"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": fields
			}
		],
		"resources": {
			"structureInlineTextfield.field.label": "Input Name",
			"structureInlineTextfield.inline_textfield.label": "OutputName"
		}
	}
});
_defineConstant("STRUCTURETABLE_INLINE_DROPDOWN_PROPS_INFO", {
	"title": "StructureTableDropdown Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Attribute: edit_style",
			"editable": false
		},
		"current_parameters": {
			"structureInlineDropdownList": [["BP", "Integer"]]
		},
		"parameters": [
			{
				"id": "structureInlineDropdownList",
				"type": "array[structureInlineDropdown]",
				"role": "column",
				"default": []
			}
		],
		"complex_types": [
			{
				"id": "structureInlineDropdown",
				"key_definition": {
					"id": "field",
					"type": "string",
					"role": "column"
				},
				"parameters": [
					{
						"id": "inline_dropdown",
						"type": "string",
						"enum": [
							"String",
							"Integer",
							"Real",
							"Time",
							"Date",
							"Timestamp"
						],
						"default": "String"
					}
				]
			}
		],
		"uihints": {
			"id": "structureInlineTextfieldList",
			"parameter_info": [
				{
					"parameter_ref": "structureInlineDropdownList"
				}
			],
			"complex_type_info": [
				{
					"complex_type_ref": "structureInlineDropdown",
					"key_definition": {
						"parameter_ref": "field",
						"width": 20,
						"label": {
							"default": "StructureDropdown Name",
							"resource_key": "structureInlineDropdown.field.label"
						}
					},
					"parameters": [
						{
							"parameter_ref": "inline_dropdown",
							"label": {
								"resource_key": "structureInlineDropdown.inline_dropdown.label"
							},
							"width": 30,
							"edit_style": "inline"
						}
					]
				}
			],
			"group_info": [
				{
					"id": "Structure Table Dropdown Control",
					"type": "columnSelection",
					"parameter_refs": [
						"structureInlineDropdownList"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": fields
			}
		],
		"resources": {
			"structureInlineDropdown.field.label": "Field",
			"structureInlineDropdown.inline_dropdown.label": "Type"
		}
	}
});
_defineConstant("STRUCTURETABLE_SUBPANEL_TEXTFIELD_PROPS_INFO", {
	"title": "StructureTableInlineTextfield Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Attribute: subpanel",
			"editable": false
		},
		"current_parameters": {
			"structurelisteditorTableInputList": [["BP", "BP-1"]]
		},
		"parameters": [
			{
				"id": "structurelisteditorTableInputList",
				"type": "array[structurelisteditorTableInput]",
				"role": "column",
				"default": []
			}
		],
		"complex_types": [
			{
				"id": "structurelisteditorTableInput",
				"key_definition": {
					"id": "field",
					"type": "string",
					"role": "column"
				},
				"parameters": [
					{
						"id": "subpanel_textfield",
						"type": "string",
						"role": "new_column"
					}
				]
			}
		],
		"uihints": {
			"id": "structurelisteditorTableInputList",
			"parameter_info": [
				{
					"parameter_ref": "structurelisteditorTableInputList"
				}
			],
			"complex_type_info": [
				{
					"complex_type_ref": "structurelisteditorTableInput",
					"key_definition": {
						"parameter_ref": "field",
						"width": 20,
						"label": {
							"default": "StructureSubpanel Name",
							"resource_key": "structurelisteditorTableInput.field.label"
						}
					},
					"parameters": [
						{
							"parameter_ref": "subpanel_textfield",
							"label": {
								"resource_key": "structurelisteditorTableInput.subpanel_textfield.label"
							},
							"width": 30,
							"edit_style": "subpanel"
						}
					]
				}
			],
			"group_info": [
				{
					"id": "Structure Table Subpanel Control",
					"type": "columnSelection",
					"parameter_refs": [
						"structurelisteditorTableInputList"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": [
					{
						"name": "Age",
						"type": "integer",
						"metadata": {
							"description": "",
							"measure": "range",
							"modeling_role": "input"
						}
					},
					{
						"name": "Sex",
						"type": "string",
						"metadata": {
							"description": "",
							"measure": "discrete",
							"modeling_role": "input"
						}
					},
					{
						"name": "BP",
						"type": "string",
						"metadata": {
							"description": "",
							"measure": "discrete",
							"modeling_role": "input"
						}
					},
					{
						"name": "Cholesterol",
						"type": "string",
						"metadata": {
							"description": "",
							"measure": "discrete",
							"modeling_role": "input"
						}
					},
					{
						"name": "Na",
						"type": "double",
						"metadata": {
							"description": "",
							"measure": "range",
							"modeling_role": "input"
						}
					},
					{
						"name": "K",
						"type": "double",
						"metadata": {
							"description": "",
							"measure": "range",
							"modeling_role": "input"
						}
					},
					{
						"name": "Drug",
						"type": "string",
						"metadata": {
							"description": "",
							"measure": "discrete",
							"modeling_role": "input"
						}
					}
				]
			}
		],
		"resources": {
			"structurelisteditorTableInput.field.label": "Input Name",
			"structurelisteditorTableInput.subpanel_textfield.label": "OutputName"
		}
	}
});
_defineConstant("STRUCTURETABLE_ONPANEL_EXPRESSION_PROPS_INFO", {
	"title": "StructureListEditor Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Attribute: on_panel",
			"editable": false
		},
		"current_parameters": {
			"expressionCellTable": [
				[
					"BabyBoomer",
					"Age >= 55"
				]
			]
		},
		"parameters": [
			{
				"id": "expressionCellTable",
				"type": "array[expressionCellTable]",
				"default": []
			}
		],
		"complex_types": [
			{
				"id": "expressionCellTable",
				"parameters": [
					{
						"id": "valueName",
						"type": "string",
						"default": "Value",
						"role": "new_column"
					},
					{
						"id": "condition",
						"type": "string",
						"default": "",
						"role": "expression"
					}
				]
			}
		],
		"uihints": {
			"id": "Conditions.test",
			"icon": "images/modelbuildspark.svg",
			"label": {
				"default": "Conditions Test"
			},
			"description": {
				"default": "Test condition handling in controls"
			},
			"parameter_info": [
				{
					"parameter_ref": "expressionCellTable",
					"label": {
						"default": "Values"
					},
					"description": {
						"default": "Complex table control list editor table input"
					}
				}
			],
			"complex_type_info": [
				{
					"complex_type_ref": "expressionCellTable",
					"row_selection": "single",
					"parameters": [
						{
							"parameter_ref": "valueName",
							"label": {
								"default": "Structure Name",
								"resource_key": "expressionCellTable.name.label"
							},
							"description": {
								"resource_key": "expressionCellTable.name.desc"
							},
							"width": 15,
							"edit_style": "inline"
						},
						{
							"parameter_ref": "condition",
							"language": "CLEM",
							"label": {
								"resource_key": "expressionCellTable.description.label"
							},
							"description": {
								"resource_key": "expressionCellTable.description.desc"
							},
							"width": 15,
							"edit_style": "on_panel",
							"place_holder_text": {
								"default": "Enter condition expression"
							}
						}
					]
				}
			],
			"group_info": [
				{
					"id": "Derive Node",
					"type": "panels",
					"label": {
						"default": "Derive Node"
					},
					"group_info": [
						{
							"id": "Expression Control Cell",
							"parameter_refs": [
								"expressionCellTable"
							]
						}
					]
				}
			]
		},
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "warning",
						"focus_parameter_ref": "expressionCellTable",
						"message": {
							"default": "table cannot be empty"
						}
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "expressionCellTable",
							"op": "notEquals",
							"value": []
						}
					}
				}
			}
		],
		"dataset_metadata": [
			{
				"fields": []
			}
		],
		"resources": {
			"expressionCellTable.name.label": "Set Field To",
			"expressionCellTable.name.desc": "value of field",
			"expressionCellTable.description.label": "Condition",
			"expressionCellTable.description.desc": "if condition true set field"
		}
	}
});
_defineConstant("STRUCTURETABLE_ROW_SELECTION_PROPS_INFO", {
	"title": "StructureTableRow Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Attribute: row_selection",
			"editable": false
		},
		"current_parameters": {
			"expressionCellTable": [
				["BabyBoomer", "Age >= 55"],
				["GenX", "Age < 55 && Age >= 35"],
				["Millenial", "Age < 35"]
			]
		},
		"parameters": [
			{
				"id": "expressionCellTable",
				"type": "array[expressionCellTable]",
				"default": []
			}
		],
		"complex_types": [
			{
				"id": "expressionCellTable",
				"parameters": [
					{
						"id": "valueName",
						"type": "string",
						"default": "Value",
						"role": "new_column"
					},
					{
						"id": "condition",
						"type": "string",
						"default": "",
						"role": "expression"
					}
				]
			}
		],
		"uihints": {
			"id": "Conditions.test",
			"icon": "images/modelbuildspark.svg",
			"label": {
				"default": "Conditions Test"
			},
			"description": {
				"default": "Test condition handling in controls"
			},
			"parameter_info": [
				{
					"parameter_ref": "expressionCellTable",
					"label": {
						"default": "Values"
					},
					"description": {
						"default": "Complex table control list editor table input"
					}
				}
			],
			"complex_type_info": [
				{
					"complex_type_ref": "expressionCellTable",
					"row_selection": "single",
					"parameters": [
						{
							"parameter_ref": "valueName",
							"label": {
								"default": "Structure Name",
								"resource_key": "expressionCellTable.name.label"
							},
							"description": {
								"resource_key": "expressionCellTable.name.desc"
							},
							"width": 15,
							"edit_style": "inline"
						},
						{
							"parameter_ref": "condition",
							"language": "CLEM",
							"label": {
								"resource_key": "expressionCellTable.description.label"
							},
							"description": {
								"resource_key": "expressionCellTable.description.desc"
							},
							"width": 15,
							"edit_style": "on_panel",
							"place_holder_text": {
								"default": "Enter condition expression"
							}
						}
					]
				}
			],
			"group_info": [
				{
					"id": "Derive Node",
					"type": "panels",
					"label": {
						"default": "Derive Node"
					},
					"group_info": [
						{
							"id": "Expression Control Cell",
							"parameter_refs": [
								"expressionCellTable"
							]
						}
					]
				}
			]
		},
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "warning",
						"focus_parameter_ref": "expressionCellTable",
						"message": {
							"default": "table cannot be empty"
						}
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "expressionCellTable",
							"op": "notEquals",
							"value": []
						}
					}
				}
			}
		],
		"dataset_metadata": [
			{
				"fields": []
			}
		],
		"resources": {
			"expressionCellTable.name.label": "Set Field To",
			"expressionCellTable.name.desc": "value of field",
			"expressionCellTable.description.label": "Condition",
			"expressionCellTable.description.desc": "if condition true set field"
		}
	}
});
_defineConstant("STRUCTURELISTEDITOR_PROPS_INFO", {
	"title": "StructureListEditor Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Complex: structurelisteditor",
			"editable": false
		},
		"current_parameters": {
			"structurelisteditorList": [["Hello", "World"]]
		},
		"parameters": [
			{
				"id": "structurelisteditorList",
				"type": "array[structurelisteditorTableInput]",
				"default": []
			}
		],
		"complex_types": [
			{
				"id": "structurelisteditorTableInput",
				"parameters": [
					{
						"id": "name",
						"type": "string",
						"role": "new_column"
					},
					{
						"id": "description",
						"type": "string",
						"role": "new_column"
					}
				]
			}
		],
		"uihints": {
			"id": "structurelisteditorList",
			"parameter_info": [
				{
					"parameter_ref": "structurelisteditorList"
				}
			],
			"complex_type_info": [
				{
					"complex_type_ref": "structurelisteditorTableInput",
					"parameters": [
						{
							"parameter_ref": "name",
							"label": {
								"default": "Structure Name",
								"resource_key": "structurelisteditorTableInput.name.label"
							},
							"width": 20,
							"edit_style": "subpanel"
						},
						{
							"parameter_ref": "description",
							"label": {
								"resource_key": "structurelisteditorTableInput.description.label"
							},
							"width": 20,
							"edit_style": "subpanel"
						}
					]
				}
			],
			"group_info": [
				{
					"id": "Structure Table Subpanel Control",
					"parameter_refs": [
						"structurelisteditorList"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		],
		"resources": {
			"structurelisteditorTableInput.name.label": "Name",
			"structurelisteditorTableInput.description.label": "Description"
		}
	}
});
_defineConstant("STRUCTURELISTEDITOR_ADDREMOVEROWS_PROPS_INFO", {
	"title": "StructureListEditor Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Attribute: add_remove_rows",
			"editable": false
		},
		"current_parameters": {
			"structurelisteditorList": [["Difference", 1, 0.023]]
		},
		"parameters": [
			{
				"id": "structurelisteditorList",
				"type": "array[structurelisteditorTableInput]",
				"default": []
			}
		],
		"complex_types": [
			{
				"id": "structurelisteditorTableInput",
				"parameters": [
					{
						"id": "Property",
						"type": "string",
						"role": "new_column"
					},
					{
						"id": "nonseasonal",
						"type": "integer",
						"default": 0,
						"role": "new_column"
					},
					{
						"id": "seasonal",
						"type": "double",
						"default": 1.0,
						"role": "new_column"
					}
				]
			}
		],
		"uihints": {
			"id": "structurelisteditorList",
			"parameter_info": [
				{
					"parameter_ref": "structurelisteditorList"
				}
			],
			"complex_type_info": [
				{
					"complex_type_ref": "structurelisteditorTableInput",
					"add_remove_rows": false,
					"parameters": [
						{
							"parameter_ref": "name",
							"label": {
								"default": "Structure Name",
								"resource_key": "structurelisteditorTableInput.name.label"
							},
							"width": 10
						},
						{
							"parameter_ref": "nonseasonal",
							"label": {
								"resource_key": "structurelisteditorTableInput.nonseasonal.label"
							},
							"width": 10,
							"edit_style": "inline"
						},
						{
							"parameter_ref": "seasonal",
							"label": {
								"resource_key": "structurelisteditorTableInput.seasonal.label"
							},
							"width": 10,
							"edit_style": "inline"
						}
					]
				}
			],
			"group_info": [
				{
					"id": "Structure Table Subpanel Control",
					"parameter_refs": [
						"structurelisteditorList"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		],
		"resources": {
			"structurelisteditorTableInput.name.label": "Name",
			"structurelisteditorTableInput.nonseasonal.label": "NonSeasonal",
			"structurelisteditorTableInput.seasonal.label": "NonSeasonal"
		}
	}
});
_defineConstant("STRUCTURETABLE_MOVEABLE_PROPS_INFO", {
	"title": "StructureTableMoveable Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Attribute: moveable_rows",
			"editable": false
		},
		"current_parameters": {
			"structureInlineDropdownList": [["BP", "Integer"], ["Sex", "String"], ["K", "Double"]]
		},
		"parameters": [
			{
				"id": "structureInlineDropdownList",
				"type": "array[structureInlineDropdown]",
				"role": "column",
				"default": []
			}
		],
		"complex_types": [
			{
				"id": "structureInlineDropdown",
				"key_definition": {
					"id": "field",
					"type": "string",
					"role": "column"
				},
				"parameters": [
					{
						"id": "inline_dropdown",
						"type": "string",
						"enum": [
							"String",
							"Integer",
							"Real",
							"Time",
							"Date",
							"Timestamp"
						],
						"default": "String"
					}
				]
			}
		],
		"uihints": {
			"id": "structureInlineTextfieldList",
			"parameter_info": [
				{
					"parameter_ref": "structureInlineDropdownList"
				}
			],
			"complex_type_info": [
				{
					"complex_type_ref": "structureInlineDropdown",
					"moveable_rows": true,
					"key_definition": {
						"parameter_ref": "field",
						"width": 20,
						"label": {
							"default": "StructureDropdown Name",
							"resource_key": "structureInlineDropdown.field.label"
						}
					},
					"parameters": [
						{
							"parameter_ref": "inline_dropdown",
							"label": {
								"resource_key": "structureInlineDropdown.inline_dropdown.label"
							},
							"width": 30,
							"edit_style": "inline"
						}
					]
				}
			],
			"group_info": [
				{
					"id": "Structure Table Dropdown Control",
					"type": "columnSelection",
					"parameter_refs": [
						"structureInlineDropdownList"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": fields
			}
		],
		"resources": {
			"structureInlineDropdown.field.label": "Field",
			"structureInlineDropdown.inline_dropdown.label": "Type"
		}
	}
});
_defineConstant("STRUCTURETABLE_SORTABLE_PROPS_INFO", {
	"title": "StructureTableSortable Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Attribute: sortable",
			"editable": false
		},
		"current_parameters": {
			"structureInlineDropdownList": [["BP", "Integer"], ["K", "String"]]
		},
		"parameters": [
			{
				"id": "structureInlineDropdownList",
				"type": "array[structureInlineDropdown]",
				"role": "column",
				"default": []
			}
		],
		"complex_types": [
			{
				"id": "structureInlineDropdown",
				"key_definition": {
					"id": "field",
					"type": "string",
					"role": "column"
				},
				"parameters": [
					{
						"id": "inline_dropdown",
						"type": "string",
						"enum": [
							"String",
							"Integer",
							"Real",
							"Time",
							"Date",
							"Timestamp"
						],
						"default": "String"
					}
				]
			}
		],
		"uihints": {
			"id": "structureInlineTextfieldList",
			"parameter_info": [
				{
					"parameter_ref": "structureInlineDropdownList"
				}
			],
			"complex_type_info": [
				{
					"complex_type_ref": "structureInlineDropdown",
					"key_definition": {
						"sortable": true,
						"parameter_ref": "field",
						"width": 20,
						"label": {
							"default": "StructureDropdown Name",
							"resource_key": "structureInlineDropdown.field.label"
						}
					},
					"parameters": [
						{
							"sortable": true,
							"parameter_ref": "inline_dropdown",
							"label": {
								"resource_key": "structureInlineDropdown.inline_dropdown.label"
							},
							"width": 30,
							"edit_style": "inline"
						}
					]
				}
			],
			"group_info": [
				{
					"id": "Structure Table Dropdown Control",
					"type": "columnSelection",
					"parameter_refs": [
						"structureInlineDropdownList"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": fields
			}
		],
		"resources": {
			"structureInlineDropdown.field.label": "Field",
			"structureInlineDropdown.inline_dropdown.label": "Type"
		}
	}
});
_defineConstant("STRUCTURETABLE_FILTERABLE_PROPS_INFO", {
	"title": "StructureTableFilterable Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Attribute: filterable",
			"editable": false
		},
		"current_parameters": {
			"structureInlineDropdownList": [["BP", "Integer"], ["Na", "Double"]]
		},
		"parameters": [
			{
				"id": "structureInlineDropdownList",
				"type": "array[structureInlineDropdown]",
				"role": "column",
				"default": []
			}
		],
		"complex_types": [
			{
				"id": "structureInlineDropdown",
				"key_definition": {
					"id": "field",
					"type": "string",
					"role": "column"
				},
				"parameters": [
					{
						"id": "inline_dropdown",
						"type": "string",
						"enum": [
							"String",
							"Integer",
							"Real",
							"Time",
							"Date",
							"Timestamp"
						],
						"default": "String"
					}
				]
			}
		],
		"uihints": {
			"id": "structureInlineTextfieldList",
			"parameter_info": [
				{
					"parameter_ref": "structureInlineDropdownList"
				}
			],
			"complex_type_info": [
				{
					"complex_type_ref": "structureInlineDropdown",
					"key_definition": {
						"filterable": true,
						"parameter_ref": "field",
						"width": 20,
						"label": {
							"default": "StructureDropdown Name",
							"resource_key": "structureInlineDropdown.field.label"
						}
					},
					"parameters": [
						{
							"parameter_ref": "inline_dropdown",
							"label": {
								"resource_key": "structureInlineDropdown.inline_dropdown.label"
							},
							"width": 30,
							"edit_style": "inline"
						}
					]
				}
			],
			"group_info": [
				{
					"id": "Structure Table Dropdown Control",
					"type": "columnSelection",
					"parameter_refs": [
						"structureInlineDropdownList"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": fields
			}
		],
		"resources": {
			"structureInlineDropdown.field.label": "Field",
			"structureInlineDropdown.inline_dropdown.label": "Type"
		}
	}
});
_defineConstant("SUMMARY_PROPS_INFO", {
	"title": "Group Type: controls",
	"parameterDef": {
		"titleDefinition": {
			"title": "Attribute: summary",
			"editable": false
		},
		"current_parameters": {
			"textfieldControlName": "textfieldPlaceholderText",
			"numberfieldControlName": -1,
			"structuretableSortOrder": [
				[
					"Cholesterol",
					"Ascending"
				]
			],
			"structuretableRenameFields": [
				[
					"Age",
					"Age",
					"",
					"string"
				],
				[
					"BP",
					"BP-1",
					"blood pressure",
					""
				]
			]
		},
		"parameters": [
			{
				"id": "textfieldControlName",
				"type": "string",
				"default": "textfieldControlNamePlaceholderText",
				"role": "new_column",
				"required": true
			},
			{
				"id": "numberfieldControlName",
				"type": "integer",
				"default": 0
			},
			{
				"id": "structuretableSortOrder",
				"type": "array[structuretableSortOrder]"
			},
			{
				"id": "structuretableRenameFields",
				"type": "map[string,structuretableRenameFields]",
				"role": "column",
				"default": []
			}
		],
		"complex_types": [
			{
				"id": "structuretableSortOrder",
				"key_definition": {
					"id": "field",
					"type": "string",
					"role": "column",
					"default": ""
				},
				"parameters": [{
					"id": "structuretable_sort_order",
					"enum": [
						"Ascending",
						"Descending"
					],
					"default": "Ascending"
				}]
			},
			{
				"id": "structuretableRenameFields",
				"key_definition": {
					"id": "field",
					"type": "string",
					"role": "column"
				},
				"parameters": [
					{
						"id": "new_name",
						"type": "string",
						"role": "new_column"
					},
					{
						"id": "new_label",
						"type": "string",
						"default": ""
					},
					{
						"id": "new_type",
						"enum": [
							"string",
							"number",
							"boolean",
							"time",
							"date"
						],
						"default": "string"
					}
				]
			}
		],
		"uihints": {
			"id": "PanelsPanel",
			"parameter_info": [
				{
					"parameter_ref": "textfieldControlName",
					"label": {
						"default": "Textfield Control Name"
					},
					"description": {
						"default": "Textfield test"
					}
				},
				{
					"parameter_ref": "numberfieldControlName",
					"label": {
						"default": "Numberfield Control Name"
					},
					"description": {
						"default": "Numberfield test"
					}
				},
				{
					"parameter_ref": "structuretableSortOrder",
					"required": true,
					"label": {
						"default": "Sort by"
					},
					"description": {
						"default": "Use arrows to reorder the sorting priority",
						"placement": "on_panel"
					}
				},
				{
					"parameter_ref": "structuretableRenameFields",
					"label": {
						"default": "Rename Field"
					},
					"description": {
						"default": "Complex table control with inline edit and subpanel edit"
					}
				}
			],
			"complex_type_info": [
				{
					"complex_type_ref": "structuretableSortOrder",
					"moveable_rows": true,
					"key_definition": {
						"parameter_ref": "field",
						"width": 28,
						"label": {
							"resource_key": "structuretableSortOrder.field.label"
						},
						"summary": true
					},
					"parameters": [{
						"parameter_ref": "structuretable_sort_order",
						"width": 16,
						"label": {
							"resource_key": "structuretableSortOrder.sort_order.label"
						},
						"description": {
							"resource_key": "structuretableSortOrder.sort_order.desc"
						},
						"control": "toggletext",
						"value_icons": [
							"/images/up-triangle.svg",
							"/images/down-triangle.svg"
						]
					}]
				},
				{
					"complex_type_ref": "structuretableRenameFields",
					"label": {
						"default": "Rename Subpanel"
					},
					"key_definition": {
						"parameter_ref": "field",
						"label": {
							"resource_key": "structuretableRenameFields.field.label"
						},
						"width": 26,
						"summary": true
					},
					"parameters": [
						{
							"parameter_ref": "new_name",
							"label": {
								"resource_key": "structuretableRenameFields.new_name.label"
							},
							"description": {
								"resource_key": "structuretableRenameFields.new_name.desc"
							},
							"width": 26,
							"edit_style": "inline",
							"filterable": true,
							"summary": true
						},
						{
							"parameter_ref": "new_label",
							"label": {
								"default": "Label"
							},
							"width": 26,
							"edit_style": "subpanel"
						},
						{
							"parameter_ref": "new_type",
							"label": {
								"default": "Type"
							},
							"description": {
								"default": "Select data type"
							},
							"width": 26,
							"edit_style": "inline"
						}
					]
				}
			],
			"group_info": [{
				"id": "Tables",
				"type": "panels",
				"group_info": [
					{
						"id": "textnumberfields-summary-panel",
						"label": {
							"default": "Configure Fields"
						},
						"type": "summaryPanel",
						"group_info": [{
							"id": "Text Number Field",
							"label": {
								"default": "TextNumber"
							},
							"parameter_refs": [
								"textfieldControlName",
								"numberfieldControlName"
							]
						}]
					},
					{
						"id": "structuretableRenameFields-summary-panel",
						"label": {
							"default": "Configure Tables"
						},
						"type": "summaryPanel",
						"group_info": [{
							"id": "structuretableRenameFields",
							"label": {
								"default": "Tables"
							},
							"type": "columnSelection",
							"parameter_refs": [
								"structuretableSortOrder",
								"structuretableRenameFields"
							]
						}]
					}
				]
			}]
		},
		"dataset_metadata": [
			{
				"fields": fields
			}
		],
		"resources": {
			"structuretableSortOrder.label": "Sort",
			"structuretableSortOrder.field.label": "Field",
			"structuretableSortOrder.sort_order.label": "Order",
			"structuretableSortOrder.sort_order.desc": "Update sort order",
			"structuretableSortOrder.sort_order.Ascending.label": "Ascending",
			"structuretableSortOrder.sort_order.Descending.label": "Descending",
			"structuretableRenameFields.rename.label": "Rename Columns",
			"structuretableRenameFields.field.label": "Input name",
			"structuretableRenameFields.new_name.label": "Output name",
			"structuretableRenameFields.new_name.desc": "New field name"
		}
	}
});
_defineConstant("STRUCTURETABLE_GENERATED_VALUES_PROPS_INFO", {
	"title": "StructureTableGenerated Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Attribute: generatedValues",
			"editable": false
		},
		"current_parameters": {
			"structureInlineDropdownList": [[1, "BP", "Integer"], [2, "Sex", "String"], [3, "K", "Double"]]
		},
		"parameters": [
			{
				"id": "structureInlineDropdownList",
				"type": "array[structureInlineDropdown]",
				"role": "column",
				"default": []
			}
		],
		"complex_types": [
			{
				"id": "structureInlineDropdown",
				"key_definition": {
					"id": "index",
					"type": "integer"
				},
				"parameters": [
					{
						"id": "field",
						"type": "string",
						"role": "column"
					},
					{
						"id": "inline_dropdown",
						"type": "string",
						"enum": [
							"String",
							"Integer",
							"Real",
							"Time",
							"Date",
							"Timestamp"
						],
						"default": "String"
					}
				]
			}
		],
		"uihints": {
			"id": "structureInlineTextfieldList",
			"parameter_info": [
				{
					"parameter_ref": "structureInlineDropdownList"
				}
			],
			"complex_type_info": [
				{
					"complex_type_ref": "structureInlineDropdown",
					"moveable_rows": true,
					"key_definition": {
						"parameter_ref": "index",
						"width": 15,
						"label": {
							"default": "Index",
							"resource_key": "structureInlineDropdown.index.label"
						},
						"generated_values": {
							"operation": "index"
						},
						"control": "readonly"
					},
					"parameters": [
						{
							"parameter_ref": "field",
							"width": 20,
							"label": {
								"default": "StructureDropdown Name",
								"resource_key": "structureInlineDropdown.field.label"
							}
						},
						{
							"parameter_ref": "inline_dropdown",
							"label": {
								"resource_key": "structureInlineDropdown.inline_dropdown.label"
							},
							"width": 30,
							"edit_style": "inline"
						}
					]
				}
			],
			"group_info": [
				{
					"id": "Structure Table Dropdown Control",
					"type": "columnSelection",
					"parameter_refs": [
						"structureInlineDropdownList"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": fields
			}
		],
		"resources": {
			"structureInlineDropdown.field.label": "Field",
			"structureInlineDropdown.inline_dropdown.label": "Type"
		}
	}
});
_defineConstant("STRUCTURETABLE_GENERATED_VALUES_DEFAULT_PROPS_INFO", {
	"title": "StructureTableGenerated Title",
	"parameterDef": {
		"titleDefinition": {
			"title": "Attribute: generatedValues",
			"editable": false
		},
		"current_parameters": {
			"structureInlineDropdownList": [[1, "BP", "Integer"], [2, "Sex", "String"], [3, "K", "Double"]]
		},
		"parameters": [
			{
				"id": "structureInlineDropdownList",
				"type": "array[structureInlineDropdown]",
				"role": "column",
				"default": []
			}
		],
		"complex_types": [
			{
				"id": "structureInlineDropdown",
				"key_definition": {
					"id": "index",
					"type": "integer"
				},
				"parameters": [
					{
						"id": "field",
						"type": "string",
						"role": "column"
					},
					{
						"id": "inline_dropdown",
						"type": "string",
						"enum": [
							"String",
							"Integer",
							"Real",
							"Time",
							"Date",
							"Timestamp"
						],
						"default": "String"
					}
				]
			}
		],
		"uihints": {
			"id": "structureInlineTextfieldList",
			"parameter_info": [
				{
					"parameter_ref": "structureInlineDropdownList"
				}
			],
			"complex_type_info": [
				{
					"complex_type_ref": "structureInlineDropdown",
					"moveable_rows": true,
					"key_definition": {
						"parameter_ref": "index",
						"width": 15,
						"label": {
							"default": "Index",
							"resource_key": "structureInlineDropdown.index.label"
						},
						"generated_values": {
							"operation": "index",
							"start_value": 10
						},
						"control": "readonly"
					},
					"parameters": [
						{
							"parameter_ref": "field",
							"width": 20,
							"label": {
								"default": "StructureDropdown Name",
								"resource_key": "structureInlineDropdown.field.label"
							}
						},
						{
							"parameter_ref": "inline_dropdown",
							"label": {
								"resource_key": "structureInlineDropdown.inline_dropdown.label"
							},
							"width": 30,
							"edit_style": "inline"
						}
					]
				}
			],
			"group_info": [
				{
					"id": "Structure Table Dropdown Control",
					"type": "columnSelection",
					"parameter_refs": [
						"structureInlineDropdownList"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": fields
			}
		],
		"resources": {
			"structureInlineDropdown.field.label": "Field",
			"structureInlineDropdown.inline_dropdown.label": "Type"
		}
	}
});


_defineConstant("ACTION_PROPS_INFO", {
	"title": "Actions",
	"parameterDef": {
		"titleDefinition": {
			"title": "Actions",
			"editable": false
		},
		"current_parameters": {
			"number": 0
		},
		"parameters": [
			{
				"id": "number",
				"type": "integer"
			}
		],
		"uihints": {
			"id": "actions",
			"icon": "images/actions.svg",
			"label": {
				"default": "Action Test"
			},
			"parameter_info": [
				{
					"parameter_ref": "number",
					"label": {
						"default": "Integer"
					},
					"description": {
						"default": "Try pressing Increment or Descrement buttons"
					},
					"control": "readonly"
				}
			],
			"action_info": [
				{
					"id": "increment",
					"label": {
						"default": "Increment"
					},
					"control": "button",
					"data": {
						"parameter_ref": "number"
					}
				},
				{
					"id": "decrement",
					"label": {
						"default": "Decrement"
					},
					"control": "button",
					"data": {
						"parameter_ref": "number"
					}
				}
			],
			"group_info": [
				{
					"id": "action-tests",
					"label": {
						"default": "Actions"
					},
					"type": "panels",
					"group_info": [
						{
							"id": "increment-action-panel",
							"type": "actionPanel",
							"label": {
								"default": "Action panel label"
							},
							"description": {
								"default": "Action panel description"
							},
							"action_refs": [
								"increment",
								"decrement"
							]
						},
						{
							"id": "number-control",
							"type": "controls",
							"parameter_refs": [
								"number"
							]
						}
					]
				}
			]
		}
	}
});

_defineConstant("ACTION_IMAGE_PROPS_INFO", {
	"title": "Actions",
	"parameterDef": {
		"titleDefinition": {
			"title": "Actions",
			"editable": false
		},
		"current_parameters": {
			"moon_phase": "Full"
		},
		"parameters": [
			{
				"id": "moon_phase",
				"type": "string"
			}
		],
		"uihints": {
			"id": "actions",
			"icon": "images/actions.svg",
			"label": {
				"default": "Action Test"
			},
			"parameter_info": [
				{
					"parameter_ref": "moon_phase",
					"label": {
						"default": "Current moon phase"
					},
					"description": {
						"default": "Try pressing the moon image"
					},
					"control": "readonly",
					"action_ref": "moon"
				}
			],
			"action_info": [
				{
					"id": "moon",
					"label": {
						"resource_key": "moon"
					},
					"control": "image",
					"data": {
						"parameter_ref": "moon_phase"
					},
					"image": {
						"url": "/images/moon.jpg",
						"placement": "right",
						"size": {
							"height": 20,
							"width": 25
						}
					}
				}
			],
			"group_info": [
				{
					"id": "action-tests",
					"label": {
						"default": "Actions"
					},
					"type": "panels",
					"group_info": [
						{
							"id": "moon-control",
							"type": "controls",
							"parameter_refs": [
								"moon_phase"
							]
						}
					]
				}
			]
		}
	}
});
