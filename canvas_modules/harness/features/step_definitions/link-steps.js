/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint no-console: "off" */
/* eslint max-len: "off" */

import { containLinkEvent, containLinkInObjectModel, getCommentIdFromObjectModel,
	getCommentIdFromObjectModelUsingText, getCommentIndexFromCanvasUsingText, getNodeIdForLabel,
	getNodeIdFromObjectModel, getObjectModelCount, getPortLinks } from "./utilities/validate-utils.js";
import { getCanvasData, getEventLogData } from "./utilities/test-utils.js";
import { simulateD3LinkCreation } from "./utilities/dragAndDrop-utils.js";


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
			try {
				var orgNodeNumber = srcNodeIndex - 1;
				var destNodeNumber = destNodeIndex - 1;

				var linkCount = Number(canvasLinks);

				browser.execute(simulateD3LinkCreation, ".d3-node-halo", orgNodeNumber, ".node-group", destNodeNumber, 1, 1);
				var links = browser.$$(".d3-selectable-link").length / 2; // Divide by 2 because the line and arrow head use this class
				expect(links).toEqual(linkCount);

				// verify that the link is in the internal object model
				var objectModel = getCanvasData();
				var srcNodeId = browser.execute(getNodeIdFromObjectModel, objectModel, orgNodeNumber);
				var destNodeId = browser.execute(getNodeIdFromObjectModel, objectModel, destNodeNumber);
				var returnVal = browser.execute(containLinkInObjectModel, objectModel, srcNodeId.value, destNodeId.value);
				browser.pause(500);
				expect(returnVal.value).toBe(1);

				// verify that an event for a new link is in the external object model event log
				var eventLog = getEventLogData();
				returnVal = browser.execute(containLinkEvent, eventLog, srcNodeId.value, destNodeId.value,
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
			var commentIndex = commentNumber - 1;
			var nodeIndex = nodeNumber - 1;
			var linkCount = Number(canvasLinks);

			// We cannot rely on index position of comments because they get messed up
			// when pushing comments to be underneath nodes and links. Therefore we look for the
			// text of the comment being deleted.
			commentIndex = getCommentIndexFromCanvasUsingText(commentText);
			browser.execute(simulateD3LinkCreation, ".d3-comment-halo", commentIndex, ".node-group", nodeIndex, 1, 1);
			var links = browser.$$(".d3-selectable-link").length / 2; // Divide by 2 because the line and arrow head use this class
			expect(links).toEqual(linkCount);

			// verify that the link is in the internal object model
			var objectModel = getCanvasData();
			var srcNodeId = browser.execute(getCommentIdFromObjectModelUsingText, objectModel, commentText);
			var destNodeId = browser.execute(getNodeIdFromObjectModel, objectModel, nodeIndex);
			var returnVal = browser.execute(containLinkInObjectModel, objectModel, srcNodeId.value, destNodeId.value);
			expect(returnVal.value).toBe(1);

			// verify that an event for a new link is in the external object model event log
			var eventLog = getEventLogData();
			returnVal = browser.execute(containLinkEvent, eventLog, srcNodeId.value,
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
			browser.$(".context-menu-popover").$$(".react-contextmenu-item")[0].click();

			// verify that the link is Not in the internal object model
			var objectModel = getCanvasData();
			var srcNodeId = browser.execute(getCommentIdFromObjectModel, objectModel, commentIndex);
			var destNodeId = browser.execute(getNodeIdFromObjectModel, objectModel, nodeIndex);
			var returnVal = browser.execute(containLinkInObjectModel, objectModel, srcNodeId.value, destNodeId.value);
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
			browser.$(".context-menu-popover").$$(".react-contextmenu-item")[0].click();

			// verify that the link is Not in the internal object model
			var objectModel = getCanvasData();
			var srcNodeId = browser.execute(getCommentIdFromObjectModel, objectModel, srcNodeIndex);
			var destNodeId = browser.execute(getNodeIdFromObjectModel, objectModel, destNodeIndex);
			var returnVal = browser.execute(containLinkInObjectModel, objectModel, srcNodeId.value, destNodeId.value);
			expect(returnVal.value).toBe(0);
		});

	// I delete link at 205, 248
	//
	this.Then(/^I delete link at (\d+), (\d+)$/,
		function(linkX, linkY) {
			browser.rightClick(".d3-svg-canvas-div", Number(linkX), Number(linkY));
			browser.$(".context-menu-popover").$$(".react-contextmenu-item")[0].click();
		});

	// Then I validate there are 6 links on the canvas
	//
	this.Then(/^I validate there are (\d+) links on the canvas with port style$/, function(canvasLinks) {
		var linkCount = Number(canvasLinks);
		// verify link is in the canvas DOM
		var dataLinks = browser.$$(".d3-data-link").length;
		var commentLinks = browser.$$(".d3-comment-link").length;
		var associationLinks = browser.$$(".d3-object-link").length;
		expect(dataLinks + commentLinks + associationLinks).toEqual(linkCount);

		// verify that the link is in the internal object model
		var objectModel = getCanvasData();
		var returnVal = browser.execute(getObjectModelCount, objectModel, "links", linkCount);
		expect(returnVal.value).toBe(linkCount);

	});

	this.Then(/^I verify the number of data links are (\d+)$/, function(dataLinks) {
		try {
			var dataLinksOnCanvas = browser.$$(".d3-data-link").length / 2; // Divide by 2 because the line and arrow head use this class
			expect(Number(dataLinks)).toEqual(dataLinksOnCanvas);

			// verify the number of data-links is in the internal object model
			var objectModel = getCanvasData();
			var returnVal = browser.execute(getObjectModelCount, objectModel, "datalinks", "");
			expect(returnVal.value).toBe(Number(dataLinks));
		} catch (err) {
			console.log("Error = " + err);
			throw err;
		}

	});

	this.Then(/^I verify the number of comment links are (\d+)$/, function(commentLinks) {
		try {
			var commentLinksOnCanvas = browser.$$(".d3-comment-link").length / 2;
			expect(Number(commentLinks)).toEqual(commentLinksOnCanvas);

			// verify the number of data-links is in the internal object model
			var objectModel = getCanvasData();
			var returnVal = browser.execute(getObjectModelCount, objectModel, "commentLinks", "");
			expect(returnVal.value).toBe(Number(commentLinks));
		} catch (err) {
			console.log("Error = " + err);
			throw err;
		}

	});


	// Then I link node "Var. File" output port "out3 to node "Select" input port "inport2"
	//
	this.Then(/^I link node "([^"]*)" output port "([^"]*)" to node "([^"]*)" input port "([^"]*)"$/, function(srcNodeText, srcPortId, trgNodeText, trgPortId) {

		var srcNodeId = getNodeIdForLabel(srcNodeText);
		var srcSelector = "#node_src_port_" + srcNodeId + "_" + srcPortId;

		var trgNodeId = getNodeIdForLabel(trgNodeText);
		var trgSelector = "#node_trg_port_" + trgNodeId + "_" + trgPortId;

		browser.dragAndDrop(srcSelector, trgSelector);

	});

	// Then I link node "Var. File" output port "out3 to node "Select"
	// This will simulate a drag from a specific port onto a target node rather
	// than a specific port. This should be interpreted as a link to the zeroth
	// port of the target node.
	//
	this.Then(/^I link node "([^"]*)" output port "([^"]*)" to node "([^"]*)"$/, function(srcNodeText, srcPortId, trgNodeText) {

		var srcNodeId = getNodeIdForLabel(srcNodeText);
		var srcSelector = "#node_src_port_" + srcNodeId + "_" + srcPortId;

		var trgNodeId = getNodeIdForLabel(trgNodeText);
		var trgSelector = "#node_grp_" + trgNodeId;

		browser.dragAndDrop(srcSelector, trgSelector);

	});


	this.Then(/^I verify the number of port data links are (\d+)$/, function(portLinks) {
		try {
			var portLinksOnCanvas = browser.$$(".d3-data-link").length;
			expect(Number(portLinks)).toEqual(portLinksOnCanvas);

			// verify the number of port-links is in the internal object model
			var objectModel = getCanvasData();
			var returnVal = browser.execute(getObjectModelCount, objectModel, "datalinks", "");
			expect(returnVal.value).toBe(Number(portLinks));
		} catch (err) {
			console.log("Error = " + err);
			throw err;
		}

	});

	// Then I verify 1 link between source node "Field Reorder" source port "outPort" to target node "Na_to_K" target port "inPort"
	this.Then(/^I verify (\d+) link between source node "([^"]*)" source port "([^"]*)" to target node "([^"]*)" target port "([^"]*)"$/, function(linkCount, srcNode, srcPort, trgNode, trgPort) {
		try {
			var objectModel = getCanvasData();
			var returnVal = getPortLinks(objectModel, srcNode, srcPort, trgNode, trgPort);
			expect(returnVal).toBe(Number(linkCount));
		} catch (err) {
			console.log("Error = " + err);
			throw err;
		}

	});

};
