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
import { mountWithIntl, shallowWithIntl } from "enzyme-react-intl";


import sinon from "sinon";

function flyoutEditorForm(paramDef) {
	const applyPropertyChanges = sinon.spy();
	const closePropertiesDialog = sinon.spy();

	const propertiesInfo = {
		parameterDef: paramDef,
		applyPropertyChanges: applyPropertyChanges,
		closePropertiesDialog: closePropertiesDialog
	};
	const wrapper = mountWithIntl(
		<CommonProperties
			showPropertiesDialog
			propertiesInfo={propertiesInfo}
			containerType="Custom"
			rightFlyout
		/>
	);

	return wrapper;
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
		wrapper = shallowWithIntl(editorForm);
	} else {
		wrapper = mountWithIntl(editorForm);
	}
	return wrapper;
}

module.exports = {
	flyoutEditorForm: flyoutEditorForm,
	createEditorForm: createEditorForm
};
