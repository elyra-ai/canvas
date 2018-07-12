/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint no-console: "off" */

// import log4js from "log4js";
import deepFreeze from "deep-freeze";
import { expect } from "chai";
import isEqual from "lodash/isEqual";
import ObjectModel from "../../src/object-model/object-model.js";

import supernodeWithoutSubPipelineCanvasV2 from "../test_resources/json/supernodeWithoutSubPipeline.json";
import allNodesV2 from "../../../harness/test_resources/diagrams/allNodes.json";
import allTypesCanvasV2 from "../../../harness/test_resources/diagrams/allTypesCanvas.json";
import bigCanvasV2 from "../../../harness/test_resources/diagrams/bigCanvas.json";
import blankCanvasV2 from "../../../harness/test_resources/diagrams/blankCanvas.json";
import commentColorCanvasV2 from "../../../harness/test_resources/diagrams/commentColorCanvas.json";
import commentUnderlapCanvasV2 from "../../../harness/test_resources/diagrams/commentUnderlap.json";
import customAttrsCanvasV2 from "../../../harness/test_resources/diagrams/customAttrsCanvas.json";
import customNodeV2 from "../../../harness/test_resources/diagrams/customNode.json";
import decoratorCanvasV2 from "../../../harness/test_resources/diagrams/decoratorCanvas.json";
import linkColorCanvasV2 from "../../../harness/test_resources/diagrams/linkColorCanvas.json";
import modelerCanvasV2 from "../../../harness/test_resources/diagrams/modelerCanvas.json";
import multiPortsCanvasV2 from "../../../harness/test_resources/diagrams/multiPortsCanvas.json";
import pipelineFlowExampleV2 from "../../../harness/test_resources/diagrams/pipelineFlowExample.json";
import portColorCanvasV2 from "../../../harness/test_resources/diagrams/portsColorCanvas.json";
import uiParametersCanvasV2 from "../../../harness/test_resources/diagrams/uiParametersCanvas.json";

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

// const logger = log4js.getLogger("object-model-test");
const objectModel = new ObjectModel();
objectModel.setSchemaValidation(true); // Ensure we validate against the schemas as we upgrade

describe("ObjectModel files handling test", () => {

	// --------------------------------------------------------------------------
	// These test that a v2 pipelineFlow can be read in and written out the same.
	// --------------------------------------------------------------------------
	it("should read in and write out the same file: allNodesV2", () => {
		readWriteSameFile(allNodesV2);
	});

	it("should read in and write out the same file: supernodeWithoutSubPipelineCanvasV2", () => {
		readWriteSameFile(supernodeWithoutSubPipelineCanvasV2);
	});

	it("should read in and write out the same file: allTypesCanvasV2", () => {
		readWriteSameFile(allTypesCanvasV2);
	});

	it("should read in and write out the same file: bigCanvasV2", () => {
		readWriteSameFile(bigCanvasV2);
	});

	it("should read in and write out the same file: blankCanvasV2", () => {
		readWriteSameFile(blankCanvasV2);
	});

	it("should read in and write out the same file: commentColorCanvasV2", () => {
		readWriteSameFile(commentColorCanvasV2);
	});

	it("should read in and write out the same file: commentUnderlapCanvasV2", () => {
		readWriteSameFile(commentUnderlapCanvasV2);
	});

	it("should read in and write out the same file: customAttrsCanvasV2", () => {
		readWriteSameFile(customAttrsCanvasV2);
	});

	it("should read in and write out the same file: customNodeV2", () => {
		readWriteSameFile(customNodeV2);
	});

	it("should read in and write out the same file: decoratorCanvasV2", () => {
		readWriteSameFile(decoratorCanvasV2);
	});

	it("should read in and write out the same file: linkColorCanvasV2", () => {
		readWriteSameFile(linkColorCanvasV2);
	});

	it("should read in and write out the same file: modelerCanvasV2", () => {
		readWriteSameFile(modelerCanvasV2);
	});

	it("should read in and write out the same file: multiPortsCanvasV2", () => {
		readWriteSameFile(multiPortsCanvasV2);
	});

	it("should read in and write out the same file: pipelineFlowExampleV2", () => {
		readWriteSameFile(pipelineFlowExampleV2);
	});

	it("should read in and write out the same file: portColorCanvasV2", () => {
		readWriteSameFile(portColorCanvasV2);
	});

	it("should read in and write out the same file: uiParametersCanvasV2", () => {
		readWriteSameFile(uiParametersCanvasV2);
	});

	// --------------------------------------------------------------------------
	// These test upgrade from v1 to v2
	// --------------------------------------------------------------------------
	it("should upgrade a pipelineFlow from v1 to v2 for allNodesV1", () => {
		upgradeToV2(allNodesV1, allNodesV2);
	});

	it("should upgrade a pipelineFlow from v1 to v2 for bigCanvasV1", () => {
		upgradeToV2(bigCanvasV1, bigCanvasV2);
	});

	it("should upgrade a pipelineFlow from v1 to v2 for blankCanvasV1", () => {
		upgradeToV2(blankCanvasV1, blankCanvasV2);
	});

	it("should upgrade a pipelineFlow from v1 to v2 for commentColorCanvasV1", () => {
		upgradeToV2(commentColorCanvasV1, commentColorCanvasV2);
	});

	it("should upgrade a pipelineFlow from v1 to v2 for commentUnderlapCanvasV1", () => {
		upgradeToV2(commentUnderlapCanvasV1, commentUnderlapCanvasV2);
	});

	it("should upgrade a pipelineFlow from v1 to v2 for customAttrsCanvasV1", () => {
		upgradeToV2(customAttrsCanvasV1, customAttrsCanvasV2);
	});

	it("should upgrade a pipelineFlow from v1 to v2 for decoratorCanvasV1", () => {
		upgradeToV2(decoratorCanvasV1, decoratorCanvasV2);
	});

	it("should upgrade a pipelineFlow from v1 to v2 for linkColorCanvasV1", () => {
		upgradeToV2(linkColorCanvasV1, linkColorCanvasV2);
	});

	it("should upgrade a pipelineFlow from v1 to v2 for modelerCanvasV1", () => {
		upgradeToV2(modelerCanvasV1, modelerCanvasV2);
	});

	it("should upgrade a pipelineFlow from v1 to v2 for multiPortsCanvasV1", () => {
		upgradeToV2(multiPortsCanvasV1, multiPortsCanvasV2);
	});

	it("should upgrade a pipelineFlow from v1 to v2 for pipelineFlowExampleV1", () => {
		upgradeToV2(pipelineFlowExampleV1, pipelineFlowExampleV2);
	});

	it("should upgrade a pipelineFlow from v1 to v2 for portColorCanvasV1", () => {
		upgradeToV2(portColorCanvasV1, portColorCanvasV2);
	});

	// --------------------------------------------------------------------------
	// These test upgrade from v0 to v2
	// --------------------------------------------------------------------------
	it("should upgrade a pipelineFlow from v0 to v2 for commentColorCanvasV0", () => {
		upgradeV0ToV2(commentColorCanvasV0, commentColorCanvasV2);
	});

	it("should upgrade a pipelineFlow from v0 to v2 for commentUnderlapCanvasV0", () => {
		upgradeV0ToV2(commentUnderlapCanvasV0, commentUnderlapCanvasV2);
	});

	it("should upgrade a pipelineFlow from v0 to v2 for customAttrsCanvasV0", () => {
		upgradeV0ToV2(customAttrsCanvasV0, customAttrsCanvasV2);
	});

	it("should upgrade a pipelineFlow from v0 to v2 for decoratorCanvasV0", () => {
		upgradeV0ToV2(decoratorCanvasV0, decoratorCanvasV2);
	});

	it("should upgrade a pipelineFlow from v0 to v2 for linkColorCanvasV0", () => {
		upgradeV0ToV2(linkColorCanvasV0, linkColorCanvasV2);
	});
	//
	it("should upgrade a pipelineFlow from v0 to v2 for modelerCanvasV0", () => {
		upgradeV0ToV2(modelerCanvasV0, modelerCanvasV2);
	});

	it("should upgrade a pipelineFlow from v0 to v2 for multiPortsCanvasV0", () => {
		upgradeV0ToV2(multiPortsCanvasV0, multiPortsCanvasV2);
	});

	function readWriteSameFile(file) {
		deepFreeze(file);

		objectModel.setPipelineFlow(file);

		const expectedCanvas = file;
		const actualCanvas = objectModel.getPipelineFlow();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 2));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 2));

		expect(isEqual(JSON.stringify(expectedCanvas, null, 4), JSON.stringify(actualCanvas, null, 4))).to.be.true;
	}

	function upgradeToV2(earlierPipelineFlow, v2PipelineFlow) {
		deepFreeze(earlierPipelineFlow);

		objectModel.setPipelineFlow(earlierPipelineFlow);

		const expectedCanvas = v2PipelineFlow;
		const actualCanvas = objectModel.getPipelineFlow();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 2));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 2));

		expect(isEqual(JSON.stringify(expectedCanvas, null, 4), JSON.stringify(actualCanvas, null, 4))).to.be.true;
	}

	// V0 needs a special function because runtime ref fields are not handled
	// correctly with V0 (becasue the canvas does not contain runtime info)
	// so the runtime and schemas info needs to be removed before comparing.
	function upgradeV0ToV2(earlierPipelineFlow, v2PipelineFlow) {
		deepFreeze(earlierPipelineFlow);

		objectModel.setPipelineFlow(earlierPipelineFlow);

		// Clone expected canvas because earlier tests may have deep frozen it.
		const expectedCanvas = JSON.parse(JSON.stringify(v2PipelineFlow));
		const actualCanvas = objectModel.getPipelineFlow();

		delete actualCanvas.pipelines[0].runtime_ref;
		delete expectedCanvas.pipelines[0].runtime_ref;
		delete expectedCanvas.schemas;
		delete expectedCanvas.runtimes;

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 2));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 2));

		expect(isEqual(JSON.stringify(expectedCanvas, null, 4), JSON.stringify(actualCanvas, null, 4))).to.be.true;
	}

});
