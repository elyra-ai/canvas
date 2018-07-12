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
import startCanvas from "../test_resources/json/startCanvas.json";
import clonedCanvas from "../test_resources/json/canvasWithClones.json";
import paletteJson from "../test_resources/json/testPalette.json";
import filterNode from "../test_resources/json/filterNode.json";
import horizontalLayoutCanvas from "../test_resources/json/horizontalLayoutCanvas.json";
import verticalLayoutCanvas from "../test_resources/json/verticalLayoutCanvas.json";
import addNodeHorizontalLayoutCanvas from "../test_resources/json/addNodeHorizontalLayoutCanvas.json";
import addNodeVerticalLayoutCanvas from "../test_resources/json/addNodeVerticalLayoutCanvas.json";
import moveVarNode from "../test_resources/json/moveVarNode.json";
import moveNodeHorizontalLayoutCanvas from "../test_resources/json/moveNodeHorizontalLayoutCanvas.json";
import moveNodeVerticalLayoutCanvas from "../test_resources/json/moveNodeVerticalLayoutCanvas.json";
import startPipelineFlow from "../test_resources/json/startPipelineFlow.json";
import pipelineFlowTest1Start from "../test_resources/json/pipelineFlowTest1Start.json";
import pipelineFlowTest1Expected from "../test_resources/json/pipelineFlowTest1Expected.json";


import ObjectModel from "../../src/object-model/object-model.js";
import { NONE, VERTICAL, HORIZONTAL, CREATE_NODE, CLONE_NODE, CREATE_COMMENT, CLONE_COMMENT, CREATE_NODE_LINK,
	CLONE_NODE_LINK, CREATE_COMMENT_LINK, CLONE_COMMENT_LINK } from "../../src/common-canvas/constants/canvas-constants.js";
import CloneMultipleObjectsAction from "../../src/command-actions/cloneMultipleObjectsAction.js";

const objectModel = new ObjectModel();

describe("ObjectModel API handle model OK", () => {

	it("should layout a canvas horiziontally", () => {
		deepFreeze(startCanvas);
		objectModel.setCanvasInfo(startCanvas);
		objectModel.setFixedAutoLayout(HORIZONTAL);
		objectModel.setPipelineFlowPalette(paletteJson);
		const apiPipeline = objectModel.getAPIPipeline();
		const node = apiPipeline.createNode(filterNode);
		apiPipeline.addNode(node);

		const expectedCanvas = addNodeHorizontalLayoutCanvas;
		const actualCanvas = objectModel.getCanvasInfoPipeline(objectModel.getPrimaryPipelineId());

		// Delete ID because IDs are generated at runtime and therefore won't be
		// the same between expected and actual.
		delete actualCanvas.nodes[3].id;

		// console.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 2));
		// console.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 2));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should layout a canvas vertically", () => {
		deepFreeze(startCanvas);

		objectModel.setCanvasInfo(startCanvas);
		objectModel.setFixedAutoLayout(VERTICAL);
		objectModel.setPipelineFlowPalette(paletteJson);
		const node = objectModel.getAPIPipeline().createNode(filterNode);
		objectModel.getAPIPipeline().addNode(node);

		const expectedCanvas = addNodeVerticalLayoutCanvas;
		const actualCanvas = objectModel.getCanvasInfoPipeline(objectModel.getPrimaryPipelineId());

		// Delete ID because IDs are generated at runtime and therefore won't be
		// the same between expected and actual.
		delete actualCanvas.nodes[3].id;

		// console.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 2));
		// console.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 2));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should oneTimeLayout a canvas horiziontally", () => {
		deepFreeze(startCanvas);

		objectModel.setCanvasInfo(startCanvas);
		objectModel.getAPIPipeline().autoLayout(HORIZONTAL);

		const expectedCanvas = horizontalLayoutCanvas;

		const actualCanvas = objectModel.getCanvasInfoPipeline(objectModel.getPrimaryPipelineId());

		// console.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 2));
		// console.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 2));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;

	});

	it("should oneTimeLayout a canvas vertically", () => {
		deepFreeze(startCanvas);

		objectModel.setCanvasInfo(startCanvas);
		objectModel.getAPIPipeline().autoLayout(VERTICAL);

		const expectedCanvas = verticalLayoutCanvas;

		const actualCanvas = objectModel.getCanvasInfoPipeline(objectModel.getPrimaryPipelineId());

		// console.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 2));
		// console.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 2));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should move a node after oneTimeLayout horiziontally", () => {
		deepFreeze(startCanvas);

		objectModel.setCanvasInfo(startCanvas);
		objectModel.fixedLayout = NONE;
		objectModel.getAPIPipeline().autoLayout(HORIZONTAL);

		objectModel.getAPIPipeline().moveObjects(moveVarNode);

		const expectedCanvas = moveNodeHorizontalLayoutCanvas;
		const actualCanvas = objectModel.getCanvasInfoPipeline(objectModel.getPrimaryPipelineId());

		// console.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 2));
		// console.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 2));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should move a node after oneTimeLayout vertically", () => {
		deepFreeze(startCanvas);

		objectModel.setCanvasInfo(startCanvas);
		objectModel.getAPIPipeline().autoLayout(VERTICAL);

		objectModel.getAPIPipeline().moveObjects(moveVarNode);

		const expectedCanvas = moveNodeVerticalLayoutCanvas;
		const actualCanvas = objectModel.getCanvasInfoPipeline(objectModel.getPrimaryPipelineId());

		// console.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 2));
		// console.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 2));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should return parameters of an execution node", () => {
		const actualParameters = getNodeParametersFromStartFlow("idGWRVT47XDV");
		const expectedParameters =
			{
				"props": [
					{ "field1": "execution-node-param-val1" },
					{ "field2": "execution-node-param-val2" }
				]
			};

		// console.info("Expected Canvas = " + JSON.stringify(expectedParameters, null, 4));
		// console.info("Actual Canvas   = " + JSON.stringify(actualParameters, null, 4));

		expect(isEqual(expectedParameters, actualParameters)).to.be.true;
	});

	it("should return parameters of a binding node", () => {
		const actualParameters = getNodeParametersFromStartFlow("id8I6RH2V91XW");
		const expectedParameters =
			{
				"props": [
					{ "field1": "binding-node-param-val1" },
					{ "field2": "binding-node-param-val2" }
				]
			};

		// console.info("Expected Canvas = " + JSON.stringify(expectedParameters, null, 4));
		// console.info("Actual Canvas   = " + JSON.stringify(actualParameters, null, 4));

		expect(isEqual(expectedParameters, actualParameters)).to.be.true;
	});

	it("should return parameters of a super node", () => {
		const actualParameters = getNodeParametersFromStartFlow("nodeIDSuperNodePE");
		const expectedParameters =
			{
				"props": [
					{ "field1": "super-node-param-val1" },
					{ "field2": "super-node-param-val2" }
				]
			};

		// console.info("Expected Canvas = " + JSON.stringify(expectedParameters, null, 4));
		// console.info("Actual Canvas   = " + JSON.stringify(actualParameters, null, 4));

		expect(isEqual(expectedParameters, actualParameters)).to.be.true;
	});

	it("should return parameters of a model node", () => {
		const actualParameters = getNodeParametersFromStartFlow("id125TTEEIK7V");
		const expectedParameters =
			{
				"props": [
					{ "field1": "model-node-param-val1" },
					{ "field2": "model-node-param-val2" }
				]
			};

		// console.info("Expected Canvas = " + JSON.stringify(expectedParameters, null, 4));
		// console.info("Actual Canvas   = " + JSON.stringify(actualParameters, null, 4));

		expect(isEqual(expectedParameters, actualParameters)).to.be.true;
	});

	it("should save parameters of an execution binding node", () => {
		shouldReturnSetParameters("idGWRVT47XDV");
	});

	it("should save parameters of a binding node", () => {
		shouldReturnSetParameters("id8I6RH2V91XW");
	});

	it("should save parameters of a supernode", () => {
		shouldReturnSetParameters("nodeIDSuperNodePE");
	});

	it("should save parameters of a model node", () => {
		shouldReturnSetParameters("id125TTEEIK7V");
	});

	it("should preserve supernode options", () => {
		shouldPreserveSupernodeOptions("nodeIDSuperNodePE", "canvas", "modeler-sub-pipeline");
	});


	it("should save a message for an execution node", () => {
		shouldSaveNodeMessage("idGWRVT47XDV");
	});

	it("should save a message for a binding node", () => {
		shouldSaveNodeMessage("id8I6RH2V91XW");
	});

	it("should save a message for a supernode", () => {
		shouldSaveNodeMessage("nodeIDSuperNodePE");
	});

	it("should save a message for a model node", () => {
		shouldSaveNodeMessage("id125TTEEIK7V");
	});

	it("should save multiple messages for an execution node", () => {
		shouldSaveMultipleNodeMessages("idGWRVT47XDV");
	});

	it("should save multiple messages for a binding node", () => {
		shouldSaveMultipleNodeMessages("id8I6RH2V91XW");
	});

	it("should save multiple messages for a supernode", () => {
		shouldSaveMultipleNodeMessages("nodeIDSuperNodePE");
	});

	it("should save multiple messages for a model node", () => {
		shouldSaveMultipleNodeMessages("id125TTEEIK7V");
	});

	it("should save one control messages for an execution node", () => {
		shouldSaveOneNodeMessage("idGWRVT47XDV");
	});

	it("should save one control messages for a binding node", () => {
		shouldSaveOneNodeMessage("id8I6RH2V91XW");
	});

	it("should save one control messages for a supernode", () => {
		shouldSaveOneNodeMessage("nodeIDSuperNodePE");
	});

	it("should save one control messages for a model node", () => {
		shouldSaveOneNodeMessage("id125TTEEIK7V");
	});

	it("should clear all messages for an execution node", () => {
		shouldClearAllNodeMessages("idGWRVT47XDV");
	});

	it("should clear all messages for a binding node", () => {
		shouldClearAllNodeMessages("id8I6RH2V91XW");
	});

	it("should clear all messages for a supernode", () => {
		shouldClearAllNodeMessages("nodeIDSuperNodePE");
	});

	it("should clear all messages for a model node", () => {
		shouldClearAllNodeMessages("id125TTEEIK7V");
	});

	it("should set UiParameters for a model node", () => {
		const expectedParameters = { "uiParam1": "controlOne", "uiParam2": ["warning", "text"] };
		shouldSaveNodeUiParameters("id125TTEEIK7V", expectedParameters);
	});

	it("should set empty UiParameters for a model node", () => {
		const expectedParameters = {};
		shouldSaveNodeUiParameters("id125TTEEIK7V", expectedParameters);
	});

	it("should set null UiParameters for a model node", () => {
		const expectedParameters = null;
		shouldSaveNodeUiParameters("id125TTEEIK7V", expectedParameters);
	});

	it("should add palette item into existing test category", () => {
		objectModel.setPipelineFlowPalette(paletteJson);
		const nodeTypeObj = {
			"label": "MyNodeType",
			"description": "My custom node type",
			"operator_id_ref": "filter",
			"type": "binding",
			"image": "/images/filter.svg"
		};

		const expectedPaletteJSON = JSON.parse(JSON.stringify(paletteJson));
		expectedPaletteJSON.categories[0].nodetypes.push(nodeTypeObj);

		objectModel.addNodeTypeToPalette(nodeTypeObj, "test");

		expect(isEqual(expectedPaletteJSON, objectModel.getPaletteData())).to.be.true;
	});

	it("should add palette item into new category without label", () => {
		const newCategoryName = "newCategory";
		objectModel.setPipelineFlowPalette(paletteJson);
		const nodeTypeObj = {
			"label": "MyNodeType",
			"description": "My custom node type",
			"operator_id_ref": "filter",
			"type": "binding",
			"image": "/images/filter.svg"
		};

		const expectedPaletteJSON = JSON.parse(JSON.stringify(paletteJson));
		const newCategory = {};
		newCategory.category = newCategoryName;
		newCategory.label = newCategoryName;
		newCategory.nodetypes = [nodeTypeObj];
		expectedPaletteJSON.categories.push(newCategory);

		objectModel.addNodeTypeToPalette(nodeTypeObj, newCategoryName);

		expect(isEqual(expectedPaletteJSON, objectModel.getPaletteData())).to.be.true;
	});

	it("should add palette item into new category with label", () => {
		const newCategoryName = "newCategory";
		const newCategoryLabel = "New Category";
		objectModel.setPipelineFlowPalette(paletteJson);
		const nodeTypeObj = {
			"label": "MyNodeType",
			"description": "My custom node type",
			"operator_id_ref": "filter",
			"type": "binding",
			"image": "/images/filter.svg"
		};

		const expectedPaletteJSON = JSON.parse(JSON.stringify(paletteJson));
		const newCategory = {};
		newCategory.category = newCategoryName;
		newCategory.label = newCategoryLabel;
		newCategory.nodetypes = [nodeTypeObj];
		expectedPaletteJSON.categories.push(newCategory);

		objectModel.addNodeTypeToPalette(nodeTypeObj, newCategoryName, newCategoryLabel);

		expect(isEqual(expectedPaletteJSON, objectModel.getPaletteData())).to.be.true;
	});

	it("should handle pipeline flow with no app_data in links", () => {
		objectModel.setPipelineFlow(pipelineFlowTest1Start);

		const actualPipelineFlow = objectModel.getPipelineFlow();
		const expectedPipelineFlow = pipelineFlowTest1Expected;

		// console.info("Expected Messages = " + JSON.stringify(expectedPipelineFlow, null, 2));
		// console.info("Actual messages   = " + JSON.stringify(actualPipelineFlow, null, 2));

		expect(isEqual(JSON.stringify(actualPipelineFlow, null, 2), JSON.stringify(expectedPipelineFlow, null, 2))).to.be.true;
	});

	it("should return custom app_data and ui_data for links from an execution node", () => {
		shouldReturnCustomAppDataAndUiDataForLinks("idGWRVT47XDV", null);
	});

	it("should return custom app_data and ui_data for links from an exit binding node", () => {
		shouldReturnCustomAppDataAndUiDataForLinks("id5KIRGGJ3FYT", null);
	});

	it("should return custom app_data and ui_data for links from a supernode", () => {
		shouldReturnCustomAppDataAndUiDataForLinks("nodeIDSuperNodePE", "input2SuperNodePE");
	});

	it("should return custom app_data and ui_data for links from a model node", () => {
		shouldReturnCustomAppDataAndUiDataForLinks("id125TTEEIK7V", null);
	});


	it("should add links for existing execution node", () => {
		shouldAddLinksForExistingNodes("idGWRVT47XDV", null, "id8I6RH2V91XW", "outPort");
	});

	it("should add links for existing exit binding node", () => {
		shouldAddLinksForExistingNodes("id5KIRGGJ3FYT", null, "nodeIDSuperNodePE", "output1SuperNodePE");
	});

	it("should add links for existing supernode", () => {
		shouldAddLinksForExistingNodes("nodeIDSuperNodePE", "input2SuperNodePE", "idGWRVT47XDV");
	});


	it("should add links for existing model node", () => {
		shouldAddLinksForExistingNodes("id125TTEEIK7V", null, "nodeIDSuperNodePE");
	});

	it("should update label for an executiom node", () => {
		shouldUpdateNodeLabel("idGWRVT47XDV", "New test label");
	});

	it("should update label for a binding node", () => {
		shouldUpdateNodeLabel("id5KIRGGJ3FYT", "New test label");
	});

	it("should update label for a supernode", () => {
		shouldUpdateNodeLabel("nodeIDSuperNodePE", "New test label");
	});

	it("should update label for a model node", () => {
		shouldUpdateNodeLabel("id125TTEEIK7V", "New test label");
	});

	it("should update input port label for an execution node", () => {
		shouldUpdateInputPortLabel("idGWRVT47XDV", "inPort", "New port label");
	});

	it("should update input port label for a binding exit node", () => {
		shouldUpdateInputPortLabel("id5KIRGGJ3FYT", "inPort", "New port label");
	});

	it("should update input port label for a supernode", () => {
		shouldUpdateInputPortLabel("nodeIDSuperNodePE", "input1SuperNodePE", "New port label");
	});

	it("should update input port label for a model node", () => {
		shouldUpdateInputPortLabel("id125TTEEIK7V", "inPort", "New port label");
	});

	it("should update output port label for an execution node", () => {
		shouldUpdateOutputPortLabel("idGWRVT47XDV", "outPort", "New port label");
	});

	it("should update output port label for a binding entry node", () => {
		shouldUpdateOutputPortLabel("id8I6RH2V91XW", "outPort", "New port label");
	});

	it("should update output port label for a supernode", () => {
		shouldUpdateOutputPortLabel("nodeIDSuperNodePE", "output1SuperNodePE", "New port label");
	});

	it("should update output port label for a model node", () => {
		shouldUpdateOutputPortLabel("id125TTEEIK7V", "outPort", "New port label");
	});

	it("should create node with fixed node id", () => {
		const uniqueNodeId = "myUniqueNodeId";

		deepFreeze(startCanvas);

		objectModel.clearPipelineFlow();
		objectModel.setIdGeneratorHandler((action, data) => {
			if (action === CREATE_NODE) {
				return uniqueNodeId;
			}
			return null;
		});
		objectModel.setCanvasInfo(startCanvas);
		objectModel.setFixedAutoLayout(VERTICAL);
		objectModel.setPipelineFlowPalette(paletteJson);
		const node = objectModel.getAPIPipeline().createNode(filterNode);
		objectModel.getAPIPipeline().addNode(node);

		const expectedCanvas = addNodeVerticalLayoutCanvas;
		expectedCanvas.nodes[3].id = uniqueNodeId;
		const actualCanvas = objectModel.getCanvasInfoPipeline(objectModel.getPrimaryPipelineId());

		// console.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 2));
		// console.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 2));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should create node with non-null node id", () => {
		deepFreeze(startCanvas);

		objectModel.clearPipelineFlow();
		objectModel.setIdGeneratorHandler(() => null);
		objectModel.clearPipelineFlow();
		objectModel.setPipelineFlowPalette(paletteJson);
		const node = objectModel.getAPIPipeline().createNode(filterNode);
		objectModel.getAPIPipeline().addNode(node);

		expect(objectModel.getCanvasInfoPipeline().nodes[0].id).not.to.be.null;
	});

	it("should create node links with fixed id", () => {
		const uniqueNodeId = "myUniqueNodeId";
		const uniqueNodeLink = "myUniqueLinkId";

		deepFreeze(startCanvas);

		objectModel.setIdGeneratorHandler((action, data) => {
			if (action === CREATE_NODE) {
				return uniqueNodeId + "_" + data.nodeType.label;
			}
			if (action === CREATE_NODE_LINK) {
				return uniqueNodeLink + "_" + data.sourceNode.id + "_" + data.targetNode.id;
			}
			return null;
		});
		objectModel.setCanvasInfo(startCanvas);
		objectModel.setPipelineFlowPalette(paletteJson);

		const node = objectModel.getAPIPipeline().createNode(filterNode);
		objectModel.getAPIPipeline().addNode(node);

		const sourceNodeId = uniqueNodeId + "_" + filterNode.label;
		const linkData = {
			"editType": "linkNodes",
			"nodes": [{ "id": sourceNodeId }],
			"targetNodes": [{ "id": "b4f90b52-d198-42f0-85cc-31af3914dd4f" }],
			"linkType": "data",
			"linkName": "testLink1"
		};

		const nodeLinks = objectModel.getAPIPipeline().createNodeLinks(linkData);
		objectModel.getAPIPipeline().addLinks(nodeLinks);

		const expectedLinkId = uniqueNodeLink + "_" + sourceNodeId + "_b4f90b52-d198-42f0-85cc-31af3914dd4f";
		const expectedNodeLink = {
			"id": expectedLinkId,
			"class_name": "d3-data-link",
			"srcNodeId": sourceNodeId,
			"trgNodeId": "b4f90b52-d198-42f0-85cc-31af3914dd4f",
			"type": "nodeLink",
			"linkName": "testLink1"
		};

		// console.log("EXPECTED:\n" + JSON.stringify(expectedNodeLink));
		// console.log("ACTUAL:\n" + JSON.stringify(objectModel.getAPIPipeline().getLink(expectedLinkId)));

		expect(isEqual(JSON.stringify(expectedNodeLink), JSON.stringify(objectModel.getAPIPipeline().getLink(expectedLinkId)))).to.be.true;
	});

	it("should create comment with fixed comment id", () => {
		const uniqueCommentId = "myUniqueCommentId";
		const uniqueCommentLinkId = "myUniqueCommentLinkId";

		deepFreeze(startCanvas);
		objectModel.setCanvasInfo(startCanvas);

		objectModel.setIdGeneratorHandler((action, data) => {
			if (action === CREATE_COMMENT) {
				return uniqueCommentId;
			} else if (action === CREATE_COMMENT_LINK) {
				return uniqueCommentLinkId + "_" + data.comment.id + "_" + data.targetNode.id;
			}
			return null;
		});

		const commentData = {
			"mousePos": {
				"x": 100,
				"y": 100
			},
			"selectedObjectIds": ["2e6ecd75-8b2c-4c49-991c-80fa98fe08eb"]
		};

		const comment = objectModel.getAPIPipeline().createComment(commentData);
		objectModel.getAPIPipeline().addComment(comment);

		const expectedComment = {
			"id": uniqueCommentId,
			"class_name": "d3-comment-rect",
			"content": "",
			"height": 42,
			"width": 175,
			"x_pos": 100,
			"y_pos": 100
		};

		const expectedCommentLinkId = uniqueCommentLinkId + "_" + uniqueCommentId + "_2e6ecd75-8b2c-4c49-991c-80fa98fe08eb";
		const expectedCommentLink = {
			"id": expectedCommentLinkId,
			"class_name": "d3-comment-link",
			"srcNodeId": uniqueCommentId,
			"trgNodeId": "2e6ecd75-8b2c-4c49-991c-80fa98fe08eb",
			"type": "commentLink"
		};

		expect(isEqual(expectedComment, objectModel.getAPIPipeline().getComments()[0])).to.be.true;
		expect(isEqual(JSON.stringify(expectedCommentLink), JSON.stringify(objectModel.getAPIPipeline().getLink(expectedCommentLinkId)))).to.be.true;
	});

	it("should clone a node, comment, node_link and comment_link with fixed ids", () => {
		const uniqueCommentId = "myUniqueCommentId";
		const uniqueCommentLinkId = "myUniqueCommentLinkId";
		const uniqueClonedNodeId = "myUniqueClonedNodeId";
		const uniqueClonedNodeLinkId = "myUniqueClonedNodeLinkId";
		const uniqueClonedCommentId = "myUniqueClonedCommentId";
		const uniqueClonedCommentLinkId = "myUniqueClonedCommentLinkId";

		deepFreeze(startCanvas);
		objectModel.clearPipelineFlow();
		objectModel.setCanvasInfo(startCanvas);

		objectModel.setIdGeneratorHandler((action, data) => {
			if (action === CREATE_COMMENT) {
				return uniqueCommentId;
			}
			if (action === CREATE_COMMENT_LINK) {
				return uniqueCommentLinkId;
			}
			if (action === CLONE_NODE) {
				return uniqueClonedNodeId + "_" + data.node.id;
			}
			if (action === CLONE_NODE_LINK) {
				return uniqueClonedNodeLinkId + "_" + data.link.id + "_" + data.sourceNodeId + "_" + data.targetNodeId;
			}
			if (action === CLONE_COMMENT) {
				return uniqueClonedCommentId + "_" + data.comment.id;
			}
			if (action === CLONE_COMMENT_LINK) {
				return uniqueClonedCommentLinkId + "_" + data.link.id + "_" + data.commentId + "_" + data.targetNodeId;
			}
			return null;
		});

		// add a comment
		const commentData = {
			"mousePos": {
				"x": 100,
				"y": 100
			},
			"selectedObjectIds": ["2e6ecd75-8b2c-4c49-991c-80fa98fe08eb"]
		};

		const comment = objectModel.getAPIPipeline().createComment(commentData);
		objectModel.getAPIPipeline().addComment(comment);

		const cloneData = { "objects": {} };
		cloneData.objects.nodes = [
			objectModel.getAPIPipeline().getNode("2e6ecd75-8b2c-4c49-991c-80fa98fe08eb"),
			objectModel.getAPIPipeline().getNode("b4f90b52-d198-42f0-85cc-31af3914dd4f")];
		cloneData.objects.comments = [
			objectModel.getAPIPipeline().getComment(uniqueCommentId)];
		cloneData.objects.links = [
			objectModel.getAPIPipeline().getLink("7ec57e11-fe0b-4bc8-a3b8-b72920bf1a55"),
			objectModel.getAPIPipeline().getLink(uniqueCommentLinkId)];

		const cloneAction = new CloneMultipleObjectsAction(cloneData, objectModel);
		cloneAction.do();

		// console.info("Expected Canvas = " + JSON.stringify(clonedCanvas, null, 2));
		// console.info("Actual Canvas   = " + JSON.stringify(objectModel.getCanvasInfoPipeline(), null, 2));

		expect(isEqual(objectModel.getCanvasInfoPipeline(), clonedCanvas)).to.be.true;
	});

	function getNodeParametersFromStartFlow(nodeId) {
		deepFreeze(startPipelineFlow);
		objectModel.setPipelineFlow(startPipelineFlow);

		return objectModel.getAPIPipeline().getNodeParameters(nodeId);
	}

	function shouldReturnSetParameters(nodeId) {
		const actualParameters = { "paramA": "Value for Param A", "paramB": "Value for Param B" };

		deepFreeze(startPipelineFlow);
		objectModel.setPipelineFlow(startPipelineFlow);
		objectModel.getAPIPipeline().setNodeParameters(nodeId, actualParameters);

		const node = objectModel.getPipelineFlow().pipelines[0].nodes.find((n) => n.id === nodeId);
		const expectedParameters = node.parameters;

		// console.info("Expected Canvas = " + JSON.stringify(expectedParameters, null, 2));
		// console.info("Actual Canvas   = " + JSON.stringify(actualParameters, null, 2));

		expect(isEqual(JSON.stringify(expectedParameters, null, 4), JSON.stringify(actualParameters, null, 4))).to.be.true;
	}

	function shouldPreserveSupernodeOptions(nodeId, subType, pipelineIdRef) {
		deepFreeze(startPipelineFlow);
		objectModel.setPipelineFlow(startPipelineFlow);
		const node = objectModel.getPipelineFlow().pipelines[0].nodes.find((n) => n.id === nodeId);
		expect(isEqual(subType, node.sub_type)).to.be.true;
		expect(isEqual(pipelineIdRef, node.subflow_ref.pipeline_id_ref)).to.be.true;
	}

	function shouldSaveNodeUiParameters(nodeId, expectedParameters) {
		deepFreeze(startPipelineFlow);
		objectModel.setPipelineFlow(startPipelineFlow);
		objectModel.getAPIPipeline().setNodeUiParameters(nodeId, expectedParameters);

		const actualParameters = objectModel.getAPIPipeline().getNodeUiParameters(nodeId);

		expect(isEqual(expectedParameters, actualParameters)).to.be.true;
	}

	function shouldSaveNodeMessage(nodeId) {
		deepFreeze(startPipelineFlow);
		const expectedMessage = { "id_ref": "controlOne", "type": "warning", "text": "This is a test message" };
		objectModel.setPipelineFlow(startPipelineFlow);
		objectModel.getAPIPipeline().setNodeMessage(nodeId, expectedMessage);

		const actualMessage = objectModel.getAPIPipeline().getNodeMessage(nodeId, "controlOne");

		expect(isEqual(expectedMessage, actualMessage)).to.be.true;
	}

	function shouldSaveMultipleNodeMessages(nodeId) {
		deepFreeze(startPipelineFlow);
		const message1 = { "id_ref": "controlOne", "type": "warning", "text": "This is a test message" };
		const message2 = { "id_ref": "controlTwo", "type": "error", "text": "This is an error test message" };
		const message3 = { "id_ref": "controlThree", "type": "info", "text": "" };
		const expectedMessages = [
			message1,
			message2,
			message3
		];
		objectModel.setPipelineFlow(startPipelineFlow);
		objectModel.getAPIPipeline().setNodeMessage(nodeId, message1);
		objectModel.getAPIPipeline().setNodeMessage(nodeId, message2);
		objectModel.getAPIPipeline().setNodeMessage(nodeId, message3);

		const actualMessages = objectModel.getAPIPipeline().getNodeMessages(nodeId);

		// console.info("Expected Messages = " + JSON.stringify(expectedMessages, null, 4));
		// console.info("Actual messages   = " + JSON.stringify(actualMessages, null, 4));

		expect(isEqual(expectedMessages, actualMessages)).to.be.true;
	}

	function shouldSaveOneNodeMessage(nodeId) {
		deepFreeze(startPipelineFlow);
		const message1 = { "id_ref": "controlOne", "type": "warning", "text": "This is a test message" };
		const message2 = { "id_ref": "controlOne", "type": "error", "text": "This is an error test message" };
		const message3 = { "id_ref": "controlThree", "type": "info", "text": "" };
		const expectedMessages = [
			message2,
			message3
		];
		objectModel.setPipelineFlow(startPipelineFlow);
		objectModel.getAPIPipeline().setNodeMessage(nodeId, message1);
		objectModel.getAPIPipeline().setNodeMessage(nodeId, message2);
		objectModel.getAPIPipeline().setNodeMessage(nodeId, message3);

		const actualMessages = objectModel.getAPIPipeline().getNodeMessages(nodeId);

		// console.info("Expected Messages = " + JSON.stringify(expectedMessages, null, 4));
		// console.info("Actual messages   = " + JSON.stringify(actualMessages, null, 4));

		expect(isEqual(expectedMessages, actualMessages)).to.be.true;
	}

	function shouldClearAllNodeMessages(nodeId) {
		deepFreeze(startPipelineFlow);
		const message1 = { "id_ref": "controlOne", "type": "warning", "text": "This is a test message" };
		const message2 = { "id_ref": "controlTwo", "type": "error", "text": "This is an error test message" };
		const message3 = { "id_ref": "controlThree", "type": "info", "text": "" };
		const expectedMessages = [
			message1,
			message2,
			message3
		];
		objectModel.setPipelineFlow(startPipelineFlow);
		objectModel.getAPIPipeline().setNodeMessage(nodeId, message1);
		objectModel.getAPIPipeline().setNodeMessage(nodeId, message2);
		objectModel.getAPIPipeline().setNodeMessage(nodeId, message3);

		const actualMessages = objectModel.getAPIPipeline().getNodeMessages(nodeId);

		// console.info("Expected Messages = " + JSON.stringify(expectedMessages, null, 4));
		// console.info("Actual messages   = " + JSON.stringify(actualMessages, null, 4));

		expect(isEqual(expectedMessages, actualMessages)).to.be.true;

		const expectedClearedMessages = [];

		objectModel.getAPIPipeline().setNodeMessages(nodeId, expectedClearedMessages);
		const actualClearedMessages = objectModel.getAPIPipeline().getNodeMessages(nodeId);

		// console.info("Expected Messages = " + JSON.stringify(expectedClearedMessages, null, 4));
		// console.info("Actual messages   = " + JSON.stringify(actualClearedMessages, null, 4));

		expect(isEqual(expectedClearedMessages, actualClearedMessages)).to.be.true;
	}

	function shouldReturnCustomAppDataAndUiDataForLinks(targetNodeId, targetPortId) {
		const startPipelineFlowLinkAppData = JSON.parse(JSON.stringify(startPipelineFlow));

		// add app_data and ui_data to existing link
		const node = startPipelineFlowLinkAppData.pipelines[0].nodes.find((n) => n.id === targetNodeId);
		const myAppDataValue = { "some_data": { "f1": "val1", "f2": "val2" } };
		let input = node.inputs[0];
		if (targetPortId) {
			input = node.inputs.find((inp) => inp.id === targetPortId);
		}
		input.links[0].app_data.myData = myAppDataValue;

		deepFreeze(startPipelineFlowLinkAppData);
		objectModel.setPipelineFlow(startPipelineFlowLinkAppData);

		const actualNode = objectModel.getPipelineFlow().pipelines[0].nodes.find((n) => n.id === targetNodeId);
		input = actualNode.inputs[0];
		if (targetPortId) {
			input = actualNode.inputs.find((inp) => inp.id === targetPortId);
		}
		const actualValue = input.links[0].app_data.myData;

		// console.info("Expected Canvas = " + JSON.stringify(myAppDataValue, null, 2));
		// console.info("Actual Canvas   = " + JSON.stringify(actualValue, null, 2));

		expect(isEqual(JSON.stringify(actualValue, null, 2), JSON.stringify(myAppDataValue, null, 2))).to.be.true;
	}

	function 	shouldAddLinksForExistingNodes(targetNodeId, targetPortId, sourceNodeId, sourcePortId) {
		const startPipelineFlowNoLinks = JSON.parse(JSON.stringify(startPipelineFlow));

		// remove existing link array
		const node = startPipelineFlowNoLinks.pipelines[0].nodes.find((n) => n.id === targetNodeId);
		let input = node.inputs[0];
		if (targetPortId) {
			input = node.inputs.find((inp) => inp.id === targetPortId);
		}
		delete input.links;
		deepFreeze(startPipelineFlowNoLinks);

		objectModel.setPipelineFlow(startPipelineFlowNoLinks);

		const linkData = {
			"editType": "linkNodes",
			"nodes": [{ "id": sourceNodeId, "portId": sourcePortId }],
			"targetNodes": [{ "id": targetNodeId, "portId": targetPortId }],
			"linkType": "data",
			"class_name": "canvas-data-link",
			"linkName": "testLink2"
		};
		const nodeLinks = objectModel.getAPIPipeline().createNodeLinks(linkData);
		objectModel.getAPIPipeline().addLinks(nodeLinks);
		const actualCanvas = objectModel.getPipelineFlow();

		// The canvas should have returned to its original state.
		const expectedCanvas = startPipelineFlow;

		// console.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 2));
		// console.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 2));

		expect(isEqual(JSON.stringify(expectedCanvas, null, 4), JSON.stringify(actualCanvas, null, 4))).to.be.true;
	}

	function shouldUpdateNodeLabel(nodeId, newLabel) {
		deepFreeze(startPipelineFlow);
		objectModel.setPipelineFlow(startPipelineFlow);
		objectModel.getAPIPipeline().setNodeLabel(nodeId, newLabel);
		expect(isEqual(newLabel, objectModel.getAPIPipeline().getNode(nodeId).label)).to.be.true;
	}

	function shouldUpdateInputPortLabel(nodeId, portId, newLabel) {
		deepFreeze(startPipelineFlow);
		objectModel.setPipelineFlow(startPipelineFlow);
		objectModel.getAPIPipeline().setInputPortLabel(nodeId, portId, newLabel);
		const node = objectModel.getAPIPipeline().getNode(nodeId);

		expect(isEqual(newLabel, objectModel.getAPIPipeline().getPort(node.input_ports, portId).label)).to.be.true;
	}

	function shouldUpdateOutputPortLabel(nodeId, portId, newLabel) {
		deepFreeze(startPipelineFlow);
		objectModel.setPipelineFlow(startPipelineFlow);
		objectModel.getAPIPipeline().setOutputPortLabel(nodeId, portId, newLabel);
		const node = objectModel.getAPIPipeline().getNode(nodeId);

		expect(isEqual(newLabel, objectModel.getAPIPipeline().getPort(node.output_ports, portId).label)).to.be.true;
	}

});
