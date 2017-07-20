/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint no-console: "off" */

import { getEventLogCount, getObjectModelCount } from "./utilities/validateUtil.js";
import { getHarnessData } from "./utilities/HTTPClient.js";
import { getRenderingEngine } from "./utilities/test-config.js";
import { getURL } from "./utilities/test-config.js";
import { simulateDragDrop } from "./utilities/DragAndDrop.js";

/* global browser */

module.exports = function() {

	// Then I add comment 1 at location 150, 250 for link 3 on the canvas with the text "This comment box should be linked to the derive node."
	//
	this.Then(/^I add comment (\d+) at location (\d+), (\d+) with the text "([^"]*)"$/,
	function(commentIndex, canvasX, canvasY, comment) {
		// create the comment
		if (getRenderingEngine() === "D3") {
			browser.rightClick(".svg-area", Number(canvasX), Number(canvasY));
		} else {
			browser.rightClick(".svg-canvas", Number(canvasX), Number(canvasY));
		}
		browser.$(".context-menu-popover").$$(".react-context-menu-item")[0].$(".react-context-menu-link").click();

		// add the value to the comment
		var index = Number(commentIndex) - 1;
		var specificComment;

		if (getRenderingEngine() === "D3") {
			specificComment = browser.$$(".comment-group")[0]; // Comments are inserted at zeroth element.
			specificComment.click(); // Need to select the comment to allow the double click to work in next step
		} else {
			specificComment = browser.$$("textarea")[index];
		}

		browser.pause(1000);
		specificComment.doubleClick();
		browser.pause(1000);
		if (getRenderingEngine() === "D3") {
			specificComment.$("textarea").setValue("", comment); // For D3, the text area is created by the double click
		} else {
			specificComment.setValue("", comment);
		}

		browser.pause(500);
		browser.leftClick("#common-canvas", 400, 400);

		// Start Validation
		browser.pause(500);
		// verify commentis in the canvas DOM
		var commentValue;
		if (getRenderingEngine() === "D3") {
			commentValue = browser.$("#common-canvas").$$(".comment-group")[index].getAttribute("textContent");
		} else {
			commentValue = browser.$("#common-canvas").$$("textarea")[index].getValue();
		}
		expect(commentValue).toEqual(comment);

		// verify that the comment is in the internal object model
		const testUrl = getURL();
		const getCanvasUrl = testUrl + "/v1/test-harness/canvas";
		const getEventLogUrl = testUrl + "/v1/test-harness/events";
		browser.timeoutsAsyncScript(5000);
		var objectModel = browser.executeAsync(getHarnessData, getCanvasUrl);
		var returnVal = browser.execute(getObjectModelCount, objectModel.value, "comments", comment);
		expect(returnVal.value).toBe(1);

		// verify that an event for a new comment is in the external object model event log
		var eventLog = browser.executeAsync(getHarnessData, getEventLogUrl);
		returnVal = browser.execute(getEventLogCount, eventLog.value, "editActionHandler() editComment", comment);
		expect(returnVal.value).toBe(1);
	});

	// Then I delete comment 1 linked to the "Derive" node with the comment text "This comment box should be linked to the derive node."
	//
	this.Then(/^I delete comment (\d+) linked to the "([^"]*)" node with the comment text "([^"]*)"$/,
	function(commentIndex, nodeName, commentText) {
		var commentNumber = commentIndex - 1;

		if (getRenderingEngine() === "D3") {
			// For D3, we cannot rely on index position of comments because they get messed up
			// when pushing comments to be underneath nodes and links. Therefore we look for the
			// text of the comment being deleted.
			commentElements = browser.$("#common-canvas").$$(".comment-group");
			var index = 0;
			for (let idx = 0; idx < commentElements.length; idx++) {
				if (commentElements[idx].getAttribute("textContent") === commentText) {
					index = idx;
				}
			}
			browser.$("#common-canvas").$$(".comment-group")[index].rightClick();
		} else {
			browser.$("#common-canvas").$$(".comment-inner-box")[commentNumber].rightClick();
		}
		browser.$(".context-menu-popover").$$(".react-context-menu-item")[0].$(".react-context-menu-link").click();

		// Start Validation
		browser.pause(1000);
		// verify comment is not in the canvas DOM
		var count = 0;
		var commentElements;

		if (getRenderingEngine() === "D3") {
			commentElements = browser.$("#common-canvas").$$(".comment-group");
			for (let idx = 0; idx < commentElements.length; idx++) {
				if (commentElements[idx].getAttribute("textContent") === commentText) {
					count++;
				}
			}
		} else {
			commentElements = browser.$("#common-canvas").$$("textarea");
			for (let idx = 0; idx < commentElements.length; idx++) {
				if (commentElements[idx] === commentText) {
					count++;
				}
			}
		}

		expect(count).toEqual(commentNumber);

		// verify that the comment is in the internal object model
		const testUrl = getURL();
		const getCanvasUrl = testUrl + "/v1/test-harness/canvas";
		const getEventLogUrl = testUrl + "/v1/test-harness/events";
		browser.timeoutsAsyncScript(5000);
		var objectModel = browser.executeAsync(getHarnessData, getCanvasUrl);
		var returnVal = browser.execute(getObjectModelCount, objectModel.value, "comments", commentText);
		expect(returnVal.value).toBe(0);

		// verify that an event for a deleted comment is in the external object model event log
		var eventLog = browser.executeAsync(getHarnessData, getEventLogUrl);
		returnVal = browser.execute(getEventLogCount, eventLog.value, "action: deleteObjects", 	commentText);
		expect(returnVal.value).toBe(1);
	});

	// Then I move comment 1 onto the canvas by 50, 50
	// this moves the comment a delta of x +50px and y +50px
	//
	this.Then(/^I move comment (\d+) with text "([^"]*)" onto the canvas by \-?(\d+), \-?(\d+)$/,
		function(commentIndex, commentText, canvasX, canvasY) {
			var commentNumber = commentIndex - 1;
			if (getRenderingEngine() === "D3") {
				// For D3, we cannot rely on index position of comments because they get messed up
				// when pushing comments to be underneath nodes and links. Therefore we look for the
				// text of the comment being deleted.
				var commentElements = browser.$("#common-canvas").$$(".comment-group");
				var index = 0;
				for (let idx = 0; idx < commentElements.length; idx++) {
					if (commentElements[idx].getAttribute("textContent") === commentText) {
						index = idx;
					}
				}
				browser.execute(simulateDragDrop, ".comment-group", index, "#canvas-div", 0, canvasX, canvasY);
			} else {
				browser.execute(simulateDragDrop, ".comment-inner-box", commentNumber, "#canvas-div", 0, canvasX, canvasY);
			}
		});

};
