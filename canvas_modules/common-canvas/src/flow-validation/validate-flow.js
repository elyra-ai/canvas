/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Form from "../common-properties/form/Form";
import UiConditionsParser from "../common-properties/ui-conditions/ui-conditions-parser";
import ConditionsUtils from "../common-properties/util/conditions-utils";
import PropertyUtils from "../common-properties/util/property-utils";
import PropertiesController from "../common-properties/properties-controller";
import logger from "../../utils/logger";

/* eslint max-depth: ["error", 7] */

/**
* Validate the properties values for each node in a flow.
*
* @param canvasController A common canvas controller object. (required)
* @param {Function} callback function to get form | parameter data for a node. (required)
* @param {Function} callback function to store messages data for node. (optional)
* @param includeMsgTypes (array[strings]) Return invalid only if messages are found of types contained in the array.
* If not specified then any message type causes invalid return. (optional)
*
* @return (boolean) If flow is valid returns true, otherwise returns false.
*/
function validateFlow(canvasController, getParameterData, setMessagesCallback, includeMsgTypes) {
	// get the nodes in the flow
	const nodes = canvasController.getNodes();
	// traverse the flow
	// this will just visit all the nodes and not traverse it via DAG
	for (const node of nodes) {
		// get the form data for the node
		if (node.type === "execution_node" || node.type === "binding") {
			const formData = _getFormData(node.id, getParameterData);
			const propertiesController = _getPropertiesController(formData);
			_validateNode(formData, node.id, propertiesController);
			_setNodeMessages(node, propertiesController, canvasController, setMessagesCallback);
		}
	}
	return canvasController.isFlowValid(includeMsgTypes);
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
			formData = Form.makeForm(parameterData.data);
		} else {
			formData = parameterData.data.formData;
		}
		// TODO: This can be removed once the WML Play service generates datasetMetadata instead of inputDataModel
		if (formData && formData.data && formData.data.inputDataModel && !formData.data.datasetMetadata) {
			formData.data.datasetMetadata = PropertyUtils.convertInputDataModel(formData.data.inputDataModel);
		}
	} else {
		logger.warn("flow-validation", { message: "No parameter def found for node " + nodeId });
	}
	return formData;
}

function _getPropertiesController(formData) {
	const propertiesController = new PropertiesController();
	propertiesController.setForm(formData);
	return propertiesController;
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
* Extract the control from the form.
* @param {Object} form data for a specific node
*/
function _getControlsFromForm(form) {
	var controls = [];
	controls = UiConditionsParser.parseControls(controls, form);
	return controls;
}

/**
* Validate the parameters associated with a node
* @param {Object} form data for a specific node
*/
function _validateNode(formData, nodeId, propertiesController) {
	const controls = _getControlsFromForm(formData);
	const validationDefinitions = _getValidationDefinitions(formData);
	for (const control of controls) {
		const propertyId = { name: control.name };
		const controlValue = propertiesController.getPropertyValue(propertyId);
		if (Array.isArray(controlValue) && control.subControls) {
			// validate the table as a whole
			ConditionsUtils.validateInput(propertyId, propertiesController, validationDefinitions, formData.data.datasetMetadata);
			// validate each cell
			for (let rowIndex = 0; rowIndex < controlValue.length; rowIndex++) {
				for (let colIndex = 0; colIndex < control.subControls.length; colIndex++) {
					propertyId.row = rowIndex;
					propertyId.col = colIndex;
					ConditionsUtils.validateInput(propertyId, propertiesController, validationDefinitions, formData.data.datasetMetadata);
				}
			}
		} else {
			ConditionsUtils.validateInput(propertyId, propertiesController, validationDefinitions, formData.data.datasetMetadata);
		}
	}
}

function _setNodeMessages(node, propertiesController, canvasController, setMessagesCallback) {
	const nodeMsgs = canvasController.getNodeMessages(node.id);
	const errorMsgs = propertiesController.getErrorMessages(true);
	if (JSON.stringify(errorMsgs) !== JSON.stringify(nodeMsgs)) {
		canvasController.setNodeMessages(node.id, errorMsgs);
		if (setMessagesCallback) {
			setMessagesCallback(node.id, errorMsgs);
		}
	}
}

module.exports = {
	validateFlow: validateFlow
};
