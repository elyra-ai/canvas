/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint max-len: ["error", 200]*/
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
_defineConstant("TEXTFIELD_ERROR_PROPS_INFO", {
	"title": "TextField Title",
	"parameterDef": {
		"current_parameters": {
			"textfieldControlName": "enter some text"
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
						"default": "Enter a name without quotes"
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
		],
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "error",
						"message": {
							"default": "Name cannot contain double or single \"quotes\"",
							"resource_key": "textfieldControlName_no_quotes"
						},
						"focus_parameter_ref": "textfieldControlName"
					},
					"evaluate": {
						"and": [
							{
								"condition": {
									"parameter_ref": "textfieldControlName",
									"op": "notContains",
									"value": "\""
								}
							},
							{
								"condition": {
									"parameter_ref": "textfieldControlName",
									"op": "notContains",
									"value": "'"
								}
							}
						]
					}
				}
			}
		],
		"resources": {
			"textfieldControlName_no_quotes": "Name cannot contain double or single \"quotes\""
		}
	}
});
_defineConstant("TEXTFIELD_WARNING_PROPS_INFO", {
	"title": "TextField Title",
	"parameterDef": {
		"current_parameters": {
			"textfieldControlName": "enter some text"
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
						"default": "Enter a name without quotes"
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
		],
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "warning",
						"message": {
							"default": "Name cannot contain double or single \"quotes\"",
							"resource_key": "textfieldControlName_no_quotes"
						},
						"focus_parameter_ref": "textfieldControlName"
					},
					"evaluate": {
						"and": [
							{
								"condition": {
									"parameter_ref": "textfieldControlName",
									"op": "notContains",
									"value": "\""
								}
							},
							{
								"condition": {
									"parameter_ref": "textfieldControlName",
									"op": "notContains",
									"value": "'"
								}
							}
						]
					}
				}
			}
		],
		"resources": {
			"textfieldControlName_no_quotes": "Name cannot contain double or single \"quotes\""
		}
	}
});
_defineConstant("TEXTFIELD_COLNOTEXISTS_PROPS_INFO", {
	"title": "TextField Title",
	"parameterDef": {
		"current_parameters": {
			"textfieldControlName": "Age"
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
						"default": "Enter a unique column name"
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
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "error",
						"message": {
							"default": "Name cannot be an existing column field name in the dataset_metadata",
							"resource_key": "textfieldControlName_no_quotes"
						},
						"focus_parameter_ref": "textfieldControlName"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "textfieldControlName",
							"op": "colNotExists"
						}
					}
				}
			}
		],
		"dataset_metadata": [
			{
				"fields": fields
			}
		],
		"resources": {
			"textfieldControlName_no_quotes": "Name cannot be an existing column field name in the dataset_metadata"
		}
	}
});
_defineConstant("TEXTAREA_ERROR_PROPS_INFO", {
	"title": "Textarea Title",
	"parameterDef": {
		"current_parameters": {
			"textareaControlName": ["line1", "line2", "line3"]
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
						"default": "Enter some text"
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
		],
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "error",
						"message": {
							"default": "textarea cannot contain [\"line1\", \"line2\", \"line3\"]",
							"resource_key": "textareaControlName_not_empty"
						},
						"focus_parameter_ref": "textareaControlName"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "textareaControlName",
							"op": "notEquals",
							"value": ["line1", "line2", "line3"]
						}
					}
				}
			}
		],
		"resources": {
			"textareaControlName_not_empty": "textarea cannot contain [\"line1\", \"line2\", \"line3\"]"
		}
	}
});
_defineConstant("TEXTAREA_WARNING_PROPS_INFO", {
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
						"default": "Enter some text"
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
		],
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "warning",
						"message": {
							"default": "textarea cannot be empty",
							"resource_key": "textareaControlName_not_empty"
						},
						"focus_parameter_ref": "textareaControlName"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "textareaControlName",
							"op": "isNotEmpty"
						}
					}
				}
			}
		],
		"resources": {
			"textareaControlName_not_empty": "textarea cannot be empty"
		}
	}
});
_defineConstant("PASSWORD_FIELD_ERROR_PROPS_INFO", {
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
						"default": "Enter your password"
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
		],
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "error",
						"message": {
							"default": "password cannot be empty",
							"resource_key": "passwordField_not_empty"
						},
						"focus_parameter_ref": "passwordField"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "passwordField",
							"op": "isNotEmpty"
						}
					}
				}
			}
		],
		"resources": {
			"passwordField_not_empty": "password cannot be empty"
		}
	}
});
_defineConstant("EXPRESSION_ERROR_PROPS_INFO", {
	"title": "Expression Title",
	"parameterDef": {
		"current_parameters": {
			"expressionBox": ""
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
					"label": {
						"default": "Expression Control Name"
					},
					"description": {
						"default": "Enter a single line expression"
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
				"fields": []
			}
		],
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "error",
						"message": {
							"default": "expression must not contain a newline or single quotes. It must contain /.",
							"resource_key": "expressionBox_invalid"
						},
						"focus_parameter_ref": "expressionBox"
					},
					"evaluate": {
						"and": [
							{
								"condition": {
									"parameter_ref": "expressionBox",
									"op": "notContains",
									"value": "\n"
								}
							},
							{
								"condition": {
									"parameter_ref": "expressionBox",
									"op": "notContains",
									"value": "'"
								}
							},
							{
								"condition": {
									"parameter_ref": "expressionBox",
									"op": "contains",
									"value": "/"
								}
							}
						]
					}
				}
			}
		],
		"resources": {
			"expressionBox_invalid": "expression must not contain a newline or single quotes. It must contain /."
		}
	}
});
_defineConstant("EXPRESSION_WARNING_PROPS_INFO", {
	"title": "Expression Title",
	"parameterDef": {
		"current_parameters": {
			"expressionBox": ""
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
					"label": {
						"default": "Expression Control Name"
					},
					"description": {
						"default": "Enter an expression"
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
				"fields": []
			}
		],
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "warning",
						"message": {
							"default": "expression cannot be empty.",
							"resource_key": "expressionBox_invalid"
						},
						"focus_parameter_ref": "expressionBox"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "expressionBox",
							"op": "isNotEmpty"
						}
					}
				}
			}
		],
		"resources": {
			"expressionBox_invalid": "expression cannot be empty."
		}
	}
});
_defineConstant("NUMBERFIELD_ERROR_PROPS_INFO", {
	"title": "NumberField Title",
	"parameterDef": {
		"current_parameters": {
			"numberfieldControlName": null
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
						"default": "Enter a number"
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
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "error",
						"message": {
							"default": "Number must be > 0 and < 10 or > 90 and < 100",
							"resource_key": "numberfieldControlName_invalid"
						},
						"focus_parameter_ref": "numberfieldControlName"
					},
					"evaluate": {
						"and": [
							{
								"condition": {
									"parameter_ref": "numberfieldControlName",
									"op": "notEquals",
									"value": null
								}
							},
							{
								"or": [
									{
										"and": [
											{
												"condition": {
													"parameter_ref": "numberfieldControlName",
													"op": "greaterThan",
													"value": 0
												}
											},
											{
												"condition": {
													"parameter_ref": "numberfieldControlName",
													"op": "lessThan",
													"value": 10
												}
											}
										]
									},
									{
										"and": [
											{
												"condition": {
													"parameter_ref": "numberfieldControlName",
													"op": "greaterThan",
													"value": 90
												}
											},
											{
												"condition": {
													"parameter_ref": "numberfieldControlName",
													"op": "lessThan",
													"value": 100
												}
											}
										]
									}
								]
							}
						]
					}
				}
			}
		],
		"resources": {
			"numberfieldControlName_invalid": "Number must be > 0 and < 10 or > 90 and < 100"
		}
	}
});
_defineConstant("NUMBERFIELD_GENERATOR_WARNING_PROPS_INFO", {
	"title": "NumberField Generator Title",
	"parameterDef": {
		"current_parameters": {
			"numberfieldControlName": null
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
						"default": "Enter a number"
					},
					"number_generator": {
						"label": {
							"default": "Generate",
							"resource_key": "numberGenerator"
						},
						"description": {
							"default": "Generate number between 100 and 9999"
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
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "error",
						"message": {
							"default": "numberfieldControlName cannot be empty.",
							"resource_key": "numberfieldControlName_notEmpty"
						},
						"focus_parameter_ref": "numberfieldControlName"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "numberfieldControlName",
							"op": "isNotEmpty"
						}
					}
				}
			}
		],
		"resources": {
			"numberGenerator.label": "Generate",
			"numberGenerator.desc": "Generate a random number for use as a seed value",
			"numberfieldControlName_notEmpty": "numberfieldControlName cannot be empty."
		}
	}
});
_defineConstant("CHECKBOX_SINGLE_ERROR_PROPS_INFO", {
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
						"default": "Check this box"
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
		],
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "error",
						"message": {
							"default": "checkboxSingle must be checked.",
							"resource_key": "checkboxSingle"
						},
						"focus_parameter_ref": "checkboxSingle"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "checkboxSingle",
							"op": "isNotEmpty"
						}
					}
				}
			}
		],
		"resources": {
			"checkboxSingle": "checkboxSingle must be checked."
		}
	}
});
_defineConstant("CHECKBOX_SINGLE_WARNING_PROPS_INFO", {
	"title": "Checkbox Title",
	"parameterDef": {
		"current_parameters": {
			"checkboxSingleW": false
		},
		"parameters": [
			{
				"id": "checkboxSingleW",
				"type": "boolean",
				"enum": [
					"Single Checkbox Label"
				]
			}
		],
		"uihints": {
			"id": "checkboxSingleW",
			"parameter_info": [
				{
					"parameter_ref": "checkboxSingleW",
					"label": {
						"default": "Checkbox Control Name"
					},
					"description": {
						"default": "Check this box"
					}
				}
			],
			"group_info": [
				{
					"id": "Checkbox Control",
					"type": "controls",
					"parameter_refs": [
						"checkboxSingleW"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		],
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "warning",
						"message": {
							"default": "checkboxSingleW must be checked.",
							"resource_key": "checkboxSingleW"
						},
						"focus_parameter_ref": "checkboxSingleW"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "checkboxSingleW",
							"op": "equals",
							"value": true
						}
					}
				}
			}
		],
		"resources": {
			"checkboxSingle": "checkboxSingleW must be checked."
		}
	}
});
_defineConstant("CHECKBOX_SET_ERROR_PROPS_INFO", {
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
						"default": "Do not select both integer and string"
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
		],
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "error",
						"message": {
							"default": "cannot check both string and integer.",
							"resource_key": "checkboxSet"
						},
						"focus_parameter_ref": "checkboxSet"
					},
					"evaluate": {
						"or": [
							{
								"condition": {
									"parameter_ref": "checkboxSet",
									"op": "notContains",
									"value": "string"
								}
							},
							{
								"condition": {
									"parameter_ref": "checkboxSet",
									"op": "notContains",
									"value": "integer"
								}
							}
						]
					}
				}
			}
		],
		"resources": {
			"checkboxSet": "cannot check both string and integer."
		}
	}
});
_defineConstant("CHECKBOX_SET_WARNING_PROPS_INFO", {
	"title": "Checkbox Set Title",
	"parameterDef": {
		"current_parameters": {
			"checkboxSetW": []
		},
		"parameters": [
			{
				"id": "checkboxSetW",
				"type": "array[string]",
				"enum": [
					"Integer",
					"String",
					"Boolean",
					"Date"
				]
			}
		],
		"uihints": {
			"id": "checkboxSetW",
			"parameter_info": [
				{
					"parameter_ref": "checkboxSetW",
					"label": {
						"default": "Checkbox Set Control Name"
					},
					"description": {
						"default": "Do not only select integer and string"
					}
				}
			],
			"group_info": [
				{
					"id": "Checkbox Set Control",
					"type": "controls",
					"parameter_refs": [
						"checkboxSetW"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		],
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "warning",
						"message": {
							"default": "boolean must be checked.",
							"resource_key": "checkboxSetW_invalid"
						},
						"focus_parameter_ref": "checkboxSetW"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "checkboxSetW",
							"op": "notEquals",
							"value": ["Integer", "String"]
						}
					}
				}
			}
		],
		"resources": {
			"checkboxSetW_invalid": "cannot check both string and integer."
		}
	}
});
_defineConstant("RADIOSET_HORIZONTAL_ERROR_PROPS_INFO", {
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
					"red-orange",
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
						"default": "Pick a color that isn't red"
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
		],
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "error",
						"message": {
							"default": "do not select red.",
							"resource_key": "radioset_invalid"
						},
						"focus_parameter_ref": "radioset"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "radioset",
							"op": "notEquals",
							"value": "red"
						}
					}
				}
			}
		],
		"resources": {
			"radioset_invalid": "do not select red."
		}
	}
});
_defineConstant("RADIOSET_VERTICAL_WARNING_PROPS_INFO", {
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
					"red-orange",
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
						"default": "Pick a color that doesn't contain red"
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
		"dataset_metadata": [
			{
				"fields": []
			}
		],
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "warning",
						"message": {
							"default": "do not select red.",
							"resource_key": "radioset_invalid"
						},
						"focus_parameter_ref": "radioset"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "radioset",
							"op": "notContains",
							"value": "red"
						}
					}
				}
			}
		],
		"resources": {
			"radioset_invalid": "do not select any kind of red."
		}
	}
});
_defineConstant("ONEOFSELECT_ERROR_PROPS_INFO", {
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
				"default": ""
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
						"default": "Click the dropdown"
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
		],
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "error",
						"message": {
							"default": "an option must be selected.",
							"resource_key": "oneofselectList_invalid"
						},
						"focus_parameter_ref": "oneofselectList"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "oneofselectList",
							"op": "isNotEmpty"
						}
					}
				}
			}
		],
		"resources": {
			"oneofselectList_invalid": "an option must be selected."
		}
	}
});
_defineConstant("ONEOFSELECT_WARNING_PROPS_INFO", {
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
					"red-orange",
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
						"default": "Pick a color that isn't red"
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
		],
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "warning",
						"message": {
							"default": "cannot select red.",
							"resource_key": "oneofselectListinvalid"
						},
						"focus_parameter_ref": "oneofselectList"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "oneofselectList",
							"op": "notEquals",
							"value": "red"
						}
					}
				}
			}
		],
		"resources": {
			"oneofselectList_invalid": "cannot select red."
		}
	}
});
_defineConstant("SOMEOFSELECT_ERROR_PROPS_INFO", {
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
						"default": "Select a few colors"
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
		],
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "error",
						"message": {
							"default": "an option must be selected.",
							"resource_key": "someofselectList_invalid"
						},
						"focus_parameter_ref": "someofselectList"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "someofselectList",
							"op": "isNotEmpty"
						}
					}
				}
			}
		],
		"resources": {
			"someofselectList_invalid": "an option must be selected."
		}
	}
});
_defineConstant("SOMEOFSELECT_WARNING_PROPS_INFO", {
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
					"red-orange",
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
						"default": "Select some colors where one must contain red"
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
		],
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "warning",
						"message": {
							"default": "an option containing red must be selected.",
							"resource_key": "someofselectList_invalid"
						},
						"focus_parameter_ref": "someofselectList"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "someofselectList",
							"op": "contains",
							"value": "red"
						}
					}
				}
			}
		],
		"resources": {
			"someofselectList_invalid": "an option containing red must be selected."
		}
	}
});
_defineConstant("SELECTCOLUMN_ERROR_PROPS_INFO", {
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
						"default": "Do not select Drug"
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
		],
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "error",
						"message": {
							"default": "cannot select Drug.",
							"resource_key": "selectcolumnList_invalid"
						},
						"focus_parameter_ref": "selectcolumnList"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "selectcolumnList",
							"op": "notEquals",
							"value": "Drug"
						}
					}
				}
			}
		],
		"resources": {
			"selectcolumnList_invalid": "cannot select Drug."
		}
	}
});
_defineConstant("SELECTCOLUMNS_ERROR_PROPS_INFO", {
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
						"default": "Select some columns including Cholesterol"
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
		],
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "error",
						"message": {
							"default": "Cholesterol must be selected.",
							"resource_key": "selectcolumnsList_invalid"
						},
						"focus_parameter_ref": "selectcolumnsList"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "selectcolumnsList",
							"op": "contains",
							"value": "Cholesterol"
						}
					}
				}
			}
		],
		"resources": {
			"selectcolumnsList_invalid": "Cholesterol must be selected."
		}
	}
});
_defineConstant("STRUCTURETABLE_ERROR_PROPS_INFO", {
	"title": "StructureTable Title",
	"parameterDef": {
		"current_parameters": {
			"structureTableList": [["Age", "Age-1", null, ""], ["BP", "BP-1", 100, "number"]]
		},
		"parameters": [
			{
				"id": "structureTableList",
				"type": "map[string,structureTableList]",
				"role": "column",
				"default": []
			}
		],
		"complex_types": [
			{
				"id": "structureTableList",
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
						"id": "new_number",
						"type": "integer",
						"default": null
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
			"id": "structureTableList",
			"parameter_info": [
				{
					"parameter_ref": "structureTableList",
					"label": {
						"default": "Rename Field"
					},
					"description": {
						"default": "Select some columns"
					}
				}
			],
			"complex_type_info": [
				{
					"complex_type_ref": "structureTableList",
					"label": {
						"default": "Rename Subpanel"
					},
					"key_definition": {
						"parameter_ref": "field",
						"label": {
							"resource_key": "structureTableList.field.label"
						},
						"width": 26
					},
					"parameters": [
						{
							"parameter_ref": "new_name",
							"label": {
								"default": "New Name"
							},
							"description": {
								"resource_key": "structureTableList.new_name.desc"
							},
							"width": 26,
							"edit_style": "inline"
						},
						{
							"parameter_ref": "new_number",
							"label": {
								"default": "Number"
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
							"edit_style": "subpanel"
						}
					]
				}
			],
			"group_info": [
				{
					"id": "structureTableList",
					"type": "columnSelection",
					"parameter_refs": [
						"structureTableList"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": fields
			}
		],
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "error",
						"message": {
							"default": "Must contain 'Cholesterol'. Number cannot be null. Cannot contain 'boolean'.",
							"resource_key": "structureTableList_invalid"
						},
						"focus_parameter_ref": "structureTableList"
					},
					"evaluate": {
						"and": [
							{
								"condition": {
									"parameter_ref": "structureTableList",
									"op": "contains",
									"value": "Cholesterol"
								}
							},
							{
								"condition": {
									"parameter_ref": "structureTableList",
									"op": "notContains",
									"value": "boolean"
								}
							},
							{
								"condition": {
									"parameter_ref": "structureTableList",
									"op": "notContains",
									"value": null
								}
							}
						]
					}
				}
			},
			{
				"validation": {
					"fail_message": {
						"type": "warning",
						"message": {
							"default": "Number must be between 0 and 130.",
							"resource_key": "new_number_invalid"
						},
						"focus_parameter_ref": "structureTableList"
					},
					"evaluate": {
						"and": [
							{
								"condition": {
									"parameter_ref": "new_number",
									"op": "greaterThan",
									"value": 0
								}
							},
							{
								"condition": {
									"parameter_ref": "new_number",
									"op": "lessThan",
									"value": 130
								}
							}
						]
					}
				}
			}
		],
		"resources": {
			"structureTableList.field.label": "Field",
			"structureTableList.sort_order.label": "Order",
			"structureTableList_invalid": "Must contain 'Cholesterol'. Number cannot be null. Cannot contain 'boolean'.",
			"new_number_invalid": "Number must be between 0 and 130."
		}
	}
});
_defineConstant("STRUCTURETABLE_WARNING_PROPS_INFO", {
	"title": "StructureTable Title",
	"parameterDef": {
		"current_parameters": {
			"structureTableList": [["Age", "Age-1", null, ""], ["BP", "BP-111", 100, "number"]]
		},
		"parameters": [
			{
				"id": "structureTableList",
				"type": "map[string,structureTableList]",
				"role": "column",
				"default": []
			}
		],
		"complex_types": [
			{
				"id": "structureTableList",
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
						"id": "new_number",
						"type": "integer",
						"default": null
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
			"id": "structureTableList",
			"parameter_info": [
				{
					"parameter_ref": "structureTableList",
					"label": {
						"default": "Rename Field"
					},
					"description": {
						"default": "Only select the BP column"
					}
				}
			],
			"complex_type_info": [
				{
					"complex_type_ref": "structureTableList",
					"label": {
						"default": "Rename Subpanel"
					},
					"key_definition": {
						"parameter_ref": "field",
						"label": {
							"resource_key": "structureTableList.field.label"
						},
						"width": 26
					},
					"parameters": [
						{
							"parameter_ref": "new_name",
							"label": {
								"default": "New Name"
							},
							"description": {
								"resource_key": "structureTableList.new_name.desc"
							},
							"width": 26,
							"edit_style": "inline"
						},
						{
							"parameter_ref": "new_number",
							"label": {
								"default": "Number"
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
							"edit_style": "subpanel"
						}
					]
				}
			],
			"group_info": [
				{
					"id": "structureTableList",
					"type": "columnSelection",
					"parameter_refs": [
						"structureTableList"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": fields
			}
		],
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "error",
						"message": {
							"default": "Only row [\"BP\", \"BP-1\", 100, \"number\"] can be selected.",
							"resource_key": "structureTableList_invalid"
						},
						"focus_parameter_ref": "structureTableList"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "structureTableList",
							"op": "equals",
							"value": [["BP", "BP-1", 100, "number"]]
						}
					}
				}
			}
		],
		"resources": {
			"structureTableList.field.label": "Field",
			"structureTableList.sort_order.label": "Order",
			"structureTableList_invalid": "Only row [\"BP\", \"BP-1\", 100, \"number\"] can be selected."
		}
	}
});
_defineConstant("STRUCTURETABLE_COLNOTEXISTS_PROPS_INFO", {
	"title": "StructureTable Title",
	"parameterDef": {
		"current_parameters": {
			"structureTableList": [["Age", "Age", null, ""], ["BP", "Age", 100, "number"]]
		},
		"parameters": [
			{
				"id": "structureTableList",
				"type": "map[string,structureTableList]",
				"role": "column",
				"default": []
			}
		],
		"complex_types": [
			{
				"id": "structureTableList",
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
						"id": "new_number",
						"type": "integer",
						"default": null
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
			"id": "structureTableList",
			"parameter_info": [
				{
					"parameter_ref": "structureTableList",
					"label": {
						"default": "Rename Field"
					},
					"description": {
						"default": "Rename columns to unique names"
					}
				}
			],
			"complex_type_info": [
				{
					"complex_type_ref": "structureTableList",
					"label": {
						"default": "Rename Subpanel"
					},
					"key_definition": {
						"parameter_ref": "field",
						"label": {
							"resource_key": "structureTableList.field.label"
						},
						"width": 26
					},
					"parameters": [
						{
							"parameter_ref": "new_name",
							"label": {
								"default": "New Name"
							},
							"description": {
								"resource_key": "structureTableList.new_name.desc"
							},
							"width": 26,
							"edit_style": "inline"
						},
						{
							"parameter_ref": "new_number",
							"label": {
								"default": "Number"
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
							"edit_style": "subpanel"
						}
					]
				}
			],
			"group_info": [
				{
					"id": "structureTableList",
					"type": "columnSelection",
					"parameter_refs": [
						"structureTableList"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": fields
			}
		],
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "error",
						"message": {
							"default": "New Name cannot be an existing column field name in the dataset_metadata.",
							"resource_key": "structureTableList_invalid"
						},
						"focus_parameter_ref": "structureTableList"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "structureTableList",
							"op": "colNotExists"
						}
					}
				}
			}
		],
		"resources": {
			"structureTableList.field.label": "Field",
			"structureTableList.sort_order.label": "Order",
			"structureTableList_invalid": "New Name cannot be an existing column field name in the dataset_metadata."
		}
	}
});
_defineConstant("STRUCTURELISTEDITOR_ERROR_PROPS_INFO", {
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
					"parameter_ref": "structurelisteditorList",
					"label": {
						"default": "StructureListEditor Table"
					},
					"description": {
						"default": "Add some rows"
					}
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
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "error",
						"message": {
							"default": "Table cannot be empty.",
							"resource_key": "structurelisteditorList_invalid"
						},
						"focus_parameter_ref": "structurelisteditorList"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "structurelisteditorList",
							"op": "isNotEmpty"
						}
					}
				}
			}
		],
		"resources": {
			"structurelisteditorTableInput.name.label": "Name",
			"structurelisteditorTableInput.description.label": "Description",
			"structurelisteditorList_invalid": "Table cannot be empty."
		}
	}
});
_defineConstant("STRUCTURELISTEDITOR_WARNING_PROPS_INFO", {
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
					"parameter_ref": "structurelisteditorList",
					"label": {
						"default": "StructureListEditor Table"
					},
					"description": {
						"default": "Add some rows with valid name and description"
					}
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
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "warning",
						"message": {
							"default": "Table cannot be empty.",
							"resource_key": "structurelisteditorList_invalid"
						},
						"focus_parameter_ref": "structurelisteditorList"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "structurelisteditorList",
							"op": "isNotEmpty"
						}
					}
				}
			},
			{
				"validation": {
					"fail_message": {
						"type": "warning",
						"message": {
							"default": "Name cannot be empty.",
							"resource_key": "name_invalid"
						},
						"focus_parameter_ref": "name"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "name",
							"op": "isNotEmpty"
						}
					}
				}
			},
			{
				"validation": {
					"fail_message": {
						"type": "warning",
						"message": {
							"default": "Description cannot be contain '<' and '>'.",
							"resource_key": "description_invalid"
						},
						"focus_parameter_ref": "description"
					},
					"evaluate": {
						"or": [
							{
								"condition": {
									"parameter_ref": "description",
									"op": "notContains",
									"value": "<"
								}
							},
							{
								"condition": {
									"parameter_ref": "description",
									"op": "notContains",
									"value": ">"
								}
							}
						]
					}
				}
			}
		],
		"resources": {
			"structurelisteditorTableInput.name.label": "Name",
			"structurelisteditorTableInput.description.label": "Description",
			"structurelisteditorList_invalid": "Table cannot be empty.",
			"name_invalid": "Name cannot be empty.",
			"description_invalid": "Description cannot be contain '<' and '>'."
		}
	}
});

_defineConstant("STRING_GROUP_ERROR_PROPS_INFO", {
	"title": "Group Type: String Group Conditions",
	"parameterDef": {
		"current_parameters": {
			"textfieldControlName1": "hello",
			"textfieldControlName2": "world"
		},
		"parameters": [
			{
				"id": "textfieldControlName1",
				"type": "string",
				"default": "",
				"role": "new_column",
				"required": true
			},
			{
				"id": "textfieldControlName2",
				"type": "string",
				"default": "",
				"role": "new_column"
			}
		],
		"uihints": {
			"id": "GroupName",
			"parameter_info": [
				{
					"parameter_ref": "textfieldControlName1",
					"label": {
						"default": "First Name"
					},
					"description": {
						"default": "Enter a first name"
					}
				},
				{
					"parameter_ref": "textfieldControlName2",
					"label": {
						"default": "Last Name"
					},
					"description": {
						"default": "Enter a last name"
					}
				}
			],
			"group_info": [
				{
					"id": "Full Name",
					"type": "controls",
					"parameter_refs": [
						"textfieldControlName1",
						"textfieldControlName2"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		],
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "error",
						"message": {
							"default": "First and last name cannot be the same.",
							"resource_key": "textfieldControlName_invalid"
						},
						"focus_parameter_ref": "textfieldControlName1"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "textfieldControlName1",
							"op": "notEquals",
							"parameter_2_ref": "textfieldControlName2"
						}
					}
				}
			}
		],
		"resources": {
			"textfieldControlName_invalid": "First and last name cannot be the same."
		}
	}
});
_defineConstant("STRING_GROUP_WARNING_PROPS_INFO", {
	"title": "Group Type: String Group Conditions",
	"parameterDef": {
		"current_parameters": {
			"textfieldControlName1": "hello",
			"textfieldControlName2": "world"
		},
		"parameters": [
			{
				"id": "textfieldControlName1",
				"type": "string",
				"default": "",
				"role": "new_column",
				"required": true
			},
			{
				"id": "textfieldControlName2",
				"type": "string",
				"default": "",
				"role": "new_column"
			}
		],
		"uihints": {
			"id": "GroupName",
			"parameter_info": [
				{
					"parameter_ref": "textfieldControlName1",
					"label": {
						"default": "First Name"
					},
					"description": {
						"default": "Enter a first name"
					}
				},
				{
					"parameter_ref": "textfieldControlName2",
					"label": {
						"default": "Last Name"
					},
					"description": {
						"default": "Enter a last name"
					}
				}
			],
			"group_info": [
				{
					"id": "Full Name",
					"type": "controls",
					"parameter_refs": [
						"textfieldControlName1",
						"textfieldControlName2"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		],
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "warning",
						"message": {
							"default": "First name cannot be empty and Last name cannot contain first name.",
							"resource_key": "textfieldControlName_invalid"
						},
						"focus_parameter_ref": "textfieldControlName2"
					},
					"evaluate": {
						"and": [
							{
								"condition": {
									"parameter_ref": "textfieldControlName1",
									"op": "isNotEmpty"
								}
							},
							{
								"condition": {
									"parameter_ref": "textfieldControlName2",
									"op": "notContains",
									"parameter_2_ref": "textfieldControlName1"
								}
							}
						]
					}
				}
			}
		],
		"resources": {
			"textfieldControlName_invalid": "First name cannot be empty and Last name cannot contain first name."
		}
	}
});
_defineConstant("NUMBER_GROUP_ERROR_PROPS_INFO", {
	"title": "Group Type: String Group Conditions",
	"parameterDef": {
		"current_parameters": {
			"numberfieldControlName1": 1,
			"numberfieldControlName2": 100
		},
		"parameters": [
			{
				"id": "numberfieldControlName1",
				"type": "integer",
				"default": null
			},
			{
				"id": "numberfieldControlName2",
				"type": "integer",
				"default": 100
			}
		],
		"uihints": {
			"id": "GroupName",
			"parameter_info": [
				{
					"parameter_ref": "numberfieldControlName1",
					"label": {
						"default": "Lower Limit"
					},
					"description": {
						"default": "Enter a number less than upper limit"
					}
				},
				{
					"parameter_ref": "numberfieldControlName2",
					"label": {
						"default": "Upper Limit"
					},
					"description": {
						"default": "Enter a number greater than lower limit"
					}
				}
			],
			"group_info": [
				{
					"id": "Full Name",
					"type": "controls",
					"parameter_refs": [
						"numberfieldControlName1",
						"numberfieldControlName2"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		],
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "error",
						"message": {
							"default": "Lower limit cannot be equal to or greater than upper limit.",
							"resource_key": "numberfieldControlName_invalid"
						},
						"focus_parameter_ref": "numberfieldControlName1"
					},
					"evaluate": {
						"and": [
							{
								"condition": {
									"parameter_ref": "numberfieldControlName1",
									"op": "notEquals",
									"parameter_2_ref": "numberfieldControlName2"
								}
							},
							{
								"condition": {
									"parameter_ref": "numberfieldControlName1",
									"op": "lessThan",
									"parameter_2_ref": "numberfieldControlName2"
								}
							}
						]
					}
				}
			}
		],
		"resources": {
			"numberfieldControlName_invalid": "Lower limit cannot be equal to or greater than upper limit."
		}
	}
});

_defineConstant("VISIBLE_GROUP_PROPS_INFO", {
	"title": "Group Type: String Group Conditions",
	"parameterDef": {
		"current_parameters": {
			"textfieldControlName1": "hello",
			"checkboxVisible": false,
			"textfieldControlName2": "world",
			"radiosetColor": "blue"
		},
		"parameters": [
			{
				"id": "textfieldControlName1",
				"type": "string",
				"default": "",
				"role": "new_column",
				"required": true
			},
			{
				"id": "checkboxVisible",
				"type": "boolean",
				"enum": [
					"Add Description"
				],
				"default": ""
			},
			{
				"id": "textfieldControlName2",
				"type": "string",
				"default": "",
				"role": "new_column"
			},
			{
				"id": "radiosetColor",
				"enum": [
					"red",
					"blue",
					"green"
				]
			}
		],
		"uihints": {
			"id": "GroupName",
			"parameter_info": [
				{
					"parameter_ref": "textfieldControlName1",
					"label": {
						"default": "First Name"
					},
					"description": {
						"default": "Enter a first name"
					}
				},
				{
					"parameter_ref": "checkboxVisible",
					"label": {
						"default": "Advanced options"
					},
					"description": {
						"default": "Show advanced options"
					}
				},
				{
					"parameter_ref": "textfieldControlName2",
					"label": {
						"default": "Last Name"
					},
					"description": {
						"default": "Enter a last name"
					}
				},
				{
					"parameter_ref": "radiosetColor",
					"label": {
						"default": "Favorite color"
					},
					"description": {
						"default": "Pick a color"
					}
				}
			],
			"group_info": [
				{
					"id": "Full Name",
					"type": "controls",
					"parameter_refs": [
						"textfieldControlName1",
						"checkboxVisible",
						"textfieldControlName2",
						"radiosetColor"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		],
		"conditions": [
			{
				"visible": {
					"parameter_refs": [
						"textfieldControlName2",
						"radiosetColor"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "checkboxVisible",
							"op": "equals",
							"value": true
						}
					}
				}
			}
		]
	}
});

_defineConstant("ENABLED_GROUP_PROPS_INFO", {
	"title": "Group Type: String Group Conditions",
	"parameterDef": {
		"current_parameters": {
			"textfieldControlName1": "hello",
			"enablingCheckbox": false,
			"textfieldControlName2": "world",
			"radiosetColor": "blue"
		},
		"parameters": [
			{
				"id": "textfieldControlName1",
				"type": "string",
				"default": "",
				"role": "new_column",
				"required": true
			},
			{
				"id": "enablingCheckbox",
				"type": "boolean",
				"default": ""
			},
			{
				"id": "textfieldControlName2",
				"type": "string",
				"default": "",
				"role": "new_column"
			},
			{
				"id": "radiosetColor",
				"enum": [
					"red",
					"blue",
					"green"
				]
			}
		],
		"uihints": {
			"id": "GroupName",
			"parameter_info": [
				{
					"parameter_ref": "textfieldControlName1",
					"label": {
						"default": "First Name"
					},
					"description": {
						"default": "Enter a first name"
					}
				},
				{
					"parameter_ref": "enablingCheckbox",
					"label": {
						"default": "Advanced Options"
					},
					"description": {
						"default": "Enable advanced options"
					}
				},
				{
					"parameter_ref": "textfieldControlName2",
					"label": {
						"default": "Last Name"
					},
					"description": {
						"default": "Enter a last name"
					}
				},
				{
					"parameter_ref": "radiosetColor",
					"label": {
						"default": "Favorite color"
					},
					"description": {
						"default": "Pick a color"
					}
				}
			],
			"group_info": [
				{
					"id": "Full Name",
					"type": "controls",
					"parameter_refs": [
						"textfieldControlName1",
						"enablingCheckbox",
						"textfieldControlName2",
						"radiosetColor"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		],
		"conditions": [
			{
				"enabled": {
					"parameter_refs": [
						"textfieldControlName2",
						"radiosetColor"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "enablingCheckbox",
							"op": "equals",
							"value": true
						}
					}
				}
			}
		]
	}
});

_defineConstant("ENUM_FILTER_INFO", {
	"title": "Filtered Enumeration Title",
	"parameterDef": {
		"current_parameters": {
			"filter_radios": false,
			"radioset_filtered": ""
		},
		"parameters": [
			{
				"id": "filter_radios",
				"type": "boolean"
			},
			{
				"id": "radioset_filtered",
				"enum": [
					"red",
					"orange",
					"yellow",
					"green"
				],
				"required": true
			}
		],
		"uihints": {
			"id": "numberfieldControlName",
			"parameter_info": [
				{
					"parameter_ref": "filter_radios",
					"label": {
						"default": "Filter the radio buttons"
					},
					"description": {
						"default": "Check this box to remove the 'Orange' radio button option"
					}
				},
				{
					"parameter_ref": "radioset_filtered",
					"label": {
						"default": "Filterable radio buttons"
					},
					"description": {
						"default": "This set of radio buttons can be filtered"
					},
					"orientation": "vertical"
				}
			],
			"group_info": [
				{
					"id": "Radiosets",
					"label": {
						"default": "Radios"
					},
					"parameter_refs": [
						"filter_radios",
						"radioset_filtered"
					]
				}
			]
		},
		"dataset_metadata": [
			{
				"fields": []
			}
		],
		"conditions": [
			{
				"enum_filter": {
					"target": {
						"parameter_ref": "radioset_filtered",
						"values": [
							"red",
							"yellow",
							"green"
						]
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "filter_radios",
							"op": "equals",
							"value": true
						}
					}
				}
			}
		],
		"resources": {
			"radioset_filtered.red.label": "Red radio",
			"radioset_filtered.orange.label": "Orange radio",
			"radioset_filtered.yellow.label": "Yellow radio",
			"radioset_filtered.green.label": "Green radio"
		}
	}
});

_defineConstant("FILTER_INFO", {
	"title": "Filter Schema Title",
	"parameterDef": {
		"current_parameters": {
			"fields_filter_or": []
		},
		"parameters": [
			{
				"id": "fields_filter_or",
				"type": "array[string]",
				"role": "column"
			}
		],
		"uihints": {
			"id": "filter",
			"icon": "images/default.svg",
			"label": {
				"default": "Filter Fields"
			},
			"parameter_info": [
				{
					"parameter_ref": "fields_filter_or",
					"label": {
						"default": "Filter by Type or Measurement"
					},
					"description": {
						"default": "Filters out all fields without a 'type' of 'integer' or 'measurement' of 'set'.  Should be all 'drug*' and 'age*' fields."
					}
				}
			],
			"group_info": [
				{
					"id": "selectcolumns-filter",
					"label": {
						"default": "Filter"
					},
					"type": "controls",
					"parameter_refs": [
						"fields_filter_or"
					]
				}
			]
		},
		"conditions": [
			{
				"filter": {
					"parameter_ref": "fields_filter_or",
					"evaluate": {
						"or": [
							{
								"condition": {
									"op": "dmMeasurement",
									"value": "set"
								}
							},
							{
								"condition": {
									"op": "dmType",
									"value": "integer"
								}
							}
						]
					}
				}
			}
		],
		"dataset_metadata": [
			{
				"fields": [
					{
						"name": "age",
						"type": "integer",
						"metadata": {
							"description": "",
							"measure": "range",
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
						"name": "Na",
						"type": "double",
						"metadata": {
							"description": "",
							"measure": "range",
							"modeling_role": "input"
						}
					},
					{
						"name": "drug",
						"type": "string",
						"metadata": {
							"description": "",
							"measure": "set",
							"modeling_role": "input"
						}
					},
					{
						"name": "age2",
						"type": "integer",
						"metadata": {
							"description": "",
							"measure": "range",
							"modeling_role": "input"
						}
					},
					{
						"name": "BP2",
						"type": "string",
						"metadata": {
							"description": "",
							"measure": "discrete",
							"modeling_role": "input"
						}
					},
					{
						"name": "Na2",
						"type": "double",
						"metadata": {
							"description": "",
							"measure": "range",
							"modeling_role": "input"
						}
					},
					{
						"name": "drug2",
						"type": "string",
						"metadata": {
							"description": "",
							"measure": "set",
							"modeling_role": "input"
						}
					},
					{
						"name": "age3",
						"type": "integer",
						"metadata": {
							"description": "",
							"measure": "range",
							"modeling_role": "input"
						}
					},
					{
						"name": "BP3",
						"type": "string",
						"metadata": {
							"description": "",
							"measure": "discrete",
							"modeling_role": "input"
						}
					},
					{
						"name": "Na3",
						"type": "double",
						"metadata": {
							"description": "",
							"measure": "range",
							"modeling_role": "input"
						}
					},
					{
						"name": "drug3",
						"type": "string",
						"metadata": {
							"description": "",
							"measure": "set",
							"modeling_role": "input"
						}
					},
					{
						"name": "age4",
						"type": "integer",
						"metadata": {
							"description": "",
							"measure": "range",
							"modeling_role": "input"
						}
					},
					{
						"name": "BP4",
						"type": "string",
						"metadata": {
							"description": "",
							"measure": "discrete",
							"modeling_role": "input"
						}
					},
					{
						"name": "Na4",
						"type": "double",
						"metadata": {
							"description": "",
							"measure": "range",
							"modeling_role": "input"
						}
					},
					{
						"name": "drug4",
						"type": "string",
						"metadata": {
							"description": "",
							"measure": "set",
							"modeling_role": "input"
						}
					}
				]
			}
		]
	}
});
