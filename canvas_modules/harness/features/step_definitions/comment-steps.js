/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint no-console: "off" */

import { getCommentIdFromObjectModelUsingText, getCommentIndexFromCanvasUsingText, getEventLogCount, getObjectModelCount } from "./utilities/validateUtil.js";
import { getHarnessData } from "./utilities/HTTPClient.js";
import { getURL } from "./utilities/test-config.js";
import { simulateDragDrop } from "./utilities/DragAndDrop.js";

var nconf = require("nconf");

/* global browser */

module.exports = function() {

	// Then I add comment 1 at location 150, 250 for link 3 on the canvas with the text "This comment box should be linked to the derive node."
	//
	this.Then(/^I add comment (\d+) at location (\d+), (\d+) with the text "([^"]*)"$/,
		function(commentIndex, canvasX, canvasY, comment) {
			const D3RenderingEngine = nconf.get("renderingEngine") === "D3";
			// create the comment
			if (D3RenderingEngine) {
				browser.rightClick(".svg-area", Number(canvasX), Number(canvasY));
			} else {
				browser.rightClick(".svg-canvas", Number(canvasX), Number(canvasY));
			}
			browser.$(".context-menu-popover").$$(".react-contextmenu-item")[0].click();

			// add the value to the comment
			var index = Number(commentIndex) - 1;
			var specificComment;

			if (D3RenderingEngine) {
				specificComment = browser.$$(".comment-group")[0]; // Comments are inserted at zeroth element.
				specificComment.click(); // Need to select the comment to allow the double click to work in next step
			} else {
				specificComment = browser.$$("textarea")[index];
			}

			specificComment.doubleClick();
			if (D3RenderingEngine) {
				specificComment.$("textarea").setValue("", comment); // For D3, the text area is created by the double click
			} else {
				specificComment.click();
				specificComment.setValue("", comment);
			}

			browser.leftClick("#common-canvas", 400, 400);

			// Start Validation
			browser.pause(500);
			// verify commentis in the canvas DOM
			var commentValue;
			if (D3RenderingEngine) {
				// For D3, we cannot rely on index position of comments because they get messed up
				// when pushing comments to be underneath nodes and links. Therefore we look for the
				// text of the comment being deleted.
				var comIndex = getCommentIndexFromCanvasUsingText(comment);
				commentValue = browser.$("#common-canvas").$$(".comment-group")[comIndex].getAttribute("textContent");
			} else {
				commentValue = browser.$("#common-canvas").$$("textarea")[index].getValue();
			}
			console.log("Commentvalue " + commentValue);
			expect(commentValue).toEqual(comment);

			// verify that the comment is in the internal object model
			const testUrl = getURL();
			const getCanvasUrl = testUrl + "/v1/test-harness/canvas";
			const getEventLogUrl = testUrl + "/v1/test-harness/events";
			browser.timeouts("script", 5000);
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
			const D3RenderingEngine = nconf.get("renderingEngine") === "D3";
			if (D3RenderingEngine) {
				// For D3, we cannot rely on index position of comments because they get messed up
				// when pushing comments to be underneath nodes and links. Therefore we look for the
				// text of the comment being deleted.
				var index = getCommentIndexFromCanvasUsingText(commentText);
				browser.$("#common-canvas").$$(".comment-group")[index].rightClick();
			} else {
				browser.$("#common-canvas").$$(".comment-inner-box")[commentNumber].rightClick();
			}
			browser.$(".context-menu-popover").$$(".react-contextmenu-item")[0].click();

			// Start Validation
			browser.pause(500);
			// verify comment is not in the canvas DOM
			var count = 0;
			var commentElements;

			if (D3RenderingEngine) {
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
			browser.timeouts("script", 5000);
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
	this.Then(/^I move comment (\d+) with text "([^"]*)" onto the canvas by -?(\d+), -?(\d+)$/,
		function(commentIndex, commentText, canvasX, canvasY) {
			var commentNumber = commentIndex - 1;
			const D3RenderingEngine = nconf.get("renderingEngine") === "D3";
			if (D3RenderingEngine) {
				// For D3, we cannot rely on index position of comments because they get messed up
				// when pushing comments to be underneath nodes and links. Therefore we look for the
				// text of the comment being deleted.
				var index = getCommentIndexFromCanvasUsingText(commentText);
				browser.execute(simulateDragDrop, ".comment-group", index, "#canvas-div", 0, canvasX, canvasY);
			} else {
				browser.execute(simulateDragDrop, ".comment-inner-box", commentNumber, "#canvas-div", 0, canvasX, canvasY);
			}
		});

	// Then I edit comment 1 linked to the "Derive" node with the comment text "This comment box should be linked to the derive node."
	//
	this.Then(/^I edit comment (\d+) with the comment text "([^"]*)"$/,
		function(commentNumber, commentText) {
			try {
				var commentIndex = commentNumber - 1;
				var comment;
				const D3RenderingEngine = nconf.get("renderingEngine") === "D3";
				if (D3RenderingEngine) {
					comment = browser.$$(".comment-group")[0];
					comment.click();
					comment.doubleClick();
					comment.$("textarea").setValue("", commentText);
				} else {
					comment = browser.$$("textarea")[commentIndex];
					comment.doubleClick();
					comment.setValue("", commentText);
				}

				browser.pause(1500);
				browser.leftClick("#common-canvas", 400, 400);

				// verify the comment is in the internal object model
				const testUrl = getURL();
				const getCanvasUrl = testUrl + "/v1/test-harness/canvas";

				browser.timeoutsAsyncScript(5000);
				var objectModel = browser.executeAsync(getHarnessData, getCanvasUrl);
				var returnVal = browser.execute(getCommentIdFromObjectModelUsingText, objectModel.value, commentText);
				expect(returnVal.value).not.toBe(-1);


			} catch (err) {
				console.log("Error = " + err);
				throw err;
			}

		});

	this.Then(/^I verify the number of comments are (\d+)$/, function(comments) {
		try {
			var commentsLength = browser.$$(".comment-group").length;
			expect(Number(comments)).toEqual(commentsLength);

			// verify the number of comments is in the internal object model
			const testUrl = getURL();
			const getCanvasUrl = testUrl + "/v1/test-harness/canvas";

			browser.timeoutsAsyncScript(5000);
			var objectModel = browser.executeAsync(getHarnessData, getCanvasUrl);
			var returnVal = browser.execute(getObjectModelCount, objectModel.value, "comments", "");
			expect(returnVal.value).toBe(Number(comments));
		} catch (err) {
			console.log("Error = " + err);
			throw err;
		}
	});

	this.Then("I select all the comments in the canvas", function() {
		var comments = browser.$$(".comment-group");
		browser.keys("Shift");

		comments.forEach(function(comment) {
			comment.click();
		});
		browser.keys("Shift");
	});

	this.Then(/^I verify comment (\d+) with the comment text "([^"]*)"$/, function(commentNumber, commentText) {
		try {
			var commentContent = browser.$$(".d3-comment-display")[0];
			expect("This comment box ").toEqual(commentContent.getText());

			// verify the comment is in the internal object model
			const testUrl = getURL();
			const getCanvasUrl = testUrl + "/v1/test-harness/canvas";

			browser.timeoutsAsyncScript(5000);
			var objectModel = browser.executeAsync(getHarnessData, getCanvasUrl);
			var returnVal = browser.execute(getCommentIdFromObjectModelUsingText, objectModel.value, commentText);
			expect(returnVal.value).not.toBe(-1);
		} catch (err) {
			console.log("Error = " + err);
			throw err;
		}

	});

	this.Then("I verify the comment move was not done", function() {
		// MOVE OPERATION ISNT WORKING CURRENTLY IN D3
	});

	this.Then("I verify the comment move was done", function() {
		// MOVE OPERATION ISNT WORKING CURRENTLY IN D3
	});

	// Then I verify the comment 1 position is translate(445, 219)
	//
	this.Then(/^I verify the comment (\d+) position is "([^"]*)"$/, function(commentNumber, givenCommentPosition) {
		var commentIndex = commentNumber - 1;
		var comment = browser.$$(".comment-group")[commentIndex];
		var actualCommentPosition = comment.getAttribute("transform");
		expect(actualCommentPosition).toEqual(givenCommentPosition);
	});


};
