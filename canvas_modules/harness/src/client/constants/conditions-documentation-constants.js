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
_defineConstant("LIST_ERROR_PROPS_INFO", {
	"title": "List Title",
	"parameterDef": {
		"current_parameters": {
			"listControlName": ["list1", "list2", "list3", ""]
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
						"default": "Show error if list is empty"
					},
					"control": "list",
					"moveable_rows": true
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
		},
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "error",
						"message": {
							"default": "list cannot be empty",
							"resource_key": "listControlName_not_empty"
						},
						"focus_parameter_ref": "listControlName"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "listControlName",
							"op": "isNotEmpty"
						}
					}
				}
			}
		],
		"resources": {
			"listControlName_not_empty": "list cannot be empty"
		}
	}
});
_defineConstant("LIST_WARNING_PROPS_INFO", {
	"title": "List Title",
	"parameterDef": {
		"current_parameters": {
			"listNumberControlName": [10, 20, 30, null]
		},
		"parameters": [
			{
				"id": "listNumberControlName",
				"type": "array[integer]",
				"default": "listNumberPlaceholderText"
			}
		],
		"uihints": {
			"id": "listNumberControlName",
			"parameter_info": [
				{
					"parameter_ref": "listNumberControlName",
					"label": {
						"default": "List Control Name"
					},
					"description": {
						"default": "Show warning if list is empty"
					},
					"control": "list"
				}
			],
			"group_info": [
				{
					"id": "List Number Control",
					"type": "controls",
					"parameter_refs": [
						"listNumberControlName"
					]
				}
			]
		},
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "warning",
						"message": {
							"default": "list cannot be empty",
							"resource_key": "listNumberControlName_not_empty"
						},
						"focus_parameter_ref": "listNumberControlName"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "listNumberControlName",
							"op": "notEquals",
							"value": []
						}
					}
				}
			}
		],
		"resources": {
			"listNumberControlName_not_empty": "list cannot be empty"
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
							"op": "equals",
							"value": true
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
_defineConstant("MULTISELECT_ERROR_PROPS_INFO", {
	"title": "Multiselect Title",
	"parameterDef": {
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
				]
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
						"default": "Select multiple options from the 'multiselect' dropdown, besides 'red'"
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
		},
		"conditions": [
			{
				"validation": {
					"fail_message": {
						"type": "error",
						"message": {
							"default": "an option must be selected.",
							"resource_key": "multiselectList_invalid"
						},
						"focus_parameter_ref": "multiselectList"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "multiselectList",
							"op": "notContains",
							"value": "red"
						}
					}
				}
			}
		],
		"resources": {
			"multiselectList_invalid": "The option red should not be selected."
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
							"default": "Table must contain at least one row.",
							"resource_key": "structureTableList_invalid"
						},
						"focus_parameter_ref": "structureTableList"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "structureTableList",
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
							"default": "Number must be between 0 and 130.",
							"resource_key": "new_number_invalid"
						},
						"focus_parameter_ref": "structureTableList"
					},
					"evaluate": {
						"and": [
							{
								"condition": {
									"parameter_ref": "structureTableList[2]",
									"op": "greaterThan",
									"value": 0
								}
							},
							{
								"condition": {
									"parameter_ref": "structureTableList[2]",
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
			"structureTableList_invalid": "Table must contain at least one row.",
			"new_number_invalid": "Number must be between 0 and 130."
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
						"focus_parameter_ref": "structureTableList[1]"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "structureTableList[1]",
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
						"focus_parameter_ref": "structurelisteditorList[0]"
					},
					"evaluate": {
						"condition": {
							"parameter_ref": "structurelisteditorList[0]",
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
						"focus_parameter_ref": "structurelisteditorList[1]"
					},
					"evaluate": {
						"or": [
							{
								"condition": {
									"parameter_ref": "structurelisteditorList[1]",
									"op": "notContains",
									"value": "<"
								}
							},
							{
								"condition": {
									"parameter_ref": "structurelisteditorList[1]",
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

_defineConstant("PANELS_PROPS_INFO", {
	"title": "Panels",
	"parameterDef": {
		"titleDefinition": {
			"title": "Panels",
			"editable": false
		},
		"current_parameters": {
			"disablePanelLevel1": false,
			"hidePanelLevel1": false,
			"disablePanelLevel2": false,
			"hidePanelLevel2": false,
			"textfield1": 1,
			"textfield2": 2,
			"disablePanelLevel3": false,
			"hidePanelLevel3": false,
			"textfield3": 3
		},
		"parameters": [
			{
				"id": "disablePanelLevel1",
				"type": "boolean"
			},
			{
				"id": "hidePanelLevel1",
				"type": "boolean"
			},
			{
				"id": "disablePanelLevel2",
				"type": "boolean"
			},
			{
				"id": "hidePanelLevel2",
				"type": "boolean"
			},
			{
				"id": "textfield1",
				"type": "string",
				"role": "new_column"
			},
			{
				"id": "textfield2",
				"type": "string",
				"role": "new_column"
			},
			{
				"id": "disablePanelLevel3",
				"type": "boolean"
			},
			{
				"id": "hidePanelLevel3",
				"type": "boolean"
			},
			{
				"id": "textfield3",
				"type": "string",
				"role": "new_column"
			}
		],
		"uihints": {
			"id": "PanelsPanel",
			"parameter_info": [
				{
					"parameter_ref": "disablePanelLevel1",
					"label": {
						"default": "Disable 'Level1' panel"
					},
					"description": {
						"default": "Disable 'Level1' panel"
					}
				},
				{
					"parameter_ref": "hidePanelLevel1",
					"label": {
						"default": "Hide 'Level1' panel"
					},
					"description": {
						"default": "Hide 'Level1' panel"
					}
				},
				{
					"parameter_ref": "disablePanelLevel2",
					"label": {
						"default": "Disable 'Level2' panel"
					},
					"description": {
						"default": "Disable 'Level2' panel"
					}
				},
				{
					"parameter_ref": "hidePanelLevel2",
					"label": {
						"default": "Hide 'Level2' panel"
					},
					"description": {
						"default": "Hide 'Level2' panel"
					}
				},
				{
					"parameter_ref": "textfield1",
					"label": {
						"default": "textfield1"
					}
				},
				{
					"parameter_ref": "textfield2",
					"label": {
						"default": "textfield2"
					}
				},
				{
					"parameter_ref": "disablePanelLevel3",
					"label": {
						"default": "Disable 'Level3' panel"
					},
					"description": {
						"default": "Disable 'Level3' panel"
					}
				},
				{
					"parameter_ref": "hidePanelLevel3",
					"label": {
						"default": "Hide 'Level3' panel"
					},
					"description": {
						"default": "Hide 'Level3' panel"
					}
				},
				{
					"parameter_ref": "textfield3",
					"label": {
						"default": "textfield3"
					}
				}
			],
			"group_info": [
				{
					"id": "panels-in-panels",
					"label": {
						"default": "Panels within Panels"
					},
					"type": "controls",
					"parameter_refs": [
						"disablePanelLevel1",
						"hidePanelLevel1"
					],
					"group_info": [
						{
							"id": "Level1",
							"type": "textPanel"
						},
						{
							"id": "level1",
							"label": {
								"default": "Level1"
							},
							"type": "panels",
							"group_info": [
								{
									"id": "level2buttons",
									"type": "controls",
									"parameter_refs": [
										"disablePanelLevel2",
										"hidePanelLevel2"
									]
								},
								{
									"id": "Level2",
									"type": "textPanel"
								},
								{
									"id": "level2",
									"label": {
										"default": "Level2"
									},
									"type": "controls",
									"parameter_refs": [
										"textfield1",
										"textfield2",
										"disablePanelLevel3",
										"hidePanelLevel3"
									],
									"group_info": [
										{
											"id": "Level3",
											"type": "textPanel"
										},
										{
											"id": "level3",
											"label": {
												"default": "Level3"
											},
											"type": "panels",
											"group_info": [
												{
													"id": "level3control",
													"type": "controls",
													"parameter_refs": [
														"textfield3"
													]
												}
											]
										}
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
		],
		"conditions": [
			{
				"enabled": {
					"group_refs": [
						"level1"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "disablePanelLevel1",
							"op": "equals",
							"value": false
						}
					}
				}
			},
			{
				"visible": {
					"group_refs": [
						"level1"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "hidePanelLevel1",
							"op": "equals",
							"value": false
						}
					}
				}
			},
			{
				"enabled": {
					"parameter_refs": [
						"hidePanelLevel1"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "disablePanelLevel1",
							"op": "equals",
							"value": false
						}
					}
				}
			},
			{
				"enabled": {
					"group_refs": [
						"level2"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "disablePanelLevel2",
							"op": "equals",
							"value": false
						}
					}
				}
			},
			{
				"visible": {
					"group_refs": [
						"level2"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "hidePanelLevel2",
							"op": "equals",
							"value": false
						}
					}
				}
			},
			{
				"enabled": {
					"group_refs": [
						"level3"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "disablePanelLevel3",
							"op": "equals",
							"value": false
						}
					}
				}
			},
			{
				"visible": {
					"group_refs": [
						"level3"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "hidePanelLevel3",
							"op": "equals",
							"value": false
						}
					}
				}
			},
			{
				"enabled": {
					"parameter_refs": [
						"disablePanelLevel1"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "hidePanelLevel1",
							"op": "equals",
							"value": false
						}
					}
				}
			},
			{
				"enabled": {
					"parameter_refs": [
						"hidePanelLevel2"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "disablePanelLevel2",
							"op": "equals",
							"value": false
						}
					}
				}
			},
			{
				"enabled": {
					"parameter_refs": [
						"disablePanelLevel2"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "hidePanelLevel2",
							"op": "equals",
							"value": false
						}
					}
				}
			},
			{
				"enabled": {
					"parameter_refs": [
						"hidePanelLevel3"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "disablePanelLevel3",
							"op": "equals",
							"value": false
						}
					}
				}
			},
			{
				"enabled": {
					"parameter_refs": [
						"disablePanelLevel3"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "hidePanelLevel3",
							"op": "equals",
							"value": false
						}
					}
				}
			}
		]
	}
});
_defineConstant("TEXT_PANEL_PROPS_INFO", {
	"title": "Text Panel",
	"parameterDef": {
		"titleDefinition": {
			"title": "textPanel",
			"editable": false
		},
		"current_parameters": {
			"disableTextPanel": false,
			"hideTextPanel": false
		},
		"parameters": [
			{
				"id": "disableTextPanel",
				"type": "boolean"
			},
			{
				"id": "hideTextPanel",
				"type": "boolean"
			}
		],
		"uihints": {
			"id": "TextPanelId",
			"parameter_info": [
				{
					"parameter_ref": "disableTextPanel",
					"label": {
						"default": "Disable 'Oranges' text panel"
					},
					"description": {
						"default": "Disable Oranges text panel"
					}
				},
				{
					"parameter_ref": "hideTextPanel",
					"label": {
						"default": "Hide 'Apples' text panel"
					},
					"description": {
						"default": "Hide Apples text panel"
					}
				}
			],
			"group_info": [
				{
					"id": "panels",
					"label": {
						"default": "Text Panels"
					},
					"type": "panels",
					"group_info": [
						{
							"id": "panels",
							"type": "controls",
							"parameter_refs": [
								"disableTextPanel"
							],
							"group_info": [
								{
									"id": "orange-panel",
									"type": "textPanel",
									"label": {
										"default": "Oranges"
									},
									"description": {
										"default": "An orange tree can grow to reach 30 feet and live for over a hundred years."
									}
								}
							]
						},
						{
							"id": "panels",
							"type": "controls",
							"parameter_refs": [
								"hideTextPanel"
							],
							"group_info": [
								{
									"id": "apple-panel",
									"type": "textPanel",
									"label": {
										"default": "Apples"
									},
									"description": {
										"default": "Dwarf apple trees only grow to be between 5 and 7 feet tall."
									}
								}
							]
						}
					]
				}
			]
		},
		"conditions": [
			{
				"enabled": {
					"group_refs": [
						"orange-panel"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "disableTextPanel",
							"op": "equals",
							"value": false
						}
					}
				}
			}, {
				"visible": {
					"group_refs": [
						"apple-panel"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "hideTextPanel",
							"op": "equals",
							"value": false
						}
					}
				}
			}
		]
	}
});
_defineConstant("PANEL_SELECTOR_PROPS_INFO", {
	"title": "PanelSelector",
	"parameterDef": {
		"titleDefinition": {
			"title": "panelSelector",
			"editable": false
		},
		"current_parameters": {
			"disablePanelSelector": true,
			"fruit-color1": "red1",
			"hidePanelSelector": true,
			"fruit-color2": "red2",
			"number": 11
		},
		"parameters": [
			{
				"id": "disablePanelSelector",
				"type": "boolean"
			}, {
				"id": "fruit-color1",
				"enum": [
					"red1",
					"blue1",
					"yellow1"
				]
			}, {
				"id": "hidePanelSelector",
				"type": "boolean"
			}, {
				"id": "fruit-color2",
				"enum": [
					"red2",
					"blue2",
					"yellow2"
				]
			}, {
				"id": "number",
				"type": "double",
				"required": true
			}
		],
		"uihints": {
			"id": "Panel Selector",
			"parameter_info": [
				{
					"parameter_ref": "disablePanelSelector",
					"label": {
						"default": "Disable 'Fruit Color1' Panel Selector"
					},
					"description": {
						"default": "Disable Fruit Color radioset and panelselector"
					}
				}, {
					"parameter_ref": "fruit-color1",
					"label": {
						"default": "Fruit Color1"
					},
					"description": {
						"default": "Shows red, yellow, or blue values"
					}
				}, {
					"parameter_ref": "hidePanelSelector",
					"label": {
						"default": "Hide 'Fruit Color2' Panel Selector"
					},
					"description": {
						"default": "Hide Fruit Color radioset and panelselector"
					}
				}, {
					"parameter_ref": "fruit-color2",
					"label": {
						"default": "Fruit Color2"
					},
					"description": {
						"default": "Shows red, yellow, or blue values"
					}
				}, {
					"parameter_ref": "number",
					"label": {
						"default": "number"
					},
					"description": {
						"default": "A control between a panelSelector control.  Also used to display dynamic text in panel text."
					}
				}
			],
			"group_info": [
				{
					"id": "panel-selectors",
					"label": {
						"default": "Panel Selectors"
					},
					"type": "panels",
					"group_info": [
						{
							"id": "panel-selector1",
							"label": {
								"default": "Panel Selector"
							},
							"type": "controls",
							"parameter_refs": [
								"disablePanelSelector",
								"fruit-color1",
								"number"
							],
							"group_info": [
								{
									"id": "dynamicTextPercent",
									"type": "textPanel",
									"label": {
										"default": "Dynamic Percent"
									},
									"description": {
										"default": "Percent: ${percent(number, 6)} with 6 decimals. Percent: ${percent(number,2)} with 2 decimals"
									}
								},
								{
									"id": "dynamicTextSum",
									"type": "textPanel",
									"label": {
										"default": "Dynamic Sum"
									},
									"description": {
										"default": "Sum: ${sum(number, number)} with (number, number). Sum: ${sum(number, 2, number)} with (number, 2, number)"
									}
								},
								{
									"id": "panel-selector-fields1",
									"label": {
										"default": "Colors"
									},
									"type": "panelSelector",
									"depends_on_ref": "fruit-color1",
									"group_info": [
										{
											"id": "red1",
											"type": "textPanel",
											"description": {
												"default": "Apples ripen six to 10 times faster at room temperature than if they are refrigerated."
											}
										},
										{
											"id": "blue1",
											"type": "textPanel",
											"label": {
												"default": "Blueberries"
											},
											"description": {
												"default": "Blueberries freeze in just 4 minutes."
											}
										},
										{
											"id": "yellow1",
											"type": "textPanel",
											"label": {
												"default": "Lemons"
											},
											"description": {
												"default": "Lemons are a hybrid between a sour orange and a citron."
											}
										}
									]
								}
							]
						},
						{
							"id": "panel-selector2",
							"label": {
								"default": "Panel Selector"
							},
							"type": "controls",
							"parameter_refs": [
								"hidePanelSelector",
								"fruit-color2"
							],
							"group_info": [
								{
									"id": "panel-selector-fields2",
									"label": {
										"default": "Colors"
									},
									"type": "panelSelector",
									"depends_on_ref": "fruit-color2",
									"group_info": [
										{
											"id": "red2",
											"type": "textPanel",
											"description": {
												"default": "Apples ripen six to 10 times faster at room temperature than if they are refrigerated."
											}
										},
										{
											"id": "blue2",
											"type": "textPanel",
											"label": {
												"default": "Blueberries"
											},
											"description": {
												"default": "Blueberries freeze in just 4 minutes."
											}
										},
										{
											"id": "yellow2",
											"type": "textPanel",
											"label": {
												"default": "Lemons"
											},
											"description": {
												"default": "Lemons are a hybrid between a sour orange and a citron."
											}
										}
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
		],
		"conditions": [
			{
				"enabled": {
					"parameter_refs": [
						"number"
					],
					"group_refs": [
						"panel-selector-fields1",
						"dynamicTextPercent",
						"dynamicTextSum"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "disablePanelSelector",
							"op": "equals",
							"value": false
						}
					}
				}
			}, {
				"visible": {
					"group_refs": [
						"panel-selector-fields2"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "hidePanelSelector",
							"op": "equals",
							"value": false
						}
					}
				}
			}
		]
	}
});
_defineConstant("COLUMNSELECTION_PROPS_INFO", {
	"title": "ColumnSelection",
	"parameterDef": {
		"titleDefinition": {
			"title": "columnSelection",
			"editable": false
		},
		"current_parameters": {
			"disableColumnSelectionPanel": false,
			"field1_panel": "age",
			"field2_panel": "BP",
			"hideColumnSelectionPanel": false,
			"selectcolumn": "",
			"selectcolumns": []
		},
		"parameters": [
			{
				"id": "disableColumnSelectionPanel",
				"type": "boolean"
			},
			{
				"id": "field1_panel",
				"type": "string",
				"role": "column",
				"required": true
			},
			{
				"id": "field2_panel",
				"type": "string",
				"role": "column",
				"required": true
			},
			{
				"id": "hideColumnSelectionPanel",
				"type": "boolean"
			},
			{
				"id": "selectcolumn",
				"type": "string",
				"role": "column",
				"required": true
			},
			{
				"id": "selectcolumns",
				"type": "array[string]",
				"role": "column",
				"required": true
			}
		],
		"uihints": {
			"id": "ColumnSelectionPanel",
			"parameter_info": [
				{
					"parameter_ref": "disableColumnSelectionPanel",
					"label": {
						"default": "Disable 'Field1' and 'Field2'"
					},
					"description": {
						"default": "Disable 'Field1' and 'Field2'"
					}
				}, {
					"parameter_ref": "field1_panel",
					"label": {
						"default": "Field1"
					},
					"description": {
						"default": "selectcolumn parameter shared with Field2"
					},
					"text_before": {
						"default": "Field1 shares values with Field2"
					}
				}, {
					"parameter_ref": "field2_panel",
					"label": {
						"default": "Field2"
					},
					"description": {
						"default": "selectcolumn parameter shared with Field1"
					}
				}, {
					"parameter_ref": "hideColumnSelectionPanel",
					"label": {
						"default": "Hide 'Select Field' and 'Select Fields'"
					},
					"description": {
						"default": "Hide 'Select Field' and 'Select Fields'"
					}
				}, {
					"parameter_ref": "selectcolumn",
					"label": {
						"default": "Select Field"
					},
					"description": {
						"default": "selectcolumn control where values are shared with selectcolumns 'Select Fields'"
					},
					"text_before": {
						"default": "Select Field shares values with Select Fields"
					}
				}, {
					"parameter_ref": "selectcolumns",
					"label": {
						"default": "Select Fields"
					},
					"description": {
						"default": "selectcolumns control where values are shared with selectcolumns 'Select Field'"
					}
				}
			],
			"group_info": [
				{
					"id": "column-selections",
					"label": {
						"default": "Column Selection"
					},
					"type": "panels",
					"group_info": [
						{
							"id": "disable-selectcolumn-values",
							"label": {
								"default": "Values"
							},
							"type": "controls",
							"parameter_refs": [
								"disableColumnSelectionPanel"
							],
							"group_info": [
								{
									"id": "selectcolumn-values",
									"label": {
										"default": "Values"
									},
									"type": "columnSelection",
									"parameter_refs": [
										"field1_panel",
										"field2_panel"
									]
								}
							]
						},
						{
							"id": "hide-column-selection-panel",
							"label": {
								"default": "Column Selection"
							},
							"type": "controls",
							"parameter_refs": [
								"hideColumnSelectionPanel"
							],
							"group_info": [
								{
									"id": "column-selection-panel",
									"label": {
										"default": "Column Selection"
									},
									"type": "columnSelection",
									"parameter_refs": [
										"selectcolumn",
										"selectcolumns"
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
				"fields": fields
			}
		],
		"conditions": [
			{
				"enabled": {
					"group_refs": [
						"selectcolumn-values"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "disableColumnSelectionPanel",
							"op": "equals",
							"value": false
						}
					}
				}
			},
			{
				"visible": {
					"group_refs": [
						"column-selection-panel"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "hideColumnSelectionPanel",
							"op": "equals",
							"value": false
						}
					}
				}
			}
		]
	}
});
_defineConstant("SUMMARY_PANEL_PROPS_INFO", {
	"title": "summaryPanel",
	"parameterDef": {
		"titleDefinition": {
			"title": "summaryPanel",
			"editable": false
		},
		"current_parameters": {
			"enableSummary": true,
			"structuretable_summary1": [
				[
					1,
					"BP"
				],
				[
					2,
					"Age"
				]
			],
			"structuretable_summary2": [
				[
					1,
					"Na"
				],
				[
					2,
					"Drug"
				]
			],
			"hideSummary": false,
			"structuretable_summary3": [
				[
					1,
					"BP"
				],
				[
					2,
					"Age"
				]
			]
		},
		"parameters": [
			{
				"id": "enableSummary",
				"type": "boolean",
				"default": ""
			},
			{
				"id": "structuretable_summary1",
				"type": "map[string,structuretable_summary1]",
				"role": "column",
				"default": []
			},
			{
				"id": "structuretable_summary2",
				"type": "map[string,structuretable_summary2]",
				"role": "column",
				"default": []
			},
			{
				"id": "hideSummary",
				"type": "boolean",
				"default": ""
			},
			{
				"id": "structuretable_summary3",
				"type": "map[string,structuretable_summary3]",
				"role": "column",
				"default": []
			}
		],
		"complex_types": [
			{
				"id": "structuretable_summary1",
				"key_definition": {
					"id": "readonly",
					"type": "integer"
				},
				"parameters": [
					{
						"id": "field",
						"type": "string",
						"role": "column"
					}
				]
			},
			{
				"id": "structuretable_summary2",
				"key_definition": {
					"id": "readonly",
					"type": "integer"
				},
				"parameters": [
					{
						"id": "field",
						"type": "string",
						"role": "column"
					}
				]
			}, {
				"id": "structuretable_summary3",
				"key_definition": {
					"id": "readonly",
					"type": "integer"
				},
				"parameters": [
					{
						"id": "field",
						"type": "string",
						"role": "column"
					}
				]
			}
		],
		"uihints": {
			"id": "PanelsPanel",
			"parameter_info": [
				{
					"parameter_ref": "enableSummary",
					"label": {
						"default": "enable summary"
					},
					"description": {
						"default": "Enable summary"
					}
				}, {
					"parameter_ref": "structuretable_summary1",
					"label": {
						"default": "Configure Fields"
					},
					"description": {
						"default": "Configure fields"
					}
				}, {
					"parameter_ref": "structuretable_summary2",
					"label": {
						"default": "Configure Fields"
					},
					"description": {
						"default": "Configure fields"
					}
				}, {
					"parameter_ref": "hideSummary",
					"label": {
						"default": "hide summary"
					},
					"description": {
						"default": "Hide summary"
					}
				}, {
					"parameter_ref": "structuretable_summary3",
					"label": {
						"default": "Configure Fields"
					},
					"description": {
						"default": "Configure fields"
					}
				}
			],
			"complex_type_info": [
				{
					"complex_type_ref": "structuretable_summary1",
					"label": {
						"default": "Configure Fields"
					},
					"key_definition": {
						"parameter_ref": "readonly",
						"label": {
							"default": "Index"
						},
						"width": 15,
						"generated_values": {
							"operation": "index"
						},
						"control": "readonly",
						"summary": true
					},
					"parameters": [
						{
							"parameter_ref": "field",
							"label": {
								"default": "Field"
							},
							"width": 26,
							"summary": true
						}
					]
				}, {
					"complex_type_ref": "structuretable_summary2",
					"label": {
						"default": "Configure Fields"
					},
					"key_definition": {
						"parameter_ref": "readonly",
						"label": {
							"default": "Index"
						},
						"width": 15,
						"generated_values": {
							"operation": "index"
						},
						"control": "readonly",
						"summary": true
					},
					"parameters": [
						{
							"parameter_ref": "field",
							"label": {
								"default": "Field"
							},
							"width": 26,
							"summary": true
						}
					]
				}, {
					"complex_type_ref": "structuretable_summary3",
					"label": {
						"default": "Configure Fields"
					},
					"key_definition": {
						"parameter_ref": "readonly",
						"label": {
							"default": "Index"
						},
						"width": 15,
						"generated_values": {
							"operation": "index"
						},
						"control": "readonly",
						"summary": true
					},
					"parameters": [
						{
							"parameter_ref": "field",
							"label": {
								"default": "Field"
							},
							"width": 26,
							"summary": true
						}
					]
				}
			],
			"group_info": [
				{
					"id": "Tables",
					"type": "panels",
					"group_info": [
						{
							"id": "summary_panel_category",
							"type": "panels",
							"label": {
								"default": "Summary Panel"
							},
							"group_info": [
								{
									"id": "summary_info",
									"type": "textPanel",
									"description": {
										"default": "Configure fields link and summary will be disabled or hidden using the below checkboxes."
									}
								},
								{
									"id": "enable_summary_checkbox",
									"type": "controls",
									"label": {
										"default": "Enable Summary"
									},
									"description": {
										"default": "Configure fields link and summary will be disabled if checkbox is unchecked."
									},
									"parameter_refs": [
										"enableSummary"
									]
								},
								{
									"id": "structuretable-summary-panel1",
									"label": {
										"default": "Configure Fields"
									},
									"type": "summaryPanel",
									"group_info": [
										{
											"id": "structuretable_summary1_panel",
											"type": "columnSelection",
											"parameter_refs": [
												"structuretable_summary1",
												"structuretable_summary2"
											]
										}
									]
								},
								{
									"id": "hide_summary_checkbox",
									"type": "controls",
									"label": {
										"default": "Hide Summary"
									},
									"description": {
										"default": "Configure fields link and summary will be hidden if checkbox is unchecked."
									},
									"parameter_refs": [
										"hideSummary"
									]
								},
								{
									"id": "structuretable-summary-panel2",
									"label": {
										"default": "Configure Fields"
									},
									"type": "summaryPanel",
									"group_info": [
										{
											"id": "structuretable_summary3_panel",
											"parameter_refs": [
												"structuretable_summary3"
											]
										}
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
				"fields": fields
			}
		],
		"conditions": [
			{
				"enabled": {
					"group_refs": [
						"structuretable-summary-panel1"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "enableSummary",
							"op": "equals",
							"value": true
						}
					}
				}
			}, {
				"visible": {
					"group_refs": [
						"structuretable-summary-panel2"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "hideSummary",
							"op": "equals",
							"value": false
						}
					}
				}
			}
		]
	}
});
_defineConstant("TWISTY_PANEL_PROPS_INFO", {
	"title": "TwistyPanel",
	"parameterDef": {
		"titleDefinition": {
			"title": "TwistyPanel",
			"editable": false
		},
		"current_parameters": {
			"disableTwistyPanel": false,
			"numberfield1": 1,
			"numberfield2": 2,
			"hideTwistyPanel": false,
			"numberfield3": 3
		},
		"parameters": [
			{
				"id": "disableTwistyPanel",
				"type": "boolean"
			},
			{
				"id": "numberfield1",
				"type": "integer"
			},
			{
				"id": "numberfield2",
				"type": "integer"
			},
			{
				"id": "hideTwistyPanel",
				"type": "boolean"
			},
			{
				"id": "numberfield3",
				"type": "integer"
			}
		],
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
					"parameter_ref": "disableTwistyPanel",
					"label": {
						"default": "Disable 'Twisty Panel1'"
					},
					"description": {
						"default": "Disable 'Twisty Panel1'"
					}
				}, {
					"parameter_ref": "numberfield1",
					"label": {
						"default": "numberfield1"
					}
				}, {
					"parameter_ref": "numberfield2",
					"label": {
						"default": "numberfield2"
					}
				}, {
					"parameter_ref": "hideTwistyPanel",
					"label": {
						"default": "Hide 'Twisty Panel2'"
					},
					"description": {
						"default": "Hide 'Twisty Panel2'"
					}
				}, {
					"parameter_ref": "numberfield3",
					"label": {
						"default": "numberfield3"
					}
				}
			],
			"group_info": [
				{
					"id": "twisty-panels",
					"label": {
						"default": "Twisty Panels"
					},
					"type": "panels",
					"group_info": [
						{
							"id": "panels",
							"type": "controls",
							"parameter_refs": [
								"disableTwistyPanel"
							],
							"group_info": [
								{
									"id": "twisty-panel1",
									"type": "twistyPanel",
									"label": {
										"default": "Twisty Panel1"
									},
									"group_info": [
										{
											"id": "twisty-panel1-controls",
											"type": "controls",
											"parameter_refs": [
												"numberfield1",
												"numberfield2"
											]
										}
									]
								}
							]
						},
						{
							"id": "panels",
							"type": "controls",
							"parameter_refs": [
								"hideTwistyPanel"
							],
							"group_info": [
								{
									"id": "twisty-panel2",
									"type": "twistyPanel",
									"label": {
										"default": "Twisty Panel2"
									},
									"group_info": [
										{
											"id": "twisty-panel2-controls",
											"type": "controls",
											"parameter_refs": [
												"numberfield3"
											]
										}
									]
								}
							]
						}
					]
				}
			]
		},
		"conditions": [
			{
				"enabled": {
					"group_refs": [
						"twisty-panel1"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "disableTwistyPanel",
							"op": "equals",
							"value": false
						}
					}
				}
			}, {
				"visible": {
					"group_refs": [
						"twisty-panel2"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "hideTwistyPanel",
							"op": "equals",
							"value": false
						}
					}
				}
			}
		],
		"dataset_metadata": []
	}
});

// These are needed for the flyout examples. The ids need to be different than the modal
_defineConstant("PANELS_FLYOUT_PROPS_INFO", {
	"title": "Panels",
	"parameterDef": {
		"titleDefinition": {
			"title": "Panels",
			"editable": false
		},
		"current_parameters": {
			"disablePanelLevel1_flyout": false,
			"hidePanelLevel1_flyout": false,
			"disablePanelLevel2_flyout": false,
			"hidePanelLevel2_flyout": false,
			"textfield1_flyout": 1,
			"textfield2_flyout": 2,
			"disablePanelLevel3_flyout": false,
			"hidePanelLevel3_flyout": false,
			"textfield3_flyout": 3
		},
		"parameters": [
			{
				"id": "disablePanelLevel1_flyout",
				"type": "boolean"
			},
			{
				"id": "hidePanelLevel1_flyout",
				"type": "boolean"
			},
			{
				"id": "disablePanelLevel2_flyout",
				"type": "boolean"
			},
			{
				"id": "hidePanelLevel2_flyout",
				"type": "boolean"
			},
			{
				"id": "textfield1_flyout",
				"type": "string",
				"role": "new_column"
			},
			{
				"id": "textfield2_flyout",
				"type": "string",
				"role": "new_column"
			},
			{
				"id": "disablePanelLevel3_flyout",
				"type": "boolean"
			},
			{
				"id": "hidePanelLevel3_flyout",
				"type": "boolean"
			},
			{
				"id": "textfield3_flyout",
				"type": "string",
				"role": "new_column"
			}
		],
		"uihints": {
			"id": "PanelsPanel",
			"parameter_info": [
				{
					"parameter_ref": "disablePanelLevel1_flyout",
					"label": {
						"default": "Disable 'Level1' panel"
					},
					"description": {
						"default": "Disable 'Level1' panel"
					}
				},
				{
					"parameter_ref": "hidePanelLevel1_flyout",
					"label": {
						"default": "Hide 'Level1' panel"
					},
					"description": {
						"default": "Hide 'Level1' panel"
					}
				},
				{
					"parameter_ref": "disablePanelLevel2_flyout",
					"label": {
						"default": "Disable 'Level2' panel"
					},
					"description": {
						"default": "Disable 'Level2' panel"
					}
				},
				{
					"parameter_ref": "hidePanelLevel2_flyout",
					"label": {
						"default": "Hide 'Level2' panel"
					},
					"description": {
						"default": "Hide 'Level2' panel"
					}
				},
				{
					"parameter_ref": "textfield1_flyout",
					"label": {
						"default": "textfield1"
					}
				},
				{
					"parameter_ref": "textfield2_flyout",
					"label": {
						"default": "textfield2"
					}
				},
				{
					"parameter_ref": "disablePanelLevel3_flyout",
					"label": {
						"default": "Disable 'Level3' panel"
					},
					"description": {
						"default": "Disable 'Level3' panel"
					}
				},
				{
					"parameter_ref": "hidePanelLevel3_flyout",
					"label": {
						"default": "Hide 'Level3' panel"
					},
					"description": {
						"default": "Hide 'Level3' panel"
					}
				},
				{
					"parameter_ref": "textfield3_flyout",
					"label": {
						"default": "textfield3"
					}
				}
			],
			"group_info": [
				{
					"id": "panels-in-panels_flyout",
					"label": {
						"default": "Panels within Panels"
					},
					"type": "controls",
					"parameter_refs": [
						"disablePanelLevel1_flyout",
						"hidePanelLevel1_flyout"
					],
					"group_info": [
						{
							"id": "Level1_flyout",
							"type": "textPanel"
						},
						{
							"id": "level1_flyout",
							"label": {
								"default": "Level1"
							},
							"type": "panels",
							"group_info": [
								{
									"id": "level2buttons_flyout",
									"type": "controls",
									"parameter_refs": [
										"disablePanelLevel2_flyout",
										"hidePanelLevel2_flyout"
									]
								},
								{
									"id": "Level2_flyout",
									"type": "textPanel"
								},
								{
									"id": "level2_flyout",
									"label": {
										"default": "Level2"
									},
									"type": "controls",
									"parameter_refs": [
										"textfield1_flyout",
										"textfield2_flyout",
										"disablePanelLevel3_flyout",
										"hidePanelLevel3_flyout"
									],
									"group_info": [
										{
											"id": "Level3_flyout",
											"type": "textPanel"
										},
										{
											"id": "level3_flyout",
											"label": {
												"default": "Level3"
											},
											"type": "panels",
											"group_info": [
												{
													"id": "level3control_flyout",
													"type": "controls",
													"parameter_refs": [
														"textfield3_flyout"
													]
												}
											]
										}
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
		],
		"conditions": [
			{
				"enabled": {
					"group_refs": [
						"level1_flyout"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "disablePanelLevel1_flyout",
							"op": "equals",
							"value": false
						}
					}
				}
			},
			{
				"visible": {
					"group_refs": [
						"level1_flyout"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "hidePanelLevel1_flyout",
							"op": "equals",
							"value": false
						}
					}
				}
			},
			{
				"enabled": {
					"parameter_refs": [
						"hidePanelLevel1_flyout"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "disablePanelLevel1_flyout",
							"op": "equals",
							"value": false
						}
					}
				}
			},
			{
				"enabled": {
					"group_refs": [
						"level2_flyout"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "disablePanelLevel2_flyout",
							"op": "equals",
							"value": false
						}
					}
				}
			},
			{
				"visible": {
					"group_refs": [
						"level2_flyout"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "hidePanelLevel2_flyout",
							"op": "equals",
							"value": false
						}
					}
				}
			},
			{
				"enabled": {
					"group_refs": [
						"level3_flyout"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "disablePanelLevel3_flyout",
							"op": "equals",
							"value": false
						}
					}
				}
			},
			{
				"visible": {
					"group_refs": [
						"level3_flyout"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "hidePanelLevel3_flyout",
							"op": "equals",
							"value": false
						}
					}
				}
			},
			{
				"enabled": {
					"parameter_refs": [
						"disablePanelLevel1_flyout"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "hidePanelLevel1_flyout",
							"op": "equals",
							"value": false
						}
					}
				}
			},
			{
				"enabled": {
					"parameter_refs": [
						"hidePanelLevel2_flyout"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "disablePanelLevel2_flyout",
							"op": "equals",
							"value": false
						}
					}
				}
			},
			{
				"enabled": {
					"parameter_refs": [
						"disablePanelLevel2_flyout"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "hidePanelLevel2_flyout",
							"op": "equals",
							"value": false
						}
					}
				}
			},
			{
				"enabled": {
					"parameter_refs": [
						"hidePanelLevel3_flyout"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "disablePanelLevel3_flyout",
							"op": "equals",
							"value": false
						}
					}
				}
			},
			{
				"enabled": {
					"parameter_refs": [
						"disablePanelLevel3_flyout"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "hidePanelLevel3_flyout",
							"op": "equals",
							"value": false
						}
					}
				}
			}
		]
	}
});
_defineConstant("TEXT_PANEL_FLYOUT_PROPS_INFO", {
	"title": "Text Panel",
	"parameterDef": {
		"titleDefinition": {
			"title": "textPanel",
			"editable": false
		},
		"current_parameters": {
			"disableTextPanel_flyout": false,
			"hideTextPanel_flyout": false
		},
		"parameters": [
			{
				"id": "disableTextPanel_flyout",
				"type": "boolean"
			},
			{
				"id": "hideTextPanel_flyout",
				"type": "boolean"
			}
		],
		"uihints": {
			"id": "TextPanelId",
			"parameter_info": [
				{
					"parameter_ref": "disableTextPanel_flyout",
					"label": {
						"default": "Disable 'Oranges' text panel"
					},
					"description": {
						"default": "Disable Oranges text panel"
					}
				},
				{
					"parameter_ref": "hideTextPanel_flyout",
					"label": {
						"default": "Hide 'Apples' text panel"
					},
					"description": {
						"default": "Hide Apples text panel"
					}
				}
			],
			"group_info": [
				{
					"id": "panels_flyout",
					"label": {
						"default": "Text Panels"
					},
					"type": "panels",
					"group_info": [
						{
							"id": "panels_flyout",
							"type": "controls",
							"parameter_refs": [
								"disableTextPanel_flyout"
							],
							"group_info": [
								{
									"id": "orange-panel_flyout",
									"type": "textPanel",
									"label": {
										"default": "Oranges"
									},
									"description": {
										"default": "An orange tree can grow to reach 30 feet and live for over a hundred years."
									}
								}
							]
						},
						{
							"id": "panels_flyout",
							"type": "controls",
							"parameter_refs": [
								"hideTextPanel_flyout"
							],
							"group_info": [
								{
									"id": "apple-panel_flyout",
									"type": "textPanel",
									"label": {
										"default": "Apples"
									},
									"description": {
										"default": "Dwarf apple trees only grow to be between 5 and 7 feet tall."
									}
								}
							]
						}
					]
				}
			]
		},
		"conditions": [
			{
				"enabled": {
					"group_refs": [
						"orange-panel_flyout"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "disableTextPanel_flyout",
							"op": "equals",
							"value": false
						}
					}
				}
			}, {
				"visible": {
					"group_refs": [
						"apple-panel_flyout"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "hideTextPanel_flyout",
							"op": "equals",
							"value": false
						}
					}
				}
			}
		]
	}
});
_defineConstant("PANEL_SELECTOR_FLYOUT_PROPS_INFO", {
	"title": "PanelSelector",
	"parameterDef": {
		"titleDefinition": {
			"title": "panelSelector",
			"editable": false
		},
		"current_parameters": {
			"disablePanelSelector_flyout": true,
			"fruit-color1_flyout": "red1_flyout",
			"hidePanelSelector_flyout": true,
			"fruit-color2_flyout": "red2_flyout",
			"number_flyout": 11
		},
		"parameters": [
			{
				"id": "disablePanelSelector_flyout",
				"type": "boolean"
			}, {
				"id": "fruit-color1_flyout",
				"enum": [
					"red1_flyout",
					"blue1_flyout",
					"yellow1_flyout"
				]
			}, {
				"id": "hidePanelSelector_flyout",
				"type": "boolean"
			}, {
				"id": "fruit-color2_flyout",
				"enum": [
					"red2_flyout",
					"blue2_flyout",
					"yellow2_flyout"
				]
			}, {
				"id": "number_flyout",
				"type": "double",
				"required": true
			}
		],
		"uihints": {
			"id": "Panel Selector",
			"parameter_info": [
				{
					"parameter_ref": "disablePanelSelector_flyout",
					"label": {
						"default": "Disable 'Fruit Color1' Panel Selector"
					},
					"description": {
						"default": "Disable Fruit Color radioset and panelselector"
					}
				}, {
					"parameter_ref": "fruit-color1_flyout",
					"label": {
						"default": "Fruit Color1"
					},
					"description": {
						"default": "Shows red, yellow, or blue values"
					}
				}, {
					"parameter_ref": "hidePanelSelector_flyout",
					"label": {
						"default": "Hide 'Fruit Color2' Panel Selector"
					},
					"description": {
						"default": "Hide Fruit Color radioset and panelselector"
					}
				}, {
					"parameter_ref": "fruit-color2_flyout",
					"label": {
						"default": "Fruit Color2"
					},
					"description": {
						"default": "Shows red, yellow, or blue values"
					}
				}, {
					"parameter_ref": "number_flyout",
					"label": {
						"default": "number"
					},
					"description": {
						"default": "A control between a panelSelector control.  Also used to display dynamic text in panel text."
					}
				}
			],
			"group_info": [
				{
					"id": "panel-selectors_flyout",
					"label": {
						"default": "Panel Selectors"
					},
					"type": "panels",
					"group_info": [
						{
							"id": "panel-selector1_flyout",
							"label": {
								"default": "Panel Selector"
							},
							"type": "controls",
							"parameter_refs": [
								"disablePanelSelector_flyout",
								"fruit-color1_flyout",
								"number_flyout"
							],
							"group_info": [
								{
									"id": "dynamicTextPercent_flyout",
									"type": "textPanel",
									"label": {
										"default": "Dynamic Percent"
									},
									"description": {
										"default": "Percent: ${percent(number, 6)} with 6 decimals. Percent: ${percent(number,2)} with 2 decimals"
									}
								},
								{
									"id": "dynamicTextSum_flyout",
									"type": "textPanel",
									"label": {
										"default": "Dynamic Sum"
									},
									"description": {
										"default": "Sum: ${sum(number, number)} with (number, number). Sum: ${sum(number, 2, number)} with (number, 2, number)"
									}
								},
								{
									"id": "panel-selector-fields1_flyout",
									"label": {
										"default": "Colors"
									},
									"type": "panelSelector",
									"depends_on_ref": "fruit-color1_flyout",
									"group_info": [
										{
											"id": "red1_flyout",
											"type": "textPanel",
											"description": {
												"default": "Apples ripen six to 10 times faster at room temperature than if they are refrigerated."
											}
										},
										{
											"id": "blue1_flyout",
											"type": "textPanel",
											"label": {
												"default": "Blueberries"
											},
											"description": {
												"default": "Blueberries freeze in just 4 minutes."
											}
										},
										{
											"id": "yellow1_flyout",
											"type": "textPanel",
											"label": {
												"default": "Lemons"
											},
											"description": {
												"default": "Lemons are a hybrid between a sour orange and a citron."
											}
										}
									]
								}
							]
						},
						{
							"id": "panel-selector2_flyout",
							"label": {
								"default": "Panel Selector"
							},
							"type": "controls",
							"parameter_refs": [
								"hidePanelSelector_flyout",
								"fruit-color2_flyout"
							],
							"group_info": [
								{
									"id": "panel-selector-fields2_flyout",
									"label": {
										"default": "Colors"
									},
									"type": "panelSelector",
									"depends_on_ref": "fruit-color2_flyout",
									"group_info": [
										{
											"id": "red2_flyout",
											"type": "textPanel",
											"description": {
												"default": "Apples ripen six to 10 times faster at room temperature than if they are refrigerated."
											}
										},
										{
											"id": "blue2_flyout",
											"type": "textPanel",
											"label": {
												"default": "Blueberries"
											},
											"description": {
												"default": "Blueberries freeze in just 4 minutes."
											}
										},
										{
											"id": "yellow2_flyout",
											"type": "textPanel",
											"label": {
												"default": "Lemons"
											},
											"description": {
												"default": "Lemons are a hybrid between a sour orange and a citron."
											}
										}
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
		],
		"conditions": [
			{
				"enabled": {
					"parameter_refs": [
						"number_flyout"
					],
					"group_refs": [
						"panel-selector-fields1_flyout",
						"dynamicTextPercent_flyout",
						"dynamicTextSum_flyout"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "disablePanelSelector_flyout",
							"op": "equals",
							"value": false
						}
					}
				}
			}, {
				"visible": {
					"group_refs": [
						"panel-selector-fields2_flyout"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "hidePanelSelector_flyout",
							"op": "equals",
							"value": false
						}
					}
				}
			}
		]
	}
});
_defineConstant("COLUMNSELECTION_FLYOUT_PROPS_INFO", {
	"title": "ColumnSelection",
	"parameterDef": {
		"titleDefinition": {
			"title": "columnSelection",
			"editable": false
		},
		"current_parameters": {
			"disableColumnSelectionPanel_flyout": false,
			"field1_panel_flyout": "age",
			"field2_panel_flyout": "BP",
			"hideColumnSelectionPanel_flyout": false,
			"selectcolumn_flyout": "",
			"selectcolumns_flyout": []
		},
		"parameters": [
			{
				"id": "disableColumnSelectionPanel_flyout",
				"type": "boolean"
			},
			{
				"id": "field1_panel_flyout",
				"type": "string",
				"role": "column",
				"required": true
			},
			{
				"id": "field2_panel_flyout",
				"type": "string",
				"role": "column",
				"required": true
			},
			{
				"id": "hideColumnSelectionPanel_flyout",
				"type": "boolean"
			},
			{
				"id": "selectcolumn_flyout",
				"type": "string",
				"role": "column",
				"required": true
			},
			{
				"id": "selectcolumns_flyout",
				"type": "array[string]",
				"role": "column",
				"required": true
			}
		],
		"uihints": {
			"id": "ColumnSelectionPanel",
			"parameter_info": [
				{
					"parameter_ref": "disableColumnSelectionPanel_flyout",
					"label": {
						"default": "Disable 'Field1' and 'Field2'"
					},
					"description": {
						"default": "Disable 'Field1' and 'Field2'"
					}
				}, {
					"parameter_ref": "field1_panel_flyout",
					"label": {
						"default": "Field1"
					},
					"description": {
						"default": "selectcolumn parameter shared with Field2"
					},
					"text_before": {
						"default": "Field1 shares values with Field2"
					}
				}, {
					"parameter_ref": "field2_panel_flyout",
					"label": {
						"default": "Field2"
					},
					"description": {
						"default": "selectcolumn parameter shared with Field1"
					}
				}, {
					"parameter_ref": "hideColumnSelectionPanel_flyout",
					"label": {
						"default": "Hide 'Select Field' and 'Select Fields'"
					},
					"description": {
						"default": "Hide 'Select Field' and 'Select Fields'"
					}
				}, {
					"parameter_ref": "selectcolumn_flyout",
					"label": {
						"default": "Select Field"
					},
					"description": {
						"default": "selectcolumn control where values are shared with selectcolumns 'Select Fields'"
					},
					"text_before": {
						"default": "Select Field shares values with Select Fields"
					}
				}, {
					"parameter_ref": "selectcolumns_flyout",
					"label": {
						"default": "Select Fields"
					},
					"description": {
						"default": "selectcolumns control where values are shared with selectcolumns 'Select Field'"
					}
				}
			],
			"group_info": [
				{
					"id": "column-selections_flyout",
					"label": {
						"default": "Column Selection"
					},
					"type": "panels",
					"group_info": [
						{
							"id": "disable-selectcolumn-values_flyout",
							"label": {
								"default": "Values"
							},
							"type": "controls",
							"parameter_refs": [
								"disableColumnSelectionPanel_flyout"
							],
							"group_info": [
								{
									"id": "selectcolumn-values_flyout",
									"label": {
										"default": "Values"
									},
									"type": "columnSelection",
									"parameter_refs": [
										"field1_panel_flyout",
										"field2_panel_flyout"
									]
								}
							]
						},
						{
							"id": "hide-column-selection-panel_flyout",
							"label": {
								"default": "Column Selection"
							},
							"type": "controls",
							"parameter_refs": [
								"hideColumnSelectionPanel_flyout"
							],
							"group_info": [
								{
									"id": "column-selection-panel_flyout",
									"label": {
										"default": "Column Selection"
									},
									"type": "columnSelection",
									"parameter_refs": [
										"selectcolumn_flyout",
										"selectcolumns_flyout"
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
				"fields": fields
			}
		],
		"conditions": [
			{
				"enabled": {
					"group_refs": [
						"selectcolumn-values_flyout"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "disableColumnSelectionPanel_flyout",
							"op": "equals",
							"value": false
						}
					}
				}
			},
			{
				"visible": {
					"group_refs": [
						"column-selection-panel_flyout"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "hideColumnSelectionPanel_flyout",
							"op": "equals",
							"value": false
						}
					}
				}
			}
		]
	}
});
_defineConstant("SUMMARY_PANEL_FLYOUT_PROPS_INFO", {
	"title": "summaryPanel",
	"parameterDef": {
		"titleDefinition": {
			"title": "summaryPanel",
			"editable": false
		},
		"current_parameters": {
			"enableSummary_flyout": true,
			"structuretable_summary1_flyout": [
				[
					1,
					"BP"
				],
				[
					2,
					"Age"
				]
			],
			"structuretable_summary2_flyout": [
				[
					1,
					"Na"
				],
				[
					2,
					"Drug"
				]
			],
			"hideSummary_flyout": false,
			"structuretable_summary3_flyout": [
				[
					1,
					"BP"
				],
				[
					2,
					"Age"
				]
			]
		},
		"parameters": [
			{
				"id": "enableSummary_flyout",
				"type": "boolean",
				"default": ""
			},
			{
				"id": "structuretable_summary1_flyout",
				"type": "map[string,structuretable_summary1_flyout]",
				"role": "column",
				"default": []
			},
			{
				"id": "structuretable_summary2_flyout",
				"type": "map[string,structuretable_summary2_flyout]",
				"role": "column",
				"default": []
			},
			{
				"id": "hideSummary_flyout",
				"type": "boolean",
				"default": ""
			},
			{
				"id": "structuretable_summary3_flyout",
				"type": "map[string,structuretable_summary3_flyout]",
				"role": "column",
				"default": []
			}
		],
		"complex_types": [
			{
				"id": "structuretable_summary1_flyout",
				"key_definition": {
					"id": "readonly",
					"type": "integer"
				},
				"parameters": [
					{
						"id": "field",
						"type": "string",
						"role": "column"
					}
				]
			},
			{
				"id": "structuretable_summary2_flyout",
				"key_definition": {
					"id": "readonly",
					"type": "integer"
				},
				"parameters": [
					{
						"id": "field",
						"type": "string",
						"role": "column"
					}
				]
			}, {
				"id": "structuretable_summary3_flyout",
				"key_definition": {
					"id": "readonly",
					"type": "integer"
				},
				"parameters": [
					{
						"id": "field",
						"type": "string",
						"role": "column"
					}
				]
			}
		],
		"uihints": {
			"id": "PanelsPanel",
			"parameter_info": [
				{
					"parameter_ref": "enableSummary_flyout",
					"label": {
						"default": "enable summary"
					},
					"description": {
						"default": "Enable summary"
					}
				}, {
					"parameter_ref": "structuretable_summary1_flyout",
					"label": {
						"default": "Configure Fields"
					},
					"description": {
						"default": "Configure fields"
					}
				}, {
					"parameter_ref": "structuretable_summary2_flyout",
					"label": {
						"default": "Configure Fields"
					},
					"description": {
						"default": "Configure fields"
					}
				}, {
					"parameter_ref": "hideSummary_flyout",
					"label": {
						"default": "hide summary"
					},
					"description": {
						"default": "Hide summary"
					}
				}, {
					"parameter_ref": "structuretable_summary3_flyout",
					"label": {
						"default": "Configure Fields"
					},
					"description": {
						"default": "Configure fields"
					}
				}
			],
			"complex_type_info": [
				{
					"complex_type_ref": "structuretable_summary1_flyout",
					"label": {
						"default": "Configure Fields"
					},
					"key_definition": {
						"parameter_ref": "readonly",
						"label": {
							"default": "Index"
						},
						"width": 15,
						"generated_values": {
							"operation": "index"
						},
						"control": "readonly",
						"summary": true
					},
					"parameters": [
						{
							"parameter_ref": "field",
							"label": {
								"default": "Field"
							},
							"width": 26,
							"summary": true
						}
					]
				}, {
					"complex_type_ref": "structuretable_summary2_flyout",
					"label": {
						"default": "Configure Fields"
					},
					"key_definition": {
						"parameter_ref": "readonly",
						"label": {
							"default": "Index"
						},
						"width": 15,
						"generated_values": {
							"operation": "index"
						},
						"control": "readonly",
						"summary": true
					},
					"parameters": [
						{
							"parameter_ref": "field",
							"label": {
								"default": "Field"
							},
							"width": 26,
							"summary": true
						}
					]
				}, {
					"complex_type_ref": "structuretable_summary3_flyout",
					"label": {
						"default": "Configure Fields"
					},
					"key_definition": {
						"parameter_ref": "readonly",
						"label": {
							"default": "Index"
						},
						"width": 15,
						"generated_values": {
							"operation": "index"
						},
						"control": "readonly",
						"summary": true
					},
					"parameters": [
						{
							"parameter_ref": "field",
							"label": {
								"default": "Field"
							},
							"width": 26,
							"summary": true
						}
					]
				}
			],
			"group_info": [
				{
					"id": "Tables_flyout",
					"type": "panels",
					"group_info": [
						{
							"id": "summary_panel_category_flyout",
							"type": "panels",
							"label": {
								"default": "Summary Panel"
							},
							"group_info": [
								{
									"id": "summary_info_flyout",
									"type": "textPanel",
									"description": {
										"default": "Configure fields link and summary will be disabled or hidden using the below checkboxes."
									}
								},
								{
									"id": "enable_summary_checkbox_flyout",
									"type": "controls",
									"label": {
										"default": "Enable Summary"
									},
									"description": {
										"default": "Configure fields link and summary will be disabled if checkbox is unchecked."
									},
									"parameter_refs": [
										"enableSummary_flyout"
									]
								},
								{
									"id": "structuretable-summary-panel1_flyout",
									"label": {
										"default": "Configure Fields"
									},
									"type": "summaryPanel",
									"group_info": [
										{
											"id": "structuretable_summary1_panel_flyout",
											"type": "columnSelection",
											"parameter_refs": [
												"structuretable_summary1_flyout",
												"structuretable_summary2_flyout"
											]
										}
									]
								},
								{
									"id": "hide_summary_checkbox_flyout",
									"type": "controls",
									"label": {
										"default": "Hide Summary"
									},
									"description": {
										"default": "Configure fields link and summary will be hidden if checkbox is unchecked."
									},
									"parameter_refs": [
										"hideSummary_flyout"
									]
								},
								{
									"id": "structuretable-summary-panel2_flyout",
									"label": {
										"default": "Configure Fields"
									},
									"type": "summaryPanel",
									"group_info": [
										{
											"id": "structuretable_summary3_panel_flyout",
											"parameter_refs": [
												"structuretable_summary3_flyout"
											]
										}
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
				"fields": fields
			}
		],
		"conditions": [
			{
				"enabled": {
					"group_refs": [
						"structuretable-summary-panel1_flyout"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "enableSummary_flyout",
							"op": "equals",
							"value": true
						}
					}
				}
			}, {
				"visible": {
					"group_refs": [
						"structuretable-summary-panel2_flyout"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "hideSummary_flyout",
							"op": "equals",
							"value": false
						}
					}
				}
			}
		]
	}
});
_defineConstant("TWISTY_PANEL_FLYOUT_PROPS_INFO", {
	"title": "TwistyPanel",
	"parameterDef": {
		"titleDefinition": {
			"title": "TwistyPanel",
			"editable": false
		},
		"current_parameters": {
			"disableTwistyPanel_flyout": false,
			"numberfield1_flyout": 1,
			"numberfield2_flyout": 2,
			"hideTwistyPanel_flyout": false,
			"numberfield3_flyout": 3
		},
		"parameters": [
			{
				"id": "disableTwistyPanel_flyout",
				"type": "boolean"
			},
			{
				"id": "numberfield1_flyout",
				"type": "integer"
			},
			{
				"id": "numberfield2_flyout",
				"type": "integer"
			},
			{
				"id": "hideTwistyPanel_flyout",
				"type": "boolean"
			},
			{
				"id": "numberfield3_flyout",
				"type": "integer"
			}
		],
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
					"parameter_ref": "disableTwistyPanel_flyout",
					"label": {
						"default": "Disable 'Twisty Panel1'"
					},
					"description": {
						"default": "Disable 'Twisty Panel1'"
					}
				}, {
					"parameter_ref": "numberfield1_flyout",
					"label": {
						"default": "numberfield1"
					}
				}, {
					"parameter_ref": "numberfield2_flyout",
					"label": {
						"default": "numberfield2"
					}
				}, {
					"parameter_ref": "hideTwistyPanel_flyout",
					"label": {
						"default": "Hide 'Twisty Panel2'"
					},
					"description": {
						"default": "Hide 'Twisty Panel2'"
					}
				}, {
					"parameter_ref": "numberfield3_flyout",
					"label": {
						"default": "numberfield3"
					}
				}
			],
			"group_info": [
				{
					"id": "twisty-panels_flyout",
					"label": {
						"default": "Twisty Panels"
					},
					"type": "panels",
					"group_info": [
						{
							"id": "panels_flyout",
							"type": "controls",
							"parameter_refs": [
								"disableTwistyPanel_flyout"
							],
							"group_info": [
								{
									"id": "twisty-panel1_flyout",
									"type": "twistyPanel",
									"label": {
										"default": "Twisty Panel1"
									},
									"group_info": [
										{
											"id": "twisty-panel1-controls_flyout",
											"type": "controls",
											"parameter_refs": [
												"numberfield1_flyout",
												"numberfield2_flyout"
											]
										}
									]
								}
							]
						},
						{
							"id": "panels_flyout",
							"type": "controls",
							"parameter_refs": [
								"hideTwistyPanel_flyout"
							],
							"group_info": [
								{
									"id": "twisty-panel2_flyout",
									"type": "twistyPanel",
									"label": {
										"default": "Twisty Panel2"
									},
									"group_info": [
										{
											"id": "twisty-panel2-controls_flyout",
											"type": "controls",
											"parameter_refs": [
												"numberfield3_flyout"
											]
										}
									]
								}
							]
						}
					]
				}
			]
		},
		"conditions": [
			{
				"enabled": {
					"group_refs": [
						"twisty-panel1_flyout"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "disableTwistyPanel_flyout",
							"op": "equals",
							"value": false
						}
					}
				}
			}, {
				"visible": {
					"group_refs": [
						"twisty-panel2_flyout"
					],
					"evaluate": {
						"condition": {
							"parameter_ref": "hideTwistyPanel_flyout",
							"op": "equals",
							"value": false
						}
					}
				}
			}
		],
		"dataset_metadata": []
	}
});
