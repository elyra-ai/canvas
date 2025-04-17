/*
 * Copyright 2017-2025 Elyra Authors
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

import React from "react";
import { CommonProperties } from "../../src/common-properties";
import PropertiesDialog from "../../src/common-properties/components/properties-modal";
import propertyUtilsRTL from "../_utils_/property-utilsRTL.js";
import tableUtilsRTL from "../_utils_/table-utilsRTL.js";
import { render } from "../_utils_/mount-utils.js";
import { expect } from "chai";
import sinon from "sinon";
import editStyleResource from "../test_resources/json/form-editstyle-test.json";
import expressionTestResource from "../test_resources/json/expression-one-category.json";
import numberfieldResource from "../test_resources/paramDefs/numberfield_paramDef.json";
import textfieldResource from "../test_resources/paramDefs/textfield_paramDef.json";
import textAreaResource from "../test_resources/paramDefs/textarea_paramDef.json";
import emptyParamDef from "../test_resources/paramDefs/empty_paramDef.json";
import oneofselectParamDef from "../test_resources/paramDefs/oneofselect_paramDef.json";
import structureListEditorParamDef from "../test_resources/paramDefs/structurelisteditor_paramDef.json";
import structureEditorParamDef from "../test_resources/paramDefs/structureeditor_paramDef.json";
import { IntlProvider } from "react-intl";
import { AiGenerate, Password } from "@carbon/icons-react";

import { CARBON_MODAL_SIZE_XSMALL, CARBON_MODAL_SIZE_SMALL, CARBON_MODAL_SIZE_LARGE } from "./../../src/common-properties/constants/constants";
import { cleanup, fireEvent, screen } from "@testing-library/react";

const applyPropertyChanges = sinon.spy();
const closePropertiesDialog = sinon.spy();
const propertyIconHandler = sinon.spy();

const locale = "en";
const localMessages = {
	"structureTable.addButton.label": "Add Some Stuff",
	"propertiesEdit.applyButton.label": "CONFIRM",
	"propertiesEdit.rejectButton.label": "NOT"
};

const validationErrorMessages = {
	"number_undefined": {
		"type": "error",
		"text": "You must enter a value for Undefined.",
		"validation_id": "required_number_undefined_272.9520234285945",
		"propertyId": {
			"name": "number_undefined"
		},
		"required": true
	},
	"number_null": {
		"type": "error",
		"text": "You must enter a value for Null.",
		"validation_id": "required_number_null_401.11526920064296",
		"propertyId": {
			"name": "number_null"
		},
		"required": true
	},
	"number_error": {
		"type": "error",
		"text": "Needs to be greaterThan 0",
		"validation_id": "number_error",
		"propertyId": {
			"name": "number_error"
		},
		"required": false
	},
	"number_warning": {
		"type": "warning",
		"text": "Needs to be greaterThan 1",
		"validation_id": "number_warning",
		"propertyId": {
			"name": "number_warning"
		},
		"required": false
	},
	"number_table": {
		"0": {
			"0": {
				"type": "error",
				"text": "Needs to be greaterThan 1",
				"validation_id": "number_table",
				"propertyId": {
					"name": "number_table",
					"col": 0,
					"row": 0
				},
				"required": false
			},
			"1": {
				"type": "warning",
				"text": "Needs to be greaterThan 1",
				"validation_id": "number_table",
				"propertyId": {
					"name": "number_table",
					"col": 1,
					"row": 0
				},
				"required": false
			}
		}
	}
};


const propertiesInfo = {};
propertiesInfo.parameterDef = editStyleResource.paramDef;
propertiesInfo.appData = {};
propertiesInfo.additionalComponents = {};
propertiesInfo.messages = [
	{
		"id_ref": "samplingSize",
		"validation_id": "samplingSize",
		"type": "warning",
		"text": "Incorrect sample size"
	}
];

const callbacks = {
	applyPropertyChanges: applyPropertyChanges,
	closePropertiesDialog: closePropertiesDialog,
	propertyIconHandler: propertyIconHandler
};

describe("CommonProperties renders correctly", () => {
	const spy = sinon.spy();
	const SpyWrapper = (props) => {
		spy(props); // capture all props passed
		return <CommonProperties {...props} />;
	};

	it("all required props should have been defined", () => {
		const propertiesConfig = { containerType: "Editing" };
		render(
			<IntlProvider key="IntlProvider2" locale={locale} messages={{}}>
				<SpyWrapper
					propertiesInfo={propertiesInfo}
					propertiesConfig={propertiesConfig}
					callbacks={callbacks}
				/>
			</IntlProvider>
		);
		expect(spy.calledOnce).to.be.true;
		const props = spy.firstCall.args[0];
		expect(props.propertiesInfo).to.equal(propertiesInfo);
		expect(props.callbacks).to.equal(callbacks);
		expect(props.propertiesConfig.containerType).to.equal("Editing");
	});

	it("should render one <PropertiesDialog/> component", () => {
		createCommonProperties("Modal");

		// Since PropertiesModal is rendered using a React Portal, it is mounted outside the main container.
		const propertiesModal = document.body.querySelector(".properties-modal");
		expect(propertiesModal).to.exist;
	});

	it("should render one <PropertiesEditing/> component", () => {
		const wrapper = createCommonProperties("Editing");
		const editingComponent = wrapper.querySelector(".properties-editor-form");
		expect(editingComponent).to.exist;
	});

	it("should override a reject label", () => {
		const wrapper = createCommonProperties("Editing", localMessages);
		const propertiesCancelButton = wrapper.querySelector("button[data-id='properties-cancel-button']");
		expect(propertiesCancelButton.textContent).to.equal("NOT");
	});

	it("should override a apply label", () => {
		const wrapper = createCommonProperties("Editing", localMessages);
		const propertiesApplyButton = wrapper.querySelector("button[data-id='properties-apply-button']");
		expect(propertiesApplyButton.textContent).to.equal("CONFIRM");
	});

	it("should override a structure table add button label", () => {
		const wrapper = createCommonProperties("Editing", localMessages);
		const tableButton = wrapper.querySelector("div.properties-column-structure");
		const addFieldsButton = tableButton.querySelector("button.properties-add-fields-button");
		expect(addFieldsButton.textContent).to.equal("Add Some Stuff");
	});
});

describe("CommonProperties works correctly in flyout", () => {
	let wrapper;
	afterEach(() => {
		cleanup();
	});

	it("When applyOnBlur=true, `X` icon in properties title should be rendered", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(propertiesInfo.parameterDef); // default is applyOnBlur=true
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const closeIcon = container.querySelector("div.properties-close-button").querySelectorAll("button");
		expect(closeIcon).to.have.length(1);

		// Verify modal buttons are not rendered
		expect(container.querySelector("button[data-id='properties-apply-button']")).to.be.null;
		expect(container.querySelector("button[data-id='properties-cancel-button']")).to.be.null;
	});

	it("When applyOnBlur=true applyPropertyChanges should be called only if values have changed", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(propertiesInfo.parameterDef); // default is applyOnBlur=true
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);

		const commonProperties = container.querySelector("aside.properties-right-flyout");
		fireEvent.blur(commonProperties);
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		// make some changes
		tableUtilsRTL.selectCheckboxes(commonProperties, [0]);

		// ensure table toolbar has delete and click it
		let tableToolbar = container.querySelector("div.properties-table-toolbar");
		let deleteButton = tableToolbar.querySelector("button.properties-action-delete");
		fireEvent.click(deleteButton);

		// save again: should save changes
		fireEvent.blur(commonProperties);
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 1);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);

		// force blur should not save because no additional changes happened
		fireEvent.blur(commonProperties);
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 1);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);

		// make more changes
		tableUtilsRTL.selectCheckboxes(commonProperties, [0]);
		tableToolbar = container.querySelector("div.properties-table-toolbar");
		deleteButton = tableToolbar.querySelectorAll("button.properties-action-delete");
		fireEvent.click(deleteButton[0]);

		// save again, should trigger a save
		fireEvent.blur(commonProperties);
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 2);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
	});

	it("When applyOnBlur=false applyPropertyChanges should not be called", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(propertiesInfo.parameterDef, { applyOnBlur: false });
		wrapper = renderedObject.wrapper;
		const container = wrapper.container;
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		// make some changes
		tableUtilsRTL.selectCheckboxes(container, [0]);

		// ensure table toolbar has delete and click it
		const tableToolbar = container.querySelector("div.properties-table-toolbar");
		const deleteButton = tableToolbar.querySelector("button.properties-action-delete");
		fireEvent.click(deleteButton);

		// save again: should save changes
		const commonProperties = container.querySelector("aside.properties-right-flyout");
		fireEvent.blur(commonProperties);
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
	});

	it("When applyPropertiesWithoutEdit=true applyPropertyChanges should still be called", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(propertiesInfo.parameterDef, { applyPropertiesWithoutEdit: true });
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		const button = screen.getAllByRole("button");
		fireEvent.click(button[0]);
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 1);
		fireEvent.click(button[0]);
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 2);
	});

	it("When applyPropertiesWithoutEdit=false applyPropertyChanges should not be called", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(propertiesInfo.parameterDef, { applyPropertiesWithoutEdit: false });
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		const button = screen.getAllByRole("button");
		fireEvent.click(button[0]);
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		fireEvent.click(button[0]);
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
	});

	it("When enableResize=false resize button should not be rendered", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(propertiesInfo.parameterDef, { enableResize: false });
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		expect(container.querySelectorAll("button.properties-btn-resize")).to.have.length(0);
	});

	it("When enableSize is omitted resize button should be rendered", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(propertiesInfo.parameterDef);
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		expect(container.querySelectorAll("button.properties-btn-resize")).to.have.length(1);
	});

	it("Resize button should have aria-label", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(propertiesInfo.parameterDef);
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const resizeBtn = container.querySelector("button.properties-btn-resize");
		expect(resizeBtn.getAttribute("aria-label")).to.equal("Expand");
		fireEvent.click(resizeBtn);

		const updatedResizeBtn = container.querySelector("button.properties-btn-resize");
		expect(updatedResizeBtn.getAttribute("aria-label")).to.equal("Contract");
	});

	it("When iconSwitch=false no icon should be rendered in oneofselect dropdown menu", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(oneofselectParamDef); // default is iconSwitch=false
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const customIcon = container.querySelectorAll("svg.custom-icon");
		expect(customIcon.length).to.equal(0);
	});

	it("When iconSwitch=true icon should be rendered in oneofselect dropdown menu", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(oneofselectParamDef, { iconSwitch: true },
			{
				propertyIconHandler: (data, callbackIcon) => {
					callbackIcon(<Password className="custom-icon" />);
				}
			});
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const customIcon = container.querySelectorAll("svg.custom-icon");
		expect(customIcon.length).to.not.equal(0);
	});

	it("Should render the correct icon for a specific propertyId", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(oneofselectParamDef, { iconSwitch: true }, {
			propertyIconHandler: (data, callbackIcon) => {
				if (data.propertyId.name === "oneofselect") {
					callbackIcon(<Password className="custom-icon-1" />);
				} else if (data.propertyId === "") {
					callbackIcon(<AiGenerate className="custom-icon-2" />);
				}
			}
		});
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const customIcon1 = container.querySelectorAll("svg.custom-icon-1");
		expect(customIcon1.length).to.not.equal(0);
		const customIcon2 = container.querySelectorAll("svg.custom-icon-2");
		expect(customIcon2.length).to.equal(0);
	});

	it("Should render the correct icon for a specific enum value", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(oneofselectParamDef, { iconSwitch: true }, {
			propertyIconHandler: (data, callbackIcon) => {
				if (data.enumValue === "blue") {
					callbackIcon(<Password className="custom-icon-1" />);
				} else if (data.propertyId === "") {
					callbackIcon(<AiGenerate className="custom-icon-2" />);
				}
			}
		});
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const customIcon1 = container.querySelectorAll("svg.custom-icon-1");
		expect(customIcon1.length).to.not.equal(0);
		const customIcon2 = container.querySelectorAll("svg.custom-icon-2");
		expect(customIcon2.length).to.equal(0);
	});


	it("When enableResize=true resize button should be rendered", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(propertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const resizeBtn = container.querySelectorAll("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(1);
		expect(container.querySelectorAll("aside.properties-small")).to.have.length(1);
		expect(container.querySelectorAll("aside.properties-medium")).to.have.length(0);
		fireEvent.click(resizeBtn[0]);
		expect(container.querySelectorAll("aside.properties-small")).to.have.length(0);
		expect(container.querySelectorAll("aside.properties-medium")).to.have.length(1);
		fireEvent.click(resizeBtn[0]);
		expect(container.querySelectorAll("aside.properties-small")).to.have.length(1);
		expect(container.querySelectorAll("aside.properties-medium")).to.have.length(0);
	});

	it("When enableResize=true and editor_size=small resize button should be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "small";
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const resizeBtn = container.querySelectorAll("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(1);
		expect(container.querySelectorAll("aside.properties-small")).to.have.length(1);
		expect(container.querySelectorAll("aside.properties-medium")).to.have.length(0);
		fireEvent.click(resizeBtn[0]);
		expect(container.querySelectorAll("aside.properties-small")).to.have.length(0);
		expect(container.querySelectorAll("aside.properties-medium")).to.have.length(1);
		fireEvent.click(resizeBtn[0]);
		expect(container.querySelectorAll("aside.properties-small")).to.have.length(1);
		expect(container.querySelectorAll("aside.properties-medium")).to.have.length(0);
	});

	it("When enableResize=true and editor_size=medium resize button should be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "medium";
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const resizeBtn = container.querySelectorAll("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(1);
	});

	it("When enableResize=true and editor_size=small and pixel_width min and max are set resize button should be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "small";
		newPropertiesInfo.parameterDef.uihints.pixel_width = { min: 400, max: 800 };
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const resizeBtn = container.querySelectorAll("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(1);
		const customSizeContainer = container.querySelectorAll("aside.properties-custom-size");
		expect(customSizeContainer).to.have.length(1);
		let style = window.getComputedStyle(customSizeContainer[0]);
		expect(style.width).to.equal("400px");
		fireEvent.click(resizeBtn[0]);
		expect(container.querySelectorAll("aside.properties-custom-size")).to.have.length(1);
		style = window.getComputedStyle(customSizeContainer[0]);
		expect(style.width).to.equal("800px");
		fireEvent.click(resizeBtn[0]);
		expect(container.querySelectorAll("aside.properties-custom-size")).to.have.length(1);
		style = window.getComputedStyle(customSizeContainer[0]);
		expect(style.width).to.equal("400px");
	});

	it("When enableResize=true and editor_size=medium and pixel_width min and max are set resize button should be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "medium";
		newPropertiesInfo.parameterDef.uihints.pixel_width = { min: 400, max: 800 };
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const resizeBtn = container.querySelectorAll("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(1);
		const customSizeContainer = container.querySelectorAll("aside.properties-custom-size");
		expect(customSizeContainer).to.have.length(1);
		let style = window.getComputedStyle(customSizeContainer[0]);
		expect(style.width).to.equal("400px");
		fireEvent.click(resizeBtn[0]);
		expect(container.querySelectorAll("aside.properties-custom-size")).to.have.length(1);
		style = window.getComputedStyle(customSizeContainer[0]);
		expect(style.width).to.equal("800px");
		fireEvent.click(resizeBtn[0]);
		expect(container.querySelectorAll("aside.properties-custom-size")).to.have.length(1);
		style = window.getComputedStyle(customSizeContainer[0]);
		expect(style.width).to.equal("400px");
	});

	it("When enableResize=true and editor_size=large and pixel_width min and max are set resize button should be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "large";
		newPropertiesInfo.parameterDef.uihints.pixel_width = { min: 400, max: 800 };
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const resizeBtn = container.querySelectorAll("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(1);
		const customSizeContainer = container.querySelectorAll("aside.properties-custom-size");
		expect(customSizeContainer).to.have.length(1);
		let style = window.getComputedStyle(customSizeContainer[0]);
		expect(style.width).to.equal("400px");
		fireEvent.click(resizeBtn[0]);
		expect(container.querySelectorAll("aside.properties-custom-size")).to.have.length(1);
		style = window.getComputedStyle(customSizeContainer[0]);
		expect(style.width).to.equal("800px");
		fireEvent.click(resizeBtn[0]);
		expect(container.querySelectorAll("aside.properties-custom-size")).to.have.length(1);
		style = window.getComputedStyle(customSizeContainer[0]);
		expect(style.width).to.equal("400px");
	});

	it("When enableResize=true and editor_size=small and pixel_width min and max are the same the resize button should not be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "small";
		newPropertiesInfo.parameterDef.uihints.pixel_width = { min: 800, max: 800 };
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const resizeBtn = container.querySelectorAll("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(0);
		const customSizeContainer = container.querySelectorAll("aside.properties-custom-size");
		expect(customSizeContainer).to.have.length(1);
		const style = window.getComputedStyle(customSizeContainer[0]);
		expect(style.width).to.equal("800px");
	});

	it("When enableResize=true and editor_size=medium and pixel_width min and max are the same the resize button should not be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "medium";
		newPropertiesInfo.parameterDef.uihints.pixel_width = { min: 800, max: 800 };
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const resizeBtn = container.querySelectorAll("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(0);
		const customSizeContainer = container.querySelectorAll("aside.properties-custom-size");
		expect(customSizeContainer).to.have.length(1);
		const style = window.getComputedStyle(customSizeContainer[0]);
		expect(style.width).to.equal("800px");
	});

	it("When enableResize=true and editor_size=large and pixel_width min and max are the same the resize button should not be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "large";
		newPropertiesInfo.parameterDef.uihints.pixel_width = { min: 800, max: 800 };
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const resizeBtn = container.querySelectorAll("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(0);
		const customSizeContainer = container.querySelectorAll("aside.properties-custom-size");
		expect(customSizeContainer).to.have.length(1);
		const style = window.getComputedStyle(customSizeContainer[0]);
		expect(style.width).to.equal("800px");
	});

	it("When enableResize=true and editor_size=max and pixel_width is ommited the resize button should not be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "max";
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const resizeBtn = container.querySelectorAll("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(0);
		expect(container.querySelectorAll("aside.properties-max")).to.have.length(1);
	});

	it("When enableResize=true and editor_size=max and pixel_width min and max is provided the resize button should not be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "max";
		newPropertiesInfo.parameterDef.uihints.pixel_width = { min: 400, max: 1000 }; // set pixel_width more than width of "max" editor_size
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const resizeBtn = container.querySelectorAll("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(0);
		const customSizeContainer = container.querySelectorAll("aside.properties-custom-size");
		expect(customSizeContainer).to.have.length(1);
		const style = window.getComputedStyle(customSizeContainer[0]);
		expect(style.width).to.equal("1000px");
	});

	it("When enableResize=true and editor_size is omitted and pixel_width min and max are the same the resize button should not be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.pixel_width = { min: 800, max: 800 };
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const resizeBtn = container.querySelectorAll("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(0);
		const customSizeContainer = container.querySelectorAll("aside.properties-custom-size");
		expect(customSizeContainer).to.have.length(1);
		const style = window.getComputedStyle(customSizeContainer[0]);
		expect(style.width).to.equal("800px");
	});

	it("When no groups or parameters are defined the flyout should still render", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(emptyParamDef);
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		expect(container.querySelectorAll("aside.properties-wrapper")).to.have.length(1);
		expect(container.querySelectorAll("div.properties-title-editor")).to.have.length(1);
		expect(container.querySelectorAll("div.properties-custom-container")).to.have.length(1);
		expect(container.querySelectorAll("div.properties-modal-buttons")).to.have.length(0);
		expect(container.querySelectorAll("div.properties-close-button")).to.have.length(1);
	});

	it("should set editorSize to initialEditorSize when defaultEditorSize='small' and initialEditorSize='medium'", () => {
		// defaultEditorSize is small & initialEditorSize is medium
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "small";
		newPropertiesInfo.initialEditorSize = "medium";

		wrapper = render(
			<IntlProvider key="IntlProvider2" locale={locale}>
				<CommonProperties
					propertiesInfo={newPropertiesInfo}
					callbacks={callbacks}
				/>
			</IntlProvider>
		);
		// Right flyout panel should have editorSize medium
		const { container } = wrapper;
		expect(container.querySelectorAll("aside.properties-small")).to.have.length(0);
		expect(container.querySelectorAll("aside.properties-medium")).to.have.length(1);
	});

	it("should set editorSize to defaultEditorSize when defaultEditorSize='large' and initialEditorSize='small'", () => {
		// defaultEditorSize is large & initialEditorSize is small
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "large";
		newPropertiesInfo.initialEditorSize = "small";

		wrapper = render(
			<IntlProvider key="IntlProvider2" locale={locale}>
				<CommonProperties
					propertiesInfo={newPropertiesInfo}
					callbacks={callbacks}
				/>
			</IntlProvider>
		);
		// Right flyout panel should have editorSize large
		const { container } = wrapper;
		expect(container.querySelectorAll("aside.properties-small")).to.have.length(0);
		expect(container.querySelectorAll("aside.properties-large")).to.have.length(1);
	});

	it("should set editorSize to defaultEditorSize when defaultEditorSize='medium' and initialEditorSize='small'", () => {
		// defaultEditorSize is medium & initialEditorSize is small
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "medium";
		newPropertiesInfo.initialEditorSize = "small";

		wrapper = render(
			<IntlProvider key="IntlProvider2" locale={locale}>
				<CommonProperties
					propertiesInfo={newPropertiesInfo}
					callbacks={callbacks}
				/>
			</IntlProvider>
		);
		// Right flyout panel should have editorSize medium
		const { container } = wrapper;
		expect(container.querySelectorAll("aside.properties-small")).to.have.length(0);
		expect(container.querySelectorAll("aside.properties-medium")).to.have.length(1);
	});

	it("should set editorSize to defaultEditorSize when defaultEditorSize='medium' and initialEditorSize='max'", () => {
		// defaultEditorSize is medium & initialEditorSize is max
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "medium";
		newPropertiesInfo.initialEditorSize = "max";

		wrapper = render(
			<IntlProvider key="IntlProvider2" locale={locale}>
				<CommonProperties
					propertiesInfo={newPropertiesInfo}
					callbacks={callbacks}
				/>
			</IntlProvider>
		);
		// Right flyout panel should have editorSize medium
		const { container } = wrapper;
		expect(container.querySelectorAll("aside.properties-max")).to.have.length(0);
		expect(container.querySelectorAll("aside.properties-medium")).to.have.length(1);
	});

	it("should set editorSize in controller on clicking resize button", () => {
		// Default editorSize is small & initialEditorSize is undefined
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "small";
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(newPropertiesInfo);
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;

		// Right flyout panel should have editorSize small
		expect(container.querySelectorAll("aside.properties-small")).to.have.length(1);
		expect(container.querySelectorAll("aside.properties-medium")).to.have.length(0);

		// Click on resize button
		const button = container.querySelectorAll("button.properties-btn-resize");
		fireEvent.click(button[0]);

		//  controller should set editorSize to medium
		expect(renderedObject.controller.getEditorSize()).to.equal("medium");
		// Right flyout panel should have editorSize medium
		expect(container.querySelectorAll("aside.properties-small")).to.have.length(0);
		expect(container.querySelectorAll("aside.properties-medium")).to.have.length(1);
	});

	it("should be able to resize rightFlyout from large to max", () => {
		// Default editorSize is large & initialEditorSize is undefined
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "large";
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(newPropertiesInfo.parameterDef);
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;

		// Right flyout panel should have editorSize large
		expect(container.querySelectorAll("aside.properties-large")).to.have.length(1);
		expect(container.querySelectorAll("aside.properties-max")).to.have.length(0);

		// Click on resize button
		const button = container.querySelectorAll("button.properties-btn-resize");
		fireEvent.click(button[0]);

		//  controller should set editorSize to max
		expect(renderedObject.controller.getEditorSize()).to.equal("max");
		// Right flyout panel should have editorSize max
		expect(container.querySelectorAll("aside.properties-large")).to.have.length(0);
		expect(container.querySelectorAll("aside.properties-max")).to.have.length(1);
	});

	it("when light=true, common properties should render with light mode enabled", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		wrapper = render(
			<IntlProvider key="IntlProvider2" locale={locale}>
				<CommonProperties
					propertiesInfo={newPropertiesInfo}
					callbacks={callbacks}
					light
				/>
			</IntlProvider>
		);
		const { container } = wrapper;
		expect(container.querySelectorAll("aside.properties-light-enabled")).to.have.length(1);
	});

	it("when light=false, common properties should render with light mode disabled", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		wrapper = render(
			<IntlProvider key="IntlProvider2" locale={locale}>
				<CommonProperties
					propertiesInfo={newPropertiesInfo}
					callbacks={callbacks}
					light={false}
				/>
			</IntlProvider>
		);
		const { container } = wrapper;
		expect(container.querySelectorAll("aside.properties-light-enabled")).to.have.length(0);
	});
});

describe("Common properties modals return the correct Carbon modal size", () => {
	let newPropertiesInfo;
	beforeEach(() => {
		newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
	});
	afterEach(() => {
		sinon.restore();
		cleanup();
	});

	it("should return 'xs' when editor_size is 'sm'", () => {
		const modalInstance = sinon.spy(PropertiesDialog.prototype, "getCarbonModalSize");
		newPropertiesInfo.parameterDef.uihints.editor_size = "small";
		propertyUtilsRTL.flyoutEditorForm(newPropertiesInfo.parameterDef, { containerType: "Modal" });
		expect(modalInstance.returnValues[0]).to.deep.equal(CARBON_MODAL_SIZE_XSMALL);
	});

	it("should return 'sm' when editor_size is 'medium'", () => {
		const modalInstance = sinon.spy(PropertiesDialog.prototype, "getCarbonModalSize");
		newPropertiesInfo.parameterDef.uihints.editor_size = "medium";
		propertyUtilsRTL.flyoutEditorForm(newPropertiesInfo.parameterDef, { containerType: "Modal" });
		expect(modalInstance.returnValues[0]).to.deep.equal(CARBON_MODAL_SIZE_SMALL);
	});

	it("should return 'lg' when editor_size is 'large'", () => {
		const modalInstance = sinon.spy(PropertiesDialog.prototype, "getCarbonModalSize");
		newPropertiesInfo.parameterDef.uihints.editor_size = "large";
		propertyUtilsRTL.flyoutEditorForm(newPropertiesInfo.parameterDef, { containerType: "Modal" });
		expect(modalInstance.returnValues[0]).to.deep.equal(CARBON_MODAL_SIZE_LARGE);
	});

	it("should return 'lg' when editor_size is 'max'", () => {
		const modalInstance = sinon.spy(PropertiesDialog.prototype, "getCarbonModalSize");
		newPropertiesInfo.parameterDef.uihints.editor_size = "max";
		propertyUtilsRTL.flyoutEditorForm(newPropertiesInfo.parameterDef, { containerType: "Modal" });
		expect(modalInstance.returnValues[0]).to.deep.equal(CARBON_MODAL_SIZE_LARGE);
	});

	it("should return 'lg' when editor_size is not set and containerType is 'Modal", () => {
		const modalInstance = sinon.spy(PropertiesDialog.prototype, "getCarbonModalSize");
		delete newPropertiesInfo.parameterDef.uihints.editor_size;
		propertyUtilsRTL.flyoutEditorForm(newPropertiesInfo.parameterDef, { containerType: "Modal" });
		expect(modalInstance.returnValues[0]).to.deep.equal(CARBON_MODAL_SIZE_LARGE);
	});
});

describe("CommonProperties validates on close in flyout", () => {
	let wrapper;
	afterEach(() => {
		cleanup();
	});

	it("Validate input when applyOnBlur=true and `X` icon pressed", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(numberfieldResource); // default is applyOnBlur=true
		wrapper = renderedObject.wrapper;
		const controller = renderedObject.controller;
		// should not have any messages to start
		expect(JSON.stringify(controller.getErrorMessages())).to.equal(JSON.stringify({}));
		// click close icon and expect validation error messsages
		const { container } = wrapper;
		const button = container.querySelector("div.properties-close-button").querySelectorAll("button");
		fireEvent.click(button[0]);
		expect(JSON.stringify(controller.getErrorMessages())).to.equal(JSON.stringify(validationErrorMessages));
	});

	it("Validate input when applyOnBlur=true and focus changes", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(numberfieldResource); // default is applyOnBlur=true
		wrapper = renderedObject.wrapper;
		const controller = renderedObject.controller;
		// should not have any messages to start
		expect(JSON.stringify(controller.getErrorMessages())).to.equal(JSON.stringify({}));

		// similate blur with no changes, expect validation error messages
		const { container } = wrapper;
		const button = container.querySelectorAll("aside.properties-right-flyout");
		fireEvent.blur(button[0]);
		expect(JSON.stringify(controller.getErrorMessages())).to.equal(JSON.stringify(validationErrorMessages));
	});


	it("Validate input when applyOnBlur=false the `Save` button pressed", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(numberfieldResource, { applyOnBlur: false });
		wrapper = renderedObject.wrapper;
		const controller = renderedObject.controller;
		// should not have any messages to start
		expect(JSON.stringify(controller.getErrorMessages())).to.equal(JSON.stringify({}));
		// click save and expect validation error messsages
		const { container } = wrapper;
		const button = container.querySelectorAll("button[data-id='properties-apply-button']")[0];
		fireEvent.click(button);
		expect(JSON.stringify(controller.getErrorMessages())).to.equal(JSON.stringify(validationErrorMessages));
	});

	it("Do not validate input when applyOnBlur=false the `Cancel` button pressed", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(numberfieldResource, { applyOnBlur: false });
		wrapper = renderedObject.wrapper;
		const controller = renderedObject.controller;
		// should not have any messages to start
		expect(JSON.stringify(controller.getErrorMessages())).to.equal(JSON.stringify({}));
		// click cancel and expect validation error messsages
		const { container } = wrapper;
		const button = container.querySelectorAll("button[data-id='properties-cancel-button']")[0];
		fireEvent.click(button);
		expect(JSON.stringify(controller.getErrorMessages())).to.equal(JSON.stringify({}));
	});

	it("Validate returned property values when conditionReturnValueHandling='value'", (done) => {
		const myApplyPropertyChanges = function(values) {
			expect(values.number_hidden).to.equal(10);
			done();
		};
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(numberfieldResource, { conditionReturnValueHandling: "value" },
			{ applyPropertyChanges: myApplyPropertyChanges });
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const button = container.querySelector("div.properties-close-button").querySelectorAll("button");
		fireEvent.click(button[0]);
	});

	it("Validate returned property values when conditionReturnValueHandling not set configuration", (done) => {
		const myApplyPropertyChanges = function(values) {
			expect(values.number_hidden).to.equal(10);
			done();
		};
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(numberfieldResource, null,
			{ applyPropertyChanges: myApplyPropertyChanges });
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const button = container.querySelector("div.properties-close-button").querySelectorAll("button");
		fireEvent.click(button[0]);
	});

	it("Validate returned property values when conditionReturnValueHandling='null'", (done) => {
		const myApplyPropertyChanges = function(values) {
			expect(values.number_hidden).to.be.undefined;
			expect(values.number_null).to.equal(null); // make sure null isn't filtered
			done();
		};
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(numberfieldResource, { conditionReturnValueHandling: "null" },
			{ applyPropertyChanges: myApplyPropertyChanges });
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const button = container.querySelector("div.properties-close-button").querySelectorAll("button");
		fireEvent.click(button[0]);
	});

	it("Validate returned property values when returnValueFiltering set", (done) => {
		const myApplyPropertyChanges = function(values) {
			expect(values.number_null).to.be.undefined;
			expect(values.number_int).to.equal(10);
			expect(values.number_random).to.be.undefined;
			done();
		};
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(numberfieldResource, { returnValueFiltering: [null, 12345] },
			{ applyPropertyChanges: myApplyPropertyChanges });
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		const button = container.querySelector("div.properties-close-button").querySelectorAll("button");
		fireEvent.click(button[0]);
	});

});

describe("CommonProperties validates on open correctly", () => {
	let wrapper;
	afterEach(() => {
		cleanup();
	});

	it("If messages are passed in then validate (generate errors)", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(numberfieldResource, null, null, { messages: propertiesInfo.messages });
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		expect(container.querySelectorAll("div[data-id='properties-alerts-panel']")).to.have.length(1);
	});

	it("If messages are not passed in then no validation", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(numberfieldResource);
		wrapper = renderedObject.wrapper;
		const { container } = wrapper;
		expect(container.querySelectorAll("div[data-id='properties-alerts-panel']")).to.have.length(0);

	});
});

describe("applyPropertiesEditing through an instance outside Common Properties", () => {
	it("If true is passed in, applyPropertiesEditing should trigger a applyPropertiesDialog and closePropertiesDialog callback", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(numberfieldResource, { applyOnBlur: false });
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		const { container } = renderedObject.wrapper;
		const commonProperties = container.querySelectorAll("button[data-id='properties-apply-button']")[0];

		// Clicking on apply button will pass true to applyPropertiesEditing.
		fireEvent.click(commonProperties);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 1);
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 1);
	});
	it("If false is passed in, applyPropertiesEditing should trigger a applyPropertiesDialog and closePropertiesDialog callback", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(numberfieldResource);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		const { container } = renderedObject.wrapper;
		const commonProperties = container.querySelector("aside.properties-right-flyout");

		// This will pass false to applyPropertiesEditing.
		fireEvent.blur(commonProperties);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 1);
	});
});

describe("closePropertiesDialog through an instance outside Common Properties", () => {
	it("closePropertiesDialog should be called with 'apply' if through save button", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(numberfieldResource, { applyOnBlur: false });
		const { container } = renderedObject.wrapper;
		const commonProperties = container.querySelectorAll("button[data-id='properties-apply-button']")[0];
		fireEvent.click(commonProperties);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 1);
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 1);
		expect(renderedObject.callbacks.closePropertiesDialog.calledWith("apply")).to.be.true;
	});
	it("closePropertiesDialog should be called with 'cancel' if through cancel button", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(numberfieldResource, { applyOnBlur: false });
		const { container } = renderedObject.wrapper;
		const commonProperties = container.querySelectorAll("button[data-id='properties-cancel-button']");
		fireEvent.click(commonProperties[0]);
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 1);
		expect(renderedObject.callbacks.closePropertiesDialog.calledWith("cancel")).to.be.true;
	});
});

describe("New error messages of a control should be detected and applyPropertyChanges() should be called onBlur and on close", () => {
	it("An error message in expression control should trigger a applyPropertyChanges callback when editor is closed", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(expressionTestResource); // default is applyOnBlur=true
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		const { container } = renderedObject.wrapper;
		const commonPropertiesButton = container.querySelector("div.properties-close-button").querySelectorAll("button");
		fireEvent.click(commonPropertiesButton[0]);
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 1);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 1);
	});
	it("An error message in expression control should trigger a applyPropertyChanges callback on blur", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(expressionTestResource); // default is applyOnBlur=true
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		const { container } = renderedObject.wrapper;
		const commonPropertiesButton = container.querySelector("div.properties-title-editor");
		fireEvent.click(commonPropertiesButton); // Focus on the editor
		const buttonBlur = container.querySelector("aside.properties-right-flyout");
		fireEvent.blur(buttonBlur);
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 1);
	});
});

describe("CommonProperties should setForm correctly", () => {
	it("getPropertyValue: form should set correctly with the currentParameters converted from object to array in object structure control", () => {
		// Verify input currentParameters converts correctly to internal format
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(structureListEditorParamDef); // default is applyOnBlur=true
		const controller = renderedObject.controller;
		const internalFormat = controller.getPropertyValue({ name: "structurelisteditorObjectType" });
		const expected = [[1, "Hello", "World", "string", "Readonly phrase"], [null, null, null, "number", null], [null, null, null, null, null]];
		expect(internalFormat).to.eql(expected);

		// Verify internal format gets returned correctly as array of objects
		const originalFormat = structureListEditorParamDef.current_parameters.structurelisteditorObjectType;
		// Default values will be returned as well for columns that didnt have values specified
		originalFormat[1].description = null;
		originalFormat[1].name = null;
		originalFormat[1].readonly = null;
		originalFormat[1].readonly_numbered_column_index = null;

		const objectFormat = controller.getPropertyValue({ name: "structurelisteditorObjectType" }, { applyProperties: true });
		expect(objectFormat).to.eql(originalFormat);
	});

	it("getPropertyValues: form should set correctly with the currentParameters converted from object to array in object structure control", () => {
		// Verify input currentParameters converts correctly to internal format
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(structureListEditorParamDef); // default is applyOnBlur=true
		const controller = renderedObject.controller;
		const internalFormat = controller.getPropertyValues().structurelisteditorObjectType;
		const expected = [[1, "Hello", "World", "string", "Readonly phrase"], [null, null, null, "number", null], [null, null, null, null, null]];
		expect(internalFormat).to.eql(expected);

		// Verify internal format gets returned correctly as array of objects
		const originalFormat = structureListEditorParamDef.current_parameters.structurelisteditorObjectType;
		// Default values will be returned as well for columns that didnt have values specified
		originalFormat[1].description = null;
		originalFormat[1].name = null;
		originalFormat[1].readonly = null;
		originalFormat[1].readonly_numbered_column_index = null;

		const objectFormat = controller.getPropertyValues({ applyProperties: true }).structurelisteditorObjectType;
		expect(objectFormat).to.eql(originalFormat);
	});

	it("getPropertyValue: form should set correctly with the currentParameters converted from object to array in object structure control", () => {
		// Verify input currentParameters converts correctly to internal format
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(structureEditorParamDef); // default is applyOnBlur=true
		const controller = renderedObject.controller;
		const internalFormat = controller.getPropertyValue({ name: "structureeditorObjectType" });
		const expected = [null, "hi", false, ["there", "you"]];
		expect(internalFormat).to.eql(expected);

		// Verify internal format gets returned correctly as array of objects
		const originalFormat = { "field_annotation": ["there", "you"], "first_field": "hi", "first_field_checkbox": false, "hidden_field": null };
		const objectFormat = controller.getPropertyValue({ name: "structureeditorObjectType" }, { applyProperties: true });
		expect(objectFormat).to.eql(originalFormat);
	});

	it("getPropertyValues: form should set correctly with the currentParameters converted from object to array in object structure control", () => {
		// Verify input currentParameters converts correctly to internal format
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(structureEditorParamDef); // default is applyOnBlur=true
		const controller = renderedObject.controller;
		const internalFormat = controller.getPropertyValues().structureeditorObjectType;
		const expected = [null, "hi", false, ["there", "you"]];
		expect(internalFormat).to.eql(expected);

		// Verify internal format gets returned correctly as array of objects
		const originalFormat = { "field_annotation": ["there", "you"], "first_field": "hi", "first_field_checkbox": false, "hidden_field": null };
		const objectFormat = controller.getPropertyValues({ applyProperties: true }).structureeditorObjectType;
		expect(objectFormat).to.eql(originalFormat);
	});
});

describe("CommonProperties should set propertiesConfig correctly", () => {
	it("propertiesConfig should get set if updated in props", () => {
		const propertiesConfig = {
			containerType: "Custom",
			rightFlyout: true,
			applyOnBlur: false,
			heading: true,
			showRequiredIndicator: true,
			trimSpaces: true
		};
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(numberfieldResource, propertiesConfig);
		const controller = renderedObject.controller;

		let actualConfig = controller.getPropertiesConfig();
		expect(actualConfig).to.eql(propertiesConfig);

		const updatedPropertiesConfig = {
			containerType: "Tearsheet",
			rightFlyout: false,
			applyOnBlur: false,
			heading: true,
			showRequiredIndicator: true,
			trimSpaces: true
		};
		const wrapper = renderedObject.wrapper;
		const { rerender } = wrapper;
		const newCommonProps = (<CommonProperties
			propertiesInfo={propertiesInfo}
			propertiesConfig={updatedPropertiesConfig}
		/>);
		rerender(
			<div className="properties-right-flyout">
				{newCommonProps}
			</div>
		);
		actualConfig = controller.getPropertiesConfig();
		expect(actualConfig).to.eql(updatedPropertiesConfig);
	});
});

describe("PropertiesButtons should render with the correct labels", () => {
	it("When applyOnBlur=false `Cancel` and `Save` buttons should be rendered", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(propertiesInfo.parameterDef, { applyOnBlur: false });
		const { container } = renderedObject.wrapper;
		expect(container.querySelector("button[data-id='properties-apply-button']").textContent).to.equal("Save");
		expect(container.querySelector("button[data-id='properties-cancel-button']").textContent).to.equal("Cancel");
		// Verify "X" icon in properties title is not rendered
		const closeIcon = container.querySelectorAll("div.properties-close-button");
		expect(closeIcon).to.have.length(0);
	});
	it("properties buttons should use a custom label if provided in propertiesConfig", () => {
		const propertiesConfig = {
			applyOnBlur: false,
			buttonLabels: {
				primary: "test apply",
				secondary: "test reject"
			}
		};
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(numberfieldResource, propertiesConfig);
		const { container } = renderedObject.wrapper;
		expect(container.querySelector("button[data-id='properties-apply-button']").textContent).to.equal("test apply");
		expect(container.querySelector("button[data-id='properties-cancel-button']").textContent).to.equal("test reject");
	});
	it("apply button should use a custom label if provided in propertiesConfig", () => {
		const propertiesConfig = {
			applyOnBlur: false,
			buttonLabels: {
				primary: "test apply"
			}
		};
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(numberfieldResource, propertiesConfig);
		const { container } = renderedObject.wrapper;
		expect(container.querySelector("button[data-id='properties-apply-button']").textContent).to.equal("test apply");
		expect(container.querySelector("button[data-id='properties-cancel-button']").textContent).to.equal("Cancel");
	});
	it("reject button should use a custom label if provided in propertiesConfig", () => {
		const propertiesConfig = {
			applyOnBlur: false,
			buttonLabels: {
				secondary: "test reject"
			}
		};
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(numberfieldResource, propertiesConfig);
		const { container } = renderedObject.wrapper;
		expect(container.querySelector("button[data-id='properties-apply-button']").textContent).to.equal("Save");
		expect(container.querySelector("button[data-id='properties-cancel-button']").textContent).to.equal("test reject");
	});
});

describe("CommonProperties conditionHandling option tests", () => {
	const propertyId = { name: "string_condition_handling" };
	afterEach(() => {
		cleanup();
	});

	it("valation when conditionHiddenPropertyHandling=null hidden controls return null values in conditions", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(textfieldResource, { conditionHiddenPropertyHandling: "null" }); // default is applyOnBlur=true
		const controller = renderedObject.controller;
		expect(controller.getControlState(propertyId)).to.equal("disabled");
		controller.updatePropertyValue({ name: "hide" }, false);
		expect(controller.getControlState(propertyId)).to.equal("enabled");

	});

	it("valation when conditionDisabledPropertyHandling=null disabled controls return null values in conditions", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(textfieldResource, { conditionDisabledPropertyHandling: "null" }); // default is applyOnBlur=true
		const controller = renderedObject.controller;
		expect(controller.getControlState(propertyId)).to.equal("disabled");
		controller.updatePropertyValue({ name: "disable" }, false);
		expect(controller.getControlState(propertyId)).to.equal("enabled");
	});

	it("valation when neither conditionDisabledPropertyHandling or conditionHiddenPropertyHandling are set values are returned in conditions", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(textfieldResource); // default is applyOnBlur=true
		const controller = renderedObject.controller;
		expect(controller.getControlState(propertyId)).to.equal("enabled");
	});
});

describe("CommonProperties should set maxLengthForMultiLineControls and maxLengthForSingleLineControls in propertiesConfig", () => {
	const maxLengthForSingleLineControls = 5;
	const maxLengthForMultiLineControls = 15;
	afterEach(() => {
		cleanup();
	});

	it("verify number of characters for single-line string type controls don't exceed maxLengthForSingleLineControls from propertiesConfig", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(textfieldResource, { maxLengthForSingleLineControls: maxLengthForSingleLineControls });
		const { container } = renderedObject.wrapper;
		const controller = renderedObject.controller;
		// Only 5 characters are allowed
		expect(controller.getMaxLengthForSingleLineControls()).to.equal(maxLengthForSingleLineControls);
		const textWrapper = container.querySelector("div[data-id='properties-ctrl-string']");
		const input = textWrapper.querySelectorAll("input");
		const newValue = "This sentence has more characters than maxLengthForSingleLineControls.";
		fireEvent.change(input[0], { target: { value: newValue } });
		// Verify only 5 characters are displayed - "This "
		expect(controller.getPropertyValue("string")).to.equal(newValue.substring(0, maxLengthForSingleLineControls));

	});

	it("verify number of characters for multi-line string type controls don't exceed maxLengthForMultiLineControls from propertiesConfig", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(textAreaResource, { maxLengthForMultiLineControls: maxLengthForMultiLineControls });
		const { container } = renderedObject.wrapper;
		const controller = renderedObject.controller;
		// Only 15 characters are allowed
		expect(controller.getMaxLengthForMultiLineControls()).to.equal(maxLengthForMultiLineControls);
		const textWrapper = container.querySelector("div[data-id='properties-ctrl-string']");
		const textarea = textWrapper.querySelectorAll("textarea");
		const newValue = "This sentence has more characters than maxLengthForMultiLineControls.";
		fireEvent.change(textarea[0], { target: { value: newValue } });
		// Verify only 15 characters are displayed - "This sentence h"
		expect(controller.getPropertyValue("string")).to.equal(newValue.substring(0, maxLengthForMultiLineControls));

	});

	it("verify char_limit from uiHints overrides the value of maxLengthForSingleLineControls from propertiesConfig", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(textfieldResource, { maxLengthForSingleLineControls: maxLengthForSingleLineControls });
		const { container } = renderedObject.wrapper;
		const controller = renderedObject.controller;
		const charLimit = controller.controls.string_charLimit.charLimit;
		// maxLength = 5 and char_limit = 10
		expect(controller.getMaxLengthForSingleLineControls()).to.equal(maxLengthForSingleLineControls);
		expect(charLimit).to.equal(10);

		const textWrapper = container.querySelector("div[data-id='properties-ctrl-string_charLimit']");
		const input = textWrapper.querySelectorAll("input");
		const newValue = "This sentence should display 10 characters.";
		fireEvent.change(input[0], { target: { value: newValue } });
		// Verify 10 characters are displayed - "This sente"
		expect(controller.getPropertyValue("string_charLimit")).to.equal(newValue.substring(0, charLimit));

	});

	it("verify char_limit from uiHints overrides the value of maxLengthForMultiLineControls from propertiesConfig", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(textAreaResource, { maxLengthForMultiLineControls: maxLengthForMultiLineControls });
		const { container } = renderedObject.wrapper;
		const controller = renderedObject.controller;
		const charLimit = controller.controls.string_charLimit.charLimit;
		// maxLength = 15 and char_limit = 20
		expect(controller.getMaxLengthForMultiLineControls()).to.equal(maxLengthForMultiLineControls);
		expect(charLimit).to.equal(20);

		const textWrapper = container.querySelector("div[data-id='properties-ctrl-string_charLimit']");
		const textarea = textWrapper.querySelector("textarea");
		const newValue = "This sentence should display 20 characters.";
		fireEvent.change(textarea, { target: { value: newValue } });
		// Verify 20 characters are displayed - "This sentence should"
		expect(textarea.textContent).to.equal(newValue.substring(0, charLimit));

	});

	it("verify default value of maxLengthForMultiLineControls is 1024", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(textAreaResource);
		const controller = renderedObject.controller;
		expect(controller.getMaxLengthForMultiLineControls()).to.equal(1024);

	});

	it("verify default value of maxLengthForSingleLineControls is 128", () => {
		const renderedObject = propertyUtilsRTL.flyoutEditorForm(textfieldResource);
		const controller = renderedObject.controller;
		expect(controller.getMaxLengthForSingleLineControls()).to.equal(128);

	});
});

function createCommonProperties(containers, messages) {
	const propertiesConfig = { containerType: containers };
	if (containers === "Custom") {
		propertiesConfig.rightFlyout = true;
	}
	const { container } = render(
		<IntlProvider key="IntlProvider2" locale={locale} messages={messages}>
			<CommonProperties
				propertiesInfo={propertiesInfo}
				propertiesConfig={propertiesConfig}
				callbacks={callbacks}
			/>
		</IntlProvider>
	);
	return container;
}


