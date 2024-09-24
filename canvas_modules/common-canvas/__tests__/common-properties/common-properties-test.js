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

import React from "react";
import { CommonProperties } from "../../src/common-properties";
import PropertiesDialog from "../../src/common-properties/components/properties-modal";
import PropertiesEditing from "../../src/common-properties/components/properties-editor";
import propertyUtils from "../_utils_/property-utils";
import tableUtils from "../_utils_/table-utils";
import { mount } from "../_utils_/mount-utils.js";
import { expect } from "chai";
import sinon from "sinon";
import editStyleResource from "../test_resources/json/form-editstyle-test.json";
import expressionTestResource from "../test_resources/json/expression-one-category.json";

import numberfieldResource from "../test_resources/paramDefs/numberfield_paramDef.json";
import textfieldResource from "../test_resources/paramDefs/textfield_paramDef.json";
import textAreaResource from "../test_resources/paramDefs/textarea_paramDef.json";
import emptyParamDef from "../test_resources/paramDefs/empty_paramDef.json";
import structureListEditorParamDef from "../test_resources/paramDefs/structurelisteditor_paramDef.json";
import structureEditorParamDef from "../test_resources/paramDefs/structureeditor_paramDef.json";
import { IntlProvider } from "react-intl";

import { CARBON_MODAL_SIZE_XSMALL, CARBON_MODAL_SIZE_SMALL, CARBON_MODAL_SIZE_LARGE } from "./../../src/common-properties/constants/constants";

const applyPropertyChanges = sinon.spy();
const closePropertiesDialog = sinon.spy();

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
	closePropertiesDialog: closePropertiesDialog
};

describe("CommonProperties renders correctly", () => {

	it("all required props should have been defined", () => {
		const wrapper = createCommonProperties("Editing");
		expect(wrapper.prop("propertiesInfo")).to.equal(propertiesInfo);
		expect(wrapper.prop("callbacks")).to.equal(callbacks);
		expect(wrapper.prop("propertiesConfig").containerType).to.equal("Editing");
	});

	it("should render one <PropertiesDialog/> component", () => {
		const wrapper = createCommonProperties("Modal");
		expect(wrapper.find(PropertiesDialog)).to.have.length(1);
	});

	it("should render one <PropertiesEditing/> component", () => {
		const wrapper = createCommonProperties("Editing");
		expect(wrapper.find(PropertiesEditing)).to.have.length(1);
	});

	it("should override a reject label", () => {
		const wrapper = createCommonProperties("Editing", localMessages);
		expect(wrapper.find("button[data-id='properties-cancel-button']").text()).to.equal("NOT");
	});

	it("should override a apply label", () => {
		const wrapper = createCommonProperties("Editing", localMessages);
		expect(wrapper.find("button[data-id='properties-apply-button']").text()).to.equal("CONFIRM");
	});

	it("should override a structure table add button label", () => {
		const wrapper = createCommonProperties("Editing", localMessages);
		const tableButton = wrapper.find("div.properties-column-structure").find("button.properties-add-fields-button");
		expect(tableButton.text()).to.equal("Add Some Stuff");
	});
});

describe("CommonProperties works correctly in flyout", () => {
	let wrapper;
	afterEach(() => {
		wrapper.unmount();
	});

	it("When applyOnBlur=true, `X` icon in properties title should be rendered", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(propertiesInfo.parameterDef); // default is applyOnBlur=true
		wrapper = renderedObject.wrapper;
		const closeIcon = wrapper.find("div.properties-close-button").find("button");
		expect(closeIcon).to.have.length(1);
		// Verify modal buttons are not rendered
		const buttonWrapper = wrapper.find("div.properties-modal-buttons");
		expect(buttonWrapper.find("button[data-id='properties-apply-button']")).to.have.length(0);
		expect(buttonWrapper.find("button[data-id='properties-cancel-button']")).to.have.length(0);
	});

	it("When applyOnBlur=true applyPropertyChanges should be called only if values have changed", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(propertiesInfo.parameterDef); // default is applyOnBlur=true
		wrapper = renderedObject.wrapper;
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		const commonProperties = wrapper.find("aside.properties-right-flyout");
		commonProperties.simulate("blur");
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		// make some changes
		tableUtils.selectCheckboxes(commonProperties, [0]);

		// ensure table toolbar has delete and click it
		let tableToolbar = wrapper.find("div.properties-table-toolbar");
		let deleteButton = tableToolbar.find("button.properties-action-delete");
		expect(deleteButton).to.have.length(1);
		deleteButton.simulate("click");

		// save again: should save changes
		commonProperties.simulate("blur");
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 1);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);

		// force blur should not save because no additional changes happened
		commonProperties.simulate("blur");
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 1);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);

		// make more changes
		tableUtils.selectCheckboxes(commonProperties, [0]);
		tableToolbar = wrapper.find("div.properties-table-toolbar");
		deleteButton = tableToolbar.find("button.properties-action-delete");
		deleteButton.simulate("click");

		// save again, should trigger a save
		commonProperties.simulate("blur");
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 2);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
	});

	it("When applyOnBlur=false applyPropertyChanges should not be called", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(propertiesInfo.parameterDef, { applyOnBlur: false });
		wrapper = renderedObject.wrapper;
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		// make some changes
		tableUtils.selectCheckboxes(wrapper, [0]);

		// ensure table toolbar has delete and click it
		const tableToolbar = wrapper.find("div.properties-table-toolbar");
		const deleteButton = tableToolbar.find("button.properties-action-delete");
		expect(deleteButton).to.have.length(1);
		deleteButton.simulate("click");

		// save again: should save changes
		wrapper.find("aside.properties-right-flyout")
			.simulate("blur");
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
	});

	it("When applyPropertiesWithoutEdit=true applyPropertyChanges should still be called", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(propertiesInfo.parameterDef, { applyPropertiesWithoutEdit: true });
		wrapper = renderedObject.wrapper;
		const commonProperties = renderedObject.wrapper.find("CommonProperties");
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		commonProperties.instance().applyPropertiesEditing();
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 1);
		commonProperties.instance().applyPropertiesEditing();
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 2);
	});

	it("When applyPropertiesWithoutEdit=false applyPropertyChanges should not be called", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(propertiesInfo.parameterDef, { applyPropertiesWithoutEdit: false });
		wrapper = renderedObject.wrapper;
		const commonProperties = renderedObject.wrapper.find("CommonProperties");
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		commonProperties.instance().applyPropertiesEditing();
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		commonProperties.instance().applyPropertiesEditing();
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
	});

	it("When enableResize=false resize button should not be rendered", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(propertiesInfo.parameterDef, { enableResize: false });
		wrapper = renderedObject.wrapper;
		expect(wrapper.find("button.properties-btn-resize")).to.have.length(0);
	});

	it("When enableSize is omitted resize button should be rendered", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(propertiesInfo.parameterDef);
		wrapper = renderedObject.wrapper;
		expect(wrapper.find("button.properties-btn-resize")).to.have.length(1);
	});

	it("Resize button should have aria-label", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(propertiesInfo.parameterDef);
		wrapper = renderedObject.wrapper;
		const resizeBtn = wrapper.find("button.properties-btn-resize");
		expect(resizeBtn.props()).to.have.property("aria-label", "Expand");
		resizeBtn.simulate("click");

		const updatedResizeBtn = wrapper.find("button.properties-btn-resize");
		expect(updatedResizeBtn.props()).to.have.property("aria-label", "Contract");
	});

	it("When enableResize=true resize button should be rendered", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(propertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const resizeBtn = wrapper.find("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(1);
		expect(wrapper.find("aside.properties-small")).to.have.length(1);
		expect(wrapper.find("aside.properties-medium")).to.have.length(0);
		resizeBtn.simulate("click");
		expect(wrapper.find("aside.properties-small")).to.have.length(0);
		expect(wrapper.find("aside.properties-medium")).to.have.length(1);
		resizeBtn.simulate("click");
		expect(wrapper.find("aside.properties-small")).to.have.length(1);
		expect(wrapper.find("aside.properties-medium")).to.have.length(0);
	});

	it("When enableResize=true and editor_size=small resize button should be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "small";
		const renderedObject = propertyUtils.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const resizeBtn = wrapper.find("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(1);
		expect(wrapper.find("aside.properties-small")).to.have.length(1);
		expect(wrapper.find("aside.properties-medium")).to.have.length(0);
		resizeBtn.simulate("click");
		expect(wrapper.find("aside.properties-small")).to.have.length(0);
		expect(wrapper.find("aside.properties-medium")).to.have.length(1);
		resizeBtn.simulate("click");
		expect(wrapper.find("aside.properties-small")).to.have.length(1);
		expect(wrapper.find("aside.properties-medium")).to.have.length(0);
	});

	it("When enableResize=true and editor_size=medium resize button should be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "medium";
		const renderedObject = propertyUtils.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const resizeBtn = wrapper.find("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(1);
	});

	it("When enableResize=true and editor_size=small and pixel_width min and max are set resize button should be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "small";
		newPropertiesInfo.parameterDef.uihints.pixel_width = { min: 400, max: 800 };
		const renderedObject = propertyUtils.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const resizeBtn = wrapper.find("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(1);
		expect(wrapper.find("aside.properties-custom-size")).to.have.length(1);
		expect(wrapper.find("aside.properties-custom-size").get(0).props.style).to.have.property("width", "400px");
		resizeBtn.simulate("click");
		expect(wrapper.find("aside.properties-custom-size")).to.have.length(1);
		expect(wrapper.find("aside.properties-custom-size").get(0).props.style).to.have.property("width", "800px");
		resizeBtn.simulate("click");
		expect(wrapper.find("aside.properties-custom-size")).to.have.length(1);
		expect(wrapper.find("aside.properties-custom-size").get(0).props.style).to.have.property("width", "400px");
	});

	it("When enableResize=true and editor_size=medium and pixel_width min and max are set resize button should be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "medium";
		newPropertiesInfo.parameterDef.uihints.pixel_width = { min: 400, max: 800 };
		const renderedObject = propertyUtils.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const resizeBtn = wrapper.find("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(1);
		expect(wrapper.find("aside.properties-custom-size")).to.have.length(1);
		expect(wrapper.find("aside.properties-custom-size").get(0).props.style).to.have.property("width", "400px");
		resizeBtn.simulate("click");
		expect(wrapper.find("aside.properties-custom-size")).to.have.length(1);
		expect(wrapper.find("aside.properties-custom-size").get(0).props.style).to.have.property("width", "800px");
		resizeBtn.simulate("click");
		expect(wrapper.find("aside.properties-custom-size")).to.have.length(1);
		expect(wrapper.find("aside.properties-custom-size").get(0).props.style).to.have.property("width", "400px");
	});

	it("When enableResize=true and editor_size=large and pixel_width min and max are set resize button should be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "large";
		newPropertiesInfo.parameterDef.uihints.pixel_width = { min: 400, max: 800 };
		const renderedObject = propertyUtils.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const resizeBtn = wrapper.find("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(1);
		expect(wrapper.find("aside.properties-custom-size")).to.have.length(1);
		expect(wrapper.find("aside.properties-custom-size").get(0).props.style).to.have.property("width", "400px");
		resizeBtn.simulate("click");
		expect(wrapper.find("aside.properties-custom-size")).to.have.length(1);
		expect(wrapper.find("aside.properties-custom-size").get(0).props.style).to.have.property("width", "800px");
		resizeBtn.simulate("click");
		expect(wrapper.find("aside.properties-custom-size")).to.have.length(1);
		expect(wrapper.find("aside.properties-custom-size").get(0).props.style).to.have.property("width", "400px");
	});

	it("When enableResize=true and editor_size=small and pixel_width min and max are the same the resize button should not be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "small";
		newPropertiesInfo.parameterDef.uihints.pixel_width = { min: 800, max: 800 };
		const renderedObject = propertyUtils.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const resizeBtn = wrapper.find("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(0);
		expect(wrapper.find("aside.properties-custom-size")).to.have.length(1);
		expect(wrapper.find("aside.properties-custom-size").get(0).props.style).to.have.property("width", "800px");
	});

	it("When enableResize=true and editor_size=medium and pixel_width min and max are the same the resize button should not be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "medium";
		newPropertiesInfo.parameterDef.uihints.pixel_width = { min: 800, max: 800 };
		const renderedObject = propertyUtils.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const resizeBtn = wrapper.find("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(0);
		expect(wrapper.find("aside.properties-custom-size")).to.have.length(1);
		expect(wrapper.find("aside.properties-custom-size").get(0).props.style).to.have.property("width", "800px");
	});

	it("When enableResize=true and editor_size=large and pixel_width min and max are the same the resize button should not be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "large";
		newPropertiesInfo.parameterDef.uihints.pixel_width = { min: 800, max: 800 };
		const renderedObject = propertyUtils.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const resizeBtn = wrapper.find("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(0);
		expect(wrapper.find("aside.properties-custom-size")).to.have.length(1);
		expect(wrapper.find("aside.properties-custom-size").get(0).props.style).to.have.property("width", "800px");
	});

	it("When enableResize=true and editor_size=max and pixel_width is ommited the resize button should not be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "max";
		const renderedObject = propertyUtils.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const resizeBtn = wrapper.find("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(0);
		expect(wrapper.find("aside.properties-max")).to.have.length(1);
	});

	it("When enableResize=true and editor_size=max and pixel_width min and max is provided the resize button should not be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "max";
		newPropertiesInfo.parameterDef.uihints.pixel_width = { min: 400, max: 1000 }; // set pixel_width more than width of "max" editor_size
		const renderedObject = propertyUtils.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const resizeBtn = wrapper.find("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(0);
		expect(wrapper.find("aside.properties-custom-size")).to.have.length(1);
		expect(wrapper.find("aside.properties-custom-size").get(0).props.style).to.have.property("width", "1000px");
	});

	it("When enableResize=true and editor_size is omitted and pixel_width min and max are the same the resize button should not be rendered", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.pixel_width = { min: 800, max: 800 };
		const renderedObject = propertyUtils.flyoutEditorForm(newPropertiesInfo.parameterDef, { enableResize: true });
		wrapper = renderedObject.wrapper;
		const resizeBtn = wrapper.find("button.properties-btn-resize");
		expect(resizeBtn).to.have.length(0);
		expect(wrapper.find("aside.properties-custom-size")).to.have.length(1);
		expect(wrapper.find("aside.properties-custom-size").get(0).props.style).to.have.property("width", "800px");
	});

	it("When no groups or parameters are defined the flyout should still render", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(emptyParamDef);
		wrapper = renderedObject.wrapper;
		expect(wrapper.find("aside.properties-wrapper")).to.have.length(1);
		expect(wrapper.find("div.properties-title-editor")).to.have.length(1);
		expect(wrapper.find("div.properties-custom-container")).to.have.length(1);
		expect(wrapper.find("div.properties-modal-buttons")).to.have.length(0);
		expect(wrapper.find("div.properties-close-button")).to.have.length(1);
	});

	it("should set editorSize to initialEditorSize when defaultEditorSize='small' and initialEditorSize='medium'", () => {
		// defaultEditorSize is small & initialEditorSize is medium
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "small";
		newPropertiesInfo.initialEditorSize = "medium";

		wrapper = mount(
			<IntlProvider key="IntlProvider2" locale={ locale }>
				<CommonProperties
					propertiesInfo={newPropertiesInfo}
					callbacks={callbacks}
				/>
			</IntlProvider>
		);
		// Right flyout panel should have editorSize medium
		expect(wrapper.find("aside.properties-small")).to.have.length(0);
		expect(wrapper.find("aside.properties-medium")).to.have.length(1);
	});

	it("should set editorSize to defaultEditorSize when defaultEditorSize='large' and initialEditorSize='small'", () => {
		// defaultEditorSize is large & initialEditorSize is small
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "large";
		newPropertiesInfo.initialEditorSize = "small";

		wrapper = mount(
			<IntlProvider key="IntlProvider2" locale={ locale }>
				<CommonProperties
					propertiesInfo={newPropertiesInfo}
					callbacks={callbacks}
				/>
			</IntlProvider>
		);
		// Right flyout panel should have editorSize large
		expect(wrapper.find("aside.properties-small")).to.have.length(0);
		expect(wrapper.find("aside.properties-large")).to.have.length(1);
	});

	it("should set editorSize to defaultEditorSize when defaultEditorSize='medium' and initialEditorSize='small'", () => {
		// defaultEditorSize is medium & initialEditorSize is small
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "medium";
		newPropertiesInfo.initialEditorSize = "small";

		wrapper = mount(
			<IntlProvider key="IntlProvider2" locale={ locale }>
				<CommonProperties
					propertiesInfo={newPropertiesInfo}
					callbacks={callbacks}
				/>
			</IntlProvider>
		);
		// Right flyout panel should have editorSize medium
		expect(wrapper.find("aside.properties-small")).to.have.length(0);
		expect(wrapper.find("aside.properties-medium")).to.have.length(1);
	});

	it("should set editorSize to defaultEditorSize when defaultEditorSize='medium' and initialEditorSize='max'", () => {
		// defaultEditorSize is medium & initialEditorSize is max
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "medium";
		newPropertiesInfo.initialEditorSize = "max";

		wrapper = mount(
			<IntlProvider key="IntlProvider2" locale={ locale }>
				<CommonProperties
					propertiesInfo={newPropertiesInfo}
					callbacks={callbacks}
				/>
			</IntlProvider>
		);
		// Right flyout panel should have editorSize medium
		expect(wrapper.find("aside.properties-max")).to.have.length(0);
		expect(wrapper.find("aside.properties-medium")).to.have.length(1);
	});

	it("should set editorSize in controller on clicking resize button", () => {
		// Default editorSize is small & initialEditorSize is undefined
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "small";
		const renderedObject = propertyUtils.flyoutEditorForm(newPropertiesInfo);
		wrapper = renderedObject.wrapper;

		// Right flyout panel should have editorSize small
		expect(wrapper.find("aside.properties-small")).to.have.length(1);
		expect(wrapper.find("aside.properties-medium")).to.have.length(0);

		// Click on resize button
		wrapper.find("button.properties-btn-resize").simulate("click");

		//	controller should set editorSize to medium
		expect(renderedObject.controller.getEditorSize()).to.equal("medium");
		// Right flyout panel should have editorSize medium
		expect(wrapper.find("aside.properties-small")).to.have.length(0);
		expect(wrapper.find("aside.properties-medium")).to.have.length(1);
	});

	it("should be able to resize rightFlyout from large to max", () => {
		// Default editorSize is large & initialEditorSize is undefined
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "large";
		const renderedObject = propertyUtils.flyoutEditorForm(newPropertiesInfo.parameterDef);
		wrapper = renderedObject.wrapper;

		// Right flyout panel should have editorSize large
		expect(wrapper.find("aside.properties-large")).to.have.length(1);
		expect(wrapper.find("aside.properties-max")).to.have.length(0);

		// Click on resize button
		wrapper.find("button.properties-btn-resize").simulate("click");

		//	controller should set editorSize to max
		expect(renderedObject.controller.getEditorSize()).to.equal("max");
		// Right flyout panel should have editorSize max
		expect(wrapper.find("aside.properties-large")).to.have.length(0);
		expect(wrapper.find("aside.properties-max")).to.have.length(1);
	});

	it("when light=true, common properties should render with light mode enabled", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		wrapper = mount(
			<IntlProvider key="IntlProvider2" locale={ locale }>
				<CommonProperties
					propertiesInfo={newPropertiesInfo}
					callbacks={callbacks}
					light
				/>
			</IntlProvider>
		);
		expect(wrapper.find("aside.properties-light-enabled")).to.have.length(1);
	});

	it("when light=false, common properties should render with light mode disabled", () => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		wrapper = mount(
			<IntlProvider key="IntlProvider2" locale={ locale }>
				<CommonProperties
					propertiesInfo={newPropertiesInfo}
					callbacks={callbacks}
					light={false}
				/>
			</IntlProvider>
		);
		expect(wrapper.find("aside.properties-light-enabled")).to.have.length(0);
	});
});

describe("Common properties modals return the correct Carbon modal size", () => {
	let wrapper;
	let newPropertiesInfo;
	beforeEach(() => {
		newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
	});

	it("should return 'xs' when editor_size is 'sm'", () => {
		newPropertiesInfo.parameterDef.uihints.editor_size = "small";
		const renderedObject = propertyUtils.flyoutEditorForm(newPropertiesInfo.parameterDef, { containerType: "Modal" });
		wrapper = renderedObject.wrapper;
		const modalInstance = wrapper.find(PropertiesDialog).instance();
		expect(modalInstance.getCarbonModalSize()).to.equal(CARBON_MODAL_SIZE_XSMALL);
	});

	it("should return 'sm' when editor_size is 'medium'", () => {
		newPropertiesInfo.parameterDef.uihints.editor_size = "medium";
		const renderedObject = propertyUtils.flyoutEditorForm(newPropertiesInfo.parameterDef, { containerType: "Modal" });
		wrapper = renderedObject.wrapper;
		const modalInstance = wrapper.find(PropertiesDialog).instance();
		expect(modalInstance.getCarbonModalSize()).to.equal(CARBON_MODAL_SIZE_SMALL);
	});

	it("should return 'lg' when editor_size is 'large'", () => {
		newPropertiesInfo.parameterDef.uihints.editor_size = "large";
		const renderedObject = propertyUtils.flyoutEditorForm(newPropertiesInfo.parameterDef, { containerType: "Modal" });
		wrapper = renderedObject.wrapper;
		const modalInstance = wrapper.find(PropertiesDialog).instance();
		expect(modalInstance.getCarbonModalSize()).to.equal(CARBON_MODAL_SIZE_LARGE);
	});

	it("should return 'lg' when editor_size is 'max'", () => {
		newPropertiesInfo.parameterDef.uihints.editor_size = "max";
		const renderedObject = propertyUtils.flyoutEditorForm(newPropertiesInfo.parameterDef, { containerType: "Modal" });
		wrapper = renderedObject.wrapper;
		const modalInstance = wrapper.find(PropertiesDialog).instance();
		expect(modalInstance.getCarbonModalSize()).to.equal(CARBON_MODAL_SIZE_LARGE);
	});

	it("should return 'lg' when editor_size is not set and containerType is 'Modal", () => {
		delete newPropertiesInfo.parameterDef.uihints.editor_size;
		const renderedObject = propertyUtils.flyoutEditorForm(newPropertiesInfo.parameterDef, { containerType: "Modal" });
		wrapper = renderedObject.wrapper;
		const modalInstance = wrapper.find(PropertiesDialog).instance();
		expect(modalInstance.getCarbonModalSize()).to.equal(CARBON_MODAL_SIZE_LARGE);
	});
});

describe("CommonProperties validates on close in flyout", () => {
	let wrapper;
	afterEach(() => {
		wrapper.unmount();
	});

	it("Validate input when applyOnBlur=true and `X` icon pressed", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource); // default is applyOnBlur=true
		wrapper = renderedObject.wrapper;
		const controller = renderedObject.controller;
		// should not have any messages to start
		expect(JSON.stringify(controller.getErrorMessages())).to.equal(JSON.stringify({}));
		// click close icon and expect validation error messsages
		wrapper.find("div.properties-close-button")
			.find("button")
			.simulate("click");
		expect(JSON.stringify(controller.getErrorMessages())).to.equal(JSON.stringify(validationErrorMessages));
	});

	it("Validate input when applyOnBlur=true and focus changes", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource); // default is applyOnBlur=true
		wrapper = renderedObject.wrapper;
		const controller = renderedObject.controller;
		// should not have any messages to start
		expect(JSON.stringify(controller.getErrorMessages())).to.equal(JSON.stringify({}));

		// similate blur with no changes, expect validation error messages
		wrapper.find("aside.properties-right-flyout")
			.simulate("blur");
		expect(JSON.stringify(controller.getErrorMessages())).to.equal(JSON.stringify(validationErrorMessages));
	});


	it("Validate input when applyOnBlur=false the `Save` button pressed", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource, { applyOnBlur: false });
		wrapper = renderedObject.wrapper;
		const controller = renderedObject.controller;
		// should not have any messages to start
		expect(JSON.stringify(controller.getErrorMessages())).to.equal(JSON.stringify({}));
		// click save and expect validation error messsages
		wrapper.find("button[data-id='properties-apply-button']")
			.at(0)
			.simulate("click");
		expect(JSON.stringify(controller.getErrorMessages())).to.equal(JSON.stringify(validationErrorMessages));
	});

	it("Do not validate input when applyOnBlur=false the `Cancel` button pressed", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource, { applyOnBlur: false });
		wrapper = renderedObject.wrapper;
		const controller = renderedObject.controller;
		// should not have any messages to start
		expect(JSON.stringify(controller.getErrorMessages())).to.equal(JSON.stringify({}));
		// click cancel and expect validation error messsages
		wrapper.find("button[data-id='properties-cancel-button']")
			.at(0)
			.simulate("click");
		expect(JSON.stringify(controller.getErrorMessages())).to.equal(JSON.stringify({}));
	});

	it("Validate returned property values when conditionReturnValueHandling='value'", (done) => {
		const myApplyPropertyChanges = function(values) {
			expect(values.number_hidden).to.equal(10);
			done();
		};
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource, { conditionReturnValueHandling: "value" },
			{ applyPropertyChanges: myApplyPropertyChanges });
		wrapper = renderedObject.wrapper;
		wrapper.find("div.properties-close-button")
			.find("button")
			.simulate("click");
	});

	it("Validate returned property values when conditionReturnValueHandling not set configuration", (done) => {
		const myApplyPropertyChanges = function(values) {
			expect(values.number_hidden).to.equal(10);
			done();
		};
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource, null,
			{ applyPropertyChanges: myApplyPropertyChanges });
		wrapper = renderedObject.wrapper;
		wrapper.find("div.properties-close-button")
			.find("button")
			.simulate("click");
	});

	it("Validate returned property values when conditionReturnValueHandling='null'", (done) => {
		const myApplyPropertyChanges = function(values) {
			expect(values.number_hidden).to.be.undefined;
			expect(values.number_null).to.equal(null); // make sure null isn't filtered
			done();
		};
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource, { conditionReturnValueHandling: "null" },
			{ applyPropertyChanges: myApplyPropertyChanges });
		wrapper = renderedObject.wrapper;
		wrapper.find("div.properties-close-button")
			.find("button")
			.simulate("click");
	});

	it("Validate returned property values when returnValueFiltering set", (done) => {
		const myApplyPropertyChanges = function(values) {
			expect(values.number_null).to.be.undefined;
			expect(values.number_int).to.equal(10);
			expect(values.number_random).to.be.undefined;
			done();
		};
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource, { returnValueFiltering: [null, 12345] },
			{ applyPropertyChanges: myApplyPropertyChanges });
		wrapper = renderedObject.wrapper;
		wrapper.find("div.properties-close-button")
			.find("button")
			.simulate("click");
	});

});

describe("CommonProperties validates on open correctly", () => {
	let wrapper;
	afterEach(() => {
		wrapper.unmount();
	});

	it("If messages are passed in then validate (generate errors)", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource, null, null, { messages: propertiesInfo.messages });
		wrapper = renderedObject.wrapper;
		expect(wrapper.find("div[data-id='properties-alerts-panel']")).to.have.length(1);
	});

	it("If messages are not passed in then no validation", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource);
		wrapper = renderedObject.wrapper;
		expect(wrapper.find("div[data-id='properties-alerts-panel']")).to.have.length(0);

	});
});

describe("applyPropertiesEditing through an instance outside Common Properties", () => {
	it("If true is passed in, applyPropertiesEditing should trigger a applyPropertiesDialog and closePropertiesDialog callback", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		const commonProperties = renderedObject.wrapper.find("CommonProperties");
		commonProperties.instance().applyPropertiesEditing(true);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 1);
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 1);
	});
	it("If false is passed in, applyPropertiesEditing should trigger a applyPropertiesDialog and closePropertiesDialog callback", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		const commonProperties = renderedObject.wrapper.find("CommonProperties");
		commonProperties.instance().applyPropertiesEditing(false);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 1);
	});
});

describe("closePropertiesDialog through an instance outside Common Properties", () => {
	it("closePropertiesDialog should be called with 'apply' if through save button", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource, { applyOnBlur: false });
		const commonProperties = renderedObject.wrapper.find("CommonProperties");
		commonProperties.find("button[data-id='properties-apply-button']")
			.at(0)
			.simulate("click");
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 1);
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 1);
		expect(renderedObject.callbacks.closePropertiesDialog.calledWith("apply")).to.be.true;
	});
	it("closePropertiesDialog should be called with 'cancel' if through cancel button", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource, { applyOnBlur: false });
		const commonProperties = renderedObject.wrapper.find("CommonProperties");
		commonProperties.find("button[data-id='properties-cancel-button']")
			.at(0)
			.simulate("click");
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 1);
		expect(renderedObject.callbacks.closePropertiesDialog.calledWith("cancel")).to.be.true;
	});
});

describe("New error messages of a control should be detected and applyPropertyChanges() should be called onBlur and on close", () => {
	it("An error message in expression control should trigger a applyPropertyChanges callback when editor is closed", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(expressionTestResource); // default is applyOnBlur=true
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		renderedObject.wrapper.find("CommonProperties").find("div.properties-close-button")
			.find("button")
			.simulate("click");
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 1);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 1);
	});
	it("An error message in expression control should trigger a applyPropertyChanges callback on blur", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(expressionTestResource); // default is applyOnBlur=true
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 0);
		expect(renderedObject.callbacks.closePropertiesDialog).to.have.property("callCount", 0);
		renderedObject.wrapper.find("CommonProperties").find("div.properties-title-editor")
			.at(0)
			.simulate("click"); // Focus on the editor
		renderedObject.wrapper.find("aside.properties-right-flyout")
			.simulate("blur"); // On blur
		expect(renderedObject.callbacks.applyPropertyChanges).to.have.property("callCount", 1);
	});
});

describe("CommonProperties should setForm correctly", () => {
	it("getPropertyValue: form should set correctly with the currentParameters converted from object to array in object structure control", () => {
		// Verify input currentParameters converts correctly to internal format
		const renderedObject = propertyUtils.flyoutEditorForm(structureListEditorParamDef); // default is applyOnBlur=true
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
		const renderedObject = propertyUtils.flyoutEditorForm(structureListEditorParamDef); // default is applyOnBlur=true
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
		const renderedObject = propertyUtils.flyoutEditorForm(structureEditorParamDef); // default is applyOnBlur=true
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
		const renderedObject = propertyUtils.flyoutEditorForm(structureEditorParamDef); // default is applyOnBlur=true
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
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource, propertiesConfig);
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

		const newCommonProps = (<CommonProperties
			propertiesInfo={propertiesInfo}
			propertiesConfig={updatedPropertiesConfig}
		/>);

		// call "setProps" to update config: https://github.com/enzymejs/enzyme/issues/1925#issuecomment-445442480
		renderedObject.wrapper.setProps({ children: newCommonProps });
		actualConfig = controller.getPropertiesConfig();
		expect(actualConfig).to.eql(updatedPropertiesConfig);
	});
});

describe("PropertiesButtons should render with the correct labels", () => {
	it("When applyOnBlur=false `Cancel` and `Save` buttons should be rendered", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(propertiesInfo.parameterDef, { applyOnBlur: false });
		const wrapper = renderedObject.wrapper;
		expect(wrapper.find("button[data-id='properties-apply-button']").text()).to.equal("Save");
		expect(wrapper.find("button[data-id='properties-cancel-button']").text()).to.equal("Cancel");
		// Verify "X" icon in properties title is not rendered
		const closeIcon = wrapper.find("div.properties-close-button");
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
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource, propertiesConfig);
		const wrapper = renderedObject.wrapper;
		expect(wrapper.find("button[data-id='properties-apply-button']").text()).to.equal("test apply");
		expect(wrapper.find("button[data-id='properties-cancel-button']").text()).to.equal("test reject");
	});
	it("apply button should use a custom label if provided in propertiesConfig", () => {
		const propertiesConfig = {
			applyOnBlur: false,
			buttonLabels: {
				primary: "test apply"
			}
		};
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource, propertiesConfig);
		const wrapper = renderedObject.wrapper;
		expect(wrapper.find("button[data-id='properties-apply-button']").text()).to.equal("test apply");
		expect(wrapper.find("button[data-id='properties-cancel-button']").text()).to.equal("Cancel");
	});
	it("reject button should use a custom label if provided in propertiesConfig", () => {
		const propertiesConfig = {
			applyOnBlur: false,
			buttonLabels: {
				secondary: "test reject"
			}
		};
		const renderedObject = propertyUtils.flyoutEditorForm(numberfieldResource, propertiesConfig);
		const wrapper = renderedObject.wrapper;
		expect(wrapper.find("button[data-id='properties-apply-button']").text()).to.equal("Save");
		expect(wrapper.find("button[data-id='properties-cancel-button']").text()).to.equal("test reject");
	});
});

describe("CommonProperties conditionHandling option tests", () => {
	let wrapper;
	const propertyId = { name: "string_condition_handling" };
	afterEach(() => {
		wrapper.unmount();
	});

	it("valation when conditionHiddenPropertyHandling=null hidden controls return null values in conditions", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(textfieldResource, { conditionHiddenPropertyHandling: "null" }); // default is applyOnBlur=true
		wrapper = renderedObject.wrapper;
		const controller = renderedObject.controller;
		expect(controller.getControlState(propertyId)).to.equal("disabled");
		controller.updatePropertyValue({ name: "hide" }, false);
		expect(controller.getControlState(propertyId)).to.equal("enabled");

	});

	it("valation when conditionDisabledPropertyHandling=null disabled controls return null values in conditions", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(textfieldResource, { conditionDisabledPropertyHandling: "null" }); // default is applyOnBlur=true
		wrapper = renderedObject.wrapper;
		const controller = renderedObject.controller;
		expect(controller.getControlState(propertyId)).to.equal("disabled");
		controller.updatePropertyValue({ name: "disable" }, false);
		expect(controller.getControlState(propertyId)).to.equal("enabled");
	});

	it("valation when neither conditionDisabledPropertyHandling or conditionHiddenPropertyHandling are set values are returned in conditions", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(textfieldResource); // default is applyOnBlur=true
		wrapper = renderedObject.wrapper;
		const controller = renderedObject.controller;
		expect(controller.getControlState(propertyId)).to.equal("enabled");
	});
});

describe("CommonProperties should set maxLengthForMultiLineControls and maxLengthForSingleLineControls in propertiesConfig", () => {
	let wrapper;
	const maxLengthForSingleLineControls = 5;
	const maxLengthForMultiLineControls = 15;
	afterEach(() => {
		wrapper.unmount();
	});

	it("verify number of characters for single-line string type controls don't exceed maxLengthForSingleLineControls from propertiesConfig", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(textfieldResource, { maxLengthForSingleLineControls: maxLengthForSingleLineControls });
		wrapper = renderedObject.wrapper;
		const controller = renderedObject.controller;
		// Only 5 characters are allowed
		expect(controller.getMaxLengthForSingleLineControls()).to.equal(maxLengthForSingleLineControls);
		const textWrapper = wrapper.find("div[data-id='properties-ctrl-string']");
		const input = textWrapper.find("input");
		const newValue = "This sentence has more characters than maxLengthForSingleLineControls.";
		input.simulate("change", { target: { value: newValue } });
		// Verify only 5 characters are displayed - "This "
		expect(controller.getPropertyValue("string")).to.equal(newValue.substring(0, maxLengthForSingleLineControls));

	});

	it("verify number of characters for multi-line string type controls don't exceed maxLengthForMultiLineControls from propertiesConfig", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(textAreaResource, { maxLengthForMultiLineControls: maxLengthForMultiLineControls });
		wrapper = renderedObject.wrapper;
		const controller = renderedObject.controller;
		// Only 15 characters are allowed
		expect(controller.getMaxLengthForMultiLineControls()).to.equal(maxLengthForMultiLineControls);
		const textWrapper = wrapper.find("div[data-id='properties-ctrl-string']");
		const textarea = textWrapper.find("textarea");
		const newValue = "This sentence has more characters than maxLengthForMultiLineControls.";
		textarea.simulate("change", { target: { value: newValue } });
		// Verify only 15 characters are displayed - "This sentence h"
		expect(controller.getPropertyValue("string")).to.equal(newValue.substring(0, maxLengthForMultiLineControls));

	});

	it("verify char_limit from uiHints overrides the value of maxLengthForSingleLineControls from propertiesConfig", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(textfieldResource, { maxLengthForSingleLineControls: maxLengthForSingleLineControls });
		wrapper = renderedObject.wrapper;
		const controller = renderedObject.controller;
		const charLimit = controller.controls.string_charLimit.charLimit;
		// maxLength = 5 and char_limit = 10
		expect(controller.getMaxLengthForSingleLineControls()).to.equal(maxLengthForSingleLineControls);
		expect(charLimit).to.equal(10);

		const textWrapper = wrapper.find("div[data-id='properties-ctrl-string_charLimit']");
		const input = textWrapper.find("input");
		const newValue = "This sentence should display 10 characters.";
		input.simulate("change", { target: { value: newValue } });
		// Verify 10 characters are displayed - "This sente"
		expect(controller.getPropertyValue("string_charLimit")).to.equal(newValue.substring(0, charLimit));

	});

	it("verify char_limit from uiHints overrides the value of maxLengthForMultiLineControls from propertiesConfig", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(textAreaResource, { maxLengthForMultiLineControls: maxLengthForMultiLineControls });
		wrapper = renderedObject.wrapper;
		const controller = renderedObject.controller;
		const charLimit = controller.controls.string_charLimit.charLimit;
		// maxLength = 15 and char_limit = 20
		expect(controller.getMaxLengthForMultiLineControls()).to.equal(maxLengthForMultiLineControls);
		expect(charLimit).to.equal(20);

		const textWrapper = wrapper.find("div[data-id='properties-ctrl-string_charLimit']");
		const textarea = textWrapper.find("textarea");
		const newValue = "This sentence should display 20 characters.";
		textarea.simulate("change", { target: { value: newValue } });
		// Verify 20 characters are displayed - "This sentence should"
		expect(textarea.text()).to.equal(newValue.substring(0, charLimit));

	});

	it("verify default value of maxLengthForMultiLineControls is 1024", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(textAreaResource);
		wrapper = renderedObject.wrapper;
		const controller = renderedObject.controller;
		expect(controller.getMaxLengthForMultiLineControls()).to.equal(1024);

	});

	it("verify default value of maxLengthForSingleLineControls is 128", () => {
		const renderedObject = propertyUtils.flyoutEditorForm(textfieldResource);
		wrapper = renderedObject.wrapper;
		const controller = renderedObject.controller;
		expect(controller.getMaxLengthForSingleLineControls()).to.equal(128);

	});
});

function createCommonProperties(container, messages) {
	const propertiesConfig = { containerType: container };
	if (container === "Custom") {
		propertiesConfig.rightFlyout = true;
	}
	const	wrapper = mount(
		<IntlProvider key="IntlProvider2" locale={ locale } messages={messages}>
			<CommonProperties
				propertiesInfo={propertiesInfo}
				propertiesConfig={propertiesConfig}
				callbacks={callbacks}
			/>
		</IntlProvider>
	);
	return wrapper.find("CommonProperties");
}
