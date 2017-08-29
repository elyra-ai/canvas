/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint no-console: "off" */

import { containLinkEvent, containLinkInObjectModel, getCommentIdFromObjectModel,
					getCommentIdFromObjectModelUsingText, getCommentIndexFromCanvasUsingText,
					getNodeIdFromObjectModel, getObjectModelCount } from "./utilities/validateUtil.js";
import { simulateD3LinkCreation, simulateDragDrop } from "./utilities/DragAndDrop.js";
import { getHarnessData } from "./utilities/HTTPClient.js";
import { getURL } from "./utilities/test-config.js";

var nconf = require("nconf");

/* global browser */

// ------------------------------------
//   Test Cases
// -------------------------------------
module.exports = function() {
	// Then I link node 1 the "Var. File" node to node 2 the "Derive" node for link 1 on the canvas
	// The canvasLinks arg should include the number of comment links in addition to data links.
	//
	this.Then(/^I link node (\d+) the "([^"]*)" node to node (\d+) the "([^"]*)" node for link (\d+) on the canvas$/,
  function(srcNodeIndex, srcNodeName, destNodeIndex, destNodeName, canvasLinks) {
	const D3RenderingEngine = nconf.get("renderingEngine") === "D3";
	try {
		var orgNodeNumber = srcNodeIndex - 1;
		var destNodeNumber = destNodeIndex - 1;

		var linkCount = Number(canvasLinks);

		if (D3RenderingEngine) {
			browser.execute(simulateD3LinkCreation, ".d3-node-halo", orgNodeNumber, ".node-group", destNodeNumber, 1, 1);
			var links = browser.$$(".d3-selectable-link").length / 2; // Divide by 2 because the line and arrow head use this class
			expect(links).toEqual(linkCount);
		} else {
			browser.execute(simulateDragDrop, ".node-circle", orgNodeNumber, ".node-inner-circle", destNodeNumber, 1, 1);
			var dataLinks = browser.$$(".canvas-data-link").length / 2;
			var commentLinks = browser.$$(".canvas-comment-link").length / 2;
			expect(dataLinks + commentLinks).toEqual(linkCount);
		}

		// verify that the link is in the internal object model
		const testUrl = getURL();
		const getCanvasUrl = testUrl + "/v1/test-harness/canvas";
		const getEventLogUrl = testUrl + "/v1/test-harness/events";
		browser.timeouts("script", 5000);
		var objectModel = browser.executeAsync(getHarnessData, getCanvasUrl);
		var srcNodeId = browser.execute(getNodeIdFromObjectModel, objectModel.value, orgNodeNumber);
		var destNodeId = browser.execute(getNodeIdFromObjectModel, objectModel.value, destNodeNumber);
		var returnVal = browser.execute(containLinkInObjectModel, objectModel.value, srcNodeId.value, destNodeId.value);
		browser.pause(500);
		expect(returnVal.value).toBe(1);

		// verify that an event for a new link is in the external object model event log
		var eventLog = browser.executeAsync(getHarnessData, getEventLogUrl);
		returnVal = browser.execute(containLinkEvent, eventLog.value, srcNodeId.value, destNodeId.value,
																"editActionHandler() linkNodes");
		expect(returnVal.value).toBe(1);
	} catch (err) {
		console.log("Error = " + err);
		throw err;
	}

});

	// Then I link comment 2 to node 6 the "Neural Net" node for link 7 on the canvas
	//
	this.Then(/^I link comment (\d+) with text "([^"]*)" to node (\d+) the "([^"]*)" node for link (\d+) on the canvas$/,
	function(commentNumber, commentText, nodeNumber, nodeName, canvasLinks) {
		const D3RenderingEngine = nconf.get("renderingEngine") === "D3";
		var commentIndex = commentNumber - 1;
		var nodeIndex = nodeNumber - 1;
		var linkCount = Number(canvasLinks);

		if (D3RenderingEngine) {
			// For D3, we cannot rely on index position of comments because they get messed up
			// when pushing comments to be underneath nodes and links. Therefore we look for the
			// text of the comment being deleted.
			commentIndex = getCommentIndexFromCanvasUsingText(commentText);
			browser.execute(simulateD3LinkCreation, ".d3-comment-halo", commentIndex, ".node-group", nodeIndex, 1, 1);
			var links = browser.$$(".d3-selectable-link").length / 2; // Divide by 2 because the line and arrow head use this class
			expect(links).toEqual(linkCount);
		} else {
			browser.execute(simulateDragDrop, ".comment-box", commentIndex, ".node-inner-circle", nodeIndex, 1, 1);
			// verify link is in the canvas DOM
			var dataLinks = browser.$$(".canvas-data-link").length / 2;
			var commentLinks = browser.$$(".canvas-comment-link").length / 2;
			expect(dataLinks + commentLinks).toEqual(linkCount);
		}

		// verify that the link is in the internal object model
		const testUrl = getURL();
		const getCanvasUrl = testUrl + "/v1/test-harness/canvas";
		const getEventLogUrl = testUrl + "/v1/test-harness/events";
		browser.timeouts("script", 5000);
		var objectModel = browser.executeAsync(getHarnessData, getCanvasUrl);
		var srcNodeId = browser.execute(getCommentIdFromObjectModelUsingText, objectModel.value, commentText);
		var destNodeId = browser.execute(getNodeIdFromObjectModel, objectModel.value, nodeIndex);
		var returnVal = browser.execute(containLinkInObjectModel, objectModel.value, srcNodeId.value, destNodeId.value);
		expect(returnVal.value).toBe(1);

		// verify that an event for a new link is in the external object model event log
		var eventLog = browser.executeAsync(getHarnessData, getEventLogUrl);
		returnVal = browser.execute(containLinkEvent, eventLog.value, srcNodeId.value,
																destNodeId.value, "editActionHandler() linkComment");
		expect(returnVal.value).toBe(1);
	});

	// Then I delete link between comment 1 and node 1 the "Derive" node
	//
	this.Then(/^I delete comment link at (\d+), (\d+) between comment (\d+) and node (\d+) the "([^"]*)" node$/,
	function(linkX, linkY, sourceIndex, destinationIndex, destinationName) {
		var commentIndex = sourceIndex - 1;
		var nodeIndex = destinationIndex - 1;

		// delete the link
		browser.rightClick(".svg-canvas", Number(linkX), Number(linkY));
		browser.$(".context-menu-popover").$$(".react-context-menu-item")[0].$(".react-context-menu-link").click();

		// verify that the link is Not in the internal object model
		const testUrl = getURL();
		const getCanvasUrl = testUrl + "/v1/test-harness/canvas";
		browser.timeouts("script", 5000);
		var objectModel = browser.executeAsync(getHarnessData, getCanvasUrl);
		var srcNodeId = browser.execute(getCommentIdFromObjectModel, objectModel.value, commentIndex);
		var destNodeId = browser.execute(getNodeIdFromObjectModel, objectModel.value, nodeIndex);
		var returnVal = browser.execute(containLinkInObjectModel, objectModel.value, srcNodeId.value, destNodeId.value);
		expect(returnVal.value).toBe(0);
	});

	// Then I delete link between node 1 the "Filter" node and node 2 the "Type" node
	//
	this.Then(/^I delete node link at (\d+), (\d+) between node (\d+) the "([^"]*)" node and node (\d+) the "([^"]*)" node$/,
	function(linkX, linkY, sourceIndex, sourceName, destinationIndex, destinationName) {
		var srcNodeIndex = sourceIndex - 1;
		var destNodeIndex = destinationIndex - 1;

		// delete the link
		browser.rightClick(".svg-canvas", Number(linkX), Number(linkY));
		browser.$(".context-menu-popover").$$(".react-context-menu-item")[0].$(".react-context-menu-link").click();

		// verify that the link is Not in the internal object model
		const testUrl = getURL();
		const getCanvasUrl = testUrl + "/v1/test-harness/canvas";
		browser.timeouts("script", 5000);
		var objectModel = browser.executeAsync(getHarnessData, getCanvasUrl);
		var srcNodeId = browser.execute(getCommentIdFromObjectModel, objectModel.value, srcNodeIndex);
		var destNodeId = browser.execute(getNodeIdFromObjectModel, objectModel.value, destNodeIndex);
		var returnVal = browser.execute(containLinkInObjectModel, objectModel.value, srcNodeId.value, destNodeId.value);
		expect(returnVal.value).toBe(0);
	});

	// I delete d3 link at 205, 248
	//
	this.Then(/^I delete d3 link at (\d+), (\d+)$/,
	function(linkX, linkY) {
		browser.rightClick(".d3-svg-canvas-div", Number(linkX), Number(linkY));
		browser.$(".context-menu-popover").$$(".react-context-menu-item")[0].$(".react-context-menu-link").click();
	});

	// Then I validate there are 6 links on the canvas
	//
	this.Then(/^I validate there are (\d+) links on the canvas$/, function(canvasLinks) {
		var linkCount = Number(canvasLinks);
		// verify link is in the canvas DOM
		var dataLinks = browser.$$(".canvas-data-link").length;
		var commentLinks = browser.$$(".canvas-comment-link").length;
		expect(dataLinks + commentLinks).toEqual(linkCount);

		// verify that the link is in the internal object model
		const testUrl = getURL();
		const getCanvasUrl = testUrl + "/v1/test-harness/canvas";
		browser.timeouts("script", 5000);
		var objectModel = browser.executeAsync(getHarnessData, getCanvasUrl);
		var returnVal = browser.execute(getObjectModelCount, objectModel.value, "links", linkCount);
		expect(returnVal.value).toBe(linkCount);

	});

	this.Then(/^I verify the number of data links are (\d+)$/, function(dataLinks) {
		try {
			var dataLinksOnCanvas = browser.$$(".canvas-data-link").length / 2;
			expect(Number(dataLinks)).toEqual(dataLinksOnCanvas);

			// verify the number of data-links is in the internal object model
			const testUrl = getURL();
			const getCanvasUrl = testUrl + "/v1/test-harness/canvas";

			browser.timeoutsAsyncScript(5000);
			var objectModel = browser.executeAsync(getHarnessData, getCanvasUrl);
			var returnVal = browser.execute(getObjectModelCount, objectModel.value, "datalinks", "");
			expect(returnVal.value).toBe(Number(dataLinks));
		} catch (err) {
			console.log("Error = " + err);
			throw err;
		}

	});

	this.Then(/^I verify the number of comment links are (\d+)$/, function(commentLinks) {
		try {
			var commentLinksOnCanvas = browser.$$(".canvas-comment-link").length / 2;
			expect(Number(commentLinks)).toEqual(commentLinksOnCanvas);

			// verify the number of data-links is in the internal object model
			const testUrl = getURL();
			const getCanvasUrl = testUrl + "/v1/test-harness/canvas";

			browser.timeoutsAsyncScript(5000);
			var objectModel = browser.executeAsync(getHarnessData, getCanvasUrl);
			var returnVal = browser.execute(getObjectModelCount, objectModel.value, "commentLinks", "");
			expect(returnVal.value).toBe(Number(commentLinks));
		} catch (err) {
			console.log("Error = " + err);
			throw err;
		}

	});

};
