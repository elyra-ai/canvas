/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint max-depth: ["error", 6] */

// Modules

// Globals -------------------------------------------------------------------->

// The lowest version accepted
const FIRST_VERSION = 1;

// The latest pipeline-flow version - update as new versions are developed
const LATEST_VERSION = 2;

// Array of major version upgrade functions
const updateFuncs = [
	_update0to1,
	_update1to2
];

// Private Methods ------------------------------------------------------------>

/**
 * Extracts the version from the given pipeline-flow.
 *
 * @param {Object} pipelineFlow: A pipeline-flow JSON object
 *
 * @return {integer} An integer version number
 *
 * @throws {Error} If the version number cannot be extracted
 */
function _extractVersion(pipelineFlow) {
	let baseVersion;
	// Validate the incoming pipeline-flow
	if (!pipelineFlow || !pipelineFlow.version ||
		!(typeof pipelineFlow.version === "string") ||
		pipelineFlow.version.length === 0) {
		throw new Error("Invalid pipeline-flow document: The 'version' attribute is missing or invalid");
	} else {
		baseVersion = parseInt(pipelineFlow.version, 10);
		if (!baseVersion) {
			throw new Error("Invalid pipeline-flow document: The 'version' attribute cannot be parsed");
		}
	}
	return baseVersion;
}

// Version 1 methods ------------------------>

/**
 * Updates version 0 to version 1.
 *
 * @param {object} pipelineFlow: A pipeline-flow JSON object
 *
 * @return A pipeline-flow object that has been upgraded to version 1
 */
function _update0to1(pipelineFlow) {
	pipelineFlow.version = "1.0";
	return pipelineFlow;
}

// Version 2 methods ------------------------>

/**
 * Updates version 1 to version 2.
 *
 * @param {object} pipelineFlow: A pipeline-flow JSON object
 *
 * @return A pipeline-flow object that has been upgraded to version 2
 */
function _update1to2(pipelineFlow) {
	pipelineFlow.version = "2.0";
	pipelineFlow.json_schema = "http://api.dataplatform.ibm.com/schemas/common-pipeline/pipeline-flow/pipeline-flow-v2-schema.json";

	// --> Changed the binding node. Instead of just a single input or output port,
	// binding nodes can have either an array of input ports or an array of output ports.
	// Also added "parameters" and "op" elements in the binding node *
	// Cycle the pipelines...
	for (let idx = 0; idx < pipelineFlow.pipelines.length; idx++) {
		const pipeline = pipelineFlow.pipelines[idx];
		updateBindingNodesInPipeline(pipeline);
	}

	// --> "pipeline_id_ref" was removed from "link_def"
	for (let idx = 0; idx < pipelineFlow.pipelines.length; idx++) {
		const pipeline = pipelineFlow.pipelines[idx];
		updatePipelinesIdRef(pipeline);
	}

	// --> Renamed "runtime" to "runtime_ref" and added an array of runtime objects that "runtime_ref" refers to
	if (!pipelineFlow.runtimes) {
		pipelineFlow.runtimes = [];
	}
	for (let idx = 0; idx < pipelineFlow.pipelines.length; idx++) {
		const pipeline = pipelineFlow.pipelines[idx];
		if (pipeline.runtime) {
			const runtimeName = pipeline.runtime;
			pipeline.runtime_ref = runtimeName;
			if (_getRuntime(pipelineFlow, runtimeName) === null) {
				// Add a new runtime object
				pipelineFlow.runtimes.push({
					"id": runtimeName,
					"name": runtimeName
				});
			}
			delete pipeline.runtime;
		}
	}

	return pipelineFlow;
}

/**
 * Attempts to locate a runtime object with the given name.
 *
 * @param {Object} pipelineFlow: A pipeline-flow JSON object
 * @param {String} name: The name of the runtime to search for
 *
 * @return {Object} a runtime object or null if not found
 */
function _getRuntime(pipelineFlow, runtimeName) {
	if (pipelineFlow.runtimes) {
		for (let idx = 0; idx < pipelineFlow.runtimes; idx++) {
			const runtime = pipelineFlow.runtimes[idx];
			if (runtime.name === runtimeName) {
				return runtime;
			}
		}
	}
	return null;
}

/**
 * Updates the binding nodes in the given pipeline to 2.0 state.
 *
 * @param {object} pipeline: A single pipeline
 * @return {void}
 */
function updateBindingNodesInPipeline(pipeline) {
	for (let id2 = 0; id2 < pipeline.nodes.length; id2++) {
		const node = pipeline.nodes[id2];
		if (node.type === "binding") {
			// Extract the port and add it to a new array of ports instead
			if (typeof node.input !== "undefined") {
				if (node.input.link) {
					node.input.links = [node.input.link];
					delete node.input.link;
				}
				node.inputs = [node.input];
				delete node.input;
			} else if (typeof node.output !== "undefined") {
				node.outputs = [node.output];
				delete node.output;
			}
		}
	}
}

/**
 * Removes all pipeline_id_ref elements from ports.
 *
 * @param {object} pipeline: A single pipeline
 * @return {void}
 */
function updatePipelinesIdRef(pipeline) {
	for (let id2 = 0; id2 < pipeline.nodes.length; id2++) {
		const node = pipeline.nodes[id2];
		if (node.links) {
			for (let id3 = 0; id3 < node.links.length; id3++) {
				const link = node.links[id3];
				if (link.pipeline_id_ref) {
					delete link.pipeline_id_ref;
				}
			}
		}
	}
}


// Public Methods ------------------------------------------------------------->

/**
 * Upgrades the given pipeline-flow object to the current version.
 *
 * @param {Object} pipelineFlow: A pipeline-flow JSON object
 *
 * @returns A pipeline-flow object that has been upgraded to the latest version
 */
function upgrade(pipelineFlow) {
	const baseVersion = Math.max(_extractVersion(pipelineFlow), FIRST_VERSION);
	let flow = JSON.parse(JSON.stringify(pipelineFlow));
	for (let idx = baseVersion; idx < LATEST_VERSION; idx++) {
		flow = updateFuncs[idx](flow);
	}
	return flow;
}


module.exports = {
	upgradePipelineFlow: upgrade,
	extractVersion: _extractVersion,
	LATEST_VERSION: LATEST_VERSION
};
