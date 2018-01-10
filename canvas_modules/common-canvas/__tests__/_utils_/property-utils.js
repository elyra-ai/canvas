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
import EditorForm from "../../src/common-properties/editor-controls/editor-form.jsx";
import { mount, shallow } from "enzyme";
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

function createEditorForm(state, formData, controller) {
	const additionalComponents = null;
	const showPropertiesButtons = sinon.spy();

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

module.exports = {
	flyoutEditorForm: flyoutEditorForm,
	createEditorForm: createEditorForm
};
