/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* global document */

import propertyUtils from "./../../_utils_/property-utils";

import { expect } from "chai";
import isEqual from "lodash/isEqual";

import Controller from "./../../../src/common-properties/properties-controller";

const CONDITIONS_TEST_FORM_DATA = require("./../../test_resources/json/conditions-test-formData.json");
const ENUM_FILTER_FORM_DATA = require("./../../test_resources/json/filtered-enum-test-formData.json");

const additionalComponents = null;

const enabledDefinitions = {};
enabledDefinitions.checkboxEnable = [
	{
		params: "checkboxEnable",
		definition: {
			"enabled": {
				"parameter_refs": ["radiosetColor"],
				"evaluate": {
					"condition": {
						"parameter_ref": "checkboxEnable",
						"op": "equals",
						"value": true
					}
				}
			}
		}
	}
];
enabledDefinitions.textfieldName = [
	{
		params: "textfieldName",
		definition: {
			"enabled": {
				"parameter_refs": [
					"expressionBox"
				],
				"evaluate": {
					"condition": {
						"parameter_ref": "textfieldName",
						"op": "isNotEmpty"
					}
				}
			}
		}
	}
];

const visibleDefinitions = {};
visibleDefinitions.oneofselectAnimals = [
	{
		"params": "oneofselectAnimals",
		"definition": {
			"visible": {
				"parameter_refs": ["oneofselectPets"],
				"evaluate": {
					"condition": {
						"parameter_ref": "oneofselectAnimals",
						"op": "notContains",
						"value": "lion"
					}
				}
			}
		}
	}
];
visibleDefinitions.checkboxEnableDesc = [
	{
		params: "checkboxEnableDesc",
		definition: {
			"visible": {
				"parameter_refs": ["textareaDescription"],
				"evaluate": {
					"condition": {
						"parameter_ref": "checkboxEnableDesc",
						"op": "equals",
						"value": true
					}
				}
			}
		}
	}
];

const validationDefinitions = {};
validationDefinitions.numberfieldCheckpointInterval = [
	{
		params: "numberfieldCheckpointInterval",
		definition: {
			"validation": {
				"fail_message": {
					"type": "error",
					"focus_parameter_ref": "numberfieldCheckpointInterval",
					"message": {
						"resource_key": "numberfield_checkpoint_interval_not_valid",
						"default": "The checkpoint interval value must either be >= 1 or -1 to disable"
					}
				},
				"evaluate": {
					"or": [
						{
							"condition": {
								"parameter_ref": "numberfieldCheckpointInterval",
								"op": "equals",
								"value": -1
							}
						},
						{
							"condition": {
								"parameter_ref": "numberfieldCheckpointInterval",
								"op": "greaterThan",
								"value": 0
							}
						}
					]
				}
			}
		}
	},
	{
		"params": "numberfieldCheckpointInterval",
		"definition": {
			"validation": {
				"id": "required_numberfieldCheckpointInterval_605.6368461289118",
				"fail_message": {
					"type": "error",
					"message": {
						"default": "Required parameter 'Checkpoint Interval' has no value"
					},
					"focus_parameter_ref": "numberfieldCheckpointInterval"
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "numberfieldCheckpointInterval",
						"op": "isNotEmpty"
					}
				}
			}
		}
	}
];
validationDefinitions.numberfieldImpurity = [
	{
		params: "numberfieldImpurity",
		definition: {
			"validation": {
				"fail_message": {
					"type": "error",
					"focus_parameter_ref": "numberfieldImpurity",
					"message": {
						"resource_key": "numberfieldImpurity_invalid",
						"default": "invalid: gini is selected"
					}
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "numberfieldImpurity",
						"op": "notEquals",
						"value": "gini"
					}
				}
			}
		}
	}
];
validationDefinitions.numberfieldMaxBins = [
	{
		params: [
			"numberfieldMaxBins",
			"numberfieldMaxDepth"
		],
		definition: {
			"validation": {
				"fail_message": {
					"type": "error",
					"focus_parameter_ref": "numberfieldMaxBins",
					"message": {
						"resource_key": "numberfield_max_bins_not_valid",
						"default": "Maximum number of bins must be >= 2 or Maximum depth cannot be empty"
					}
				},
				"evaluate": {
					"or": [
						{
							"condition": {
								"parameter_ref": "numberfieldMaxBins",
								"op": "greaterThan",
								"value": 1
							}
						},
						{
							"condition": {
								"parameter_ref": "numberfieldMaxDepth",
								"op": "isNotEmpty"
							}
						}
					]
				}
			}
		}
	},
	{
		"params": "numberfieldMaxBins",
		"definition": {
			"validation": {
				"id": "required_numberfieldMaxBins_823.4996625010101",
				"fail_message": {
					"type": "error",
					"message": {
						"default": "Required parameter 'Maximum number of bins' has no value"
					},
					"focus_parameter_ref": "numberfieldMaxBins"
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "numberfieldMaxBins",
						"op": "isNotEmpty"
					}
				}
			}
		}
	}
];
validationDefinitions.numberfieldMaxDepth = [
	{
		params: [
			"numberfieldMaxBins",
			"numberfieldMaxDepth"
		],
		definition: {
			"validation": {
				"fail_message": {
					"type": "error",
					"focus_parameter_ref": "numberfieldMaxBins",
					"message": {
						"resource_key": "numberfield_max_bins_not_valid",
						"default": "Maximum number of bins must be >= 2 or Maximum depth cannot be empty"
					}
				},
				"evaluate": {
					"or": [
						{
							"condition": {
								"parameter_ref": "numberfieldMaxBins",
								"op": "greaterThan",
								"value": 1
							}
						},
						{
							"condition": {
								"parameter_ref": "numberfieldMaxDepth",
								"op": "isNotEmpty"
							}
						}
					]
				}
			}
		}
	}
];
validationDefinitions.numberfieldMinInstancesPerNode = [
	{
		params: [
			"numberfieldMinInfoGain",
			"numberfieldMinInstancesPerNode"
		],
		definition: {
			"validation": {
				"fail_message": {
					"type": "error",
					"focus_parameter_ref": "numberfieldMinInfoGain",
					"message": {
						"resource_key": "numberfield_min_info_gain_not_equals_min_instance",
						"default": "info gain should not equal min instance"
					}
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "numberfieldMinInfoGain",
						"op": "notEquals",
						"parameter_2_ref": "numberfieldMinInstancesPerNode"
					}
				}
			}
		}
	}
];
validationDefinitions.numberfieldMinInfoGain = [
	{
		params: [
			"numberfieldMinInfoGain",
			"numberfieldMinInstancesPerNode"
		],
		definition: {
			"validation": {
				"fail_message": {
					"type": "error",
					"focus_parameter_ref": "numberfieldMinInfoGain",
					"message": {
						"resource_key": "numberfield_min_info_gain_not_equals_min_instance",
						"default": "info gain should not equal min instance"
					}
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "numberfieldMinInfoGain",
						"op": "notEquals",
						"parameter_2_ref": "numberfieldMinInstancesPerNode"
					}
				}
			}
		}
	}
];
validationDefinitions.numberfieldSeed = [
	{
		params: "numberfieldSeed",
		definition: {
			"validation": {
				"fail_message": {
					"type": "error",
					"focus_parameter_ref": "numberfieldSeed",
					"message": {
						"resource_key": "numberfield_seed_not_valid",
						"default": "Field cannot be null. This is an example of a long error message that might be entered. The message text will wrap around to the next line."
					}
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "numberfieldSeed",
						"op": "notEquals",
						"value": null
					}
				}
			}
		}
	}
];
validationDefinitions.columnSelectInputFieldList = [
	{
		params: "columnSelectInputFieldList",
		definition: {
			"validation": {
				"fail_message": {
					"type": "error",
					"focus_parameter_ref": "columnSelectInputFieldList",
					"message": {
						"resource_key": "column_select_input_field_list_not_empty",
						"default": "Select one or more input fields."
					}
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "columnSelectInputFieldList",
						"op": "isNotEmpty"
					}
				}
			}
		}
	},
	{
		"params": "columnSelectInputFieldList",
		"definition": {
			"validation": {
				"id": "required_columnSelectInputFieldList_19.516368410342054",
				"fail_message": {
					"type": "error",
					"message": {
						"default": "Required parameter 'Column Select Input' has no value"
					},
					"focus_parameter_ref": "columnSelectInputFieldList"
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "columnSelectInputFieldList",
						"op": "isNotEmpty"
					}
				}
			}
		}
	}
];
validationDefinitions.columnSelectSharedWithInput = [
	{
		params: "columnSelectSharedWithInput",
		definition: {
			"validation": {
				"fail_message": {
					"type": "warning",
					"focus_parameter_ref": "columnSelectSharedWithInput",
					"message": {
						"resource_key": "column_select_shared_with_input_not_empty",
						"default": "Warning: empty tables"
					}
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "columnSelectSharedWithInput",
						"op": "isNotEmpty"
					}
				}
			}
		}
	}
];
validationDefinitions.checkboxTypes = [
	{
		params: "checkboxTypes",
		definition: {
			"validation": {
				"fail_message": {
					"type": "warning",
					"message": {
						"default": "No data types are selected",
						"resource_key": "checkbox_types_not_empty"
					},
					"focus_parameter_ref": "checkboxTypes"
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "checkboxTypes",
						"op": "isNotEmpty"
					}
				}
			}
		}
	},
	{
		params: [
			"checkboxSingle",
			"checkboxTypes"
		],
		definition: {
			"validation": {
				"fail_message": {
					"type": "error",
					"message": {
						"default": "Checkbox single should be checked if data type is selected",
						"resource_key": "checkbox_single_not_empty"
					},
					"focus_parameter_ref": "checkboxSingle"
				},
				"evaluate": {
					"or": [
						{
							"condition": {
								"parameter_ref": "checkboxSingle",
								"op": "equals",
								"value": true
							}
						},
						{
							"and": [
								{
									"condition": {
										"parameter_ref": "checkboxTypes",
										"op": "isEmpty"
									}
								},
								{
									"condition": {
										"parameter_ref": "checkboxSingle",
										"op": "equals",
										"value": false
									}
								}
							]
						}
					]
				}
			}
		}
	}
];
validationDefinitions.oneofselectAnimals = [
	{
		params: "oneofselectAnimals",
		definition: {
			"validation": {
				"fail_message": {
					"type": "warning",
					"message": {
						"default": "Warning: one of select cannot be empty"
					},
					"focus_parameter_ref": "oneofselectAnimals"
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "oneofselectAnimals",
						"op": "isNotEmpty"
					}
				}
			}
		}
	},
	{
		"params": "oneofselectAnimals",
		"definition": {
			"validation": {
				"fail_message": {
					"type": "warning",
					"message": {
						"default": "Warning: selected tiger",
						"resource_key": "one_of_select_animals_not_empty"
					},
					"focus_parameter_ref": "oneofselectAnimals"
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "oneofselectAnimals",
						"op": "notEquals",
						"value": "tiger"
					}
				}
			}
		}
	}
];
validationDefinitions.someofselectNumbers = [
	{
		"params": "someofselectNumbers",
		"definition": {
			"validation": {
				"fail_message": {
					"type": "error",
					"message": {
						"default": "Error: none selected"
					},
					"focus_parameter_ref": "someofselectNumbers"
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "someofselectNumbers",
						"op": "isNotEmpty"
					}
				}
			}
		}
	}, {
		"params": "someofselectNumbers",
		"definition": {
			"validation": {
				"fail_message": {
					"type": "warning",
					"message": {
						"default": "Warning: selected three"
					},
					"focus_parameter_ref": "someofselectNumbers"
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "someofselectNumbers",
						"op": "notContains",
						"value": "Three"
					}
				}
			}
		}
	}
];
validationDefinitions.checkboxSingle = [
	{
		"params": [
			"checkboxSingle", "checkboxTypes"
		],
		"definition": {
			"validation": {
				"fail_message": {
					"type": "error",
					"message": {
						"default": "Checkbox single should be checked if data type is selected",
						"resource_key": "checkbox_single_not_empty"
					},
					"focus_parameter_ref": "checkboxSingle"
				},
				"evaluate": {
					"or": [
						{
							"condition": {
								"parameter_ref": "checkboxSingle",
								"op": "equals",
								"value": true
							}
						},
						{
							"and": [
								{
									"condition": {
										"parameter_ref": "checkboxTypes",
										"op": "isEmpty"
									}
								},
								{
									"condition": {
										"parameter_ref": "checkboxSingle",
										"op": "equals",
										"value": false
									}
								}
							]
						}
					]
				}
			}
		}
	}
];
validationDefinitions.radiosetColor = [
	{
		params: "radiosetColor",
		definition: {
			"validation": {
				"fail_message": {
					"type": "warning",
					"message": {
						"default": "Are you sure you want to choose yellow?",
						"resource_key": "radiosetColor"
					},
					"focus_parameter_ref": "radiosetColor"
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "radiosetColor",
						"op": "notEquals",
						"value": "yellow"
					}
				}
			}
		}
	}
];
validationDefinitions.passwordField = [
	{
		params: "passwordField",
		definition: {
			"validation": {
				"id": "PW2",
				"fail_message": {
					"type": "error",
					"focus_parameter_ref": "passwordField",
					"message": {
						"resource_key": "password_not_empty",
						"default": "Password cannot be empty, enter \"password\""
					}
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "passwordField",
						"op": "isNotEmpty"
					}
				}
			}
		}
	},
	{
		"params": [
			"textfieldName", "passwordField"
		],
		"definition": {
			"validation": {
				"id": "PW1",
				"fail_message": {
					"type": "warning",
					"message": {
						"default": "name cannot contain password",
						"resource_key": "textfield_name_not_contain_password"
					},
					"focus_parameter_ref": "passwordField"
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "textfieldName",
						"op": "notContains",
						"parameter_2_ref": "passwordField"
					}
				}
			}
		}
	}
];
validationDefinitions.textfieldName = [
	{
		params: "textfieldName",
		definition: {
			"validation": {
				"id": "textfieldtest1",
				"fail_message": {
					"type": "error",
					"message": {
						"default": "Name cannot contain /",
						"resource_key": "textfield_name_not_valid_one"
					},
					"focus_parameter_ref": "textfieldName"
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "textfieldName",
						"op": "notContains",
						"value": "/"
					}
				}
			}
		}
	},
	{
		params: "textfieldName",
		definition: {
			"validation": {
				"id": "textfieldtest2",
				"fail_message": {
					"type": "error",
					"message": {
						"default": "Name cannot contain double or single \"quotes\"",
						"resource_key": "textfield_name_not_valid_two"
					},
					"focus_parameter_ref": "textfieldName"
				},
				"evaluate": {
					"and": [
						{
							"condition": {
								"parameter_ref": "textfieldName",
								"op": "notContains",
								"value": "\""
							}
						},
						{
							"condition": {
								"parameter_ref": "textfieldName",
								"op": "notContains",
								"value": "'"
							}
						}
					]
				}
			}
		}
	},
	{
		"params": [
			"textfieldName", "passwordField"
		],
		"definition": {
			"validation": {
				"id": "PW1",
				"fail_message": {
					"type": "warning",
					"message": {
						"default": "name cannot contain password",
						"resource_key": "textfield_name_not_contain_password"
					},
					"focus_parameter_ref": "passwordField"
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "textfieldName",
						"op": "notContains",
						"parameter_2_ref": "passwordField"
					}
				}
			}
		}
	},
	{
		"params": "textfieldName",
		"definition": {
			"validation": {
				"id": "required_textfieldName_462.6946539987652",
				"fail_message": {
					"type": "error",
					"message": {
						"default": "Required parameter 'Name' has no value"
					},
					"focus_parameter_ref": "textfieldName"
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "textfieldName",
						"op": "isNotEmpty"
					}
				}
			}
		}
	}
];
validationDefinitions.textareaDescription = [
	{
		params: "textareaDescription",
		definition: {
			"validation": {
				"fail_message": {
					"type": "warning",
					"message": {
						"default": "Description cannot contain /, double or single \"quotes\"",
						"resource_key": "textarea_description_not_valid"
					},
					"focus_parameter_ref": "textareaDescription"
				},
				"evaluate": {
					"and": [
						{
							"condition": {
								"parameter_ref": "textareaDescription",
								"op": "notContains",
								"value": "/"
							}
						},
						{
							"condition": {
								"parameter_ref": "textareaDescription",
								"op": "notContains",
								"value": "\""
							}
						},
						{
							"condition": {
								"parameter_ref": "textareaDescription",
								"op": "notContains",
								"value": "'"
							}
						}
					]
				}
			}
		}
	},
	{
		"params": "textareaDescription",
		"definition": {
			"validation": {
				"id": "required_textareaDescription_708.576019526482",
				"fail_message": {
					"type": "error",
					"message": {
						"default": "Required parameter 'Description' has no value"
					},
					"focus_parameter_ref": "textareaDescription"
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "textareaDescription",
						"op": "isNotEmpty"
					}
				}
			}
		}
	}
];
validationDefinitions.structuretableSortOrder = [
	{
		params: "structuretableSortOrder",
		definition: {
			"validation": {
				"fail_message": {
					"type": "error",
					"focus_parameter_ref": "structuretableSortOrder",
					"message": {
						"default": "table cannot be empty"
					}
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "structuretableSortOrder",
						"op": "isNotEmpty"
					}
				}
			}
		}
	},
	{
		"params": "structuretableSortOrder",
		"definition": {
			"validation": {
				"id": "required_structuretableSortOrder_155.4428691845365",
				"fail_message": {
					"type": "error",
					"message": {
						"default": "Required parameter 'Sort by' has no value"
					},
					"focus_parameter_ref": "structuretableSortOrder"
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "structuretableSortOrder",
						"op": "isNotEmpty"
					}
				}
			}
		}
	}
];
validationDefinitions.structuretableRenameFields = [
	{
		params: "structuretableRenameFields",
		definition: {
			"validation": {
				"fail_message": {
					"type": "error",
					"focus_parameter_ref": "structuretableRenameFields",
					"message": {
						"resource_key": "structuretable_rename_fields_not_contains_pw",
						"default": "The 'Output Name' field cannot contain 'pw'"
					}
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "structuretableRenameFields",
						"op": "notContains",
						"value": "pw"
					}
				}
			}
		}
	},
	{
		"params": "structuretableRenameFields",
		"definition": {
			"validation": {
				"id": "required_structuretableRenameFields_330.40852731641877",
				"fail_message": {
					"type": "error",
					"message": {
						"default": "Required parameter 'Rename Field' has no value"
					},
					"focus_parameter_ref": "structuretableRenameFields"
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "structuretableRenameFields",
						"op": "isNotEmpty"
					}
				}
			}
		}
	}
];
validationDefinitions.structurelisteditorTableInput = [
	{
		params: "structurelisteditorTableInput",
		definition: {
			"validation": {
				"fail_message": {
					"type": "warning",
					"focus_parameter_ref": "structurelisteditorTableInput",
					"message": {
						"default": "table cannot be empty"
					}
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "structurelisteditorTableInput",
						"op": "notEquals",
						"value": []
					}
				}
			}
		}
	}
];
validationDefinitions.subpanelTextfieldName = [
	{
		"params": "name",
		"definition": {
			"validation": {
				"fail_message": {
					"type": "error",
					"focus_parameter_ref": "name",
					"message": {
						"resource_key": "name should not be empty",
						"default": "name should not be empty"
					}
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "name",
						"op": "cellNotEmpty"
					}
				}
			}
		}
	},
	{
		"params": "name",
		"definition": {
			"validation": {
				"fail_message": {
					"type": "warning",
					"focus_parameter_ref": "name",
					"message": {
						"default": "name cannot be an existing column name"
					}
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "name",
						"op": "colNotExists"
					}
				}
			}
		}
	},
	{
		"params": "name",
		"definition": {
			"validation": {
				"fail_message": {
					"type": "error",
					"focus_parameter_ref": "name",
					"message": {
						"resource_key": "invalid_subpanel_name",
						"default": "name should not contain pw"
					}
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "name",
						"op": "notContains",
						"value": "pw"
					}
				}
			}
		}
	}
];

const filteredEnumDefinitions = {};
filteredEnumDefinitions.filter_radios = [
	{
		"params": "filter_radios",
		"definition": {
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
	}
];

const controller = new Controller();

function compareObjects(expected, actual) {
	expect(isEqual(JSON.parse(JSON.stringify(expected)),
		JSON.parse(JSON.stringify(actual)))).to.be.true;
}

describe("editor-form renders correctly with validations", () => {

	it("props should have been defined", () => {
		const wrapper = propertyUtils.createEditorForm("mount", CONDITIONS_TEST_FORM_DATA, controller);

		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("additionalComponents")).to.equal(additionalComponents);
		expect(wrapper.prop("showPropertiesButtons")).to.exist;
	});

	it("should render an `EditorForm` with parsed conditions", () => {
		const wrapper = propertyUtils.createEditorForm("mount", CONDITIONS_TEST_FORM_DATA, controller);

		expect(wrapper.find(".form-horizontal")).to.have.length(1);
		expect(wrapper.find(".section--light")).to.have.length(1);
		expect(wrapper.find(".tabs__tabpanel")).to.have.length(6);
		expect(wrapper.find(".editor_control_area")).to.have.length(33);
	});

	it("should initialize correct values in `Properties-Controller`", () => {
		expect(Object.keys(controller.visibleDefinitions.controls)).to.have.length(3);
		expect(Object.keys(controller.enabledDefinitions.controls)).to.have.length(3);
		compareObjects(enabledDefinitions.checkboxEnable, controller.enabledDefinitions.controls.checkboxEnable);
		compareObjects(enabledDefinitions.textfieldName, controller.enabledDefinitions.controls.textfieldName);

		compareObjects(visibleDefinitions.oneofselectAnimals, controller.visibleDefinitions.controls.oneofselectAnimals);
		compareObjects(visibleDefinitions.checkboxEnableDesc, controller.visibleDefinitions.controls.checkboxEnableDesc);
		expect(isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.controls.numberfieldCheckpointInterval)),
			JSON.parse(JSON.stringify(validationDefinitions.numberfieldCheckpointInterval)))).to.be.true;
		expect(isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.controls.numberfieldImpurity)),
			JSON.parse(JSON.stringify(validationDefinitions.numberfieldImpurity)))).to.be.true;
		expect(isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.controls.numberfieldMaxBins)),
			JSON.parse(JSON.stringify(validationDefinitions.numberfieldMaxBins)))).to.be.true;
		expect(isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.controls.numberfieldMaxDepth)),
			JSON.parse(JSON.stringify(validationDefinitions.numberfieldMaxDepth)))).to.be.true;
		expect(isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.controls.numberfieldMinInstancesPerNode)),
			JSON.parse(JSON.stringify(validationDefinitions.numberfieldMinInstancesPerNode)))).to.be.true;
		expect(isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.controls.numberfieldMinInfoGain)),
			JSON.parse(JSON.stringify(validationDefinitions.numberfieldMinInfoGain)))).to.be.true;
		expect(isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.controls.numberfieldSeed)),
			JSON.parse(JSON.stringify(validationDefinitions.numberfieldSeed)))).to.be.true;
		expect(isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.controls.columnSelectInputFieldList)),
			JSON.parse(JSON.stringify(validationDefinitions.columnSelectInputFieldList)))).to.be.true;
		expect(isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.controls.columnSelectSharedWithInput)),
			JSON.parse(JSON.stringify(validationDefinitions.columnSelectSharedWithInput)))).to.be.true;
		expect(isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.controls.checkboxTypes)),
			JSON.parse(JSON.stringify(validationDefinitions.checkboxTypes)))).to.be.true;
		expect(isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.controls.oneofselectAnimals)),
			JSON.parse(JSON.stringify(validationDefinitions.oneofselectAnimals)))).to.be.true;
		expect(isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.controls.someofselectNumbers)),
			JSON.parse(JSON.stringify(validationDefinitions.someofselectNumbers)))).to.be.true;
		expect(isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.controls.checkboxSingle)),
			JSON.parse(JSON.stringify(validationDefinitions.checkboxSingle)))).to.be.true;
		expect(isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.controls.radiosetColor)),
			JSON.parse(JSON.stringify(validationDefinitions.radiosetColor)))).to.be.true;
		expect(isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.controls.passwordField)),
			JSON.parse(JSON.stringify(validationDefinitions.passwordField)))).to.be.true;
		expect(isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.controls.textfieldName)),
			JSON.parse(JSON.stringify(validationDefinitions.textfieldName)))).to.be.true;
		expect(isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.controls.textareaDescription)),
			JSON.parse(JSON.stringify(validationDefinitions.textareaDescription)))).to.be.true;
		expect(isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.controls.structuretableSortOrder)),
			JSON.parse(JSON.stringify(validationDefinitions.structuretableSortOrder)))).to.be.true;
		expect(isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.controls.structuretableRenameFields)),
			JSON.parse(JSON.stringify(validationDefinitions.structuretableRenameFields)))).to.be.true;
		expect(isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.controls.structurelisteditorTableInput)),
			JSON.parse(JSON.stringify(validationDefinitions.structurelisteditorTableInput)))).to.be.true;
		expect(isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.controls.name)),
			JSON.parse(JSON.stringify(validationDefinitions.subpanelTextfieldName)))).to.be.true;

		compareObjects({}, controller.getErrorMessages());
	});
});

describe("Filtered enumerations properly filter", () => {
	it("Filters should work", () => {
		const wrapper = propertyUtils.createEditorForm("mount", ENUM_FILTER_FORM_DATA, controller);

		expect(wrapper.find(".control-panel")).to.have.length(4);
		expect(wrapper.find(".control-radio-block")).to.have.length(3);
		expect(Object.keys(controller.filteredEnumDefinitions.controls)).to.have.length(4);
		expect(isEqual(JSON.parse(JSON.stringify(controller.filteredEnumDefinitions.controls.filter_radios)),
			JSON.parse(JSON.stringify(filteredEnumDefinitions.filter_radios)))).to.be.true;
	});
});
