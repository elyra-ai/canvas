/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* global document */

import React from "react";
import EditorForm from "../../src/common-properties/editor-controls/editor-form.jsx";
import { shallow, mount } from "enzyme";
import { expect } from "chai";
import sinon from "sinon";
import chai from "chai";
import chaiEnzyme from "chai-enzyme";
chai.use(chaiEnzyme()); // Need for style checking
import _ from "underscore";

import Controller from "../../src/common-properties/properties-controller";

const CONDITIONS_TEST_FORM_DATA = require("../test_resources/json/conditions-test-formData.json");

const showPropertiesButtons = sinon.spy();

const additionalComponents = null;
const formData = {};
formData.componentId = CONDITIONS_TEST_FORM_DATA.componentId;
formData.label = CONDITIONS_TEST_FORM_DATA.label;
formData.editorSize = CONDITIONS_TEST_FORM_DATA.editorSize;
formData.uiItems = CONDITIONS_TEST_FORM_DATA.uiItems;
formData.buttons = CONDITIONS_TEST_FORM_DATA.buttons;
formData.data = CONDITIONS_TEST_FORM_DATA.data;
formData.conditions = CONDITIONS_TEST_FORM_DATA.conditions;

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

const visibleDefinition = {};
visibleDefinition.oneofselectAnimals = [
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
visibleDefinition.checkboxEnableDesc = [
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
	}
];
validationDefinitions.oneofcolumnsList = [
	{
		params: "oneofcolumnsList",
		definition: {
			"validation": {
				"fail_message": {
					"type": "error",
					"focus_parameter_ref": "oneofcolumnsList",
					"message": {
						"resource_key": "one_of_columns_list_not_empty",
						"default": "Cannot have Sex selected"
					}
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "oneofcolumnsList",
						"op": "contains",
						"value": "Sex"
					}
				}
			}
		}
	}
];
validationDefinitions.someofcolumnsList = [
	{
		params: "someofcolumnsList",
		definition: {
			"validation": {
				"fail_message": {
					"type": "warning",
					"focus_parameter_ref": "someofcolumnsList",
					"message": {
						"resource_key": "some_of_columns_list_not_empty",
						"default": "Field must be selected"
					}
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "someofcolumnsList",
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
								"op": "isNotEmpty"
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
										"op": "isEmpty"
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
								"op": "isNotEmpty"
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
										"op": "isEmpty"
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

const defaultControlStates = {
	"textareaDescription": "hidden",
	"radiosetColor": "disabled",
	"expressionBox": "disabled",
	"field_types[1][3]": "hidden",
	"field_types[1][2]": "disabled",
	"field_types[3][3]": "hidden",
	"field_types[3][2]": "disabled",
	"field_types[4][3]": "hidden",
	"field_types[4][2]": "disabled",
	"field_types[6][3]": "hidden",
	"field_types[6][2]": "disabled"
};
var controller;
function createEditorForm(state) {
	controller = new Controller();
	controller.setForm(formData);
	let wrapper;
	const editorForm = (<EditorForm
		ref="editorForm"
		key="editor-form-key"
		controller={controller}
		additionalComponents={additionalComponents}
		showPropertiesButtons={showPropertiesButtons}
	/>);
	if (state === "shallow") {
		wrapper = shallow(editorForm);
	} else {
		wrapper = mount(editorForm);
	}
	return wrapper;
}
function compareObjects(expected, actual) {
	expect(_.isEqual(JSON.parse(JSON.stringify(expected)),
		JSON.parse(JSON.stringify(actual)))).to.be.true;
}

describe("editor-form renders correctly with validations", () => {

	it("props should have been defined", () => {
		const wrapper = createEditorForm("mount");

		expect(wrapper.prop("controller")).to.equal(controller);
		expect(wrapper.prop("additionalComponents")).to.equal(additionalComponents);
		expect(wrapper.prop("showPropertiesButtons")).to.equal(showPropertiesButtons);
	});
	it("should render an `EditorForm` with parsed conditions", () => {
		const wrapper = createEditorForm("mount");

		expect(wrapper.find(".form-horizontal")).to.have.length(1);
		expect(wrapper.find(".section--light")).to.have.length(1);
		expect(wrapper.find(".tabs__tabpanel")).to.have.length(6);
		expect(wrapper.find(".editor_control_area")).to.have.length(25);
		expect(wrapper.find(".validation-error-message")).to.have.length(40);
	});
	it("should initialize correct values in `Properties-Controller`", () => {
		expect(Object.keys(controller.visibleDefinition)).to.have.length(3);
		expect(Object.keys(controller.enabledDefinitions)).to.have.length(3);
		compareObjects(enabledDefinitions.checkboxEnable, controller.enabledDefinitions.checkboxEnable);
		compareObjects(enabledDefinitions.textfieldName, controller.enabledDefinitions.textfieldName);

		compareObjects(visibleDefinition.oneofselectAnimals, controller.visibleDefinition.oneofselectAnimals);
		compareObjects(visibleDefinition.checkboxEnableDesc, controller.visibleDefinition.checkboxEnableDesc);

		expect(_.isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.numberfieldCheckpointInterval)),
			JSON.parse(JSON.stringify(validationDefinitions.numberfieldCheckpointInterval)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.numberfieldImpurity)),
			JSON.parse(JSON.stringify(validationDefinitions.numberfieldImpurity)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.numberfieldMaxBins)),
			JSON.parse(JSON.stringify(validationDefinitions.numberfieldMaxBins)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.numberfieldMaxDepth)),
			JSON.parse(JSON.stringify(validationDefinitions.numberfieldMaxDepth)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.numberfieldMinInstancesPerNode)),
			JSON.parse(JSON.stringify(validationDefinitions.numberfieldMinInstancesPerNode)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.numberfieldMinInfoGain)),
			JSON.parse(JSON.stringify(validationDefinitions.numberfieldMinInfoGain)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.numberfieldSeed)),
			JSON.parse(JSON.stringify(validationDefinitions.numberfieldSeed)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.columnSelectInputFieldList)),
			JSON.parse(JSON.stringify(validationDefinitions.columnSelectInputFieldList)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.oneofcolumnsList)),
			JSON.parse(JSON.stringify(validationDefinitions.oneofcolumnsList)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.someofcolumnsList)),
			JSON.parse(JSON.stringify(validationDefinitions.someofcolumnsList)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.columnSelectSharedWithInput)),
			JSON.parse(JSON.stringify(validationDefinitions.columnSelectSharedWithInput)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.checkboxTypes)),
			JSON.parse(JSON.stringify(validationDefinitions.checkboxTypes)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.oneofselectAnimals)),
			JSON.parse(JSON.stringify(validationDefinitions.oneofselectAnimals)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.someofselectNumbers)),
			JSON.parse(JSON.stringify(validationDefinitions.someofselectNumbers)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.checkboxSingle)),
			JSON.parse(JSON.stringify(validationDefinitions.checkboxSingle)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.radiosetColor)),
			JSON.parse(JSON.stringify(validationDefinitions.radiosetColor)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.passwordField)),
			JSON.parse(JSON.stringify(validationDefinitions.passwordField)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.textfieldName)),
			JSON.parse(JSON.stringify(validationDefinitions.textfieldName)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.textareaDescription)),
			JSON.parse(JSON.stringify(validationDefinitions.textareaDescription)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.structuretableSortOrder)),
			JSON.parse(JSON.stringify(validationDefinitions.structuretableSortOrder)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.structuretableRenameFields)),
			JSON.parse(JSON.stringify(validationDefinitions.structuretableRenameFields)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.structurelisteditorTableInput)),
			JSON.parse(JSON.stringify(validationDefinitions.structurelisteditorTableInput)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(controller.validationDefinitions.name)),
			JSON.parse(JSON.stringify(validationDefinitions.subpanelTextfieldName)))).to.be.true;

		compareObjects({}, controller.getErrorMessages());
	});
	describe("condition messages renders correctly with numberfield control", () => {
		it("numberfield control should have error message from invalid input", () => {
			const wrapper = createEditorForm("mount");

			const input = wrapper.find("input[id='editor-control-numberfieldCheckpointInterval']");
			expect(input).to.have.length(1);
			input.simulate("change", { target: { value: -100 } });
			wrapper.update();

			const numberfieldCheckpointIntervalErrorMessages = {
				"type": "error",
				"text": "The checkpoint interval value must either be >= 1 or -1 to disable"
			};
			compareObjects(numberfieldCheckpointIntervalErrorMessages, controller.getErrorMessage({ name: "numberfieldCheckpointInterval" }));
			expect(wrapper.find(".validation-error-message-icon")).to.have.length(1);
			expect(wrapper.find(".form__validation--error")).to.have.length(1);
		});
		it("required numberfield control should have error message from null input", () => {
			const wrapper = createEditorForm("mount");

			const input = wrapper.find("input[id='editor-control-numberfieldCheckpointInterval']");
			expect(input).to.have.length(1);
			input.simulate("change", { target: { value: "" } });
			wrapper.update();

			const numberfieldCheckpointIntervalErrorMessages = {
				"type": "error",
				"text": "Required parameter numberfieldCheckpointInterval has no value",
			};
			compareObjects(numberfieldCheckpointIntervalErrorMessages, controller.getErrorMessage({ name: "numberfieldCheckpointInterval" }));
			expect(wrapper.find(".validation-error-message-icon")).to.have.length(1);
			expect(wrapper.find(".form__validation--error")).to.have.length(1);
		});
		it("numberfield control should have error message from null input and generator should trigger validation", () => {
			const wrapper = createEditorForm("mount");

			const input = wrapper.find("input[id='editor-control-numberfieldSeed']");
			expect(input).to.have.length(1);
			input.simulate("change", { target: { value: "" } });
			wrapper.update();

			const numberfieldSeedErrorMessages = {
				"type": "error",
				"text": "Field cannot be null. This is an example of a long error message that might be entered. The message text will wrap around to the next line.",
			};
			compareObjects(numberfieldSeedErrorMessages, controller.getErrorMessage({ name: "numberfieldSeed" }));
			expect(wrapper.find(".validation-error-message-icon")).to.have.length(1);
			expect(wrapper.find(".form__validation--error")).to.have.length(1);

			const generator = wrapper.find(".number-generator");
			expect(generator).to.have.length(1);
			generator.simulate("click");
			wrapper.update();

			expect(wrapper.find(".validation-error-message-icon")).to.have.length(0);
			expect(wrapper.find(".form__validation--error")).to.have.length(0);
		});
	});
	describe("condition messages renders correctly with columnselect control", () => {
		it("columnselect control should have error message from empty input", () => {
			const wrapper = createEditorForm("mount");
			const propertyId = { name: "columnSelectInputFieldList" };
			const input = wrapper.find("#editor-control-columnSelectInputFieldList");
			expect(input).to.have.length(1);

			const optAge = document.createElement("OPTION");
			optAge.selected = true;
			optAge.value = "Age";
			const optBp = document.createElement("OPTION");
			optBp.selected = false;
			optBp.value = "BP";
			const options1 = [
				optAge,
				optBp
			];

			expect(input.find("option")).to.have.length(2);
			input.simulate("change", { target: { options: options1 } });
			wrapper.update();

			const enabledRemoveColumnButton = wrapper.find("#remove-fields-button-enabled");
			expect(enabledRemoveColumnButton).to.have.length(1);

			enabledRemoveColumnButton.simulate("click");
			expect(input.find("option")).to.have.length(1);
			expect(controller.getPropertyValue(propertyId)).to.have.length(1);

			optBp.selected = true;
			const options2 = [
				optBp
			];
			input.simulate("change", { target: { options: options2 } });
			wrapper.update();

			enabledRemoveColumnButton.simulate("click");
			expect(input.find("option")).to.have.length(0);
			expect(controller.getPropertyValue(propertyId)).to.have.length(0);
			input.simulate("blur");
			wrapper.update();

			const columnSelectInputFieldListErrorMessages = {
				"type": "error",
				"text": "Select one or more input fields."
			};
			compareObjects(columnSelectInputFieldListErrorMessages, controller.getErrorMessage(propertyId));
			expect(wrapper.find(".validation-error-message-icon")).to.have.length(1);
			expect(wrapper.find(".form__validation--error")).to.have.length(1);
		});
	});
	describe("condition messages renders correctly with someofcolumns control", () => {
		it("someofcolumnsList control should have warning message from no selection", () => {
			const wrapper = createEditorForm("mount");
			const propertyId = { name: "someofcolumnsList" };
			const input = wrapper.find("select[id='editor-control-someofcolumnsList']");
			expect(input).to.have.length(1);

			const optAge = document.createElement("OPTION");
			optAge.selected = true;
			optAge.value = "Age";
			const options1 = [
				optAge
			];

			expect(input.find("option")).to.have.length(7);
			input.simulate("change", { target: { options: options1 } });
			expect(controller.getPropertyValue(propertyId)).to.have.length(1);

			optAge.selected = false;
			input.simulate("change", { target: { options: options1 } });
			wrapper.update();
			expect(controller.getPropertyValue(propertyId)).to.have.length(0);

			const someofcolumnsListWarningMessages = {
				"type": "warning",
				"text": "Field must be selected",
			};
			compareObjects(someofcolumnsListWarningMessages, controller.getErrorMessage(propertyId));

			expect(wrapper.find(".validation-warning-message-icon-selection")).to.have.length(1);
			expect(wrapper.find(".validation-error-message-color-warning")).to.have.length(1);
		});
	});

	describe("condition messages renders correctly with checkbox control", () => {
		it("checkboxTypes control should have warning message if none are checked", () => {
			const wrapper = createEditorForm("mount");

			const input = wrapper.find("#editor-control-checkboxTypes");
			expect(input).to.have.length(1);
			expect(input.find("input[type='checkbox']")).to.have.length(3);
			const checkbox = wrapper.find("input[type='checkbox']").at(1);
			checkbox.simulate("change", { target: { checked: true, id: "string" } });
			wrapper.update();

			const checkboxSingleMessages = {
				"type": "error",
				"text": "Checkbox single should be checked if data type is selected"
			};
			var checkboxTypesMessages = {
				"type": "error",
				"text": "Checkbox single should be checked if data type is selected"
			};
			compareObjects(checkboxSingleMessages, controller.getErrorMessage({ name: "checkboxSingle" }));
			compareObjects(checkboxTypesMessages, controller.getErrorMessage({ name: "checkboxTypes" }));

			expect(wrapper.find(".validation-error-message-icon-checkbox")).to.have.length(2);
			expect(wrapper.find(".validation-error-message-color-error")).to.have.length(2);

			checkbox.simulate("change", { target: { checked: false, id: "string" } });
			wrapper.update();

			checkboxTypesMessages = {
				"type": "warning",
				"text": "No data types are selected"
			};
			compareObjects(checkboxTypesMessages, controller.getErrorMessage({ name: "checkboxTypes" }));

			expect(wrapper.find(".validation-warning-message-icon-checkbox")).to.have.length(1);
			expect(wrapper.find(".validation-error-message-color-warning")).to.have.length(1);
		});
	});
	describe("condition messages renders correctly with structure table cells", () => {
		it("structuretableRenameFields control should have error message with empty renamed field", () => {
			const wrapper = createEditorForm("mount");
			const propertyId = { name: "structuretableRenameFields" };
			const input = wrapper.find("#structure-table").at(1);
			expect(input).to.have.length(1);
			expect(controller.getPropertyValue(propertyId)).to.have.length(2);

			const dataRows = input.find(".reactable-data").find("tr");
			expect(dataRows).to.have.length(2);
			dataRows.first().simulate("click");
			const cell = dataRows.first().find("#editor-control-new_name");
			cell.simulate("change", { target: { value: "" } });
			const rowValues = controller.getPropertyValue(propertyId);
			const expected = [
				["Age", ""],
				["BP", "BP-1"]
			];
			expect(_.isEqual(rowValues, expected)).to.be.true;

			// TODO nothing being checked here for validations
		});

		it("structuretableRenameFields control should have disabled dropdown control", () => {
			const wrapper = createEditorForm("mount");
			const tabs = wrapper.find(".tabs__tabpanel");
			expect(tabs).to.have.length(6);
			const tab = tabs.at(5);
			const dataRows = tab.find(".reactable-data").find("tr");
			expect(dataRows).to.have.length(7);
			const uncheckedRow = dataRows.at(1);
			expect(uncheckedRow.find(".Dropdown-disabled")).to.have.length(1);
			const cells = uncheckedRow.find("td");
			expect(cells).to.have.length(5);
			const cell = cells.at(3);
			const dropdown = cell.find(".Dropdown-control-table");
			expect(dropdown).to.have.length(1);
			expect(dropdown).to.have.style("display", "none");
		});
	});
	describe("condition messages renders correctly with structure table control", () => {
		it("structuretableSortOrder control should have error message from no selection", () => {
			// a note about this test.  structuretableSortOrder has the required = true attribute and
			// a isNotEmpty condition.  THe isNotEmpty condition error message should take precendence.
			const wrapper = createEditorForm("mount");
			const propertyId = { name: "structuretableSortOrder" };
			const input = wrapper.find("#structure-table").at(0);
			expect(input).to.have.length(1);
			expect(controller.getPropertyValue(propertyId)).to.have.length(1);

			let dataRows = input.find(".reactable-data").find("tr");
			expect(dataRows).to.have.length(1);
			dataRows.first().simulate("click");
			wrapper.update();

			const enabledRemoveColumnButton = wrapper.find("#remove-fields-button-enabled");
			expect(enabledRemoveColumnButton).to.have.length(1);

			enabledRemoveColumnButton.simulate("click");
			wrapper.update();
			dataRows = input.find(".reactable-data").find("tr");
			expect(dataRows).to.have.length(0);
			expect(controller.getPropertyValue(propertyId)).to.have.length(0);

			enabledRemoveColumnButton.simulate("blur");
			wrapper.update();

			const structuretableSortOrderErrorMessages = {
				"type": "error",
				"text": "table cannot be empty"
			};

			compareObjects(structuretableSortOrderErrorMessages, controller.getErrorMessage({ name: "structuretableSortOrder" }));
			expect(wrapper.find(".validation-error-message-icon")).to.have.length(1);
			expect(wrapper.find(".form__validation--error")).to.have.length(1);
		});

		it("structuretableRenameFields control should have error message from containing 'pw'", () => {
			const wrapper = createEditorForm("mount");
			const propertyId = { name: "structuretableRenameFields" };
			const input = wrapper.find("#structure-table").at(1);
			expect(input).to.have.length(1);
			expect(controller.getPropertyValue(propertyId)).to.have.length(2);

			const nameInput = input.find("input[id='editor-control-new_name']");
			expect(nameInput).to.have.length(2);
			const inputControl = nameInput.at(0);
			inputControl.simulate("change", { target: { value: "bad pw" } });
			wrapper.update();
			inputControl.simulate("blur");
			wrapper.update();

			const structuretableRenameFieldsErrorMessages = {
				"type": "error",
				"text": "The 'Output Name' field cannot contain 'pw'"
			};

			compareObjects(structuretableRenameFieldsErrorMessages, controller.getErrorMessage({ name: "structuretableRenameFields" }));
			expect(wrapper.find(".validation-error-message-icon")).to.have.length(1);
			expect(wrapper.find(".form__validation--error")).to.have.length(1);

		});

		it("required structuretableRenameTable control should have error message from no selection", () => {
			const wrapper = createEditorForm("mount");
			const propertyId = { name: "structuretableRenameFields" };

			const input = wrapper.find("#structure-table").at(1);
			expect(input).to.have.length(1);
			expect(controller.getPropertyValue(propertyId)).to.have.length(2);

			// remove two data row so that the table is empty
			let dataRows = input.find(".reactable-data").find("tr");
			expect(dataRows).to.have.length(2);
			dataRows.first().simulate("click");
			wrapper.update();

			const enabledRemoveColumnButton = wrapper.find("#remove-fields-button-enabled");
			expect(enabledRemoveColumnButton).to.have.length(1);

			enabledRemoveColumnButton.simulate("click");
			wrapper.update();
			dataRows = input.find(".reactable-data").find("tr");

			expect(dataRows).to.have.length(1);
			expect(controller.getPropertyValue(propertyId)).to.have.length(1);

			dataRows.first().simulate("click");
			wrapper.update();
			enabledRemoveColumnButton.simulate("click");
			wrapper.update();
			dataRows = input.find(".reactable-data").find("tr");

			expect(dataRows).to.have.length(0);
			expect(controller.getPropertyValue(propertyId)).to.have.length(0);

			enabledRemoveColumnButton.simulate("blur");

			const structuretableRenameFieldsErrorMessages = {
				"type": "error",
				"text": "Required parameter structuretableRenameFields has no value"
			};
			compareObjects(structuretableRenameFieldsErrorMessages, controller.getErrorMessage({ name: "structuretableRenameFields" }));

			expect(wrapper.find(".validation-error-message-icon")).to.have.length(1);
			expect(wrapper.find(".form__validation--error")).to.have.length(1);
		});
	});
	describe("Cells disable and hide correctly with structure table control", () => {
		it("structuretable should disable cells", () => {
			const wrapper = createEditorForm("mount");
			const table = wrapper.find("#structure-table");
			expect(table).to.have.length(4);
			const storageTable = table.at(3);
			let disabledDropdowns = storageTable.find(".Dropdown-disabled");
			expect(disabledDropdowns).to.have.length(4);
			const input = storageTable.find("#editor-control-override_field_types_0_1");
			expect(input).to.have.length(1);
			storageTable.find("input[id='editor-control-override_field_types_0_1']").simulate("change", { target: { checked: false } });
			wrapper.update();
			disabledDropdowns = storageTable.find(".Dropdown-disabled");
			expect(disabledDropdowns).to.have.length(5);
		});

		it("structuretable should hide cells", () => {
			const wrapper = createEditorForm("mount");
			const tabs = wrapper.find(".tabs__tabpanel");
			expect(tabs).to.have.length(6);
			const tab = tabs.at(5);
			const table = tab.find("#structure-table");
			const dataRows = table.find(".reactable-data").find("tr");
			expect(dataRows).to.have.length(7);
			let row = dataRows.first();
			let hiddenDropdowns = row.find(".Dropdown-control-table");
			expect(hiddenDropdowns).to.have.length(2);
			expect(hiddenDropdowns.at(1)).not.to.have.style("display", "none");
			const input = row.find("#editor-control-override_field_types_0_1");
			expect(input).to.have.length(1);
			wrapper.find("input[id='editor-control-override_field_types_0_1']").simulate("change", { target: { checked: false } });
			wrapper.update();
			row = dataRows.first();
			hiddenDropdowns = row.find(".Dropdown-control-table");
			expect(hiddenDropdowns).to.have.length(2);
			expect(hiddenDropdowns.at(1)).to.have.style("display", "none");
		});
	});

	describe("condition messages renders correctly with structurelisteditor table", () => {
		it("structurelisteditor control should have error message when notEquals []", () => {
			const wrapper = createEditorForm("mount");
			const propertyId = { name: "structurelisteditorTableInput" };
			const input = wrapper.find("#editor-control-structurelisteditorTableInput");
			expect(input).to.have.length(1);
			expect(controller.getPropertyValue(propertyId)).to.have.length(1);

			expect(wrapper.find(".validation-warning-message-icon-structure-list-editor")).to.have.length(0);
			expect(wrapper.find(".validation-error-message-color-warning")).to.have.length(0);
			// const dataRows = input.find(".public_fixedDataTable_bodyRow");
			const dataRows = input.find(".table-row");
			expect(dataRows).to.have.length(1);
			dataRows.first().simulate("click");
			wrapper.update();
			const removeRowButton = wrapper.find("#remove-fields-button-enabled");
			expect(removeRowButton).to.have.length(1);

			removeRowButton.simulate("click");
			wrapper.update();
			expect(controller.getPropertyValue(propertyId)).to.have.length(0);

			expect(wrapper.find(".validation-warning-message-icon-structure-list-editor")).to.have.length(1);
			expect(wrapper.find(".validation-error-message-color-warning")).to.have.length(1);
		});
	});

	describe("condition messages renders correctly with radioSet control", () => {
		// test radioSet disabled and warning message
		it("radiosetColor control should have warning message selected yellow", () => {
			const wrapper = createEditorForm("mount");
			const propertyId = { name: "radiosetColor" };
			const input = wrapper.find("#editor-control-radiosetColor");
			expect(input).to.have.length(1);
			const radios = input.find("input[type='radio']");
			expect(radios).to.have.length(3);
			radios.forEach((radio) => {
				// console.log("radio propsss " + JSON.stringify(radio.props()));
				expect(radio.is("[disabled]")).to.equal(true);
			});
			expect(controller.getControlState(propertyId)).to.equal(defaultControlStates.radiosetColor);

			const checkbox = wrapper.find("#editor-control-checkboxEnable");
			expect(checkbox).to.have.length(1);
			checkbox.simulate("change", { target: { checked: true, id: "Enable" } });
			wrapper.update();
			radios.forEach((radio) => {
			// console.log("radio propsss " + JSON.stringify(radio.props()));
				expect(radio.is("[disabled]")).to.equal(false);
			});

			expect(controller.getControlState(propertyId)).to.equal("enabled");

			const radioYellow = radios.find("input[value='yellow']");
			radioYellow.simulate("change", { target: { checked: true, value: "yellow" } });
			wrapper.update();
			const radiosetColorWarningMessages = {
				radiosetColor:
							{ type: "warning",
								text: "Are you sure you want to choose yellow?"
							}
			};
			compareObjects(radiosetColorWarningMessages, controller.getErrorMessages());

			expect(wrapper.find(".validation-warning-message-icon-checkbox")).to.have.length(1);
			expect(wrapper.find(".validation-error-message-color-warning")).to.have.length(1);

			expect(checkbox).to.have.length(1);
			checkbox.simulate("change", { target: { checked: false, id: "Enable" } });
			wrapper.update();
			expect(controller.getControlState(propertyId)).to.equal(defaultControlStates.radiosetColor);

			radios.forEach((radio) => {
				expect(radio.is("[disabled]")).to.equal(true);
			});
		});
	});

	describe("condition messages renders correctly with textfields control", () => {
		it("test passwordfield isNotEmpty", () => {
			const wrapper = createEditorForm("mount");

			const passwordInput = wrapper.find("input[id='editor-control-passwordField']");
			expect(passwordInput).to.have.length(1);
			passwordInput.simulate("change", { target: { value: "" } });
			wrapper.update();
			let textfieldNameErrorMessages = {
				passwordField:
							{ type: "error",
								text: "Password cannot be empty, enter \"password\"" },
				textfieldName:
							{ type: "error",
								text: "textfieldName is missing an input value for validation."
							}
			};

			compareObjects(textfieldNameErrorMessages, controller.getErrorMessages());
			passwordInput.simulate("change", { target: { value: "password" } });
			wrapper.update();
			textfieldNameErrorMessages = {
				textfieldName:
							{ type: "error",
								text: "textfieldName is missing an input value for validation."
							},
				passwordField:
							{ type: "error",
								text: "textfieldName is missing an input value for validation."
							}
			};

			compareObjects(textfieldNameErrorMessages, controller.getErrorMessages());

			const textfieldNameInput = wrapper.find("#editor-control-textfieldName");
			textfieldNameInput.simulate("change", { target: { value: "entering a name that contains the password" } });
			wrapper.update();
			textfieldNameErrorMessages = {
				passwordField:
							{ type: "warning",
								text: "name cannot contain password"
							},
				textfieldName:
							{ type: "warning",
								text: "name cannot contain password"
							}
			};

			compareObjects(textfieldNameErrorMessages, controller.getErrorMessages());
		});

		it("control should be hidden", () => {
			const wrapper = createEditorForm("mount");
			const textareaDescriptionInput = wrapper.find("#editor-control-textareaDescription");
			expect(textareaDescriptionInput).to.have.length(1);
			expect(textareaDescriptionInput).to.have.style("display", "none");
			expect(controller.getControlState({ name: "textareaDescription" })).to.equal(defaultControlStates.textareaDescription);
		});

		it("textfields control should have error message from invalid input", () => {
			const wrapper = createEditorForm("mount");

			const passwordInput = wrapper.find("input[id='editor-control-passwordField']");
			expect(passwordInput).to.have.length(1);
			passwordInput.simulate("change", { target: { value: "password" } });
			wrapper.update();
			const textfieldNameInput = wrapper.find("#editor-control-textfieldName");
			const textareaDescriptionInput = wrapper.find("#editor-control-textareaDescription");

			expect(controller.getControlState({ name: "textareaDescription" })).to.equal("hidden");

			textfieldNameInput.simulate("change", { target: { value: "entering a name with invalid \"quotes'" } });
			wrapper.update();
			let textfieldNameErrorMessages = {
				textfieldName:
							{
								type: "error",
								text: "Name cannot contain double or single \"quotes\""
							}
			};

			compareObjects(textfieldNameErrorMessages, controller.getErrorMessages());

			expect(wrapper.find(".validation-error-message-icon")).to.have.length(1);
			expect(wrapper.find(".form__validation--error")).to.have.length(1);

			textfieldNameInput.simulate("change", { target: { value: "entering a name with invlid / backslash" } });
			wrapper.update();
			textfieldNameErrorMessages = {
				textfieldName:
				{
					type: "error",
					text: "Name cannot contain /"
				}
			};

			compareObjects(textfieldNameErrorMessages, controller.getErrorMessages());

			expect(wrapper.find(".validation-error-message-icon")).to.have.length(1);
			expect(wrapper.find(".form__validation--error")).to.have.length(1);

			const checkbox = wrapper.find("#editor-control-checkboxEnableDesc");
			expect(checkbox).to.have.length(1);
			checkbox.simulate("change", { target: { checked: true, id: "Enable" } });
			textfieldNameInput.simulate("change", { target: { value: "entering a valid name" } });
			textareaDescriptionInput.simulate("change", { target: { value: "entering a valid description" } });
			wrapper.update();
			textfieldNameErrorMessages = {};
			compareObjects(textfieldNameErrorMessages, controller.getErrorMessages());

			expect(wrapper.find(".form__validation--error")).to.have.length(0);
			expect(wrapper.find(".form__validation--warning")).to.have.length(0);
		});

		it("required textfields control should have error message from null input", () => {
			const wrapper = createEditorForm("mount");

			const textareaDescriptionInput = wrapper.find("#editor-control-textareaDescription");

			const checkbox = wrapper.find("#editor-control-checkboxEnableDesc");
			expect(checkbox).to.have.length(1);
			checkbox.simulate("change", { target: { checked: true, id: "Enable" } });
			textareaDescriptionInput.simulate("change", { target: { value: "" } });

			const textfieldNameErrorMessages = {
				textareaDescription:
							{
								type: "error",
								text: "Required parameter textareaDescription has no value"
							}
			};

			compareObjects(textfieldNameErrorMessages, controller.getErrorMessages());
			wrapper.update();
			expect(wrapper.find(".form__validation--error")).to.have.length(1);
			expect(wrapper.find(".form__validation--warning")).to.have.length(0);
		});
	});

	describe("condition messages renders correctly with dropDown control", () => {
		it("oneofselectAnimals control should have warning message from empty selection", () => {
			const wrapper = createEditorForm("mount");

			const dropdownContainer = wrapper.find("#oneofselect-control-container").at(0);
			const dropdown = dropdownContainer.find(".Dropdown-control-panel");
			expect(dropdown).to.have.length(1);
			dropdown.find(".Dropdown-control").simulate("click");
			wrapper.update();
			expect(dropdownContainer.find(".validation-warning-message-icon-dropdown")).to.have.length(1);
			expect(dropdownContainer.find(".validation-error-message-color-warning")).to.have.length(1);
		});
	});
});
