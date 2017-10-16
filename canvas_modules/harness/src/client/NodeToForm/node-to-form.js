/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import FormsService from "../services/FormsService";

var nodeForms = {};
var nodeToFormMap = {};
var nodeFormInfo = {};

// internal functions
function setFileNamesMap(type) {
	FormsService.getFiles(type)
		.then(function(res) {
			for (const fileName of res) {
				const splitName = fileName.split(".json");
				nodeFormInfo[splitName[0]] = { "type": type, "name": fileName };
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
	setFileNamesMap("forms");
	setFileNamesMap("parameterDefs");
}

function clearNodeForms() {
	nodeToFormMap = {};
}

function getNodeForm(nodeId) {
	// return a deep copy
	return JSON.parse(JSON.stringify(nodeToFormMap[nodeId]));
}

function setNodeForm(nodeId, nodeOp) {
	if (!nodeToFormMap[nodeId]) {
		// get the initial form information about this node type
		let nodeType = nodeOp ? nodeOp : "default";
		let formInfo = "";
		if (!nodeFormInfo[nodeType]) {
			nodeType = "default";
		}
		formInfo = nodeFormInfo[nodeType];
		// if the initial form is in memory
		if (nodeForms[nodeType]) {
			// set the mapping of this specific node id to the initial form
			nodeToFormMap[nodeId] = {
				type: formInfo.type,
				data: nodeForms[nodeType]
			};
		} else {
			// load initial form in memory off of disk
			FormsService.getFileContent(formInfo.type, formInfo.name)
				.then(function(res) {
					// set the loaded form
					nodeForms[nodeType] = res;
					// set the mapping of this specific node id to the initial form
					nodeToFormMap[nodeId] = {
						type: formInfo.type,
						data: res
					};
				});
		}
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
