/*
 * Copyright 2025 Elyra Authors
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

import { expect } from "chai";
import { fireEvent } from "@testing-library/react";

// import { validateInput } from "../../../src/common-properties/ui-conditions/ui-conditions.js";
import propertyUtilsRTL from "../../_utils_/property-utilsRTL.js";
import tableUtilsRTL from "./../../_utils_/table-utilsRTL";
import nestedConditionsParamDef from "../../test_resources/paramDefs/nestedConditions_paramDef.json";

describe("nested conditions display the error in the correct cell and table", () => {
	let wrapper;
	let controller;
	beforeEach(() => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(nestedConditionsParamDef);
		wrapper = renderedObject.wrapper;
		controller = renderedObject.controller;
		// controller.setErrorMessages({});
	});

	afterEach(() => {
		wrapper.unmount();
	});

	it("error message does not appear when common properties first opened", () => {
		const expectedError = {
			"nested_table": {
				"0": {
					"2": {
						"displayError": false,
						"propertyId": {
							"col": 2,
							"name": "nested_table",
							"row": 0
						},
						"required": false,
						"text": "Cannot select 'orange'",
						"type": "error",
						"validation_id": "nested_table"
					}
				}
			}
		};
		const allMessages = controller.getAllErrorMessages();
		expect(allMessages).to.eql(expectedError);
		expect(controller.getErrorMessages()).to.eql({});

		const container = wrapper.container;
		const errors = container.querySelectorAll(".properties-validation-message.error.inTable");
		expect(errors.length).to.equal(0);
	});

	it("conditions work correctly for a nested list control", () => {
		const container = wrapper.container;
		let mainTable = container.querySelector("div[data-id='properties-ci-nested_table']");
		tableUtilsRTL.selectCheckboxes(mainTable, [0]); // Select first row for onPanel edit

		// verify onPanel edit shows list control
		mainTable = container.querySelector("div[data-id='properties-ci-nested_table']");
		const onPanelList = mainTable.querySelectorAll(".properties-onpanel-container");
		expect(onPanelList).to.have.length(1);

		const listControl = onPanelList[0].querySelectorAll(".properties-list-table");
		expect(listControl.length).to.equal(1);
		const inputs = listControl[0].querySelectorAll("input[type='text']");
		expect(inputs.length).to.equal(2);

		const expectedErrors = {
			"nested_table": {
				"0": {
					"0": {
						"1": {
							"propertyId": {
								"col": 0,
								"name": "nested_table",
								"propertyId": {
									"name": "list",
									"row": 1
								},
								"row": 0
							},
							"required": false,
							"text": "Cannot be 'error'",
							"type": "error",
							"validation_id": "nested_table"
						},
						"propertyId": {
							"col": 0,
							"name": "nested_table",
							"propertyId": {
								"name": "list",
								"row": 1
							},
							"row": 0
						},
						"required": false,
						"text": "Cannot be 'error'",
						"type": "error",
						"validation_id": "nested_table"
					}
				}
			}
		};

		// Modify second input in list to show error
		fireEvent.change(inputs[1], { target: { value: "error" } });
		expect(controller.getErrorMessages()).to.eql(expectedErrors);

		// Verify main table also display the error in cell
		let errorCells = mainTable.querySelectorAll(".properties-validation-message.error.inTable");
		expect(errorCells.length).to.equal(2); // parent table and on panel `list` table

		// Remove error from list will also clear from parent table
		fireEvent.change(inputs[1], { target: { value: "removed error cell" } });
		expect(controller.getErrorMessages()).to.eql({});
		errorCells = mainTable.querySelectorAll(".properties-validation-message.error.inTable");
		expect(errorCells.length).to.equal(0);
	});

	it("conditions work correctly for a nested structuretable control", () => {
		const container = wrapper.container;
		let mainTable = container.querySelector("div[data-id='properties-ci-nested_table']");
		tableUtilsRTL.selectCheckboxes(mainTable, [0]); // Select first row for onPanel edit

		// verify onPanel edit shows structuretable control
		mainTable = container.querySelector("div[data-id='properties-ci-nested_table']");
		const onPanelTable = mainTable.querySelectorAll(".properties-onpanel-container");
		expect(onPanelTable).to.have.length(1);

		const structureTableControl = onPanelTable[0].querySelectorAll("div[data-id='properties-structuretable']");
		expect(structureTableControl.length).to.equal(1);
		const dropdowns = structureTableControl[0].querySelectorAll("select");
		expect(dropdowns.length).to.equal(2);

		const expectedOneError = {
			"nested_table": {
				"0": {
					"3": {
						"0": {
							"1": {
								"propertyId": {
									"col": 3,
									"name": "nested_table",
									"propertyId": {
										"col": 1,
										"name": "structuretable",
										"row": 0
									},
									"row": 0
								},
								"required": false,
								"text": "Cannot select 'green'",
								"type": "error",
								"validation_id": "nested_table"
							},
						},
						"propertyId": {
							"col": 3,
							"name": "nested_table",
							"propertyId": {
								"col": 1,
								"name": "structuretable",
								"row": 0
							},
							"row": 0
						},
						"required": false,
						"text": "Cannot select 'green'",
						"type": "error",
						"validation_id": "nested_table"
					}
				}
			}
		};

		// Modify first dropdown to show error
		fireEvent.change(dropdowns[0], { target: { value: "green" } });
		expect(controller.getErrorMessages()).to.eql(expectedOneError);

		// Verify main table also display the error in cell
		const errors = mainTable.querySelectorAll(".properties-validation-message.error.inTable");
		expect(errors.length).to.equal(2); // parent table and on panel `list` table

		const expectedTwoErrors = {
			"nested_table": {
				"0": {
					"3": {
						"0": {
							"1": {
								"propertyId": {
									"col": 3,
									"name": "nested_table",
									"propertyId": {
										"col": 1,
										"name": "structuretable",
										"row": 0
									},
									"row": 0
								},
								"required": false,
								"text": "Cannot select 'green'",
								"type": "error",
								"validation_id": "nested_table"
							}
						},
						"1": {
							"1": {
								"propertyId": {
									"col": 3,
									"name": "nested_table",
									"propertyId": {
										"col": 1,
										"name": "structuretable",
										"row": 1
									},
									"row": 0
								},
								"required": false,
								"text": "Cannot select 'green'",
								"type": "error",
								"validation_id": "nested_table"
							}
						},
						"propertyId": {
							"col": 3,
							"name": "nested_table",
							"propertyId": {
								"col": 1,
								"name": "structuretable",
								"row": 1
							},
							"row": 0
						},
						"required": false,
						"text": "Cannot select 'green'",
						"type": "error",
						"validation_id": "nested_table"
					}
				}
			}
		};

		// Modify second dropdown to show another error
		fireEvent.change(dropdowns[1], { target: { value: "green" } });
		expect(controller.getErrorMessages()).to.eql(expectedTwoErrors);

		// Verify main table also display the error in cell
		let errorCells = mainTable.querySelectorAll(".properties-validation-message.error.inTable");
		expect(errorCells.length).to.equal(3); // parent table and on panel `structuretable` table

		// Remove error from second dropdown will also update the error propertyId of structuretable
		fireEvent.change(dropdowns[1], { target: { value: "yellow" } });
		expect(controller.getErrorMessages()).to.eql(expectedOneError);

		// Remove error fom first dropdown will clear all error cells from both structuretable and parent table
		fireEvent.change(dropdowns[0], { target: { value: "red" } });
		expect(controller.getErrorMessages()).to.eql({});
		errorCells = mainTable.querySelectorAll(".properties-validation-message.error.inTable");
		expect(errorCells.length).to.equal(0);
	});

	it("conditions work correctly for a nested selectColumns control", () => {
		const container = wrapper.container;
		const mainTable = container.querySelector("div[data-id='properties-ci-nested_table']");
		const editButton = mainTable.querySelectorAll("button.properties-subpanel-button")[0];
		fireEvent.click(editButton); // Click subpanel edit button on first row

		// verify subpanel shows selectColumns control
		const subPanel = container.querySelectorAll(".properties-editstyle-sub-panel");
		expect(subPanel).to.have.length(1);

		const selectColumnsControl = subPanel[0].querySelectorAll(".properties-column-select-table");
		expect(selectColumnsControl.length).to.equal(1);

		// Select 'K' to show error
		const fieldPicker = tableUtilsRTL.openFieldPicker(container, "properties-ft-select_columns");
		tableUtilsRTL.fieldPicker(fieldPicker, ["K"]);

		const expectedSelectedValues = ["Age", "Na", "K"];
		expect(controller.getPropertyValue({ name: "nested_table", row: 0, col: 1 })).to.eql(expectedSelectedValues);
		const expectedOneError = {
			"nested_table": {
				"0": {
					"1": {
						"2": {
							"propertyId": {
								"col": 1,
								"name": "nested_table",
								"propertyId": {
									"row": 2
								},
								"row": 0
							},
							"required": false,
							"text": "Cannot contain 'K'",
							"type": "error",
							"validation_id": "nested_table"
						},
						"propertyId": {
							"col": 1,
							"name": "nested_table",
							"propertyId": {
								"row": 2
							},
							"row": 0
						},
						"required": false,
						"text": "Cannot contain 'K'",
						"type": "error",
						"validation_id": "nested_table"
					}
				}
			}
		};
		expect(controller.getErrorMessages()).to.eql(expectedOneError);

		// Verify subpanel selectColumns table display the error in cell
		const subPanelErrors = selectColumnsControl[0].querySelectorAll(".properties-validation-message.error.inTable");
		expect(subPanelErrors.length).to.equal(1);

		// Verify main parent table also display the error in cell
		const errors = mainTable.querySelectorAll(".properties-validation-message.error.inTable");
		expect(errors.length).to.equal(1);
	});

	it("conditions work correctly for a nested someofselect control", () => {
		const container = wrapper.container;
		const mainTable = container.querySelector("div[data-id='properties-ci-nested_table']");
		const editButton = mainTable.querySelectorAll("button.properties-subpanel-button")[0];
		fireEvent.click(editButton); // Click subpanel edit button on first row

		// verify subpanel shows someofselect control
		const subPanel = container.querySelectorAll(".properties-editstyle-sub-panel");
		expect(subPanel).to.have.length(1);

		// Select 'yellow' to trigger the error to show
		const someofselectControl = subPanel[0].querySelectorAll("div[data-id='properties-someofselect']");
		expect(someofselectControl.length).to.equal(1);
		tableUtilsRTL.selectCheckboxes(someofselectControl[0], [2]);

		const expectedSelectedValues = ["orange", "yellow", "green"];
		expect(controller.getPropertyValue({ name: "nested_table", row: 0, col: 2 })).to.eql(expectedSelectedValues);

		const expectedOneError = {
			"nested_table": {
				"0": {
					"2": {
						"propertyId": {
							"col": 2,
							"name": "nested_table",
							"row": 0
						},
						"required": false,
						"text": "Cannot select 'orange'",
						"type": "error",
						"validation_id": "nested_table"
					}
				}
			}
		};
		expect(controller.getErrorMessages()).to.eql(expectedOneError);

		// Verify subpanel someofselect table display the error in table
		let subPanelErrors = someofselectControl[0].querySelectorAll(".properties-validation-message.error");
		expect(subPanelErrors.length).to.equal(1);

		// Verify main parent table also display the error in cell
		let errors = mainTable.querySelectorAll(".properties-validation-message.error.inTable");
		expect(errors.length).to.equal(1);

		// Deselect 'orange' will remove error from someofselect table and parent table
		tableUtilsRTL.selectCheckboxes(someofselectControl[0], [1]);
		const expectedValues = ["yellow", "green"];
		expect(controller.getPropertyValue({ name: "nested_table", row: 0, col: 2 })).to.eql(expectedValues);

		subPanelErrors = someofselectControl[0].querySelectorAll(".properties-validation-message.error");
		expect(subPanelErrors.length).to.equal(0);
		errors = mainTable.querySelectorAll(".properties-validation-message.error.inTable");
		expect(errors.length).to.equal(0);
	});

	it("conditions work correctly for a nested structurelisteditor control", () => {
		const container = wrapper.container;
		const mainTable = container.querySelector("div[data-id='properties-ci-nested_table']");
		const editButton = mainTable.querySelectorAll("button.properties-subpanel-button")[0];
		fireEvent.click(editButton); // Click subpanel edit button on first row

		// verify subpanel shows structurelisteditor control
		const subPanel = container.querySelectorAll(".properties-editstyle-sub-panel");
		expect(subPanel).to.have.length(1);

		const structurelisteditorControl = subPanel[0].querySelectorAll("div[data-id='properties-ft-structurelisteditor']");
		expect(structurelisteditorControl.length).to.equal(1);

		const textInputs = structurelisteditorControl[0].querySelectorAll("input[type='text']");
		expect(textInputs.length).to.equal(2);
		const numberInputs = structurelisteditorControl[0].querySelectorAll("input[type='number']");
		expect(numberInputs.length).to.equal(2);

		const expectedOneError = {
			"nested_table": {
				"0": {
					"4": {
						"0": {
							"0": {
								"propertyId": {
									"col": 4,
									"name": "nested_table",
									"propertyId": {
										"col": 0,
										"name": "structurelisteditor",
										"row": 0
									},
									"row": 0
								},
								"required": false,
								"text": "Cannot be 'error'",
								"type": "error",
								"validation_id": "nested_table"
							}
						},
						"propertyId": {
							"col": 4,
							"name": "nested_table",
							"propertyId": {
								"col": 0,
								"name": "structurelisteditor",
								"row": 0
							},
							"row": 0
						},
						"required": false,
						"text": "Cannot be 'error'",
						"type": "error",
						"validation_id": "nested_table"
					}
				}
			}
		};

		// Modify row 0 textinput to show error
		fireEvent.change(textInputs[0], { target: { value: "error" } });
		expect(controller.getErrorMessages()).to.eql(expectedOneError);

		// Verify main parent table also display the error in cell
		let errors = mainTable.querySelectorAll(".properties-validation-message.error.inTable");
		expect(errors.length).to.equal(1);

		// Verify structurelistedior also display the error in bottom of table
		let validationErrors = subPanel[0].querySelectorAll(".properties-validation-message.error");
		expect(validationErrors.length).to.equal(2); // First one is in cell, the other is on table
		expect(validationErrors[1].querySelector("span").textContent).to.equal("Cannot be 'error'");

		const expectedTwoErrors = {
			"nested_table": {
				"0": {
					"4": {
						"0": {
							"0": {
								"propertyId": {
									"col": 4,
									"name": "nested_table",
									"propertyId": {
										"col": 0,
										"name": "structurelisteditor",
										"row": 0
									},
									"row": 0
								},
								"required": false,
								"text": "Cannot be 'error'",
								"type": "error",
								"validation_id": "nested_table"
							},
							"1": {
								"propertyId": {
									"col": 4,
									"name": "nested_table",
									"propertyId": {
										"col": 1,
										"name": "structurelisteditor",
										"row": 0
									},
									"row": 0
								},
								"required": false,
								"text": "Must be greater than 0",
								"type": "error",
								"validation_id": "nested_table"
							}
						},
						"propertyId": {
							"col": 4,
							"name": "nested_table",
							"propertyId": {
								"col": 1,
								"name": "structurelisteditor",
								"row": 0
							},
							"row": 0
						},
						"required": false,
						"text": "Must be greater than 0",
						"type": "error",
						"validation_id": "nested_table"
					}
				}
			}
		};

		// Modify row 0 numberinput to show error
		fireEvent.change(numberInputs[0], { target: { value: 0 } });
		expect(controller.getErrorMessages()).to.eql(expectedTwoErrors);

		// Verify main table also display the error in cell
		errors = mainTable.querySelectorAll(".properties-validation-message.error.inTable");
		expect(errors.length).to.equal(1);

		// Verify structurelisteditor table error gets updated
		validationErrors = subPanel[0].querySelectorAll(".properties-validation-message.error");
		expect(validationErrors.length).to.equal(3); // Two errors in the cell, the other is on table
		expect(validationErrors[2].querySelector("span").textContent).to.equal("Must be greater than 0");

		// Remove error from numberinput, table error should be set back to first error
		fireEvent.change(numberInputs[0], { target: { value: 1 } });
		expect(controller.getErrorMessages()).to.eql(expectedOneError);
		validationErrors = subPanel[0].querySelectorAll(".properties-validation-message.error");
		expect(validationErrors.length).to.equal(2); // First one is in cell, the other is on table
		expect(validationErrors[1].querySelector("span").textContent).to.equal("Cannot be 'error'");
	});

	it("default required conditions work correctly for a nested structurelisteditor control", () => {
		const container = wrapper.container;
		const mainTable = container.querySelector("div[data-id='properties-ci-nested_table']");
		const editButton = mainTable.querySelectorAll("button.properties-subpanel-button")[0];
		fireEvent.click(editButton); // Click subpanel edit button on first row

		// verify subpanel shows structurelisteditor control
		const subPanel = container.querySelectorAll(".properties-editstyle-sub-panel");
		expect(subPanel).to.have.length(1);

		const structurelisteditorControl = subPanel[0].querySelectorAll("div[data-id='properties-ft-structurelisteditor']");
		expect(structurelisteditorControl.length).to.equal(1);

		const textInputs = structurelisteditorControl[0].querySelectorAll("input[type='text']");
		expect(textInputs.length).to.equal(2);
		const numberInputs = structurelisteditorControl[0].querySelectorAll("input[type='number']");
		expect(numberInputs.length).to.equal(2);

		const expectedOneError = {
			"nested_table": {
				"0": {
					"4": {
						"1": {
							"0": {
								"propertyId": {
									"col": 4,
									"name": "nested_table",
									"propertyId": {
										"col": 0,
										"name": "structurelisteditor",
										"row": 1
									},
									"row": 0
								},
								"required": true,
								"text": "You must enter a value for textfield.",
								"type": "error",
								"validation_id": "required_nested_table[4][0]_186.07303925125697"
							}
						},
						"propertyId": {
							"col": 4,
							"name": "nested_table",
							"propertyId": {
								"col": 0,
								"name": "structurelisteditor",
								"row": 1
							},
							"row": 0
						},
						"required": true,
						"text": "You must enter a value for textfield.",
						"type": "error",
						"validation_id": "required_nested_table[4][0]_186.07303925125697"
					}
				}
			}
		};

		// Modify row 1 textinput to show error
		fireEvent.change(textInputs[1], { target: { value: "" } });
		expect(controller.getErrorMessages()).to.eql(expectedOneError);

		// Verify main parent table also display the error in cell
		let errors = mainTable.querySelectorAll(".properties-validation-message.error.inTable");
		expect(errors.length).to.equal(1);

		// Verify structurelistedior also display the error in bottom of table
		let validationErrors = subPanel[0].querySelectorAll(".properties-validation-message.error");
		expect(validationErrors.length).to.equal(2); // First one is in cell, the other is on table
		expect(validationErrors[1].querySelector("span").textContent).to.equal("You must enter a value for textfield.");

		const expectedTwoErrors = {
			"nested_table": {
				"0": {
					"4": {
						"0": {
							"1": {
								"propertyId": {
									"col": 4,
									"name": "nested_table",
									"propertyId": {
										"col": 1,
										"name": "structurelisteditor",
										"row": 0
									},
									"row": 0
								},
								"required": true,
								"text": "You must enter a value for numberfield.",
								"type": "error",
								"validation_id": "required_nested_table[4][1]_344.3166233602058"
							}
						},
						"1": {
							"0": {
								"propertyId": {
									"col": 4,
									"name": "nested_table",
									"propertyId": {
										"col": 0,
										"name": "structurelisteditor",
										"row": 1
									},
									"row": 0
								},
								"required": true,
								"text": "You must enter a value for textfield.",
								"type": "error",
								"validation_id": "required_nested_table[4][0]_186.07303925125697"
							}
						},
						"propertyId": {
							"col": 4,
							"name": "nested_table",
							"propertyId": {
								"col": 1,
								"name": "structurelisteditor",
								"row": 0
							},
							"row": 0
						},
						"required": true,
						"text": "You must enter a value for numberfield.",
						"type": "error",
						"validation_id": "required_nested_table[4][1]_344.3166233602058"
					}
				}
			}
		};

		// Modify row 1 numberinput to show error
		fireEvent.change(numberInputs[0], { target: { value: null } });
		expect(controller.getErrorMessages()).to.eql(expectedTwoErrors);

		// Verify main table also display the error in cell
		errors = mainTable.querySelectorAll(".properties-validation-message.error.inTable");
		expect(errors.length).to.equal(1);

		// Verify structurelisteditor table error gets updated
		validationErrors = subPanel[0].querySelectorAll(".properties-validation-message.error");
		expect(validationErrors.length).to.equal(3); // Two errors in the cell, the other is on table
		expect(validationErrors[2].querySelector("span").textContent).to.equal("You must enter a value for numberfield.");

		// Remove error from numberinput, table error should be set back to first error
		fireEvent.change(numberInputs[0], { target: { value: 1 } });
		expect(controller.getErrorMessages()).to.eql(expectedOneError);
		validationErrors = subPanel[0].querySelectorAll(".properties-validation-message.error");
		expect(validationErrors.length).to.equal(2); // First one is in cell, the other is on table
		expect(validationErrors[1].querySelector("span").textContent).to.equal("You must enter a value for textfield.");
	});
});
