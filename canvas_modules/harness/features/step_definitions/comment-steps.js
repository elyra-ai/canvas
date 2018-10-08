/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint no-console: "off" */
/* eslint sort-imports: "off" */

import { getCanvasData, getEventLogData } from "./utilities/test-utils.js";
import { addTextForComment, getCommentIdForText, getCommentIdForTextInSubFlow,
	getCommentIdForTextInSubFlowInSubFlow,
	getCommentIdFromObjectModelUsingText, getCommentIndexFromCanvasUsingText,
	getEventLogCount, getObjectModelCount } from "./utilities/validate-utils.js";
import isEqual from "lodash/isEqual";
import { simulateDragDrop } from "./utilities/dragAndDrop-utils.js";

/* global browser */

module.exports = function() {

	// Then I add comment 1 at location 150, 250 for link 3 on the canvas with the text "This comment box should be linked to the derive node."
	//
	this.Then(/^I add comment (\d+) at location (\d+), (\d+) with the text "([^"]*)"$/,
		function(commentIndex, canvasX, canvasY, comment) {
			var specificComment;

			// create the comment
			const previousComments = browser.$$(".comment-group");
			browser.rightClick(".svg-area", Number(canvasX), Number(canvasY));
			browser.$(".context-menu-popover").$$(".react-contextmenu-item")[0].click(); // Click 'Add Comment' option
			const newComments = browser.$$(".comment-group");

			// Find the new comment that was added by comparing new comment list with old (previous)
			for (let idx = 0; idx < newComments.length; idx++) {
				const index = previousComments.findIndex((prevCom) => isEqual(prevCom, newComments[idx]));
				if (index === -1) {
					specificComment = newComments[idx];
				}
			}
			specificComment.click(); // Need to select the comment to allow the double click to work in next step
			specificComment.doubleClick();
			specificComment.$("textarea").keys(comment); // The text area is created by double click

			browser.leftClick("#common-canvas-items-container-0", 400, 400);

			// Start Validation
			browser.pause(500);
			// verify commentis in the canvas DOM
			var commentValue;
			// We cannot rely on index position of comments because they get messed up
			// when pushing comments to be underneath nodes and links. Therefore we look for the
			// text of the comment being deleted.
			var comIndex = getCommentIndexFromCanvasUsingText(comment);
			commentValue = browser.$("#common-canvas-items-container-0").$$(".comment-group")[comIndex].getAttribute("textContent");
			expect(commentValue).toEqual(comment);

			// verify that the comment is in the internal object model
			var objectModel = getCanvasData();
			var returnVal = browser.execute(getObjectModelCount, objectModel, "comments", comment);
			expect(returnVal.value).toBe(1);

			// verify that an event for a new comment is in the external object model event log
			var eventLog = getEventLogData();
			returnVal = browser.execute(getEventLogCount, eventLog, "editActionHandler() editComment", comment);
			expect(returnVal.value).toBe(1);
		});

	// Then I delete comment 1 linked to the "Derive" node with the comment text "This comment box should be linked to the derive node."
	//
	this.Then(/^I delete comment (\d+) linked to the "([^"]*)" node with the comment text "([^"]*)"$/,
		function(commentIndex, nodeName, commentText) {
			var commentNumber = commentIndex - 1;
			// We cannot rely on index position of comments because they get messed up
			// when pushing comments to be underneath nodes and links. Therefore we look for the
			// text of the comment being deleted.
			var index = getCommentIndexFromCanvasUsingText(commentText);
			browser.$("#common-canvas-items-container-0").$$(".comment-group")[index].rightClick();
			browser.$(".context-menu-popover").$$(".react-contextmenu-item")[0].click();
			// Start Validation
			browser.pause(500);
			// verify comment is not in the canvas DOM
			var count = 0;
			var commentElements;
			commentElements = browser.$("#common-canvas-items-container-0").$$(".comment-group");
			for (let idx = 0; idx < commentElements.length; idx++) {
				if (commentElements[idx].getAttribute("textContent") === commentText) {
					count++;
				}
			}

			expect(count).toEqual(commentNumber);

			// verify that the comment is in the internal object model
			var objectModel = getCanvasData();
			var returnVal = browser.execute(getObjectModelCount, objectModel, "comments", commentText);
			expect(returnVal.value).toBe(0);

			// verify that an event for a deleted comment is in the external object model event log
			var eventLog = getEventLogData();
			returnVal = browser.execute(getEventLogCount, eventLog, "action: deleteObjects", 	commentText);
			expect(returnVal.value).toBe(1);
		});

	// Then I move comment 1 onto the canvas by 50, 50
	// this moves the comment a delta of x +50px and y +50px
	//
	this.Then(/^I move comment (\d+) with text "([^"]*)" onto the canvas by -?(\d+), -?(\d+)$/,
		function(commentIndex, commentText, canvasX, canvasY) {
			// We cannot rely on index position of comments because they get messed up
			// when pushing comments to be underneath nodes and links. Therefore we look for the
			// text of the comment being deleted.
			var index = getCommentIndexFromCanvasUsingText(commentText);
			browser.execute(simulateDragDrop, ".comment-group", index, "#canvas-div-0", 0, canvasX, canvasY);
		});

	// Then I edit comment 1 linked to the "Derive" node with the comment text "This comment box should be linked to the derive node."
	//
	this.Then(/^I edit comment (\d+) with the comment text "([^"]*)"$/,
		function(commentNumber, commentText) {
			try {
				var comment;
				comment = browser.$$(".comment-group")[0];
				comment.click();
				comment.doubleClick();
				// workaround since setValue isn't working with comments.
				// keys is deprecated and might not work in latest version of firefox
				for (let indx = 0; indx < 60; ++indx) {
					comment.$("textarea").keys("Backspace");
				}
				comment.$("textarea").keys(commentText);

				browser.pause(1500);
				browser.leftClick("#common-canvas-items-container-0", 400, 400);

				// verify the comment is in the internal object model
				browser.timeouts("script", 5000);
				var objectModel = getCanvasData();
				var returnVal = browser.execute(getCommentIdFromObjectModelUsingText, objectModel, commentText);
				expect(returnVal.value).not.toBe(-1);


			} catch (err) {
				console.log("Error = " + err);
				throw err;
			}

		});

	// Then I edit the comment with text "abc" with text "def"
	//
	this.Then(/^I edit the comment "([^"]*)" with text "([^"]*)"$/,
		function(originalComment, newCommentText) {
			try {
				const comId = getCommentIdForText(originalComment);
				addTextForComment(comId, newCommentText);

			} catch (err) {
				console.log("Error = " + err);
				throw err;
			}
		});

	// Then I edit the comment with text "abc" in the subflow with text "def"
	//
	this.Then(/^I edit the comment "([^"]*)" in the subflow with text "([^"]*)"$/,
		function(originalComment, newCommentText) {
			try {
				const comId = getCommentIdForTextInSubFlow(originalComment);
				addTextForComment(comId, newCommentText);

			} catch (err) {
				console.log("Error = " + err);
				throw err;
			}
		});

	// Then I edit the comment with text "abc" in the subflow in the subflow with text "def"
	//
	this.Then(/^I edit the comment "([^"]*)" in the subflow in the subflow with text "([^"]*)"$/,
		function(originalComment, newCommentText) {
			try {
				const comId = getCommentIdForTextInSubFlowInSubFlow(originalComment);
				addTextForComment(comId, newCommentText);

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
			browser.timeouts("script", 5000);
			var objectModel = getCanvasData();
			var returnVal = browser.execute(getObjectModelCount, objectModel, "comments", "");
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

	this.Then(/^I click the comment with text "([^"]*)" to select it$/, function(commentText) {
		const comIndex = getCommentIndexFromCanvasUsingText(commentText);
		const commentId = browser.$("#common-canvas-items-container-0").$$(".comment-group")[comIndex].getAttribute("id");
		var cmntSelector = "#" + commentId;
		browser.$(cmntSelector).click();
	});

	this.Then(/^I right click the comment with text "([^"]*)" to open the context menu$/, function(commentText) {
		const comIndex = getCommentIndexFromCanvasUsingText(commentText);
		const commentId = browser.$("#common-canvas-items-container-0").$$(".comment-group")[comIndex].getAttribute("id");
		var cmntSelector = "#" + commentId;
		browser.$(cmntSelector).rightClick();
	});

	this.Then(/^I verify comment (\d+) with the comment text "([^"]*)"$/, function(commentNumber, commentText) {
		try {
			var commentContent = browser.$$(".d3-comment-text")[0];
			var commentContentTxt = commentContent.getText();
			commentContentTxt = commentContentTxt.replace("\n", "");
			commentContentTxt = commentContentTxt.replace("\r", "");
			expect(commentText).toEqual(commentContentTxt);

			// verify the comment is in the internal object model
			browser.timeouts("script", 5000);
			var objectModel = getCanvasData();
			var returnVal = browser.execute(getCommentIdFromObjectModelUsingText, objectModel, commentText);
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
