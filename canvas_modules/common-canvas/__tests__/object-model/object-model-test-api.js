/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint no-console: "off" */

import log4js from "log4js";
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
import nodeParameters from "../test_resources/json/nodeParameters.json";
import startPipelineFlow from "../test_resources/json/startPipelineFlow.json";
import startPipelineFlowParamsAdded from "../test_resources/json/startPipelineFlowParamsAdded.json";
import pipelineFlowTest1Start from "../test_resources/json/pipelineFlowTest1Start.json";
import pipelineFlowTest1Expected from "../test_resources/json/pipelineFlowTest1Expected.json";
import pipelineFlowV1 from "../test_resources/json/pipelineFlowV1.json";
import pipelineFlowV2 from "../test_resources/json/pipelineFlowV2.json";
import addAppDataToLinksFlowExpected from "../test_resources/json/addAppDataToLinksFlowExpected.json";


import ObjectModel from "../../src/object-model/object-model.js";
import { NONE, VERTICAL, HORIZONTAL, CREATE_NODE, CLONE_NODE, CREATE_COMMENT, CLONE_COMMENT, CREATE_NODE_LINK,
	CLONE_NODE_LINK, CREATE_COMMENT_LINK, CLONE_COMMENT_LINK } from "../../src/common-canvas/constants/canvas-constants.js";
import CloneMultipleObjectsAction from "../../src/command-actions/cloneMultipleObjectsAction.js";

const logger = log4js.getLogger("object-model-test");
const objectModel = new ObjectModel();

describe("ObjectModel API handle model OK", () => {

	it("should layout a canvas horiziontally", () => {
		logger.info("should layout a canvas horiziontally");

		deepFreeze(startCanvas);

		objectModel.setCanvasInfo(startCanvas);
		objectModel.fixedAutoLayout(HORIZONTAL);
		objectModel.setPipelineFlowPalette(paletteJson);
		const node = objectModel.createNode(filterNode);
		objectModel.addNode(node);

		const expectedCanvas = addNodeHorizontalLayoutCanvas;
		const actualCanvas = objectModel.getCanvasInfoPipeline();

		// Delete ID because IDs are generated at runtime and therefore won't be
		// the same between expected and actual.
		delete actualCanvas.nodes[3].id;

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 2));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 2));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should layout a canvas vertically", () => {
		logger.info("should layout a canvas vertically");

		deepFreeze(startCanvas);

		objectModel.setCanvasInfo(startCanvas);
		objectModel.fixedAutoLayout(VERTICAL);
		objectModel.setPipelineFlowPalette(paletteJson);
		const node = objectModel.createNode(filterNode);
		objectModel.addNode(node);

		const expectedCanvas = addNodeVerticalLayoutCanvas;
		const actualCanvas = objectModel.getCanvasInfoPipeline();

		// Delete ID because IDs are generated at runtime and therefore won't be
		// the same between expected and actual.
		delete actualCanvas.nodes[3].id;

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 2));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 2));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should oneTimeLayout a canvas horiziontally", () => {
		logger.info("should oneTimeLayout a canvas horiziontally");

		deepFreeze(startCanvas);

		objectModel.setCanvasInfo(startCanvas);
		objectModel.autoLayout(HORIZONTAL);

		const expectedCanvas = horizontalLayoutCanvas;

		const actualCanvas = objectModel.getCanvasInfoPipeline();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 2));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 2));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;

	});

	it("should oneTimeLayout a canvas vertically", () => {
		logger.info("should oneTimeLayout a canvas vertically");

		deepFreeze(startCanvas);

		objectModel.setCanvasInfo(startCanvas);
		objectModel.autoLayout(VERTICAL);

		const expectedCanvas = verticalLayoutCanvas;

		const actualCanvas = objectModel.getCanvasInfoPipeline();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 2));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 2));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should move a node after oneTimeLayout horiziontally", () => {
		logger.info("should move a node after oneTimeLayout horiziontally");

		deepFreeze(startCanvas);

		objectModel.setCanvasInfo(startCanvas);
		objectModel.fixedLayout = NONE;
		objectModel.autoLayout(HORIZONTAL);

		objectModel.moveObjects(moveVarNode);

		const expectedCanvas = moveNodeHorizontalLayoutCanvas;
		const actualCanvas = objectModel.getCanvasInfoPipeline();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 2));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 2));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should move a node after oneTimeLayout vertically", () => {
		logger.info("should move a node after oneTimeLayout vertically");

		deepFreeze(startCanvas);

		objectModel.setCanvasInfo(startCanvas);
		objectModel.autoLayout(VERTICAL);

		objectModel.moveObjects(moveVarNode);

		const expectedCanvas = moveNodeVerticalLayoutCanvas;
		const actualCanvas = objectModel.getCanvasInfoPipeline();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 2));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 2));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should return parameters of a node", () => {
		logger.info("should return parameters of a node");

		deepFreeze(startPipelineFlow);

		objectModel.setPipelineFlow(startPipelineFlow);
		var actualParameters = objectModel.getNodeParameters("idGWRVT47XDV");

		const expectedParameters = nodeParameters;


		// logger.info("Expected Canvas = " + JSON.stringify(expectedParameters, null, 4));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualParameters, null, 4));

		expect(isEqual(expectedParameters, actualParameters)).to.be.true;
	});

	it("should save parameters of a node", () => {
		logger.info("should save parameters of a node");

		deepFreeze(startPipelineFlow);

		objectModel.setPipelineFlow(startPipelineFlow);
		objectModel.setNodeParameters("id8I6RH2V91XW", { "paramA": "Value for Param A", "paramB": "Value for Param B" });

		const expectedCanvas = startPipelineFlowParamsAdded;
		const actualCanvas = objectModel.getPipelineFlow();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 2));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 2));

		expect(isEqual(JSON.stringify(expectedCanvas, null, 4), JSON.stringify(actualCanvas, null, 4))).to.be.true;
	});

	it("should save a messages for a node", () => {
		logger.info("should save a messages for a node");

		deepFreeze(startPipelineFlow);
		const expectedMessage = { "id_ref": "controlOne", "type": "warning", "text": "This is a test message" };
		objectModel.setPipelineFlow(startPipelineFlow);
		objectModel.setNodeMessage("id8I6RH2V91XW", expectedMessage);

		const actualMessage = objectModel.getNodeMessage("id8I6RH2V91XW", "controlOne");

		expect(isEqual(expectedMessage, actualMessage)).to.be.true;
	});

	it("should save multiple messages for a node", () => {
		logger.info("should save multiple messages for a node");

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
		objectModel.setNodeMessage("id8I6RH2V91XW", message1);
		objectModel.setNodeMessage("id8I6RH2V91XW", message2);
		objectModel.setNodeMessage("id8I6RH2V91XW", message3);

		const actualMessages = objectModel.getNodeMessages("id8I6RH2V91XW");


		// logger.info("Expected Messages = " + JSON.stringify(expectedMessages, null, 4));
		// logger.info("Actual messages   = " + JSON.stringify(actualMessages, null, 4));


		expect(isEqual(expectedMessages, actualMessages)).to.be.true;
	});

	it("should save one control messages for a node", () => {
		logger.info("should save one control messages for a node");

		deepFreeze(startPipelineFlow);
		const message1 = { "id_ref": "controlOne", "type": "warning", "text": "This is a test message" };
		const message2 = { "id_ref": "controlOne", "type": "error", "text": "This is an error test message" };
		const message3 = { "id_ref": "controlThree", "type": "info", "text": "" };
		const expectedMessages = [
			message2,
			message3
		];
		objectModel.setPipelineFlow(startPipelineFlow);
		objectModel.setNodeMessage("id8I6RH2V91XW", message1);
		objectModel.setNodeMessage("id8I6RH2V91XW", message2);
		objectModel.setNodeMessage("id8I6RH2V91XW", message3);

		const actualMessages = objectModel.getNodeMessages("id8I6RH2V91XW");

		// logger.info("Expected Messages = " + JSON.stringify(expectedMessages, null, 4));
		// logger.info("Actual messages   = " + JSON.stringify(actualMessages, null, 4));

		expect(isEqual(expectedMessages, actualMessages)).to.be.true;
	});

	it("should clear all messages for a node", () => {
		logger.info("should clear all control messages for a node");

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
		objectModel.setNodeMessage("id8I6RH2V91XW", message1);
		objectModel.setNodeMessage("id8I6RH2V91XW", message2);
		objectModel.setNodeMessage("id8I6RH2V91XW", message3);

		const actualMessages = objectModel.getNodeMessages("id8I6RH2V91XW");

		// logger.info("Expected Messages = " + JSON.stringify(expectedMessages, null, 4));
		// logger.info("Actual messages   = " + JSON.stringify(actualMessages, null, 4));

		expect(isEqual(expectedMessages, actualMessages)).to.be.true;

		const expectedClearedMessages = [];

		objectModel.setNodeMessages("id8I6RH2V91XW", expectedClearedMessages);
		const actualClearedMessages = objectModel.getNodeMessages("id8I6RH2V91XW");

		// logger.info("Expected Messages = " + JSON.stringify(expectedClearedMessages, null, 4));
		// logger.info("Actual messages   = " + JSON.stringify(actualClearedMessages, null, 4));

		expect(isEqual(expectedClearedMessages, actualClearedMessages)).to.be.true;

	});

	it("should upgrade a pipelineFlow from v1 to v2", () => {
		logger.info("should upgrade a pipelineFlow from v1 to v2");

		deepFreeze(pipelineFlowV1);

		objectModel.setPipelineFlow(pipelineFlowV1);

		const expectedCanvas = pipelineFlowV2;
		const actualCanvas = objectModel.getPipelineFlow();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 2));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 2));

		expect(isEqual(JSON.stringify(expectedCanvas, null, 4), JSON.stringify(actualCanvas, null, 4))).to.be.true;
	});

	it("should add palette item into existing test category", () => {
		logger.info("should add palette item into existing test category");
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
		logger.info("should add palette item into new category without label");

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
		logger.info("should add palette item into new category with label");
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
		logger.info("should handle pipeline flow with no app_data in links");

		objectModel.setPipelineFlow(pipelineFlowTest1Start);

		const actualPipelineFlow = objectModel.getPipelineFlow();
		const expectedPipelineFlow = pipelineFlowTest1Expected;

		// logger.info("Expected Messages = " + JSON.stringify(expectedPipelineFlow, null, 2));
		// logger.info("Actual messages   = " + JSON.stringify(actualPipelineFlow, null, 2));

		expect(isEqual(JSON.stringify(actualPipelineFlow, null, 2), JSON.stringify(expectedPipelineFlow, null, 2))).to.be.true;
	});

	it("should return custom app_data and ui_data for links", () => {
		logger.info("should return custom app_data and ui_data for links");

		const startPipelineFlowLinkAppData = JSON.parse(JSON.stringify(startPipelineFlow));
		// add app_data and ui_data to existing link
		startPipelineFlowLinkAppData.pipelines[0].nodes[0].inputs[0].links[0].app_data.myData = "myValue";
		deepFreeze(startPipelineFlowLinkAppData);

		objectModel.setPipelineFlow(startPipelineFlowLinkAppData);

		const expectedCanvas = addAppDataToLinksFlowExpected;
		const actualCanvas = objectModel.getPipelineFlow();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 2));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 2));

		expect(isEqual(JSON.stringify(actualCanvas, null, 2), JSON.stringify(expectedCanvas, null, 2))).to.be.true;
	});

	it("should add links for existing nodes", () => {
		logger.info("should add links for existing nodes");

		const startPipelineFlowNoLinks = JSON.parse(JSON.stringify(startPipelineFlow));
		// remove existing link array
		delete startPipelineFlowNoLinks.pipelines[0].nodes[0].inputs[0].links;
		deepFreeze(startPipelineFlowNoLinks);

		objectModel.setPipelineFlow(startPipelineFlowNoLinks);

		const expectedCanvas = startPipelineFlow;

		const linkData = {
			"editType": "linkNodes",
			"nodes": [{ "id": "id8I6RH2V91XW" }],
			"targetNodes": [{ "id": "idGWRVT47XDV" }],
			"linkType": "data"
		};
		const nodeLinks = objectModel.createNodeLinks(linkData);
		objectModel.addLinks(nodeLinks);
		const actualCanvas = objectModel.getPipelineFlow();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 2));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 2));

		expect(isEqual(JSON.stringify(expectedCanvas, null, 4), JSON.stringify(actualCanvas, null, 4))).to.be.true;
	});

	it("should update label for a node", () => {
		logger.info("should update label for a node");

		deepFreeze(startPipelineFlow);
		const newLabel = "newNodeLabel";
		objectModel.setPipelineFlow(startPipelineFlow);
		objectModel.setNodeLabel("id8I6RH2V91XW", newLabel);

		expect(isEqual(newLabel, objectModel.getNode("id8I6RH2V91XW").label)).to.be.true;
	});

	it("should update input port label for a node", () => {
		logger.info("should update input port label for a node");

		deepFreeze(startPipelineFlow);
		const newLabel = "newPortLabel";
		objectModel.setPipelineFlow(startPipelineFlow);
		objectModel.setInputPortLabel("id8I6RH2V91XW", "inPort", newLabel);
		const node = objectModel.getNode("id8I6RH2V91XW");

		expect(isEqual(newLabel, objectModel.getPort(node.input_ports, "inPort").label)).to.be.true;
	});

	it("should update output port label for a node", () => {
		logger.info("should update output port label for a node");

		deepFreeze(startPipelineFlow);
		const newLabel = "newPortLabel";
		objectModel.setPipelineFlow(startPipelineFlow);
		objectModel.setOutputPortLabel("idGWRVT47XDV", "outPort", newLabel);
		const node = objectModel.getNode("idGWRVT47XDV");

		expect(isEqual(newLabel, objectModel.getPort(node.output_ports, "outPort").label)).to.be.true;
	});

	it("should create node with fixed node id", () => {
		logger.info("should create node with fixed node id");
		const uniqueNodeId = "myUniqueNodeId";

		deepFreeze(startCanvas);

		objectModel.setEmptyPipelineFlow();
		objectModel.setIdGeneratorHandler((action, data) => {
			if (action === CREATE_NODE) {
				return uniqueNodeId;
			}
			return null;
		});
		objectModel.setCanvasInfo(startCanvas);
		objectModel.fixedAutoLayout(VERTICAL);
		objectModel.setPipelineFlowPalette(paletteJson);
		const node = objectModel.createNode(filterNode);
		objectModel.addNode(node);

		const expectedCanvas = addNodeVerticalLayoutCanvas;
		expectedCanvas.nodes[3].id = uniqueNodeId;
		const actualCanvas = objectModel.getCanvasInfoPipeline();

		// logger.info("Expected Canvas = " + JSON.stringify(expectedCanvas, null, 2));
		// logger.info("Actual Canvas   = " + JSON.stringify(actualCanvas, null, 2));

		expect(isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should create node with non-null node id", () => {
		logger.info("should create node with non-null node id");

		deepFreeze(startCanvas);

		objectModel.setEmptyPipelineFlow();
		objectModel.setIdGeneratorHandler(() => null);
		objectModel.setEmptyPipelineFlow();
		objectModel.setPipelineFlowPalette(paletteJson);
		const node = objectModel.createNode(filterNode);
		objectModel.addNode(node);

		expect(objectModel.getCanvasInfoPipeline().nodes[0].id).not.to.be.null;
	});

	it("should create node links with fixed id", () => {
		logger.info("should create node links with fixed id");
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

		const node = objectModel.createNode(filterNode);
		objectModel.addNode(node);

		const sourceNodeId = uniqueNodeId + "_" + filterNode.label;
		const linkData = {
			"editType": "linkNodes",
			"nodes": [{ "id": sourceNodeId }],
			"targetNodes": [{ "id": "b4f90b52-d198-42f0-85cc-31af3914dd4f" }],
			"linkType": "data"
		};

		const nodeLinks = objectModel.createNodeLinks(linkData);
		objectModel.addLinks(nodeLinks);

		const expectedLinkId = uniqueNodeLink + "_" + sourceNodeId + "_b4f90b52-d198-42f0-85cc-31af3914dd4f";
		const expectedNodeLink = {
			"id": expectedLinkId,
			"class_name": "d3-data-link",
			"srcNodeId": sourceNodeId,
			"trgNodeId": "b4f90b52-d198-42f0-85cc-31af3914dd4f",
			"type": "nodeLink"
		};

		expect(isEqual(JSON.stringify(expectedNodeLink), JSON.stringify(objectModel.getLink(expectedLinkId)))).to.be.true;
	});

	it("should create comment with fixed comment id", () => {
		logger.info("should create comment with fixed comment id");
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

		const comment = objectModel.createComment(commentData);
		objectModel.addComment(comment);

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

		expect(isEqual(expectedComment, objectModel.getComments()[0])).to.be.true;
		expect(isEqual(JSON.stringify(expectedCommentLink), JSON.stringify(objectModel.getLink(expectedCommentLinkId)))).to.be.true;
	});

	it("should clone a node, comment, node_link and comment_link with fixed ids", () => {
		logger.info("should clone a node, comment, node_link and comment_link with fixed ids");
		const uniqueCommentId = "myUniqueCommentId";
		const uniqueCommentLinkId = "myUniqueCommentLinkId";
		const uniqueClonedNodeId = "myUniqueClonedNodeId";
		const uniqueClonedNodeLinkId = "myUniqueClonedNodeLinkId";
		const uniqueClonedCommentId = "myUniqueClonedCommentId";
		const uniqueClonedCommentLinkId = "myUniqueClonedCommentLinkId";

		deepFreeze(startCanvas);
		objectModel.setEmptyPipelineFlow();
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

		const comment = objectModel.createComment(commentData);
		objectModel.addComment(comment);

		const cloneData = { "objects": {} };
		cloneData.objects.nodes = [
			objectModel.getNode("2e6ecd75-8b2c-4c49-991c-80fa98fe08eb"),
			objectModel.getNode("b4f90b52-d198-42f0-85cc-31af3914dd4f")];
		cloneData.objects.comments = [
			objectModel.getComment(uniqueCommentId)];
		cloneData.objects.links = [
			objectModel.getLink("7ec57e11-fe0b-4bc8-a3b8-b72920bf1a55"),
			objectModel.getLink(uniqueCommentLinkId)];

		const cloneAction = new CloneMultipleObjectsAction(cloneData, objectModel);
		cloneAction.do();

		// logger.info("Expected Canvas = " + JSON.stringify(clonedCanvas, null, 2));
		// logger.info("Actual Canvas   = " + JSON.stringify(objectModel.getCanvasInfoPipeline(), null, 2));

		expect(isEqual(objectModel.getCanvasInfoPipeline(), clonedCanvas)).to.be.true;
	});

});
