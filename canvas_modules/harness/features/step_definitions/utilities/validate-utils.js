/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/


/* global browser */

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

function getPortLinks(objectModel, srcNode, srcPort, trgNode, trgPort) {
	var count = 0;
	var nodes = objectModel.nodes;
	var links = objectModel.links;
	var srcNodeID;
	var trgNodeID;

	nodes.forEach(function(node) {
		if (node.label === srcNode) {
			srcNodeID = node.id;
		}

		if (node.label === trgNode) {
			trgNodeID = node.id;
		}
	});

	links.forEach(function(link) {
		if (link.srcNodeId === srcNodeID && link.trgNodeId === trgNodeID && link.srcNodePortId === srcPort && link.trgNodePortId === trgPort) {
			count++;
		}
	});

	return count;
}

// determine if all the nodes, comments and links are empty in the object model
//
function isObjectModelEmpty(objectModel) {
	var count = objectModel.nodes.length +
							objectModel.comments.length +
							objectModel.links.length;
	return count;
}

function getNodeIdForLabel(nodeText) {
	var result = browser.execute(function(labelText) {
		/* global document */
		var nodeId = null;

		var domLabels = document.getElementsByClassName("d3-node-label");
		for (let idx = 0; idx < domLabels.length; idx++) {
			if (domLabels.item(idx).__data__.label === labelText) {
				nodeId = domLabels.item(idx).id;
				break;
			}
		}

		return nodeId;
	}, nodeText);

	return result.value.substr(11);
}

function clickSVGAreaAt(xCoord, yCoord) {
	browser.click(".svg-area", Number(xCoord), Number(yCoord));
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
	for (var cat of browser.$$(".palette-flyout-category")) {
		if (cat.getValue() === nodeCategory) {
			return cat;
		}
	}
	return null;
}

function getSummaryFromName(summaryName) {
	const summaries = browser.$$(".control-summary-configured-values");
	let summary = null;
	for (let idx = 0; idx < summaries.length; idx++) {
		if (summaries[idx].$(".summary-label").getText() === summaryName) {
			summary = summaries[idx];
			break;
		}
	}
	return summary;
}

function getControlContainerFromName(name) {
	const containers = browser.$$(".control-label-container");
	let container = null;
	for (let idx = 0; idx < containers.length; idx++) {
		if (containers[idx].$(".control-label").getText() === name) {
			container = containers[idx];
			break;
		}
	}
	return container;
}

module.exports = {
	containLinkEvent: containLinkEvent,
	containLinkInObjectModel: containLinkInObjectModel,
	deleteLinkInObjectModel: deleteLinkInObjectModel,
	getCommentIdFromObjectModel: getCommentIdFromObjectModel,
	getCommentIdFromObjectModelUsingText: getCommentIdFromObjectModelUsingText,
	getCommentIndexFromCanvasUsingText: getCommentIndexFromCanvasUsingText,
	getEventLogCount: getEventLogCount,
	getLinkEventCount: getLinkEventCount,
	getNodeIdFromObjectModel: getNodeIdFromObjectModel,
	getObjectModelCount: getObjectModelCount,
	getPortLinks: getPortLinks,
	isObjectModelEmpty: isObjectModelEmpty,
	getNodeIdForLabel: getNodeIdForLabel,
	clickSVGAreaAt: clickSVGAreaAt,
	findNodeIndexInPalette: findNodeIndexInPalette,
	findCategoryElement: findCategoryElement,
	getSummaryFromName: getSummaryFromName,
	getControlContainerFromName: getControlContainerFromName
};
