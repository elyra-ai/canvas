/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import FormsService from "../services/FormsService";
import { FORMS, PARAMETER_DEFS } from "../constants/constants.js";

var nodeForms = {};
var nodeToFormMap = {};
var nodeFormInfo = {};

// internal functions
function setFileNamesMap(type) {
	FormsService.getFiles(type)
		.then(function(res) {
			for (const fileName of res) {
				const splitName = fileName.split(".json");
				nodeFormInfo[splitName[0]] = fileName;
				loadForm(splitName[0], type, fileName);
			}
		});
}

function loadForm(id, type, fileName) {
	FormsService.getFileContent(type, fileName)
		.then(function(res) {
			// set the loaded form
			nodeForms[id] = res;
		});
}


// Export functions

function initialize() {
	setFileNamesMap(FORMS);
	setFileNamesMap(PARAMETER_DEFS);
}

function clearNodeForms() {
	nodeToFormMap = {};
}

function getNodeForm(nodeId) {
	if (nodeToFormMap[nodeId]) {
		return JSON.parse(JSON.stringify(nodeToFormMap[nodeId]));
	}
	return null;
}

function setNodeForm(nodeId, nodeOp) {
	if (!nodeToFormMap[nodeId]) {
		// get the initial form information about this node type
		let nodeType = nodeOp ? nodeOp : "default"; // if op not supplied then get the default
		nodeType = nodeForms[nodeType] ? nodeType : "default"; // if op form file not found then get default
		// set the mapping of this specific node id to the initial form
		const type = (nodeForms[nodeType].formData) ? "form" : "parameterDef";
		nodeToFormMap[nodeId] = {
			type: type,
			data: JSON.parse(JSON.stringify(nodeForms[nodeType]))
		};
	}
}

function setNodeForms(nodes) {
	for (const node of nodes) {
		setNodeForm(node.id, node.operator_id_ref);
	}
}


module.exports = {
	initialize: initialize,
	setNodeForm: setNodeForm,
	setNodeForms: setNodeForms,
	getNodeForm: getNodeForm,
	clearNodeForms: clearNodeForms
};
