/*
 * Copyright 2017-2023 Elyra Authors
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
/* eslint no-console: "off" */

import deepFreeze from "deep-freeze";
import { expect } from "chai";
import isEqual from "lodash/isEqual";
import ObjectModel from "../../src/object-model/object-model.js";

import supernodeWithoutSubPipelineCanvas from "test-resources/object-model/supernodeWithoutSubPipeline.json";


import allNodes from "test-resources/pipeline-flows/allNodes.json";
import allTypesCanvas from "test-resources/pipeline-flows/allTypesCanvas.json";
import bigCanvas from "test-resources/pipeline-flows/bigCanvas.json";
import blankCanvas from "test-resources/pipeline-flows/blankCanvas.json";
import commentColorCanvas from "test-resources/pipeline-flows/commentColorCanvas.json";
import commentUnderlapCanvas from "test-resources/pipeline-flows/commentUnderlap.json";
import customAttrsCanvas from "test-resources/pipeline-flows/customAttrsCanvas.json";
import customNode from "test-resources/pipeline-flows/customNode.json";
import decoratorCanvas from "test-resources/pipeline-flows/decoratorCanvas.json";
import detachedLinksCanvas from "test-resources/pipeline-flows/detachedLinksCanvas.json";
import externalMainCanvas from "test-resources/pipeline-flows/externalMainCanvas.json";
import externalNestedCanvas from "test-resources/pipeline-flows/externalNestedCanvas.json";
import linkColorCanvas from "test-resources/pipeline-flows/linkColorCanvas.json";
import modelerCanvas from "test-resources/pipeline-flows/modelerCanvas.json";
import multiPortsCanvas from "test-resources/pipeline-flows/multiPortsCanvas.json";
import pipelineFlowExample from "test-resources/pipeline-flows/pipelineFlowExample.json";
import portColorCanvas from "test-resources/pipeline-flows/portsColorCanvas.json";
import robWoodsCanvas from "test-resources/pipeline-flows/robWoodsCanvas.json";
import supernodeCanvas from "test-resources/pipeline-flows/supernodeCanvas.json";
import supernodeNestedCanvas from "test-resources/pipeline-flows/supernodeNestedCanvas.json";
import uiParametersCanvas from "test-resources/pipeline-flows/uiParametersCanvas.json";
import titanicFlowCanvas from "test-resources/pipeline-flows/titanicFlowCanvas.json";
import stylesCanvas from "test-resources/pipeline-flows/stylesCanvas.json";
import editableDecLabelsCanvas from "test-resources/pipeline-flows/editableDecLabelsCanvas.json";
import resizedNodesCanvas from "test-resources/pipeline-flows/resizedNodesCanvas.json";

import allNodesV2 from "test-resources/pipeline-flows/v2-allNodes.json";
import allTypesCanvasV2 from "test-resources/pipeline-flows/v2-allTypesCanvas.json";
import bigCanvasV2 from "test-resources/pipeline-flows/v2-bigCanvas.json";
import blankCanvasV2 from "test-resources/pipeline-flows/v2-blankCanvas.json";
import commentColorCanvasV2 from "test-resources/pipeline-flows/v2-commentColorCanvas.json";
import commentUnderlapCanvasV2 from "test-resources/pipeline-flows/v2-commentUnderlap.json";
import customAttrsCanvasV2 from "test-resources/pipeline-flows/v2-customAttrsCanvas.json";
import customNodeV2 from "test-resources/pipeline-flows/v2-customNode.json";
import decoratorCanvasV2 from "test-resources/pipeline-flows/v2-decoratorCanvas.json";
import linkColorCanvasV2 from "test-resources/pipeline-flows/v2-linkColorCanvas.json";
import modelerCanvasV2 from "test-resources/pipeline-flows/v2-modelerCanvas.json";
import multiPortsCanvasV2 from "test-resources/pipeline-flows/v2-multiPortsCanvas.json";
import pipelineFlowExampleV2 from "test-resources/pipeline-flows/v2-pipelineFlowExample.json";
import portColorCanvasV2 from "test-resources/pipeline-flows/v2-portsColorCanvas.json";
import robWoodsCanvasV2 from "test-resources/pipeline-flows/v2-robWoodsCanvas.json";
import supernodeCanvasV2 from "test-resources/pipeline-flows/v2-supernodeCanvas.json";
import uiParametersCanvasV2 from "test-resources/pipeline-flows/v2-uiParametersCanvas.json";

import allNodesV1 from "test-resources/pipeline-flows/v1-allNodes.json";
import bigCanvasV1 from "test-resources/pipeline-flows/v1-bigCanvas.json";
import blankCanvasV1 from "test-resources/pipeline-flows/v1-blankCanvas.json";
import commentColorCanvasV1 from "test-resources/pipeline-flows/v1-commentColorCanvas.json";
import commentUnderlapCanvasV1 from "test-resources/pipeline-flows/v1-commentUnderlap.json";
import customAttrsCanvasV1 from "test-resources/pipeline-flows/v1-customAttrsCanvas.json";
import decoratorCanvasV1 from "test-resources/pipeline-flows/v1-decoratorCanvas.json";
import linkColorCanvasV1 from "test-resources/pipeline-flows/v1-linkColorCanvas.json";
import modelerCanvasV1 from "test-resources/pipeline-flows/v1-modelerCanvas.json";
import multiPortsCanvasV1 from "test-resources/pipeline-flows/v1-multiPortsCanvas.json";
import pipelineFlowExampleV1 from "test-resources/pipeline-flows/v1-pipeline-flow-v1-example.json";
import portColorCanvasV1 from "test-resources/pipeline-flows/v1-portsColorCanvas.json";

import commentColorCanvasV0 from "test-resources/pipeline-flows/x-commentColorCanvas.json";
import commentUnderlapCanvasV0 from "test-resources/pipeline-flows/x-commentUnderlap.json";
import customAttrsCanvasV0 from "test-resources/pipeline-flows/x-customAttrsCanvas.json";
import decoratorCanvasV0 from "test-resources/pipeline-flows/x-decoratorCanvas.json";
import linkColorCanvasV0 from "test-resources/pipeline-flows/x-linkColorCanvas.json";
import modelerCanvasV0 from "test-resources/pipeline-flows/x-modelerCanvas.json";
import multiPortsCanvasV0 from "test-resources/pipeline-flows/x-multiPortsCanvas.json";
import titanicFlowCanvasV0 from "test-resources/pipeline-flows/x-titanicFlowCanvas.json";

const objectModel = new ObjectModel();
objectModel.setSchemaValidation(true); // Ensure we validate against the schemas as we upgrade

describe("ObjectModel files handling test", () => {

	// --------------------------------------------------------------------------
	// These test that a latest version pipelineFlow can be read in and written out the same.
	// --------------------------------------------------------------------------

	// TODO - This is a special test for checking to see if we can load a Canvas
	// with a supernode that doesn't have a corresponding pipeline.
	it("should read in and write out the same file: supernodeWithoutSubPipelineCanvas", () => {
		readWriteSameFile(supernodeWithoutSubPipelineCanvas);
	});

	it("should read in and write out the same file: allNodes", () => {
		readWriteSameFile(allNodes);
	});

	it("should read in and write out the same file: allTypesCanvas", () => {
		readWriteSameFile(allTypesCanvas);
	});

	it("should read in and write out the same file: bigCanvas", () => {
		readWriteSameFile(bigCanvas);
	});

	it("should read in and write out the same file: blankCanvas", () => {
		readWriteSameFile(blankCanvas);
	});

	it("should read in and write out the same file: commentColorCanvas", () => {
		readWriteSameFile(commentColorCanvas);
	});

	it("should read in and write out the same file: commentUnderlapCanvas", () => {
		readWriteSameFile(commentUnderlapCanvas);
	});

	it("should read in and write out the same file: customAttrsCanvas", () => {
		readWriteSameFile(customAttrsCanvas);
	});

	it("should read in and write out the same file: customNode", () => {
		readWriteSameFile(customNode);
	});

	it("should read in and write out the same file: decoratorCanvas", () => {
		readWriteSameFile(decoratorCanvas);
	});

	it("should read in and write out the same file: detachedLinksCanvas", () => {
		readWriteSameFile(detachedLinksCanvas);
	});

	it("should read in and write out the same file: externalMainCanvas", () => {
		readWriteSameFile(externalMainCanvas);
	});

	it("should read in and write out the same file: externalNestedCanvas", () => {
		readWriteSameFile(externalNestedCanvas);
	});

	it("should read in and write out the same file: linkColorCanvas", () => {
		readWriteSameFile(linkColorCanvas);
	});

	it("should read in and write out the same file: modelerCanvas", () => {
		readWriteSameFile(modelerCanvas);
	});

	it("should read in and write out the same file: multiPortsCanvas", () => {
		readWriteSameFile(multiPortsCanvas);
	});

	it("should read in and write out the same file: pipelineFlowExample", () => {
		readWriteSameFile(pipelineFlowExample);
	});

	it("should read in and write out the same file: portColorCanvas", () => {
		readWriteSameFile(portColorCanvas);
	});

	it("should read in and write out the same file: robWoodsCanvas", () => {
		readWriteSameFile(robWoodsCanvas);
	});

	it("should read in and write out the same file: supernodeCanvas", () => {
		readWriteSameFile(supernodeCanvas);
	});

	it("should read in and write out the same file: supernodeNestedCanvas", () => {
		readWriteSameFile(supernodeNestedCanvas);
	});

	it("should read in and write out the same file: uiParametersCanvas", () => {
		readWriteSameFile(uiParametersCanvas);
	});

	it("should read in and write out the same file: titanicFlowCanvas", () => {
		readWriteSameFile(titanicFlowCanvas);
	});

	it("should read in and write out the same file: stylesCanvas", () => {
		readWriteSameFile(stylesCanvas);
	});

	it("should read in and write out the same file: editableDecLabelsCanvas", () => {
		readWriteSameFile(editableDecLabelsCanvas);
	});

	it("should read in and write out the same file: editableDecLabelsCanvas", () => {
		readWriteSameFile(resizedNodesCanvas);
	});

	// --------------------------------------------------------------------------
	// These test upgrade from v2 to the latest version
	// --------------------------------------------------------------------------
	it("should upgrade a pipelineFlow from v2 to latest version for allNodesV2", () => {
		upgradeToLatestVersion(allNodesV2, allNodes);
	});

	it("should upgrade a pipelineFlow from v2 to latest version for allTypesCanvasV2", () => {
		upgradeToLatestVersion(allTypesCanvasV2, removeConnectionFields(removeNewLinkFields(allTypesCanvas)));
	});

	it("should upgrade a pipelineFlow from v2 to latest version for bigCanvasV2", () => {
		upgradeToLatestVersion(bigCanvasV2, bigCanvas);
	});

	it("should upgrade a pipelineFlow from v2 to latest version for blankCanvasV2", () => {
		upgradeToLatestVersion(blankCanvasV2, blankCanvas);
	});

	it("should upgrade a pipelineFlow from v2 to latest version for commentColorCanvasV2", () => {
		upgradeToLatestVersion(commentColorCanvasV2, commentColorCanvas);
	});

	it("should upgrade a pipelineFlow from v2 to latest version for commentUnderlapCanvasV2", () => {
		upgradeToLatestVersion(commentUnderlapCanvasV2, commentUnderlapCanvas);
	});

	it("should upgrade a pipelineFlow from v2 to latest version for customAttrsCanvasV2", () => {
		upgradeToLatestVersion(customAttrsCanvasV2, customAttrsCanvas);
	});

	it("should upgrade a pipelineFlow from v2 to latest version for customNodeV2", () => {
		upgradeToLatestVersion(customNodeV2, customNode);
	});

	it("should upgrade a pipelineFlow from v2 to latest version for decoratorCanvasV2", () => {
		upgradeToLatestVersion(decoratorCanvasV2, removeNodesAndCommentsAndLinks(decoratorCanvas));
	});

	it("should upgrade a pipelineFlow from v2 to latest version for linkColorCanvasV2", () => {
		upgradeToLatestVersion(linkColorCanvasV2, linkColorCanvas);
	});

	it("should upgrade a pipelineFlow from v2 to latest version for modelerCanvasV2", () => {
		upgradeToLatestVersion(modelerCanvasV2, removeOpFromModelNodes(modelerCanvas));
	});

	it("should upgrade a pipelineFlow from v2 to latest version for multiPortsCanvasV2", () => {
		upgradeToLatestVersion(multiPortsCanvasV2, multiPortsCanvas);
	});

	it("should upgrade a pipelineFlow from v2 to latest version for pipelineFlowExampleV2", () => {
		upgradeToLatestVersion(pipelineFlowExampleV2, pipelineFlowExample);
	});

	it("should upgrade a pipelineFlow from v2 to latest version for portColorCanvasV2", () => {
		upgradeToLatestVersion(portColorCanvasV2, portColorCanvas);
	});

	it("should upgrade a pipelineFlow from v2 to latest version for robWoodsCanvasV2", () => {
		upgradeToLatestVersion(robWoodsCanvasV2, robWoodsCanvas);
	});

	it("should upgrade a pipelineFlow from v2 to latest version for supernodeCanvasV2", () => {
		upgradeToLatestVersion(supernodeCanvasV2, supernodeCanvas);
	});

	it("should upgrade a pipelineFlow from v2 to latest version for uiParametersCanvasV2", () => {
		upgradeToLatestVersion(uiParametersCanvasV2, uiParametersCanvas);
	});

	// --------------------------------------------------------------------------
	// These test upgrade from v1 to the latest version
	// --------------------------------------------------------------------------
	it("should upgrade a pipelineFlow from v1 to latest version for allNodesV1", () => {
		upgradeToLatestVersion(allNodesV1, allNodes);
	});

	it("should upgrade a pipelineFlow from v1 to latest version for bigCanvasV1", () => {
		upgradeToLatestVersion(bigCanvasV1, bigCanvas);
	});

	it("should upgrade a pipelineFlow from v1 to latest version for blankCanvasV1", () => {
		upgradeToLatestVersion(blankCanvasV1, blankCanvas);
	});

	it("should upgrade a pipelineFlow from v1 to latest version for commentColorCanvasV1", () => {
		upgradeToLatestVersion(commentColorCanvasV1, removeOpFromBindingAndModelNodes(commentColorCanvas));
	});

	it("should upgrade a pipelineFlow from v1 to latest version for commentUnderlapCanvasV1", () => {
		upgradeToLatestVersion(commentUnderlapCanvasV1, removeOpFromBindingAndModelNodes(commentUnderlapCanvas));
	});

	it("should upgrade a pipelineFlow from v1 to latest version for customAttrsCanvasV1", () => {
		upgradeToLatestVersion(customAttrsCanvasV1, customAttrsCanvas);
	});

	it("should upgrade a pipelineFlow from v1 to latest version for decoratorCanvasV1", () => {
		upgradeToLatestVersion(decoratorCanvasV1, removeNodesAndCommentsAndLinks(decoratorCanvas));
	});

	it("should upgrade a pipelineFlow from v1 to latest version for linkColorCanvasV1", () => {
		upgradeToLatestVersion(linkColorCanvasV1, removeOpFromBindingAndModelNodes(linkColorCanvas));
	});

	it("should upgrade a pipelineFlow from v1 to latest version for modelerCanvasV1", () => {
		upgradeToLatestVersion(modelerCanvasV1, removeOpFromBindingAndModelNodes(modelerCanvas));
	});

	it("should upgrade a pipelineFlow from v1 to latest version for multiPortsCanvasV1", () => {
		upgradeToLatestVersion(multiPortsCanvasV1, removeOpFromBindingAndModelNodes(multiPortsCanvas));
	});

	it("should upgrade a pipelineFlow from v1 to latest version for pipelineFlowExampleV1", () => {
		upgradeToLatestVersion(pipelineFlowExampleV1, pipelineFlowExample);
	});

	it("should upgrade a pipelineFlow from v1 to latest version for portColorCanvasV1", () => {
		upgradeToLatestVersion(portColorCanvasV1, portColorCanvas);
	});

	// --------------------------------------------------------------------------
	// These test upgrade from v0 to the latest version
	// --------------------------------------------------------------------------
	it("should upgrade a pipelineFlow from v0 to latest version for commentColorCanvasV0", () => {
		upgradeV0ToLatestVersion(commentColorCanvasV0, commentColorCanvas);
	});

	it("should upgrade a pipelineFlow from v0 to latest version for commentUnderlapCanvasV0", () => {
		upgradeV0ToLatestVersion(commentUnderlapCanvasV0, commentUnderlapCanvas);
	});

	it("should upgrade a pipelineFlow from v0 to latest version for customAttrsCanvasV0", () => {
		upgradeV0ToLatestVersion(customAttrsCanvasV0, customAttrsCanvas);
	});

	it("should upgrade a pipelineFlow from v0 to latest version for decoratorCanvasV0", () => {
		upgradeV0ToLatestVersion(decoratorCanvasV0, removeNodesAndCommentsAndLinks(decoratorCanvas));
	});

	it("should upgrade a pipelineFlow from v0 to latest version for linkColorCanvasV0", () => {
		upgradeV0ToLatestVersion(linkColorCanvasV0, linkColorCanvas);
	});

	it("should upgrade a pipelineFlow from v0 to latest version for modelerCanvasV0", () => {
		upgradeV0ToLatestVersion(modelerCanvasV0, modelerCanvas);
	});

	it("should upgrade a pipelineFlow from v0 to latest version for multiPortsCanvasV0", () => {
		upgradeV0ToLatestVersion(multiPortsCanvasV0, multiPortsCanvas);
	});

	// This will test upgrade of a WML Canvas flow that contains a node at 0,0 to current version.
	it("should upgrade a pipelineFlow from v0 to latest version for titanicFlowCanvasV0", () => {
		upgradeV0ToLatestVersion(titanicFlowCanvasV0, titanicFlowCanvas);
	});

	function readWriteSameFile(file) {
		deepFreeze(file);

		objectModel.setPipelineFlow(file);

		const expectedCanvas = file;
		const actualCanvas = objectModel.getPipelineFlow();

		// console.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 2));
		// console.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 2));

		expect(isEqual(JSON.stringify(expectedCanvas, null, 4), JSON.stringify(actualCanvas, null, 4))).to.be.true;
	}

	function upgradeToLatestVersion(earlierPipelineFlow, latestPipelineFlow) {
		deepFreeze(earlierPipelineFlow);

		objectModel.setPipelineFlow(earlierPipelineFlow);

		// When testing upgrade from old version we ignore generated link IDs.
		const expectedCanvas = removeGeneratedLinkIds(JSON.parse(JSON.stringify(latestPipelineFlow)));
		const actualCanvas = removeGeneratedLinkIds(objectModel.getPipelineFlow());

		// Also ignore any parameters in the expected canvas
		const expectedCanvas2 = removeParametersFromLinks(expectedCanvas);

		// console.info("Expected Canvas = " + JSON.stringify(expectedCanvas2, null, 2));
		// console.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 2));

		expect(isEqual(JSON.stringify(expectedCanvas2, null, 4), JSON.stringify(actualCanvas, null, 4))).to.be.true;
	}

	// Returns a modified expected canvas for comparing with an upgraded V1 pipeline
	// flow. We remove the op property from the expected canvas because this was
	// not supported in the V1 schema for model nodes but we need it in
	// the expected file for comparison with upgraded x- canvas files.
	function removeOpFromBindingAndModelNodes(latestPipelineFlow) {
		const expectedCanvas = JSON.parse(JSON.stringify(latestPipelineFlow));
		expectedCanvas.pipelines[0].nodes.forEach((n) => {
			if (n.type === "binding" || n.type === "model_node") {
				delete n.op;
			}
		});
		return expectedCanvas;
	}

	// Returns a modified expected canvas for comparing with an upgraded V2 pipeline
	// flow. We remove the op property from the expected canvas because this was
	// not supported in the V2 schema for model nodes but we need it in
	// the expected file for comparison with upgraded x- canvas files.
	function removeOpFromModelNodes(latestPipelineFlow) {
		const expectedCanvas = JSON.parse(JSON.stringify(latestPipelineFlow));
		expectedCanvas.pipelines[0].nodes.forEach((n) => {
			if (n.type === "model_node") {
				delete n.op;
			}
		});
		return expectedCanvas;
	}


	// Removes the new optional link.type_attr and link.description attributes
	// which did not exist before the V3 schema.
	function removeNewLinkFields(latestPipelineFlow) {
		const expectedCanvas = JSON.parse(JSON.stringify(latestPipelineFlow));
		expectedCanvas.pipelines[0].nodes.forEach((node) => {
			if (node.inputs) {
				node.inputs.forEach((inp) => {
					if (inp.links) {
						inp.links.forEach((link) => {
							delete link.type_attr;
							delete link.description;
						});
					}
				});
			}
		});
		return expectedCanvas;
	}

	// The node's connection and data_asset fields were not corrctly supported in
	// V2 of the schema and no one used those fields anyway so we remove them
	// when comparing a v3 pipelineFlow with a v2 pipelineFlow.
	function removeConnectionFields(latestPipelineFlow) {
		const expectedCanvas = JSON.parse(JSON.stringify(latestPipelineFlow));
		expectedCanvas.pipelines[0].nodes.forEach((node) => {
			delete node.connection;
			delete node.data_asset;
		});
		return expectedCanvas;
	}

	// V0 needs a special function because runtime ref fields are not handled
	// correctly with V0 (because the canvas does not contain runtime info)
	// so the runtime and schemas info needs to be removed before comparing.
	function upgradeV0ToLatestVersion(earlierPipelineFlow, v2PipelineFlow) {
		deepFreeze(earlierPipelineFlow);

		objectModel.setPipelineFlow(earlierPipelineFlow);

		// Clone expected canvas because earlier tests may have deep frozen it.
		const expectedCanvas = removeGeneratedLinkIds(JSON.parse(JSON.stringify(v2PipelineFlow)));
		const actualCanvas = removeGeneratedLinkIds(objectModel.getPipelineFlow());

		delete actualCanvas.pipelines[0].runtime_ref;
		delete expectedCanvas.pipelines[0].runtime_ref;
		delete expectedCanvas.schemas;
		delete expectedCanvas.runtimes;

		// console.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 2));
		// console.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 2));

		expect(isEqual(JSON.stringify(expectedCanvas, null, 4), JSON.stringify(actualCanvas, null, 4))).to.be.true;
	}

	// Removes nodes from the V3 canvas that has new style decorators which
	// were not supported in earlier versions. Also, removes corresponding
	// comments. Furthermore, it removed link which now have decoration support
	// in v3. These changes allow the output flow to be compared to the
	// result of upgrading the previous version flows.
	function removeNodesAndCommentsAndLinks(flow) {
		const outFlow = JSON.parse(JSON.stringify(flow));
		outFlow.pipelines[0].nodes = outFlow.pipelines[0].nodes.slice(0, 6);
		outFlow.pipelines[0].app_data.ui_data.comments = outFlow.pipelines[0].app_data.ui_data.comments.slice(0, 5);
		outFlow.pipelines[0].nodes.forEach((n) => {
			if (n.app_data && n.app_data.ui_data && n.app_data.ui_data.associations) {
				delete n.app_data.ui_data.associations;
			}
			if (n.inputs) {
				n.inputs.forEach((inp) => delete inp.links);
			}
			if (n.app_data?.ui_data?.decorations) {
				n.app_data?.ui_data?.decorations.forEach((d) => {
					delete d.focusable;
					delete d.tooltip;
					return d;
				});
			}
		});
		return outFlow;
	}

	function removeGeneratedLinkIds(pipelineFlow) {
		pipelineFlow.pipelines.forEach((pipeline, pIdx) => {
			if (pipeline.nodes) {
				pipeline.nodes.forEach((node, mIdx) => {
					if (node.inputs) {
						node.inputs.forEach((input, iIdx) => {
							if (input.links) {
								input.links.forEach((link, lIds) => delete link.id);
							}
						});
					}
				});
			}

			if (pipeline.app_data && pipeline.app_data.ui_data && pipeline.app_data.ui_data.comments) {
				pipeline.app_data.ui_data.comments.forEach((comment) => {
					if (comment.associated_id_refs) {
						comment.associated_id_refs.forEach((link) => delete link.id);
					}
				});
			}
		});
		return pipelineFlow;
	}

	// The `parameters` field was added in schema v3 and is not expected when converting
	// from an older version of the schema - so remove it.
	function removeParametersFromLinks(pipelineFlow) {
		pipelineFlow.pipelines.forEach((pipeline, pIdx) => {
			if (pipeline.nodes) {
				pipeline.nodes.forEach((node, mIdx) => {
					if (node.inputs) {
						node.inputs.forEach((input, iIdx) => {
							if (input.links) {
								input.links.forEach((link, lIds) => delete link.parameters);
							}
						});
					}
				});
			}
		});
		return pipelineFlow;
	}
});
