/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import CommonProperties from "../../src/common-properties/common-properties.jsx";
import UiConditionsParser from "../../src/common-properties/ui-conditions/ui-conditions-parser.js";
import { mountWithIntl } from "./intl-utils";
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

function flyoutEditorForm(paramDef, propertiesConfigOverrides, callbacksOverrides, propertiesInfoOverrides) {
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
		containerType: "Custom"
	};
	if (propertiesConfigOverrides) {
		propertiesConfig = Object.assign(propertiesConfig, propertiesConfigOverrides);
	}

	const wrapper = mountWithIntl(
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

module.exports = {
	flyoutEditorForm: flyoutEditorForm,
	setControls: setControls,
	genLongString: genLongString,
	openSummaryPanel: openSummaryPanel
};
