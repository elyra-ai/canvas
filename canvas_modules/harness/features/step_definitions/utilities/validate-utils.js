/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/


/* global browser */

function dragAndDrop(srcSelector, srcXPos, srcYPos, trgSelector, trgXPos, trgYPos) {
	browser.moveToObject(srcSelector, Number(srcXPos), Number(srcYPos));
	browser.buttonDown();
	browser.moveToObject(trgSelector, Number(trgXPos), Number(trgYPos));
	browser.buttonUp();
}

// Find the number of link events in event log
function containLinkEvent(eventLog, srcNodeId, destNodeId, eventType) {
	var count = 0;
	var eventData = srcNodeId + " to " + destNodeId;
	for (var idx = 0; idx < eventLog.length; idx++) {
		if (eventLog[idx].event === eventType &&
			(eventLog[idx].data === eventData)) {
			count++;
		}
	}
	return count;
}

// find the number of links in object model that have source and destination ids.
//
function containLinkInObjectModel(objectModel, srcNodeId, destNodeId) {
	var count = 0;
	var links = objectModel.links;
	for (var lidx = 0; lidx < links.length; lidx++) {
		if (links[lidx].srcNodeId === srcNodeId &&
				links[lidx].trgNodeId === destNodeId) {
			count++;
		}
	}
	return count;
}

// delete links in object model that have node ids.
//
function deleteLinkInObjectModel(objectModel, nodeId) {
	var count = 0;
	var links = objectModel.links;
	for (var lidx = 0; lidx < links.length; lidx++) {
		if (links[lidx].srcNodeId === nodeId) {
			count++;
		}
	}
	return count;
}

// return the comment id from the object model
//
function getCommentIdFromObjectModel(objectModel, commentIndex) {
	return objectModel.comments[commentIndex].id;
}

// return the comment id from the object model
//
function getCommentIdFromObjectModelUsingText(objectModel, commentText) {
	var id = -1;
	objectModel.comments.forEach(function(com) {
		if (com.content === commentText) {
			id = com.id;
		}
	});
	return id;
}

// return the zoom object from the object model
//
function getZoomForPrimaryPipeline(objectModel) {
	return objectModel.zoom;
}


// We cannot rely on index position of comments because they get messed up
// when pushing comments to be underneath nodes and links. Therefore we look for the
// text of the comment being deleted.
function getCommentIndexFromCanvasUsingText(commentText) {
	var commentElements = browser.$("#common-canvas-items-container-0").$$(".comment-group");
	var comIndex = 0;
	for (let idx = 0; idx < commentElements.length; idx++) {
		if (commentElements[idx].getAttribute("textContent") === commentText) {
			comIndex = idx;
			break;
		}
	}
	return comIndex;
}

// count the number of events in event log
//
function getEventLogCount(eventLog, eventType, eventData) {
	var count = 0;
	for (var idx = 0; idx < eventLog.length; idx++) {
		if (eventLog[idx].event === eventType &&
			(eventLog[idx].data === eventData ||
			eventLog[idx].content === eventData)) {
			count++;
		}
	}
	return count;
}

// count the number of link event types in the event log
//
function getLinkEventCount(eventLog, eventType) {
	var count = 0;
	for (var idx = 0; idx < eventLog.length; idx++) {
		if (eventLog[idx].event === eventType) {
			count++;
		}
	}
	return count;
}

// get the node id from the object model
//
function getNodeIdFromObjectModel(objectModel, nodeIndex) {
	return objectModel.nodes[nodeIndex].id;
}

// get the node from the object model given the node id.
//
function getNodeFromObjectModel(objectModel, nodeId) {
	let node = null;
	for (let idx = 0; idx < objectModel.nodes.length; idx++) {
		if (objectModel.nodes[idx].id === nodeId) {
			node = objectModel.nodes[idx];
		}
	}
	expect(node).not.toEqual(null);
	return node;
}

// get a count of the number of object types in the object model
//
/* eslint complexity: [2, 15] */
function getObjectModelCount(objectModel, type, compare) {
	var count = 0;

	if (type === "nodes") {
		var nodes = objectModel.nodes;
		if (compare !== "") {
			for (var idx = 0; idx < nodes.length; idx++) {
				if (nodes[idx].image === compare) {
					count++;
				}
			}
		} else {
			count = nodes.length;
		}
	} else if (type === "comments") {
		var comments = objectModel.comments;
		if (compare !== "") {
			for (var cidx = 0; cidx < comments.length; cidx++) {
				if (comments[cidx].content === compare) {
					count++;
				}
			}
		} else {
			count = comments.length;
		}
	} else if (type === "links") {
		var links = objectModel.links;
		count = links.length;
	} else if (type === "datalinks") {
		var datalinks = objectModel.links;
		datalinks.forEach(function(datalink) {
			if (datalink.class_name === "d3-data-link" ||
					datalink.class_name === "canvas-data-link") { // For legacy rendering engine
				count++;
			}
		});
	} else if (type === "commentLinks") {
		var commentlinks = objectModel.links;
		commentlinks.forEach(function(commentlink) {
			if (commentlink.class_name === "d3-comment-link" ||
					commentlink.class_name === "canvas-comment-link") { // For legacy rendering engine
				count++;
			}
		});
	}
	return count;
}

// Returns the array of links (usually there's just one) between the source
// node/port and target node/port passed in.
//
function getPortLinks(objectModel, srcNodeLabel, srcPort, trgNodeLabel, trgPort) {
	var outLinks = [];
	var nodes = objectModel.nodes;
	var links = objectModel.links;
	var srcNodeID;
	var trgNodeID;

	nodes.forEach(function(node) {
		if (node.label === srcNodeLabel) {
			srcNodeID = node.id;
		}

		if (node.label === trgNodeLabel) {
			trgNodeID = node.id;
		}
	});

	links.forEach(function(link) {
		if (link.srcNodeId === srcNodeID && link.trgNodeId === trgNodeID && link.srcNodePortId === srcPort && link.trgNodePortId === trgPort) {
			outLinks.push(link);
		}
	});

	return outLinks;
}

// determine if all the nodes, comments and links are empty in the object model
//
function isObjectModelEmpty(objectModel) {
	var count = objectModel.nodes.length +
							objectModel.comments.length +
							objectModel.links.length;
	return count;
}

function getNodePortTipSelector(portId, extraCanvas) {
	const portSelector = "[data-id='node_port_tip_0_" + portId + "']";
	return portSelector;
}

function getNodePortSelector(nodeText, nodeElement, portId, extraCanvas) {
	const nodeId = getNodeIdForLabel(nodeText, extraCanvas);
	const portSelector = "[data-id='node_" + nodeElement + "_" + nodeId + "_" + portId + "']";
	return portSelector;
}

function getNodePortSelectorInSubFlow(nodeText, nodeElement, portId, extraCanvas) {
	const nodeId = getNodeIdForLabelInSubFlow(nodeText, extraCanvas);
	const portSelector = "[data-id='node_" + nodeElement + "_" + nodeId + "_" + portId + "']";
	return portSelector;
}

function getNodeSelector(nodeText, nodeElement, extraCanvas) {
	const nodeId = getNodeIdForLabel(nodeText, extraCanvas);
	const nodeSelector = "[data-id='node_" + nodeElement + "_" + nodeId + "']";
	return nodeSelector;
}

function getNodeSelectorInSubFlow(nodeText, nodeElement, extraCanvas) {
	const nodeId = getNodeIdForLabelInSubFlow(nodeText, extraCanvas);
	const nodeSelector = "[data-id='node_" + nodeElement + "_" + nodeId + "']";
	return nodeSelector;
}

function getNodeIdForLabel(nodeText, extraCanvas) {
	const inst = extraCanvas === true ? "1" : "0";
	const selector = `div > svg > g > g > text[data-id^='node_label_${inst}']`;
	return getNodeId(nodeText, selector);
}

function getNodeIdForLabelInSubFlow(nodeText, extraCanvas) {
	const inst = extraCanvas === true ? "1" : "0";
	const selector = `div > svg > g > g > svg > g > g > text[data-id^='node_label_${inst}']`;
	return getNodeId(nodeText, selector);
}

function getNodeId(nodeText, selector) {
	var result = browser.execute(function(labelText, inSelector) {
		/* global document */
		var nodeId = null;
		var domLabels = document.querySelectorAll(inSelector);
		for (let idx = 0; idx < domLabels.length; idx++) {
			if (domLabels.item(idx).__data__.label === labelText) {
				nodeId = domLabels.item(idx).getAttribute("data-id");
				break;
			}
		}

		return nodeId;
	}, nodeText, selector);

	if (result && result.value) {
		return result.value.substr(11);
	}
	return null;
}

function getCommentSelector(commentText, commentElement, extraCanvas) {
	const commentId = getCommentIdForText(commentText, extraCanvas);
	const commentSelector = "[data-id='comment_" + commentElement + "_" + commentId + "']";
	return commentSelector;
}

function getCommentSelectorInSubFlow(commentText, commentElement, extraCanvas) {
	const commentId = getCommentIdForTextInSubFlow(commentText, extraCanvas);
	const commentSelector = "[data-id='comment_" + commentElement + "_" + commentId + "']";
	return commentSelector;
}

function getCommentIdForText(commentText, extraCanvas) {
	const inst = extraCanvas === true ? "1" : "0";
	const selector = `div > svg > g > g[data-id^=comment_grp_${inst}]`;
	return getCommentId(commentText, selector);
}

function getCommentIdForTextInSubFlow(commentText, extraCanvas) {
	const inst = extraCanvas === true ? "1" : "0";
	const selector = `div > svg > g > g > svg > g > g[data-id^=comment_grp_${inst}]`;
	return getCommentId(commentText, selector);
}

function getCommentIdForTextInSubFlowInSubFlow(commentText, extraCanvas) {
	const inst = extraCanvas === true ? "1" : "0";
	const selector = `div > svg > g > g > svg > g > g > svg > g > g[data-id^=comment_grp_${inst}]`;
	return getCommentId(commentText, selector);
}

function getLinkSelector(linkId, extraCanvas) {
	const inst = extraCanvas === true ? "1" : "0";
	const selector = `div > svg > g > g > path[data-id^=link_line_${inst}_${linkId}]`;
	return selector;
}

function getCommentDimensions(commentSelector) {
	var result = browser.execute(function(comSelector) {
		/* global document */
		var comElement = document.querySelector(comSelector);
		return {
			x_pos: comElement.__data__.x_pos,
			y_pos: comElement.__data__.y_pos,
			width: comElement.__data__.width,
			height: comElement.__data__.height
		};
	}, commentSelector);

	if (result.value) {
		return result.value;
	}
	return null;
}

function addTextForComment(comId, newCommentText) {
	var selector = "[data-id='comment_grp_" + comId + "']";
	var comment = browser.$(selector);
	comment.click();
	comment.doubleClick();

	// workaround since setValue isn't working with comments.
	// keys is deprecated and might not work in latest version of firefox
	for (let indx = 0; indx < 60; ++indx) {
		comment.$("textarea").keys("Backspace");
	}
	comment.$("textarea").keys(newCommentText);

	// Wait a moment for the keys commands above to execute
	browser.pause(1000);
	// Click somewhere on the canvas (hopefully nothing is there) to go out of edit mode.
	browser.leftClick("#common-canvas-items-container-0", 400, 1);

	// Verify that the text has a clip-path within its style
	var textSelector = "[data-id='comment_text_" + comId + "']";
	var commentText = browser.$(textSelector);
	expect(commentText.getCssProperty("clip-path").value).not.toBe(null);
}

function getCommentId(commentText, selector) {
	var result = browser.execute(function(comText, inSelector) {
		/* global document */
		var commentId = null;
		var domComments = document.querySelectorAll(inSelector);
		for (let idx = 0; idx < domComments.length; idx++) {
			if (domComments.item(idx).__data__.content === comText) {
				commentId = domComments.item(idx).getAttribute("data-id");
				break;
			}
		}

		return commentId;
	}, commentText, selector);

	if (result) {
		return result.value.substr(12);
	}
	return null;
}

function doesTipExist(nodeName, location) {
	const nodeSelectorTip = getNodeSelector(nodeName, "tip");
	const nodeSelectorGrp = getNodeSelector(nodeName, "grp");

	checkTipExists(nodeName, location, nodeSelectorTip, nodeSelectorGrp);
}

function doesTipExistInSubFlow(nodeName, location) {
	const nodeSelectorTip = getNodeSelectorInSubFlow(nodeName, "tip");
	const nodeSelectorGrp = getNodeSelectorInSubFlow(nodeName, "grp");

	checkTipExists(nodeName, location, nodeSelectorTip, nodeSelectorGrp);
}

function checkTipExists(nodeName, location, nodeSelectorTip, nodeSelectorGrp) {
	const tip = browser.$(nodeSelectorTip);
	expect(tip.value).not.toEqual(null);

	const node = browser.$(nodeSelectorGrp);
	const tipTop = tip.getLocation().y;
	if (location === "below") {
		expect(tipTop).toBeGreaterThan(node.getLocation().y + node.getElementSize().height);
	} else if (location === "above") {
		expect(tipTop).toBeLessThan(node.getLocation().y);
	}

	const tipLabel = tip.$(".tip-node-label").getText();
	expect(tipLabel).toEqual(nodeName);
}

function clickSVGAreaAt(xCoord, yCoord) {
	browser.leftClick(".svg-area", Number(xCoord), Number(yCoord));
}

function findNodeIndexInPalette(nodeType) {
	var listItems = browser.$$(".palette-list-item");
	for (var idx = 0; idx < listItems.length; idx++) {
		var nodeText = listItems[idx].$(".palette-list-item-text-div").$(".palette-list-item-text-span")
			.getText();
		if (nodeText === nodeType) {
			return idx;
		}
	}
	return -1;
}

function findCategoryElement(nodeCategory) {
	for (var cat of browser.$$(".palette-flyout-category span")) {
		if (cat.getText() === nodeCategory) {
			return cat;
		}
	}
	return null;
}

function getSummaryFromName(summaryName) {
	const summaries = browser.$$(".properties-summary-values");
	let summary = null;
	for (let idx = 0; idx < summaries.length; idx++) {
		if (summaries[idx].$(".properties-summary-label").getText() === summaryName) {
			summary = summaries[idx];
			break;
		}
	}
	return summary;
}

function getControlContainerFromName(name) {
	const containers = browser.$$(".properties-label-container");
	let container = null;
	for (let idx = 0; idx < containers.length; idx++) {
		if (containers[idx].$(".properties-control-label").getText() === name) {
			container = containers[idx];
			break;
		}
	}
	return container;
}

function getNumberOfSelectedNodes() {
	var items = browser.getAttribute(".d3-node-selection-highlight", "data-selected");
	var selected = 0;

	for (var idx = 0; idx < items.length; idx++) {
		if (items[idx] === "yes") {
			selected++;
		}
	}
	return selected;
}

function getNumberOfSelectedComments() {
	var items = browser.getAttribute(".d3-comment-selection-highlight", "data-selected");
	var selected = 0;

	for (var idx = 0; idx < items.length; idx++) {
		if (items[idx] === "yes") {
			selected++;
		}
	}
	return selected;
}


module.exports = {
	dragAndDrop: dragAndDrop,
	containLinkEvent: containLinkEvent,
	containLinkInObjectModel: containLinkInObjectModel,
	deleteLinkInObjectModel: deleteLinkInObjectModel,
	getCommentIdFromObjectModel: getCommentIdFromObjectModel,
	getCommentIdFromObjectModelUsingText: getCommentIdFromObjectModelUsingText,
	getCommentIndexFromCanvasUsingText: getCommentIndexFromCanvasUsingText,
	getEventLogCount: getEventLogCount,
	getLinkEventCount: getLinkEventCount,
	getNodeIdFromObjectModel: getNodeIdFromObjectModel,
	getNodeFromObjectModel: getNodeFromObjectModel,
	getObjectModelCount: getObjectModelCount,
	getPortLinks: getPortLinks,
	isObjectModelEmpty: isObjectModelEmpty,
	getNodeSelector: getNodeSelector,
	getNodeSelectorInSubFlow: getNodeSelectorInSubFlow,
	getNodePortSelector: getNodePortSelector,
	getNodePortSelectorInSubFlow: getNodePortSelectorInSubFlow,
	getNodePortTipSelector: getNodePortTipSelector,
	addTextForComment: addTextForComment,
	getCommentSelector: getCommentSelector,
	getCommentSelectorInSubFlow: getCommentSelectorInSubFlow,
	getCommentIdForText: getCommentIdForText,
	getCommentIdForTextInSubFlow: getCommentIdForTextInSubFlow,
	getCommentIdForTextInSubFlowInSubFlow: getCommentIdForTextInSubFlowInSubFlow,
	getCommentDimensions: getCommentDimensions,
	clickSVGAreaAt: clickSVGAreaAt,
	findNodeIndexInPalette: findNodeIndexInPalette,
	findCategoryElement: findCategoryElement,
	getSummaryFromName: getSummaryFromName,
	getControlContainerFromName: getControlContainerFromName,
	getNumberOfSelectedNodes: getNumberOfSelectedNodes,
	getNumberOfSelectedComments: getNumberOfSelectedComments,
	doesTipExist: doesTipExist,
	doesTipExistInSubFlow: doesTipExistInSubFlow,
	getZoomForPrimaryPipeline: getZoomForPrimaryPipeline,
	getLinkSelector: getLinkSelector
};
