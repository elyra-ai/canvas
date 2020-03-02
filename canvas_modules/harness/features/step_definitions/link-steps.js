/*
 * Copyright 2017-2020 IBM Corporation
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
/* eslint max-len: "off" */

import { containLinkEvent, containLinkInObjectModel, getCommentIdFromObjectModel,
	getCommentIdFromObjectModelUsingText, getCommentIndexFromCanvasUsingText,
	getLinkFromAPIName, getLinkSelector, getLinksCount,
	getNodeIdFromObjectModel, getNodePortSelector, getNodePortSelectorInSubFlow,
	getNodeSelector, getObjectModelCount, getPortLinks } from "./utilities/validate-utils.js";
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
				browser.execute(simulateD3LinkCreation, ".d3-node-halo", orgNodeNumber, ".d3-node-group", destNodeNumber, 1, 1);
				var links = browser.$$(".d3-selectable-link").length / 2; // Divide by 2 because the line and arrow head use this class
				expect(links).toEqual(linkCount);

				// verify that the link is in the internal object model
				var objectModel = getCanvasData();

				var srcNodeId = getNodeIdFromObjectModel(objectModel, orgNodeNumber);
				var destNodeId = getNodeIdFromObjectModel(objectModel, destNodeNumber);
				var returnVal = containLinkInObjectModel(objectModel, srcNodeId, destNodeId);
				expect(returnVal).toBe(1);

				// verify that an event for a new link is in the external object model event log
				var eventLog = getEventLogData();
				returnVal = containLinkEvent(eventLog, srcNodeId, destNodeId,
					"editActionHandler() linkNodes");
				expect(returnVal).toBe(1);
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
			browser.execute(simulateD3LinkCreation, ".d3-comment-halo", commentIndex, ".d3-node-group", nodeIndex, 1, 1);
			var links = browser.$$(".d3-selectable-link").length / 2; // Divide by 2 because the line and arrow head use this class
			expect(links).toEqual(linkCount);

			// verify that the link is in the internal object model
			var objectModel = getCanvasData();
			var srcNodeId = getCommentIdFromObjectModelUsingText(objectModel, commentText);
			var destNodeId = getNodeIdFromObjectModel(objectModel, nodeIndex);
			var returnVal = containLinkInObjectModel(objectModel, srcNodeId, destNodeId);
			expect(returnVal).toBe(1);

			// verify that an event for a new link is in the external object model event log
			var eventLog = getEventLogData();
			returnVal = containLinkEvent(eventLog, srcNodeId,
				destNodeId, "editActionHandler() linkComment");
			expect(returnVal).toBe(1);
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
			var srcNodeId = getCommentIdFromObjectModel(objectModel, commentIndex);
			var destNodeId = getNodeIdFromObjectModel(objectModel, nodeIndex);
			var returnVal = containLinkInObjectModel(objectModel, srcNodeId, destNodeId);
			expect(returnVal).toBe(0);
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
			var srcNodeId = getCommentIdFromObjectModel(objectModel, srcNodeIndex);
			var destNodeId = getNodeIdFromObjectModel(objectModel, destNodeIndex);
			var returnVal = containLinkInObjectModel(objectModel, srcNodeId, destNodeId);
			expect(returnVal).toBe(0);
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
		var returnVal = getObjectModelCount(objectModel, "links", linkCount);
		expect(returnVal).toBe(linkCount);

	});

	this.Then(/^I verify the number of data links are (\d+)$/, function(dataLinks) {
		try {
			var dataLinksOnCanvas = getLinksCount("nodeLink");
			expect(Number(dataLinks)).toEqual(dataLinksOnCanvas);

			// verify the number of data-links is in the internal object model
			var objectModel = getCanvasData();
			var returnVal = getObjectModelCount(objectModel, "datalinks", "");
			expect(returnVal).toBe(Number(dataLinks));
		} catch (err) {
			console.log("Error = " + err);
			throw err;
		}

	});

	this.Then(/^I verify the number of comment links are (\d+)$/, function(commentLinks) {
		try {
			var commentLinksOnCanvas = getLinksCount("commentLink");
			expect(Number(commentLinks)).toEqual(commentLinksOnCanvas);

			// verify the number of comment-links is in the internal object model
			var objectModel = getCanvasData();
			var returnVal = getObjectModelCount(objectModel, "commentLinks", "");
			expect(returnVal).toBe(Number(commentLinks));
		} catch (err) {
			console.log("Error = " + err);
			throw err;
		}

	});

	// Then I verify the link from node "Select3" output port "outPort8" to node "Neural Net" input port "inPort1" has path "M L 34 56"
	this.Then(/^I verify the link from node "([^"]*)" output port "([^"]*)" to node "([^"]*)" input port "([^"]*)" has path "([^"]*)"$/, function(srcNodeLabel, srcPortId, trgNodeLabel, trgPortId, path) {
		var objectModel = getCanvasData();
		var links = getPortLinks(objectModel, srcNodeLabel, srcPortId, trgNodeLabel, trgPortId);
		expect(links.length).toBe(1);

		const selector = getLinkSelector(links[0].id, "line");
		const linkObjs = browser.$$(selector);

		let linkObjData = null;
		for (const linkObj of linkObjs) {
			linkObjData = linkObj.getAttribute("d");
		}

		expect(linkObjData).toBe(path);
	});

	// Then I link node "Var. File" output port "out3" to node "Select" input port "inport2"
	//
	this.Then(/^I link node "([^"]*)" output port "([^"]*)" to node "([^"]*)" input port "([^"]*)"$/, function(srcNodeText, srcPortId, trgNodeText, trgPortId) {
		const srcSelector = getNodePortSelector(srcNodeText, "src_port", srcPortId);
		const trgSelector = getNodePortSelector(trgNodeText, "trg_port", trgPortId);

		browser.dragAndDrop(srcSelector, trgSelector);
	});

	// Then I link node "Var. File" output port "out3" to node "Select" input port "inport2" on the subflow
	//
	this.Then(/^I link node "([^"]*)" output port "([^"]*)" to node "([^"]*)" input port "([^"]*)" on the subflow$/, function(srcNodeText, srcPortId, trgNodeText, trgPortId) {
		const srcSelector = getNodePortSelectorInSubFlow(srcNodeText, "src_port", srcPortId);
		const trgSelector = getNodePortSelectorInSubFlow(trgNodeText, "trg_port", trgPortId);

		browser.dragAndDrop(srcSelector, trgSelector);
	});


	// Then I link node "Var. File" output port "out3 to node "Select"
	// This will simulate a drag from a specific port onto a target node rather
	// than a specific port. This should be interpreted as a link to the zeroth
	// port of the target node.
	//
	this.Then(/^I link node "([^"]*)" output port "([^"]*)" to node "([^"]*)"$/, function(srcNodeText, srcPortId, trgNodeText) {
		const srcSelector = getNodePortSelector(srcNodeText, "src_port", srcPortId);
		const trgSelector = getNodeSelector(trgNodeText, "grp");

		browser.dragAndDrop(srcSelector, trgSelector);
	});


	this.Then(/^I verify the number of port data links are (\d+)$/, function(portLinks) {
		try {
			var portLinksOnCanvas = browser.$$(".d3-data-link").length;
			expect(Number(portLinks)).toEqual(portLinksOnCanvas);

			// verify the number of port-links is in the internal object model
			var objectModel = getCanvasData();
			var returnVal = getObjectModelCount(objectModel, "datalinks", "");
			expect(returnVal).toBe(Number(portLinks));
		} catch (err) {
			console.log("Error = " + err);
			throw err;
		}

	});

	// Then I verify 1 link between source node "Field Reorder" source port "outPort" to target node "Na_to_K" target port "inPort"
	this.Then(/^I verify (\d+) link between source node "([^"]*)" source port "([^"]*)" to target node "([^"]*)" target port "([^"]*)"$/, function(linkCount, srcNodeLabel, srcPortId, trgNodeLabel, trgPortId) {
		try {
			var objectModel = getCanvasData();
			var links = getPortLinks(objectModel, srcNodeLabel, srcPortId, trgNodeLabel, trgPortId);
			expect(links.length).toBe(Number(linkCount));
		} catch (err) {
			console.log("Error = " + err);
			throw err;
		}
	});

	this.Then(/^I verify link "([^"]*)" has (\d+) decorators$/, function(linkName, decoratorCount) {
		const link = getLinkFromAPIName(linkName, getCanvasData());
		const decorators = link.$$(".d3-link-dec-outline");
		expect(String(decorators.length)).toEqual(decoratorCount);
	});

	this.Then(/^I verify link "([^"]*)" has (\d+) label decorators$/, function(linkName, decoratorCount) {
		const link = getLinkFromAPIName(linkName, getCanvasData());
		const decorators = link.$$(".d3-link-dec-label");
		expect(String(decorators.length)).toEqual(decoratorCount);
	});

	this.Then(/^I click on the hotspot for decorator "([^"]*)" on the "([^"]*)" link$/, function(decoratorId, linkName) {
		const link = getLinkFromAPIName(linkName, getCanvasData());
		const decoratorImage = link.$(".d3-link-dec-image[data-id=link_dec_img_0_" + decoratorId + "]");
		decoratorImage.click();
	});

	this.Then(/^I verify link "([^"]*)" has a decorator with id "([^"]*)" at position x ([-+]?[0-9]*\.?[0-9]+) y ([-+]?[0-9]*\.?[0-9]+)$/,
		function(linkName, decoratorId, xPos, yPos) {
			const link = getLinkFromAPIName(linkName, getCanvasData());
			const decorators = link.$$(".d3-link-dec-outline");
			let found = false;
			let xx = 0;
			let yy = 0;
			for (const decorator of decorators) {
				var id = decorator.getAttribute("data-id");
				if (id === "link_dec_outln_0_" + decoratorId) {
					found = true;
					xx = decorator.getAttribute("x");
					yy = decorator.getAttribute("y");
				}
			}

			expect(found).toEqual(true);
			expect(xx).toEqual(xPos);
			expect(yy).toEqual(yPos);
		});
};
