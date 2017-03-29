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
import { getLinkEventCount, getObjectModelCount } from "./utilities/validateUtil.js";
import { getHarnessData } from "./utilities/HTTPClient.js";
import { simulateDragDrop } from "./utilities/DragandDrop.js";

/* global browser */

module.exports = function() {
	const testUrl = process.env.TESTURL;
	const getCanvasUrl = testUrl + "/v1/test-harness/canvas";
	const getEventLogUrl = testUrl + "/v1/test-harness/events";

	// ------------------------------------
	//   Test Cases
	// -------------------------------------

	// Then I link node 1 the "Var. File" node to node 2 the "Derive" node for link 1 on the canvas
	// The canvasLinks arg should include the number of comment links in addition to data links.
	this.Then(/^I link node (\d+) the "([^"]*)" node to node (\d+) the "([^"]*)" node for link (\d+) on the canvas$/,
  function(srcNodeIndex, srcNodeName, destNodeIndex, destNodeName, canvasLinks) {
	var orgNodeNumber = srcNodeIndex - 1;
	var destNodeNumber = destNodeIndex - 1;
	browser.execute(simulateDragDrop, ".node-circle", orgNodeNumber, ".node-inner-circle", destNodeNumber, 1, 1);

	// Start Validation
	var linkCount = Number(canvasLinks);
	browser.pause(500);
	// verify link is in the canvas DOM
	var dataLinks = browser.$$(".canvas-data-link").length;
	var commentLinks = browser.$$(".canvas-comment-link").length;
	expect(dataLinks + commentLinks).toEqual(Number(linkCount));

	// verify that the link is in the internal object model
	browser.timeoutsAsyncScript(5000);
	var objectModel = browser.executeAsync(getHarnessData, getCanvasUrl);
	var returnVal = browser.execute(getObjectModelCount, objectModel.value, "links", linkCount);
	expect(returnVal.value).toBe(linkCount);

	// verify that an event for a new link is in the external object model event log
	var eventLog = browser.executeAsync(getHarnessData, getEventLogUrl);
	returnVal = browser.execute(getLinkEventCount, eventLog.value, "editActionHandler() linkNodes");
	// @Todo =========================================
	// this has to be comment out due to issue 110
	// expect(returnVal.value).toBe(linkCount);
});

	this.Then(/^I link comment (\d+) to node (\d+) the "([^"]*)" node for link (\d+) on the canvas$/,
	function(commentNumber, nodeNumber, nodeName, canvasLinks) {
		var commentIndex = commentNumber - 1;
		var nodeIndex = nodeNumber - 1;
		browser.execute(simulateDragDrop, ".comment-box", commentIndex, ".node-inner-circle", nodeIndex, 1, 1);

		// Start Validation
		var linkCount = Number(canvasLinks);
		browser.pause(500);
		// verify link is in the canvas DOM
		var dataLinks = browser.$$(".canvas-data-link").length;
		var commentLinks = browser.$$(".canvas-comment-link").length;
		expect(dataLinks + commentLinks).toEqual(Number(linkCount));

		// verify that the link is in the internal object model
		browser.timeoutsAsyncScript(5000);
		var objectModel = browser.executeAsync(getHarnessData, getCanvasUrl);
		var returnVal = browser.execute(getObjectModelCount, objectModel.value, "links", linkCount);
		expect(returnVal.value).toBe(linkCount);

		// verify that an event for a new link is in the external object model event log
		var eventLog = browser.executeAsync(getHarnessData, getEventLogUrl);
		returnVal = browser.execute(getLinkEventCount, eventLog.value, "editActionHandler() linkNodes");
		// @Todo =========================================
		// this has to be comment out due to issue 110
		// expect(returnVal.value).toBe(linkCount);
	});

	// Then I delete link between comment 1 and node 1 the "Derive" node
	this.Then(/^I delete comment link at (\d+), (\d+) between comment (\d+) and node (\d+) the "([^"]*)" node$/,
	function(linkX, linkY, sourceIndex, destinationIndex, destinationName) {
		// delete the link
		browser.rightClick(".svg-canvas", Number(linkX), Number(linkY));
		browser.$(".context-menu-popover").$$(".react-context-menu-item")[0].$(".react-context-menu-link").click();

		// @Todo =========================================
		// validate that the link is gone
	});

	// Then I delete link between node 1 the "Filter" node and node 2 the "Type" node
	this.Then(/^I delete node link at (\d+), (\d+) between node (\d+) the "([^"]*)" node and node (\d+) the "([^"]*)" node$/,
	function(linkX, linkY, sourceIndex, sourceName, destinationIndex, destinationName) {
		// delete the link
		browser.rightClick(".svg-canvas", Number(linkX), Number(linkY));
		browser.$(".context-menu-popover").$$(".react-context-menu-item")[0].$(".react-context-menu-link").click();

		// @Todo =========================================
		// validate that the link is gone
	});

	// Then I validate there are 6 links on the canvas
	this.Then(/^I validate there are (\d+) links on the canvas$/, function(canvasLinks) {
		// Start Validation
		var linkCount = Number(canvasLinks);
		browser.pause(2000);
		// verify link is in the canvas DOM
		var dataLinks = browser.$$(".canvas-data-link").length;
		var commentLinks = browser.$$(".canvas-comment-link").length;
		expect(dataLinks + commentLinks).toEqual(Number(linkCount));

		// verify that the link is in the internal object model
		browser.timeoutsAsyncScript(5000);
		var objectModel = browser.executeAsync(getHarnessData, getCanvasUrl);
		var returnVal = browser.execute(getObjectModelCount, objectModel.value, "links", linkCount);
		if (returnVal.value !== linkCount) {
			// console.log(objectModel.value);
		}
		expect(returnVal.value).toBe(linkCount);

		// verify that an event for a new link is in the external object model event log
		var eventLog = browser.executeAsync(getHarnessData, getEventLogUrl);
		returnVal = browser.execute(getLinkEventCount, eventLog.value, "editActionHandler() linkNodes");
		// @Todo =========================================
		// this has to be comment out due to issue 110
		// expect(returnVal.value).toBe(linkCount);
	});
};
