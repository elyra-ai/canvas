/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2017
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/
import { getEventLogCount, getObjectModelCount } from "./utilities/validateUtil.js";
import { getHarnessData } from "./utilities/HTTPClient.js";
import { simulateDragDrop } from "./utilities/DragAndDrop.js";

/* global browser */

module.exports = function() {
	const testUrl = process.env.UI_TEST_URL;
	const getCanvasUrl = testUrl + "/v1/test-harness/canvas";
	const getEventLogUrl = testUrl + "/v1/test-harness/events";

	// Then I add comment 1 at location 150, 250 for link 3 on the canvas with the text "This comment box should be linked to the derive node."
	//
	this.Then(/^I add comment (\d+) at location (\d+), (\d+) with the text "([^"]*)"$/,
	function(commentIndex, canvasX, canvasY, comment) {
		// create the comment
		browser.rightClick(".svg-canvas", Number(canvasX), Number(canvasY));
		browser.$(".context-menu-popover").$$(".react-context-menu-item")[0].$(".react-context-menu-link").click();

		// add the value to the comment
		var index = Number(commentIndex) - 1;
		var specificComment = browser.$$("textarea")[index];
		browser.pause(500);
		specificComment.doubleClick();
		browser.pause(1000);
		specificComment.setValue("", comment);
		browser.pause(500);
		browser.leftClick("#common-canvas", 400, 400);

		// Start Validation
		browser.pause(500);
		// verify commentis in the canvas DOM
		var commentValue = browser.$("#common-canvas").$$("textarea")[index].getValue();
		expect(commentValue).toEqual(comment);

		// verify that the comment is in the internal object model
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
	function(commentIndex, nodeName, comment) {
		var commentNumber = commentIndex - 1;
		browser.$("#common-canvas").$$(".comment-inner-box")[commentNumber].rightClick();
		browser.$(".context-menu-popover").$$(".react-context-menu-item")[0].$(".react-context-menu-link").click();

		// Start Validation
		browser.pause(1000);
		// verify comment is not in the canvas DOM
		var count = 0;
		var commentElements = browser.$("#common-canvas").$$("textarea");
		for (var idx = 0; idx < commentElements.length; idx++) {
			if (commentElements[idx] === comment) {
				count++;
			}
		}
		expect(count).toEqual(commentNumber);

		// verify that the comment is in the internal object model
		browser.timeoutsAsyncScript(5000);
		var objectModel = browser.executeAsync(getHarnessData, getCanvasUrl);
		var returnVal = browser.execute(getObjectModelCount, objectModel.value, "comments", comment);
		expect(returnVal.value).toBe(0);

		// verify that an event for a deleted comment is in the external object model event log
		var eventLog = browser.executeAsync(getHarnessData, getEventLogUrl);
		returnVal = browser.execute(getEventLogCount, eventLog.value, "action: deleteObjects", 	comment);
		expect(returnVal.value).toBe(1);
	});

	// Then I move comment 1 onto the canvas by 50, 50
	// this moves the comment a delta of x +50px and y +50px
	//
	this.Then(/^I move comment (\d+) onto the canvas by \-?(\d+), \-?(\d+)$/,
		function(nodeIndex, canvasX, canvasY) {
			var nodeNumber = nodeIndex - 1;
			browser.execute(simulateDragDrop, ".comment-inner-box", nodeNumber, "#canvas-div", 0, canvasX, canvasY);
		});

};
