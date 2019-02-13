/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint no-console: "off" */

import deepFreeze from "deep-freeze";
import { expect } from "chai";
import isEqual from "lodash/isEqual";
import ObjectModel from "../../src/object-model/object-model.js";

import supernodeWithoutSubPipelineCanvas from "../test_resources/json/supernodeWithoutSubPipeline.json";


import allNodes from "../../../harness/test_resources/diagrams/allNodes.json";
import allTypesCanvas from "../../../harness/test_resources/diagrams/allTypesCanvas.json";
import bigCanvas from "../../../harness/test_resources/diagrams/bigCanvas.json";
import blankCanvas from "../../../harness/test_resources/diagrams/blankCanvas.json";
import commentColorCanvas from "../../../harness/test_resources/diagrams/commentColorCanvas.json";
import commentUnderlapCanvas from "../../../harness/test_resources/diagrams/commentUnderlap.json";
import customAttrsCanvas from "../../../harness/test_resources/diagrams/customAttrsCanvas.json";
import customNode from "../../../harness/test_resources/diagrams/customNode.json";
import decoratorCanvas from "../../../harness/test_resources/diagrams/decoratorCanvas.json";
import linkColorCanvas from "../../../harness/test_resources/diagrams/linkColorCanvas.json";
import modelerCanvas from "../../../harness/test_resources/diagrams/modelerCanvas.json";
import multiPortsCanvas from "../../../harness/test_resources/diagrams/multiPortsCanvas.json";
import pipelineFlowExample from "../../../harness/test_resources/diagrams/pipelineFlowExample.json";
import portColorCanvas from "../../../harness/test_resources/diagrams/portsColorCanvas.json";
import robWoodsCanvas from "../../../harness/test_resources/diagrams/robWoodsCanvas.json";
import supernodeCanvas from "../../../harness/test_resources/diagrams/supernodeCanvas.json";
import supernodeNestedCanvas from "../../../harness/test_resources/diagrams/supernodeNestedCanvas.json";
import uiParametersCanvas from "../../../harness/test_resources/diagrams/uiParametersCanvas.json";
import titanicFlowCanvas from "../../../harness/test_resources/diagrams/titanicFlowCanvas.json";
import stylesCanvas from "../../../harness/test_resources/diagrams/stylesCanvas.json";

import allNodesV2 from "../../../harness/test_resources/diagrams/v2-allNodes.json";
import allTypesCanvasV2 from "../../../harness/test_resources/diagrams/v2-allTypesCanvas.json";
import bigCanvasV2 from "../../../harness/test_resources/diagrams/v2-bigCanvas.json";
import blankCanvasV2 from "../../../harness/test_resources/diagrams/v2-blankCanvas.json";
import commentColorCanvasV2 from "../../../harness/test_resources/diagrams/v2-commentColorCanvas.json";
import commentUnderlapCanvasV2 from "../../../harness/test_resources/diagrams/v2-commentUnderlap.json";
import customAttrsCanvasV2 from "../../../harness/test_resources/diagrams/v2-customAttrsCanvas.json";
import customNodeV2 from "../../../harness/test_resources/diagrams/v2-customNode.json";
import decoratorCanvasV2 from "../../../harness/test_resources/diagrams/v2-decoratorCanvas.json";
import linkColorCanvasV2 from "../../../harness/test_resources/diagrams/v2-linkColorCanvas.json";
import modelerCanvasV2 from "../../../harness/test_resources/diagrams/v2-modelerCanvas.json";
import multiPortsCanvasV2 from "../../../harness/test_resources/diagrams/v2-multiPortsCanvas.json";
import pipelineFlowExampleV2 from "../../../harness/test_resources/diagrams/v2-pipelineFlowExample.json";
import portColorCanvasV2 from "../../../harness/test_resources/diagrams/v2-portsColorCanvas.json";
import robWoodsCanvasV2 from "../../../harness/test_resources/diagrams/v2-robWoodsCanvas.json";
import supernodeCanvasV2 from "../../../harness/test_resources/diagrams/v2-supernodeCanvas.json";
import uiParametersCanvasV2 from "../../../harness/test_resources/diagrams/v2-uiParametersCanvas.json";

import allNodesV1 from "../../../harness/test_resources/diagrams/v1-allNodes.json";
import bigCanvasV1 from "../../../harness/test_resources/diagrams/v1-bigCanvas.json";
import blankCanvasV1 from "../../../harness/test_resources/diagrams/v1-blankCanvas.json";
import commentColorCanvasV1 from "../../../harness/test_resources/diagrams/v1-commentColorCanvas.json";
import commentUnderlapCanvasV1 from "../../../harness/test_resources/diagrams/v1-commentUnderlap.json";
import customAttrsCanvasV1 from "../../../harness/test_resources/diagrams/v1-customAttrsCanvas.json";
import decoratorCanvasV1 from "../../../harness/test_resources/diagrams/v1-decoratorCanvas.json";
import linkColorCanvasV1 from "../../../harness/test_resources/diagrams/v1-linkColorCanvas.json";
import modelerCanvasV1 from "../../../harness/test_resources/diagrams/v1-modelerCanvas.json";
import multiPortsCanvasV1 from "../../../harness/test_resources/diagrams/v1-multiPortsCanvas.json";
import pipelineFlowExampleV1 from "../../../harness/test_resources/diagrams/v1-pipeline-flow-v1-example.json";
import portColorCanvasV1 from "../../../harness/test_resources/diagrams/v1-portsColorCanvas.json";

import commentColorCanvasV0 from "../../../harness/test_resources/diagrams/x-commentColorCanvas.json";
import commentUnderlapCanvasV0 from "../../../harness/test_resources/diagrams/x-commentUnderlap.json";
import customAttrsCanvasV0 from "../../../harness/test_resources/diagrams/x-customAttrsCanvas.json";
import decoratorCanvasV0 from "../../../harness/test_resources/diagrams/x-decoratorCanvas.json";
import linkColorCanvasV0 from "../../../harness/test_resources/diagrams/x-linkColorCanvas.json";
import modelerCanvasV0 from "../../../harness/test_resources/diagrams/x-modelerCanvas.json";
import multiPortsCanvasV0 from "../../../harness/test_resources/diagrams/x-multiPortsCanvas.json";
import titanicFlowCanvasV0 from "../../../harness/test_resources/diagrams/x-titanicFlowCanvas.json";

const objectModel = new ObjectModel();
objectModel.setSchemaValidation(true); // Ensure we validate against the schemas as we upgrade

// TODO - Remove this when we support v3 schemas permanently.
objectModel.setReturnPipelineFlowDraftVersion(true);

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

	// --------------------------------------------------------------------------
	// These test upgrade from v2 to the latest version
	// --------------------------------------------------------------------------
	it("should upgrade a pipelineFlow from v2 to latest version for allNodesV2", () => {
		upgradeToLatestVersion(allNodesV2, allNodes);
	});

	it("should upgrade a pipelineFlow from v2 to latest version for allTypesCanvasV2", () => {
		upgradeToLatestVersion(allTypesCanvasV2, allTypesCanvas);
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
		upgradeToLatestVersion(decoratorCanvasV2, decoratorCanvas);
	});

	it("should upgrade a pipelineFlow from v2 to latest version for linkColorCanvasV2", () => {
		upgradeToLatestVersion(linkColorCanvasV2, linkColorCanvas);
	});

	it("should upgrade a pipelineFlow from v2 to latest version for modelerCanvasV2", () => {
		upgradeToLatestVersion(modelerCanvasV2, modelerCanvas);
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
		upgradeToLatestVersion(commentColorCanvasV1, commentColorCanvas);
	});

	it("should upgrade a pipelineFlow from v1 to latest version for commentUnderlapCanvasV1", () => {
		upgradeToLatestVersion(commentUnderlapCanvasV1, commentUnderlapCanvas);
	});

	it("should upgrade a pipelineFlow from v1 to latest version for customAttrsCanvasV1", () => {
		upgradeToLatestVersion(customAttrsCanvasV1, customAttrsCanvas);
	});

	it("should upgrade a pipelineFlow from v1 to latest version for decoratorCanvasV1", () => {
		upgradeToLatestVersion(decoratorCanvasV1, decoratorCanvas);
	});

	it("should upgrade a pipelineFlow from v1 to latest version for linkColorCanvasV1", () => {
		upgradeToLatestVersion(linkColorCanvasV1, linkColorCanvas);
	});

	it("should upgrade a pipelineFlow from v1 to latest version for modelerCanvasV1", () => {
		upgradeToLatestVersion(modelerCanvasV1, modelerCanvas);
	});

	it("should upgrade a pipelineFlow from v1 to latest version for multiPortsCanvasV1", () => {
		upgradeToLatestVersion(multiPortsCanvasV1, multiPortsCanvas);
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
		upgradeV0ToLatestVersion(decoratorCanvasV0, decoratorCanvas);
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

		const expectedCanvas = latestPipelineFlow;
		const actualCanvas = objectModel.getPipelineFlow();

		// console.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 2));
		// console.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 2));

		expect(isEqual(JSON.stringify(expectedCanvas, null, 4), JSON.stringify(actualCanvas, null, 4))).to.be.true;
	}

	// V0 needs a special function because runtime ref fields are not handled
	// correctly with V0 (because the canvas does not contain runtime info)
	// so the runtime and schemas info needs to be removed before comparing.
	function upgradeV0ToLatestVersion(earlierPipelineFlow, v2PipelineFlow) {
		deepFreeze(earlierPipelineFlow);

		objectModel.setPipelineFlow(earlierPipelineFlow);

		// Clone expected canvas because earlier tests may have deep frozen it.
		const expectedCanvas = JSON.parse(JSON.stringify(v2PipelineFlow));
		const actualCanvas = objectModel.getPipelineFlow();

		delete actualCanvas.pipelines[0].runtime_ref;
		delete expectedCanvas.pipelines[0].runtime_ref;
		delete expectedCanvas.schemas;
		delete expectedCanvas.runtimes;

		// console.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 2));
		// console.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 2));

		expect(isEqual(JSON.stringify(expectedCanvas, null, 4), JSON.stringify(actualCanvas, null, 4))).to.be.true;
	}

});
