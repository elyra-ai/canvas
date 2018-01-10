/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
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
];

// Public Methods ------------------------------------------------------------->
_defineConstant("CONTAINERS_RIGHT_FLYOUT_PROPERTIES", "const rightFlyoutContent =(<CommonProperties \n" +
"    showPropertiesDialog={this.showPropertiesDialog} \n" +
"    propertiesInfo={this.propertiesInfo} \n" +
"    containerType=\"Custom\" \n" +
"    rightFlyout \n" +
"/>);");

_defineConstant("CONTAINERS_RIGHT_FLYOUT_CANVAS", "<CommonCanvas \n" +
"    config={commonCanvasConfig} \n" +
"    contextMenuHandler={this.contextMenuHandler} \n" +
"    contextMenuActionHandler= {this.contextMenuActionHandler} \n" +
"    editActionHandler= {this.editActionHandler} \n" +
"    clickActionHandler= {this.clickActionHandler} \n" +
"    decorationActionHandler= {this.decorationActionHandler} \n" +
"    toolbarConfig={toolbarConfig} \n" +
"    toolbarMenuActionHandler={this.toolbarMenuActionHandler} \n" +
"    rightFlyoutContent={rightFlyoutContent} \n" +
"    showRightFlyout={showRightFlyoutProperties} \n" +
"/>");

_defineConstant("CONTROLS_PROPS_INFO", {
	"title": "Group Type: controls",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": []
		}
	}
});
_defineConstant("TABS_PROPS_INFO", {
	"title": "Group Type: tabs",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": []
		}
	}
});
_defineConstant("SUBTABS_PROPS_INFO", {
	"title": "Group Type: subTabs",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": []
		}
	}
});
_defineConstant("PANELS_PROPS_INFO", {
	"title": "Group Type: panels",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": []
		}
	}
});
_defineConstant("PANEL_SELECTOR_PROPS_INFO", {
	"title": "Group Type: panelSelector",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": []
		}
	}
});
_defineConstant("CHECKBOX_PANEL_PROPS_INFO", {
	"title": "Group Type: controls",
	"parameterDef": {
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
					"type": "checkboxPanel",
					"label": {
						"default": "Enable Controls"
					},
					"parameter_refs": [
						"textfieldControlName",
						"numberfieldControlName"
					]
				}
			]
		},
		"dataset_metadata": {
			"fields": []
		}
	}
});
_defineConstant("SUMMARY_PANEL_PROPS_INFO", {
	"title": "Group Type: controls",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": fields
		},
		"resources": {
			"structuretableRenameFields.rename.label": "Rename Columns",
			"structuretableRenameFields.field.label": "Input name",
			"structuretableRenameFields.new_name.label": "Output name",
			"structuretableRenameFields.new_name.desc": "New field name"
		}
	}
});
_defineConstant("COLUMNSELECTION_PROPS_INFO", {
	"title": "Group Types: ColumnSelection",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": fields
		}
	}
});

_defineConstant("TEXT_PANEL_PROPS_INFO", {
	"title": "Group Types: Text Panel",
	"parameterDef": {
		"parameters": [
		],
		"uihints": {
			"id": "TextPanelId",
			"parameter_info": [
			],
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
				}
			]
		}
	}
});

_defineConstant("TEXTFIELD_PROPS_INFO", {
	"title": "TextField Title",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": []
		}
	},
	"resources": {
		"textfieldControlName_not_empty": "Textfield Control cannot be empty"
	}
});
_defineConstant("TEXTAREA_PROPS_INFO", {
	"title": "Textarea Title",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": []
		}
	},
	"resources": {
		"textareaControlName_not_empty": "Textarea Control cannot be empty"
	}
});
_defineConstant("PASSWORD_FIELD_PROPS_INFO", {
	"title": "Password Title",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": []
		}
	}
});
_defineConstant("EXPRESSION_PROPS_INFO", {
	"title": "Expression Title",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": []
		}
	}
});
_defineConstant("READONLY_PROPS_INFO", {
	"title": "Readonly Title",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": []
		}
	}
});
_defineConstant("NUMBERFIELD_GENERATOR_PROPS_INFO", {
	"title": "NumberField Generator Title",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": []
		},
		"resources": {
			"numberGenerator.label": "Generate",
			"numberGenerator.desc": "Generate a random number for use as a seed value"
		}
	}
});
_defineConstant("CHECKBOX_SINGLE_PROPS_INFO", {
	"title": "Checkbox Title",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": []
		}
	}
});
_defineConstant("CHECKBOX_SET_PROPS_INFO", {
	"title": "Checkbox Set Title",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": []
		}
	}
});
_defineConstant("RADIOSET_HORIZONTAL_PROPS_INFO", {
	"title": "Radioset Title",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": []
		}
	}
});
_defineConstant("RADIOSET_VERTICAL_PROPS_INFO", {
	"title": "Radioset Title",
	"parameterDef": {
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
					},
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
		"dataset_metadata": {
			"fields": []
		}
	}
});
_defineConstant("ONEOFSELECT_PROPS_INFO", {
	"title": "One of Select Title",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": []
		}
	}
});
_defineConstant("FORCED_RADIOSET_PROPS_INFO", {
	"title": "One of Select Title",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": []
		}
	}
});
_defineConstant("SOMEOFSELECT_PROPS_INFO", {
	"title": "Some of Select Title",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": []
		}
	}
});
_defineConstant("FORCED_CHECKBOX_SET_PROPS_INFO", {
	"title": "Forced Checkboxset Title",
	"parameterDef": {
		"current_parameters": {
			"someofselectList": ""
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
		"dataset_metadata": {
			"fields": []
		}
	}
});
_defineConstant("SELECTCOLUMN_PROPS_INFO", {
	"title": "Select Column Title",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": fields
		}
	}
});
_defineConstant("SELECTCOLUMNS_PROPS_INFO", {
	"title": "SelectColumns Title",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": fields
		}
	}
});
_defineConstant("TOGGLETEXT_PROPS_INFO", {
	"title": "Toggletext Title",
	"parameterDef": {
		"current_parameters": {
			"toggletextOption": ["On"]
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
		"dataset_metadata": {
			"fields": []
		}
	}
});
_defineConstant("TOGGLETEXTICONS_PROPS_INFO", {
	"title": "Toggletext Title",
	"parameterDef": {
		"current_parameters": {
			"toggletextOption": ["On"]
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
		"dataset_metadata": {
			"fields": []
		}
	}
});

_defineConstant("STRUCTURETABLE_INLINE_TOGGLE_PROPS_INFO", {
	"title": "StructureTableToggle Title",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": fields
		},
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
		"dataset_metadata": {
			"fields": fields
		},
		"resources": {
			"structureInlineTextfield.field.label": "Input Name",
			"structureInlineTextfield.inline_textfield.label": "OutputName"
		}
	}
});
_defineConstant("STRUCTURETABLE_INLINE_DROPDOWN_PROPS_INFO", {
	"title": "StructureTableDropdown Title",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": fields
		},
		"resources": {
			"structureInlineDropdown.field.label": "Field",
			"structureInlineDropdown.inline_dropdown.label": "Type"
		}
	}
});
_defineConstant("STRUCTURETABLE_SUBPANEL_TEXTFIELD_PROPS_INFO", {
	"title": "StructureTableInlineTextfield Title",
	"parameterDef": {
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
		"dataset_metadata": {
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
		},
		"resources": {
			"structurelisteditorTableInput.field.label": "Input Name",
			"structurelisteditorTableInput.subpanel_textfield.label": "OutputName"
		}
	}
});
_defineConstant("STRUCTURETABLE_ONPANEL_EXPRESSION_PROPS_INFO", {
	"title": "StructureListEditor Title",
	"parameterDef": {
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
				"role": "column",
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
		"dataset_metadata": {
			"fields": []
		},
		"resources": {
			"expressionCellTable.name.label": "Set Field To",
			"expressionCellTable.name.desc": "value of field",
			"expressionCellTable.description.label": "Condition",
			"expressionCellTable.description.desc": "if condition true set field"
		}
	}
});
_defineConstant("STRUCTURETABLE_ROW_SELECTION_PROPS_INFO", {
	"title": "StructureListEditor Title",
	"parameterDef": {
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
				"role": "column",
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
		"dataset_metadata": {
			"fields": []
		},
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
		"current_parameters": {
			"structurelisteditorList": [["Hello", "World"]]
		},
		"parameters": [
			{
				"id": "structurelisteditorList",
				"type": "array[structurelisteditorTableInput]",
				"role": "column",
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
		"dataset_metadata": {
			"fields": []
		},
		"resources": {
			"structurelisteditorTableInput.name.label": "Name",
			"structurelisteditorTableInput.description.label": "Description"
		}
	}
});
_defineConstant("STRUCTURETABLE_MOVEABLE_PROPS_INFO", {
	"title": "StructureTableDropdown Title",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": fields
		},
		"resources": {
			"structureInlineDropdown.field.label": "Field",
			"structureInlineDropdown.inline_dropdown.label": "Type"
		}
	}
});
_defineConstant("STRUCTURETABLE_SORTABLE_PROPS_INFO", {
	"title": "StructureTableDropdown Title",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": fields
		},
		"resources": {
			"structureInlineDropdown.field.label": "Field",
			"structureInlineDropdown.inline_dropdown.label": "Type"
		}
	}
});
_defineConstant("STRUCTURETABLE_FILTERABLE_PROPS_INFO", {
	"title": "StructureTableDropdown Title",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": fields
		},
		"resources": {
			"structureInlineDropdown.field.label": "Field",
			"structureInlineDropdown.inline_dropdown.label": "Type"
		}
	}
});
_defineConstant("SUMMARY_PROPS_INFO", {
	"title": "Group Type: controls",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": fields
		},
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
	"title": "StructureTableDropdown Title",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": fields
		},
		"resources": {
			"structureInlineDropdown.field.label": "Field",
			"structureInlineDropdown.inline_dropdown.label": "Type"
		}
	}
});
_defineConstant("STRUCTURETABLE_GENERATED_VALUES_DEFAULT_PROPS_INFO", {
	"title": "StructureTableDropdown Title",
	"parameterDef": {
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
		"dataset_metadata": {
			"fields": fields
		},
		"resources": {
			"structureInlineDropdown.field.label": "Field",
			"structureInlineDropdown.inline_dropdown.label": "Type"
		}
	}
});

_defineConstant("ACTION_PROPS_INFO", {
	"title": "Actions",
	"parameterDef": {
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
