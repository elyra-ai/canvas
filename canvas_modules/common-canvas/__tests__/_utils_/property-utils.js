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
import CommonProperties from "../../src/common-properties/common-properties.jsx";
import * as UiConditionsParser from "../../src/common-properties/ui-conditions/ui-conditions-parser.js";
import { mountWithIntl, mountWithIntlMessages, renderWithIntl } from "./intl-utils";
import { expect } from "chai";
import cloneDeep from "lodash/cloneDeep";

import CustomTableControl from "./custom-controls/CustomTableControl";
import CustomToggleControl from "./custom-controls/CustomToggleControl";
import CustomOpMax from "./custom-condition-ops/customMax";

import sinon from "sinon";
var renderedController;
function controllerHandler(propertyController) {
	renderedController = propertyController;
}

function flyoutEditorForm(paramDef, propertiesConfigOverrides, callbacksOverrides, propertiesInfoOverrides, isRender = false) {
	const applyPropertyChanges = sinon.spy();
	const closePropertiesDialog = sinon.spy();
	let callbacks = {
		applyPropertyChanges: applyPropertyChanges,
		closePropertiesDialog: closePropertiesDialog,
		controllerHandler: controllerHandler
	};
	if (callbacksOverrides) {
		callbacks = Object.assign(callbacks, callbacksOverrides);
	}

	let propertiesInfo = {
		parameterDef: cloneDeep(paramDef)
	};

	if (propertiesInfoOverrides) {
		propertiesInfo = Object.assign(propertiesInfo, propertiesInfoOverrides);
	}

	let propertiesConfig = {
		applyOnBlur: true,
		rightFlyout: true,
		trimSpaces: true,
		containerType: "Custom"
	};
	if (propertiesConfigOverrides) {
		propertiesConfig = Object.assign(propertiesConfig, propertiesConfigOverrides);
	}
	let wrapper;
	if (isRender) {
		wrapper = renderWithIntl(
			<div className="properties-right-flyout">
				<CommonProperties
					propertiesInfo={propertiesInfo}
					propertiesConfig={propertiesConfig}
					callbacks={callbacks}
					customControls={[CustomTableControl, CustomToggleControl]}
					customConditionOps={[CustomOpMax]}
				/>
			</div>);
	} else {
		wrapper = mountWithIntl(
			<div className="properties-right-flyout">
				<CommonProperties
					propertiesInfo={propertiesInfo}
					propertiesConfig={propertiesConfig}
					callbacks={callbacks}
					customControls={[CustomTableControl, CustomToggleControl]}
					customConditionOps={[CustomOpMax]}
				/>
			</div>
		);
	}
	return { wrapper: wrapper, controller: renderedController, callbacks: callbacks };
}

function flyoutEditorFormRender(paramDef, propertiesConfigOverrides, callbacksOverrides, propertiesInfoOverrides) {
	const wrapper = flyoutEditorForm(paramDef, propertiesConfigOverrides, callbacksOverrides, propertiesInfoOverrides, true).wrapper;
	const callbacks = wrapper.callbacks;

	return { wrapper: wrapper, controller: renderedController, callbacks: callbacks };
}

// Uses 'mountWithIntlMessages()' to allow for custom resources to be applied from the test harness
function flyoutEditorFormWithIntl(paramDef, propertiesConfigOverrides, callbacksOverrides, propertiesInfoOverrides) {
	const applyPropertyChanges = sinon.spy();
	const closePropertiesDialog = sinon.spy();
	let callbacks = {
		applyPropertyChanges: applyPropertyChanges,
		closePropertiesDialog: closePropertiesDialog,
		controllerHandler: controllerHandler
	};
	if (callbacksOverrides) {
		callbacks = Object.assign(callbacks, callbacksOverrides);
	}

	let propertiesInfo = {
		parameterDef: cloneDeep(paramDef)
	};

	if (propertiesInfoOverrides) {
		propertiesInfo = Object.assign(propertiesInfo, propertiesInfoOverrides);
	}

	let propertiesConfig = {
		applyOnBlur: true,
		rightFlyout: true,
		trimSpaces: true,
		containerType: "Custom"
	};
	if (propertiesConfigOverrides) {
		propertiesConfig = Object.assign(propertiesConfig, propertiesConfigOverrides);
	}

	const wrapper = mountWithIntlMessages(
		<div className="properties-right-flyout">
			<CommonProperties
				propertiesInfo={propertiesInfo}
				propertiesConfig={propertiesConfig}
				callbacks={callbacks}
				customControls={[CustomTableControl, CustomToggleControl]}
				customConditionOps={[CustomOpMax]}
			/>
		</div>
	);

	return { wrapper: wrapper, controller: renderedController, callbacks: callbacks };
}

function setControls(controller, controls) {
	const parsedControls = [];
	for (const control of controls) {
		UiConditionsParser.parseControl(parsedControls, control);
	}
	controller.saveControls(parsedControls);
}

function genLongString(length) {
	let str = "";
	while (length > str.length) {
		str += Math.random().toString(36)
			.substr(2, 1);
	}
	return str;
}

function openSummaryPanel(wrapper, panelId) {
	const summaryPanel = wrapper.find(`div[data-id='properties-${panelId}']`);
	expect(summaryPanel).to.have.length(1);
	summaryPanel.find("button.properties-summary-link-button")
		.simulate("click");
	return wrapper.find("div.properties-wf-content.show");
}

function getParameterFromParamDef(parameterId, paramDef) {
	const parameters = paramDef.parameters;
	let parameterFound = null;
	parameters.forEach((parameter) => {
		if (parameter.id === parameterId) {
			parameterFound = parameter;
		}
	});
	return parameterFound;
}

module.exports = {
	flyoutEditorForm: flyoutEditorForm,
	flyoutEditorFormRender: flyoutEditorFormRender,
	flyoutEditorFormWithIntl: flyoutEditorFormWithIntl,
	setControls: setControls,
	genLongString: genLongString,
	openSummaryPanel: openSummaryPanel,
	getParameterFromParamDef: getParameterFromParamDef
};
