/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import CommonProperties from "../../src/common-properties/common-properties.jsx";
import { mount } from "enzyme";
import sinon from "sinon";

function flyoutEditorForm(paramDef) {
	const applyPropertyChanges = sinon.spy();
	const closePropertiesDialog = sinon.spy();

	const propertiesInfo = {
		parameterDef: paramDef,
		applyPropertyChanges: applyPropertyChanges,
		closePropertiesDialog: closePropertiesDialog
	};
	const wrapper = mount(
		<CommonProperties
			showPropertiesDialog
			propertiesInfo={propertiesInfo}
			containerType="custom"
			rightFlyout
		/>
	);
	const editorForm = wrapper.ref("editorForm");
	return editorForm;
}

module.exports = {
	flyoutEditorForm: flyoutEditorForm
};
