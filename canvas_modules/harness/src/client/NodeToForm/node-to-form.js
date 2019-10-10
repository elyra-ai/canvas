/*
 * Copyright 2017-2019 IBM Corporation
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
		const nodeType = nodeForms[nodeOp] ? nodeOp : "default"; // if op form file not found then get default
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
		setNodeForm(node.id, node.op);
	}
}


module.exports = {
	initialize: initialize,
	setNodeForm: setNodeForm,
	setNodeForms: setNodeForms,
	getNodeForm: getNodeForm,
	clearNodeForms: clearNodeForms
};
