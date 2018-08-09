/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Form from "../common-properties/form/Form";
import PropertyUtils from "../common-properties/util/property-utils";
import PropertiesController from "../common-properties/properties-controller";
import logger from "../../utils/logger";
import isEqual from "lodash/isEqual";

/* eslint max-depth: ["error", 7] */

/**
* Validate the properties values for each node in a flow.
*
* @param canvasController A common canvas controller object. (required)
* @param {Function} callback function to get form | parameter data for a node. (required)
* @param {Function} callback function to store messages data for node. (optional)
* @param includeMsgTypes (array[strings]) Return invalid only if messages are found of types contained in the array.
* If not specified then any message type causes invalid return. (optional)
* @param intl reactIntl object (optional)
*
* @return (boolean) If flow is valid returns true, otherwise returns false.
*/
function validateFlow(canvasController, getParameterData, setMessagesCallback, includeMsgTypes, intl) {
	return validatePipelineFlow(canvasController, canvasController.getPrimaryPipelineId(), getParameterData, setMessagesCallback, includeMsgTypes, intl);
}
function validatePipelineFlow(canvasController, pipelineId, getParameterData, setMessagesCallback, includeMsgTypes, intl) {
	let flowValid = true;
	// get the nodes in the flow
	const nodes = canvasController.getNodes(pipelineId);
	// traverse the flow
	// this will just visit all the nodes and not traverse it via DAG
	for (const node of nodes) {
		if (node.type === "super_node" &&
		(typeof node.open_with_tool === "undefined" || node.open_with_tool === "canvas")) {
			flowValid = validatePipelineFlow(canvasController, node.subflow_ref.pipeline_id_ref,
				getParameterData, setMessagesCallback, includeMsgTypes, intl);
		} else if (node.type === "execution_node" || node.type === "binding") {
			const formData = _getFormData(node.id, pipelineId, getParameterData, canvasController);
			const propertiesController = _getPropertiesController(formData, intl);
			propertiesController.validatePropertiesValues();
			_setNodeMessages(node, pipelineId, propertiesController, canvasController, setMessagesCallback);
		}
	}
	return canvasController.isFlowValid(includeMsgTypes, pipelineId) && flowValid;
}

/**
* Get the form data and add it to the cache
* @param {String} node id
* @param {Function} callback function to get form | parameter data for a node
*/
function _getFormData(nodeId, pipelineId, getParameterData, canvasController) {
	var formData = {};
	var parameterData = getParameterData(nodeId, pipelineId, canvasController);
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

function _getPropertiesController(formData, intl) {
	const propertiesController = new PropertiesController();
	propertiesController.setForm(formData, intl);
	return propertiesController;
}

function _setNodeMessages(node, pipelineId, propertiesController, canvasController, setMessagesCallback) {
	const nodeMsgs = canvasController.getNodeMessages(node.id, pipelineId);
	const errorMsgs = propertiesController.getErrorMessages(true, true, true);
	if ((!nodeMsgs && errorMsgs.length > 0) ||
			(nodeMsgs && !isEqual(errorMsgs, nodeMsgs))) {
		canvasController.setNodeMessages(node.id, errorMsgs, pipelineId);
		if (setMessagesCallback) {
			setMessagesCallback(node.id, errorMsgs);
		}
	}
}

module.exports = {
	validateFlow: validateFlow
};
