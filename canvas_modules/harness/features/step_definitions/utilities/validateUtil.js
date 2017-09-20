/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/


/* global browser */

// find the number of link events in event log
//
function containLinkEvent(eventLog, srcNodeId, destNodeId, eventType) {
	var count = 0;
	var elJson = JSON.parse(eventLog);
	var eventData = srcNodeId + " to " + destNodeId;
	for (var idx = 0; idx < elJson.length; idx++) {
		if (elJson[idx].event === eventType &&
			(elJson[idx].data === eventData)) {
			count++;
		}
	}
	return count;
}

// find the number of links in object model that have source and destination ids.
//
function containLinkInObjectModel(objectModel, srcNodeId, destNodeId) {
	var count = 0;
	var omJson = JSON.parse(objectModel);
	var links = omJson.links;
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
	var omJson = JSON.parse(objectModel);
	var links = omJson.links;
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
	var omJson = JSON.parse(objectModel);
	return omJson.comments[commentIndex].id;
}

// return the comment id from the object model
//
function getCommentIdFromObjectModelUsingText(objectModel, commentText) {
	var omJson = JSON.parse(objectModel);
	var id = -1;
	omJson.comments.forEach(function(com) {
		if (com.content === commentText) {
			id = com.id;
		}
	});
	return id;
}

// For D3, we cannot rely on index position of comments because they get messed up
// when pushing comments to be underneath nodes and links. Therefore we look for the
// text of the comment being deleted.
function getCommentIndexFromCanvasUsingText(commentText) {
	var commentElements = browser.$("#common-canvas").$$(".comment-group");
	var comIndex = 0;
	for (let idx = 0; idx < commentElements.length; idx++) {
		if (commentElements[idx].getAttribute("textContent") === commentText) {
			comIndex = idx;
		}
	}
	return comIndex;
}

// count the number of events in event log
//
function getEventLogCount(eventLog, eventType, eventData) {
	var count = 0;
	var elJson = JSON.parse(eventLog);
	for (var idx = 0; idx < elJson.length; idx++) {
		if (elJson[idx].event === eventType &&
			(elJson[idx].data === eventData ||
			elJson[idx].content === eventData)) {
			count++;
		}
	}
	return count;
}

// count the number of link event types in the event log
//
function getLinkEventCount(eventLog, eventType) {
	var elJson = JSON.parse(eventLog);
	var count = 0;
	for (var idx = 0; idx < elJson.length; idx++) {
		if (elJson[idx].event === eventType) {
			count++;
		}
	}
	return count;
}

// get the node id from the object model
//
function getNodeIdFromObjectModel(objectModel, nodeIndex) {
	var omJson = JSON.parse(objectModel);
	return omJson.nodes[nodeIndex].id;
}

// get a count of the number of object types in the object model
//
/* eslint complexity: [2, 15] */
function getObjectModelCount(objectModel, type, compare) {
	var count = 0;
	var omJson = JSON.parse(objectModel);
	if (type === "nodes") {
		var nodes = omJson.nodes;
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
		var comments = omJson.comments;
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
		var links = omJson.links;
		count = links.length;
	} else if (type === "datalinks") {
		var datalinks = omJson.links;
		datalinks.forEach(function(datalink) {
			if (datalink.class_name === "canvas-data-link") {
				count++;
			}
		});
	} else if (type === "commentLinks") {
		var commentlinks = omJson.links;
		commentlinks.forEach(function(commentlink) {
			if (commentlink.class_name === "canvas-comment-link") {
				count++;
			}
		});
	}
	return count;
}

// determine if all the nodes, comments and links are empty in the object model
//
function isObjectModelEmpty(objectModel) {
	var omJson = JSON.parse(objectModel);
	var count = omJson.nodes.length +
							omJson.comments.length +
							omJson.links.length;
	return count;
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
	isObjectModelEmpty: isObjectModelEmpty
};
