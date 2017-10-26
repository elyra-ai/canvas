/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import ObjectModel from "../object-model/object-model";
import Form from "../common-properties/form/Form";
import UiConditionsParser from "../common-properties/ui-conditions/ui-conditions-parser";
import UiConditions from "../common-properties/ui-conditions/ui-conditions";
import logger from "../../utils/logger";
import { DEFAULT_VALIDATION_MESSAGE } from "../common-properties/constants/constants.js";


/* eslint max-depth: ["error", 7] */

/**
* @param {Function} callback function to get form | parameter data for a node
* @param {Function} callback function to store messages data for node.

*/
function validateFlow(getParameterData, setMessagesCallback) {
	// get the nodes in the flow
	const nodes = ObjectModel.getNodes();

	// traverse the flow
	// this will just visit all the nodes and not traverse it via DAG
	for (const node of nodes) {
		// get the form data for the node
		// console.log("FlowValidation: of Node: " + node.label);
		if (node.type === "execution_node" || node.type === "binding") {
			const formData = _getFormData(node.id, getParameterData);
			const messages = _validateNode(formData, node.id);
			if (messages.length > 0) {
				ObjectModel.setNodeMessages(node.id, messages);
			}
			if (setMessagesCallback) {
				setMessagesCallback(node.id, messages);
			}
		}
	}
}

/**
* Get the form data and add it to the cache
* @param {String} node id
* @param {Function} callback function to get form | parameter data for a node
*/
function _getFormData(nodeId, getParameterData) {
	var formData = {};
	var parameterData = getParameterData(nodeId);
	if (parameterData) {
		if (parameterData.type === "parameterDef") {
			formData.form = Form.makeForm(parameterData.data);
		} else {
			formData.form = parameterData.data.formData;
		}
		if (formData.form) {
			formData.validationDefinitions = _getValidationDefinitions(formData.form);
			if (Object.keys(formData.validationDefinitions).length !== 0) {
				formData.controls = _getControl(formData.form);
				formData.requiredParameters = _getRequiredParameters(formData.form, formData.controls);
			}
		} else {
			logger.warn("flow-validation", { message: "No form data for node " + nodeId });
		}
	} else {
		logger.warn("flow-validation", { message: "No parameter def found for node " + nodeId });
	}
	return formData;
}

/**
* Extract the set of evaluation definitions from the form.
* @param {Object} form data for a specific node
*/
function _getValidationDefinitions(form) {
	var validationDefinitions = {};
	if (form.conditions) {
		const uiConditions = form.conditions;
		for (let i = 0; i < uiConditions.length; i++) {
			if (uiConditions[i].validation) {
				validationDefinitions = UiConditionsParser.parseConditions(validationDefinitions, uiConditions[i], "validation");
			}
		}
	}
	return validationDefinitions;
}

/**
* Extract the set of required parameters from the form.
* @param {Object} form data for a specific node
*/
function _getRequiredParameters(form, controls) {
	var requiredParameters = [];
	requiredParameters = UiConditionsParser.parseRequiredParameters(requiredParameters, form, controls);
	return requiredParameters;
}

/**
* Extract the control from the form.
* @param {Object} form data for a specific node
*/
function _getControl(form) {
	var controls = [];
	controls = UiConditionsParser.parseControls(controls, form);
	return controls;
}

/**
* Validate the parameters associated with a node
* @param {Object} form data for a specific node
*/
function _validateNode(formData, nodeId) {
	const messages = [];
	if (formData.controls) {
		for (const control of formData.controls) {
			if (formData.validationDefinitions[control.name]) {
				let validationSetError = false;
				for (const validationDefinition of formData.validationDefinitions[control.name]) {
					if (!validationSetError && validationDefinition.definition.validation) {
						// make sure there is an element for the control name in current parameters or the code will fail.
						if (!formData.form.data.currentParameters[control.name]) {
							formData.form.data.currentParameters[control.name] = null;
						}
						// validate the control's current value.
						let error = UiConditions.evaluateInput(validationDefinition.definition, formData.form.data.currentParameters,
							control, formData.form.data.datasetMetadata, formData.requiredParameters, null, null, null);
						if (typeof error === "object" && error !== null && error !== DEFAULT_VALIDATION_MESSAGE) {
							error.id_ref = control.name;
							messages.push(error);
							validationSetError = true;
						} else if (formData.requiredParameters.indexOf(control.name) !== -1) {
							const controlValue = formData.form.data.currentParameters[control.name];
							if (!controlValue || controlValue === null || controlValue === "" ||
							(Array.isArray(controlValue) && controlValue.length === 0)) {
								error = {
									id_ref: control.name,
									type: "error",
									text: "Required parameter " + control.name + " has no value."
								};
								messages.push(error);
								validationSetError = true;
							}
						}
					}
				}
			}
		}
	}
	return messages;
}

module.exports = {
	validateFlow: validateFlow
};
