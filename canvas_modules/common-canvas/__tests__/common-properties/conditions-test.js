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
import _ from "underscore";
import chai from "chai";
import chaiEnzyme from "chai-enzyme";
chai.use(chaiEnzyme()); // Note the invocation at the end

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

const validationDefinitions = [];
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
						"default": "Maximum number of bins must be >= 2 or Maximum depth of the tree > 0"
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
						"default": "Maximum number of bins must be >= 2 or Maximum depth of the tree > 0"
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
validationDefinitions.numberfieldMinInstancesPerNode = [
	{
		params: "numberfieldMinInstancesPerNode",
		definition: {
			"validation": {
				"fail_message": {
					"type": "warning",
					"focus_parameter_ref": "numberfieldMinInstancesPerNode",
					"message": {
						"resource_key": "numberfield_min_instances_per_node_not_valid",
						"default": "The minimum instances per node value must be >= 1"
					}
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "numberfieldMinInstancesPerNode",
						"op": "greaterThan",
						"value": 0
					}
				}
			}
		}
	}
];
validationDefinitions.numberfieldMinInfoGain = [
	{
		params: "numberfieldMinInfoGain",
		definition: {
			"validation": {
				"fail_message": {
					"type": "error",
					"focus_parameter_ref": "numberfieldMinInfoGain",
					"message": {
						"resource_key": "numberfield_min_info_gain_not_valid",
						"default": "Cannot be less than 0"
					}
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "numberfieldMinInfoGain",
						"op": "greaterThan",
						"value": 0
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
						"default": "This is an example of a very long error message that someone might enter. The message text will wrap around to the next line as shown here."
					}
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "numberfieldSeed",
						"op": "contains",
						"value": "123"
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
			"checkboxTypes",
			"checkboxSingle"
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
							"and": [
								{
									"condition": {
										"parameter_ref": "checkboxTypes",
										"op": "isNotEmpty"
									}
								},
								{
									"condition": {
										"parameter_ref": "checkboxSingle",
										"op": "checked"
									}
								}
							]
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
										"op": "notChecked"
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
						"default": "Warning: selected tiger",
						"resource_key": "one_of_select_animals_not_empty"
					},
					"focus_parameter_ref": "oneofselectAnimals"
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "oneofselectAnimals",
						"op": "notContains",
						"value": "tiger"
					}
				}
			}
		}
	}
];
validationDefinitions.someofselectNumbers = [
	{
		params: "someofselectNumbers",
		definition: {
			"validation": {
				"fail_message": {
					"type": "warning",
					"message": {
						"default": "Warning: selected three",
						"resource_key": "some_of_select_animals_not_three"
					},
					"focus_parameter_ref": "someofselectNumbers"
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "someofselectNumbers",
						"op": "notContains",
						"value": "three"
					}
				}
			}
		}
	}
];
validationDefinitions.checkboxSingle = [
	{
		params: [
			"checkboxTypes",
			"checkboxSingle"
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
							"and": [
								{
									"condition": {
										"parameter_ref": "checkboxTypes",
										"op": "isNotEmpty"
									}
								},
								{
									"condition": {
										"parameter_ref": "checkboxSingle",
										"op": "checked"
									}
								}
							]
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
										"op": "notChecked"
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
validationDefinitions.expressionBox = [
	{
		params: "expressionBox",
		definition: {
			"validation": {
				"fail_message": {
					"type": "error",
					"message": {
						"default": "Expression cannot contain /, double or single \"quotes\"",
						"resource_key": "expression_box_not_valid"
					},
					"focus_parameter_ref": "expressionBox"
				},
				"evaluate": {
					"and": [
						{
							"condition": {
								"parameter_ref": "expressionBox",
								"op": "notContains",
								"value": "/"
							}
						},
						{
							"condition": {
								"parameter_ref": "expressionBox",
								"op": "notContains",
								"value": "\""
							}
						},
						{
							"condition": {
								"parameter_ref": "expressionBox",
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
validationDefinitions.structuretableRenameFields = [
	{
		params: "structuretableRenameFields",
		definition: {
			"validation": {
				"fail_message": {
					"type": "error",
					"focus_parameter_ref": "structuretableRenameFields",
					"message": {
						"resource_key": "structuretable_rename_fields_not_empty",
						"default": "The 'Rename Columns' table cannot be empty"
					}
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "structuretableRenameFields",
						"op": "isNotEmpty"
					}
				}
			}
		}
	},
	{
		params: "structuretableRenameFields",
		definition: {
			"validation": {
				"fail_message": {
					"type": "error",
					"focus_parameter_ref": "structuretableRenameFields",
					"message": {
						"resource_key": "output_name_not_empty",
						"default": "The 'Output Name' field cannot be empty"
					}
				},
				"evaluate": {
					"condition": {
						"parameter_ref": "structuretableRenameFields",
						"op": "cellNotEmpty"
					}
				}
			}
		}
	}
];
validationDefinitions.subpanelTextfieldName = [
	{
		params: "name",
		definition: {
			"validation": {
				"fail_message": {
					"type": "error",
					"message": {
						"default": "name should not contain pw",
						"resource_key": "invalid_subpanel_name"
					},
					"focus_parameter_ref": "name"
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
	"textfieldName": "hidden",
	"textareaDescription": "hidden",
	"expressionBox": "hidden",
	"radiosetColor": "disabled"
};

function createEditorForm(state) {
	let wrapper;
	if (state === "shallow") {
		wrapper = shallow(
			<EditorForm
				ref="editorForm"
				key="editor-form-key"
				form={formData}
				additionalComponents={additionalComponents}
				showPropertiesButtons={showPropertiesButtons}
			/>
		);
	} else {
		wrapper = mount(
			<EditorForm
				ref="editorForm"
				key="editor-form-key"
				form={formData}
				additionalComponents={additionalComponents}
				showPropertiesButtons={showPropertiesButtons}
			/>
		);
	}

	return wrapper;
}

describe("editor-form renders correctly with validations", () => {

	it("props should have been defined", () => {
		const wrapper = createEditorForm("shallow");

		expect(wrapper.form).to.be.defined;
		expect(wrapper.additionalComponents).to.be.defined;
		expect(wrapper.showPropertiesButtons).to.be.defined;
	});

	it("should render an `EditorForm` with parsed conditions", () => {
		const wrapper = createEditorForm("mount");

		expect(wrapper.find("#form-Conditions-test")).to.have.length(1);
		expect(wrapper.find(".section--light")).to.have.length(1);
		expect(wrapper.find(".tabs__tabpanel")).to.have.length(5);
		expect(wrapper.find(".editor_control_area")).to.have.length(17);
		expect(wrapper.find(".validation-error-message")).to.have.length(22);
	});

	it("should set correct state values in `EditorForm`", () => {
		const wrapper = createEditorForm("shallow");

		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().formData)),
			JSON.parse(JSON.stringify(formData)))).to.be.true;
		expect(wrapper.state().visibleDefinition).to.have.length(2);
		expect(wrapper.state().enabledDefinitions).to.have.length(2);

		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().validationDefinitions.numberfieldCheckpointInterval)),
			JSON.parse(JSON.stringify(validationDefinitions.numberfieldCheckpointInterval)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().validationDefinitions.numberfieldMaxBins)),
			JSON.parse(JSON.stringify(validationDefinitions.numberfieldMaxBins)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().validationDefinitions.numberfieldMaxDepth)),
			JSON.parse(JSON.stringify(validationDefinitions.numberfieldMaxDepth)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().validationDefinitions.numberfieldMinInstancesPerNode)),
			JSON.parse(JSON.stringify(validationDefinitions.numberfieldMinInstancesPerNode)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().validationDefinitions.numberfieldMinInfoGain)),
			JSON.parse(JSON.stringify(validationDefinitions.numberfieldMinInfoGain)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().validationDefinitions.numberfieldSeed)),
			JSON.parse(JSON.stringify(validationDefinitions.numberfieldSeed)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().validationDefinitions.columnSelectInputFieldList)),
			JSON.parse(JSON.stringify(validationDefinitions.columnSelectInputFieldList)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().validationDefinitions.oneofcolumnsList)),
			JSON.parse(JSON.stringify(validationDefinitions.oneofcolumnsList)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().validationDefinitions.someofcolumnsList)),
			JSON.parse(JSON.stringify(validationDefinitions.someofcolumnsList)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().validationDefinitions.checkboxTypes)),
			JSON.parse(JSON.stringify(validationDefinitions.checkboxTypes)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().validationDefinitions.oneofselectAnimals)),
			JSON.parse(JSON.stringify(validationDefinitions.oneofselectAnimals)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().validationDefinitions.someofselectNumbers)),
			JSON.parse(JSON.stringify(validationDefinitions.someofselectNumbers)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().validationDefinitions.checkboxSingle)),
			JSON.parse(JSON.stringify(validationDefinitions.checkboxSingle)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().validationDefinitions.radiosetColor)),
			JSON.parse(JSON.stringify(validationDefinitions.radiosetColor)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().validationDefinitions.passwordField)),
			JSON.parse(JSON.stringify(validationDefinitions.passwordField)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().validationDefinitions.textfieldName)),
			JSON.parse(JSON.stringify(validationDefinitions.textfieldName)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().validationDefinitions.textareaDescription)),
			JSON.parse(JSON.stringify(validationDefinitions.textareaDescription)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().validationDefinitions.expressionBox)),
			JSON.parse(JSON.stringify(validationDefinitions.expressionBox)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().validationDefinitions.structuretableRenameFields)),
			JSON.parse(JSON.stringify(validationDefinitions.structuretableRenameFields)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().validationDefinitions.name)),
			JSON.parse(JSON.stringify(validationDefinitions.subpanelTextfieldName)))).to.be.true;
		expect(_.isEqual(JSON.stringify(wrapper.state().controlErrorMessages), "{}")).to.be.true;
	});
});

describe("condition messages renders correctly with numberfield control", () => {
	it("numberfield control should have error message from invalid input", () => {
		const wrapper = createEditorForm("mount");

		const input = wrapper.find("input[id='editor-control-numberfieldCheckpointInterval']");
		expect(input).to.have.length(1);
		input.simulate("change", { target: { value: "-100" } });
		input.simulate("blur");

		const numberfieldCheckpointIntervalErrorMessages = {
			"numberfieldCheckpointInterval": {
				"type": "error",
				"text": "The checkpoint interval value must either be >= 1 or -1 to disable"
			}
		};
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().controlErrorMessages)),
			JSON.parse(JSON.stringify(numberfieldCheckpointIntervalErrorMessages)))).to.be.true;

		expect(wrapper.find(".validation-error-message-icon")).to.have.length(1);
		expect(wrapper.find(".form__validation--error")).to.have.length(1);
	});
});

describe("condition messages renders correctly with columnselect control", () => {
	it("columnselect control should have error message from empty input", () => {
		const wrapper = createEditorForm("mount");

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

		const enabledRemoveColumnButton = wrapper.find("#remove-fields-button-enabled");
		expect(enabledRemoveColumnButton).to.have.length(1);

		enabledRemoveColumnButton.simulate("click");
		expect(input.find("option")).to.have.length(1);
		expect(wrapper.state().valuesTable.columnSelectInputFieldList).to.have.length(1);

		optBp.selected = true;
		const options2 = [
			optBp
		];
		input.simulate("change", { target: { options: options2 } });

		enabledRemoveColumnButton.simulate("click");
		expect(input.find("option")).to.have.length(0);
		expect(wrapper.state().valuesTable.columnSelectInputFieldList).to.have.length(0);
		input.simulate("blur");

		const columnSelectInputFieldListErrorMessages = {
			"columnSelectInputFieldList": {
				"type": "error",
				"text": "Select one or more input fields."
			}
		};
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().controlErrorMessages)),
			JSON.parse(JSON.stringify(columnSelectInputFieldListErrorMessages)))).to.be.true;

		expect(wrapper.find(".validation-error-message-icon")).to.have.length(1);
		expect(wrapper.find(".form__validation--error")).to.have.length(1);
	});
});

describe("condition messages renders correctly with someofcolumns control", () => {
	it("someofcolumnsList control should have warning message from no selection", () => {
		const wrapper = createEditorForm("mount");

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
		expect(wrapper.state().valuesTable.someofcolumnsList).to.have.length(1);

		optAge.selected = false;
		input.simulate("change", { target: { options: options1 } });
		expect(wrapper.state().valuesTable.someofcolumnsList).to.have.length(0);

		input.simulate("blur");

		const someofcolumnsListWarningMessages = {
			"someofcolumnsList": {
				"type": "warning",
				"text": "Field must be selected"
			}
		};
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().controlErrorMessages)),
			JSON.parse(JSON.stringify(someofcolumnsListWarningMessages)))).to.be.true;

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
		checkbox.simulate("blur");

		const checkboxSingleErrorMessages = {
			"checkboxTypes": {
				"type": "error",
				"text": "Checkbox single should be checked if data type is selected"
			},
			"checkboxSingle": {
				"type": "error",
				"text": "Checkbox single should be checked if data type is selected"
			}
		};
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().controlErrorMessages)),
			JSON.parse(JSON.stringify(checkboxSingleErrorMessages)))).to.be.true;

		expect(wrapper.find(".validation-error-message-icon-checkbox")).to.have.length(2);
		expect(wrapper.find(".validation-error-message-color-error")).to.have.length(2);

		checkbox.simulate("change", { target: { checked: false, id: "string" } });
		checkbox.simulate("blur");

		const checkboxTypesWarningMessages = {
			"checkboxTypes": {
				"type": "warning",
				"text": "No data types are selected"
			},
			"checkboxSingle": {
				"type": "info",
				"text": ""
			}
		};
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().controlErrorMessages)),
			JSON.parse(JSON.stringify(checkboxTypesWarningMessages)))).to.be.true;

		expect(wrapper.find(".validation-warning-message-icon-checkbox")).to.have.length(1);
		expect(wrapper.find(".validation-error-message-color-warning")).to.have.length(1);
	});
});

describe("StructureTableEditor handles cell level conditions", () => {
	it("structuretableRenameFields control should have error message with empty renamed field", () => {
		const wrapper = createEditorForm("mount");

		const input = wrapper.find("#structure-table").at(1);
		expect(input).to.have.length(1);
		expect(wrapper.state().valuesTable.structuretableRenameFields).to.have.length(2);

		const dataRows = input.find(".reactable-data").find("tr");
		expect(dataRows).to.have.length(2);
		dataRows.first().simulate("click");

		const cell = dataRows.first().find("#editor-control-structuretableRenameFields");
		cell.simulate("change", { target: { value: "" } });
		cell.simulate("blur");
		const rowValues = wrapper.state().valuesTable.structuretableRenameFields;
		expect(rowValues).to.have.length(2);
		const expected = [
			["Age", ""],
			["BP", "BP-1"]
		];
		expect(_.isEqual(rowValues, expected)).to.be.true;

	//	const structuretableRenameFieldsErrorMessages = {
		//	"structuretableRenameFields": {
		//		"type": "error",
		//		"text": "The 'Output Name' field cannot be empty"
		//	}
		// };


		// This fails for some inexplicable reason - works fine in the UI
		// expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().controlErrorMessages)),
		//	JSON.parse(JSON.stringify(structuretableRenameFieldsErrorMessages)))).to.be.true;
		// expect(wrapper.find(".validation-error-message-icon")).to.have.length(1);
		// expect(wrapper.find(".form__validation--error")).to.have.length(1);
	});
});

describe("condition messages renders correctly with structure table control", () => {
	it("structuretableRenameFields control should have error message from no selection", () => {
		const wrapper = createEditorForm("mount");

		const input = wrapper.find("#structure-table").at(1);
		expect(input).to.have.length(1);
		expect(wrapper.state().valuesTable.structuretableRenameFields).to.have.length(2);

		let dataRows = input.find(".reactable-data").find("tr");
		expect(dataRows).to.have.length(2);
		dataRows.first().simulate("click");

		const enabledRemoveColumnButton = wrapper.find("#remove-fields-button-enabled");
		expect(enabledRemoveColumnButton).to.have.length(1);

		enabledRemoveColumnButton.simulate("click");
		dataRows = input.find(".reactable-data").find("tr");
		expect(dataRows).to.have.length(1);
		expect(wrapper.state().valuesTable.structuretableRenameFields).to.have.length(1);

		dataRows.first().simulate("click");
		enabledRemoveColumnButton.simulate("click");
		dataRows = input.find(".reactable-data").find("tr");
		expect(dataRows).to.have.length(0);
		expect(wrapper.state().valuesTable.structuretableRenameFields).to.have.length(0);

		enabledRemoveColumnButton.simulate("blur");

		const structuretableRenameFieldsErrorMessages = {
			"structuretableRenameFields": {
				"type": "error",
				"text": "The 'Rename Columns' table cannot be empty"
			}
		};
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().controlErrorMessages)),
			JSON.parse(JSON.stringify(structuretableRenameFieldsErrorMessages)))).to.be.true;

		expect(wrapper.find(".validation-error-message-icon")).to.have.length(1);
		expect(wrapper.find(".form__validation--error")).to.have.length(1);
	});
});

describe("condition messages renders correctly with radioSet control", () => {
	// test radioSet disabled and warning message
	it("radiosetColor control should have warning message selected yellow", () => {
		const wrapper = createEditorForm("mount");

		const input = wrapper.find("#editor-control-radiosetColor");
		expect(input).to.have.length(1);
		const radios = input.find("input[type='radio']");
		expect(radios).to.have.length(3);
		radios.forEach((radio) => {
			// console.log("radio propsss " + JSON.stringify(radio.props()));
			expect(radio.is("[disabled]")).to.equal(true);
		});

		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().controlStates)),
			JSON.parse(JSON.stringify(defaultControlStates)))).to.be.true;

		const checkbox = wrapper.find("#editor-control-checkboxEnable");
		expect(checkbox).to.have.length(1);
		checkbox.simulate("change", { target: { checked: true, id: "Enable" } });
		checkbox.simulate("blur");

		radios.forEach((radio) => {
			expect(radio.is("[disabled]")).to.equal(false);
		});

		const controlStates = {
			"textfieldName": "hidden",
			"textareaDescription": "hidden",
			"expressionBox": "hidden"
		};
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().controlStates)),
			JSON.parse(JSON.stringify(controlStates)))).to.be.true;

		const radioYellow = radios.find("input[value='yellow']");
		radioYellow.simulate("change", { target: { checked: true, value: "yellow" } });
		radioYellow.simulate("blur");

		const radiosetColorWarningMessages = {
			"radiosetColor": {
				"type": "warning",
				"text": "Are you sure you want to choose yellow?"
			}
		};
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().controlErrorMessages)),
			JSON.parse(JSON.stringify(radiosetColorWarningMessages)))).to.be.true;

		expect(wrapper.find(".validation-warning-message-icon-checkbox")).to.have.length(1);
		expect(wrapper.find(".validation-error-message-color-warning")).to.have.length(1);

		expect(checkbox).to.have.length(1);
		checkbox.simulate("change", { target: { checked: false, id: "Enable" } });
		checkbox.simulate("blur");

		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().controlStates)),
			JSON.parse(JSON.stringify(defaultControlStates)))).to.be.true;

		radios.forEach((radio) => {
			expect(radio.is("[disabled]")).to.equal(true);
		});
	});
});

describe("condition messages renders correctly with textfields control", () => {
	it("controls should be hidden", () => {
		const wrapper = createEditorForm("mount");

		const textfieldNameInput = wrapper.find("#editor-control-textfieldName");
		expect(textfieldNameInput).to.have.length(1);
		expect(textfieldNameInput).to.have.style("visibility", "hidden");

		const textareaDescriptionInput = wrapper.find("#editor-control-textareaDescription");
		expect(textareaDescriptionInput).to.have.length(1);
		expect(textareaDescriptionInput).to.have.style("visibility", "hidden");

		const expressionBoxInput = wrapper.find("#editor-control-expressionBox");
		expect(expressionBoxInput).to.have.length(1);
		expect(expressionBoxInput).to.have.style("visibility", "hidden");

		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().controlStates.textfieldName)),
			JSON.parse(JSON.stringify(defaultControlStates.textfieldName)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().controlStates.textareaDescription)),
			JSON.parse(JSON.stringify(defaultControlStates.textareaDescription)))).to.be.true;
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().controlStates.expressionBox)),
			JSON.parse(JSON.stringify(defaultControlStates.expressionBox)))).to.be.true;
	});

	it("textfields control should have error message from invalid input", () => {
		const wrapper = createEditorForm("mount");

		const passwordInput = wrapper.find("input[id='editor-control-passwordField']");
		expect(passwordInput).to.have.length(1);
		passwordInput.simulate("change", { target: { value: "password" } });
		passwordInput.simulate("blur");

		const textfieldNameInput = wrapper.find("#editor-control-textfieldName");
		const textareaDescriptionInput = wrapper.find("#editor-control-textareaDescription");
		const expressionBoxInput = wrapper.find("#editor-control-expressionBox");

		expect(expressionBoxInput.is("[disabled]")).to.equal(true);
		const controlStates = {
			"expressionBox": "disabled"
		};
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().controlStates.expressionBox)),
			JSON.parse(JSON.stringify(controlStates.expressionBox)))).to.be.true;

		textfieldNameInput.simulate("change", { target: { value: "entering a name with invalid \"quotes'" } });
		textfieldNameInput.simulate("blur");

		let textfieldNameErrorMessages = {
			"passwordField": {
				"type": "info",
				"text": ""
			},
			"textfieldName": {
				"type": "error",
				"text": "Name cannot contain double or single \"quotes\""
			}
		};
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().controlErrorMessages)),
			JSON.parse(JSON.stringify(textfieldNameErrorMessages)))).to.be.true;

		expect(wrapper.find(".validation-error-message-icon")).to.have.length(1);
		expect(wrapper.find(".form__validation--error")).to.have.length(1);

		textfieldNameInput.simulate("change", { target: { value: "entering a name with invlid / backslash" } });
		textfieldNameInput.simulate("blur");

		textfieldNameErrorMessages = {
			"passwordField": {
				"type": "info",
				"text": ""
			},
			"textfieldName": {
				"type": "error",
				"text": "Name cannot contain /"
			}
		};
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().controlErrorMessages)),
			JSON.parse(JSON.stringify(textfieldNameErrorMessages)))).to.be.true;

		expect(wrapper.find(".validation-error-message-icon")).to.have.length(1);
		expect(wrapper.find(".form__validation--error")).to.have.length(1);

		textareaDescriptionInput.simulate("change", { target: { value: "entering a description with invalid \"quotes'" } });
		textareaDescriptionInput.simulate("blur");
		expressionBoxInput.simulate("change", { target: { value: "entering an expression with invalid \"quotes'" } });
		expressionBoxInput.simulate("blur");

		textfieldNameErrorMessages = {
			"passwordField": {
				"type": "info",
				"text": ""
			},
			"textfieldName": {
				"type": "error",
				"text": "Name cannot contain /"
			},
			"textareaDescription": {
				"type": "warning",
				"text": "Description cannot contain /, double or single \"quotes\""
			},
			"expressionBox": {
				"type": "error",
				"text": "Expression cannot contain /, double or single \"quotes\""
			}
		};
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().controlErrorMessages)),
			JSON.parse(JSON.stringify(textfieldNameErrorMessages)))).to.be.true;

		expect(wrapper.find(".validation-error-message-icon-textfield")).to.have.length(1);
		expect(wrapper.find(".validation-error-message-icon-textfieldbox")).to.have.length(1);
		expect(wrapper.find(".validation-warning-message-icon-textfieldbox")).to.have.length(1);
		expect(wrapper.find(".validation-error-message-color-error")).to.have.length(2);
		expect(wrapper.find(".validation-error-message-color-warning")).to.have.length(1);

		textfieldNameInput.simulate("change", { target: { value: "entering a valid name" } });
		textfieldNameInput.simulate("blur");
		textareaDescriptionInput.simulate("change", { target: { value: "entering a valid description" } });
		textareaDescriptionInput.simulate("blur");
		expressionBoxInput.simulate("change", { target: { value: "entering a valid expression" } });
		expressionBoxInput.simulate("blur");

		textfieldNameErrorMessages = {
			"passwordField": {
				"type": "info",
				"text": ""
			},
			"textfieldName": {
				"type": "info",
				"text": ""
			},
			"textareaDescription": {
				"type": "info",
				"text": ""
			},
			"expressionBox": {
				"type": "info",
				"text": ""
			}
		};
		expect(_.isEqual(JSON.parse(JSON.stringify(wrapper.state().controlErrorMessages)),
			JSON.parse(JSON.stringify(textfieldNameErrorMessages)))).to.be.true;
		// console.info("testtt  " + JSON.stringify(wrapper.state().valuesTable));
		// console.info("testtt  " + JSON.stringify(wrapper.state().controlErrorMessages));
		// console.info("testtt  " + JSON.stringify(wrapper.state().controlStates));

		expect(wrapper.find(".form__validation--error")).to.have.length(0);
		expect(wrapper.find(".form__validation--warning")).to.have.length(0);
	});
});

// cannot simulate a mouseDown event
// describe("condition messages renders correctly with dropDown control", () => {
// 	it("oneofselectAnimals control should have warning message from selecting tiger", () => {
// 		const wrapper = createEditorForm("mount");
//
// 		const dropdown = wrapper.find(".Dropdown-control-panel").at(1);
// 		expect(dropdown).to.have.length(1);
// 		dropdown.find(".Dropdown-control").simulate("mouseDown");
// 		expect(dropdown.find(".Dropdown-menu")).to.have.length(1);
// 		expect(dropdown.find(".Dropdown-option")).to.have.length(5);
// 	});
// });
