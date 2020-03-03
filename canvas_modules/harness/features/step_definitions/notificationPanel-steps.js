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

import testUtils from "./utilities/test-utils.js";

/* global browser */

module.exports = function() {
	this.Then(/^I verify the the notification panel has (\d+) messages$/, function(numMessages) {
		const counterText = browser.$(".notificationCounterIcon").$(".text-content")
			.getText();
		if (Number(numMessages) === 0) {
			expect(browser.$$(".notification-panel-messages").length).toEqual(0);
			expect(counterText).toEqual("0");
		} else {
			const notificationMessages = browser.$(".notification-panel-messages").$$(".notifications-button-container");
			expect(notificationMessages.length).toEqual(Number(numMessages));
			if (Number(numMessages) > 9) {
				expect(counterText).toEqual("9+");
			} else {
				expect(counterText).toEqual(numMessages);
			}
		}
	});

	this.Then(/^I verify the the content of the notification message at index (\d+) is of type "([^"]*)"$/, function(messageIdx, messageType) {
		const notificationMessages = browser.$(".notification-panel-messages").$$(".notifications-button-container");
		let messageTypeFound = false;

		if (notificationMessages[messageIdx].$("." + messageType)) {
			messageTypeFound = true;
		}
		expect(messageTypeFound).toEqual(true);
	});

	this.Then(/^I verify the the content of the notification message at index (\d+) contains text "([^"]*)"$/, function(messageIdx, messageText) {
		const notificationMessages = browser.$(".notification-panel-messages").$$(".notifications-button-container");
		const messageDetails = notificationMessages[messageIdx].$(".notification-message-details");
		let messageTextFound = false;

		if (messageDetails.getText().indexOf(messageText) > -1) {
			messageTextFound = true;
		}
		expect(messageTextFound).toEqual(true);
	});

	this.Then(/^I verify the the content of the notification message at index (\d+) contains timestamp$/, function(messageIdx) {
		const notificationMessages = browser.$(".notification-panel-messages").$$(".notifications-button-container");
		const messageDetails = notificationMessages[messageIdx].$(".notification-message-details");
		expect(messageDetails.$$(".notification-message-timestamp-icon").length).toEqual(1);
		expect(messageDetails.$$(".notification-message-string").length).toEqual(1);
	});

	this.Then(/^I verify the the content of the notification message at index (\d+) contains custom content "([^"]*)"$/, function(messageIdx, customDiv) {
		const notificationMessages = browser.$(".notification-panel-messages").$$(".notifications-button-container");
		const messageDetails = notificationMessages[messageIdx].$(".notification-message-details");
		expect(messageDetails.$$(customDiv).length > 0).toEqual(true);
	});

	this.Then(/^I click the notification message at index (\d+)$/, function(messageIdx) {
		const notificationMessages = browser.$(".notification-panel-messages").$$(".notifications-button-container");
		notificationMessages[messageIdx].click();
	});

	this.Then(/^I verify the event log of event type "([^"]*)" has data "([^"]*)"$/, function(eventType, data) {
		const lastEventLog = testUtils.getLastLogOfType(eventType);
		expect(lastEventLog.data).toEqual(data);
	});

	this.Then(/^I click the notification message link at index (\d+)$/, function(messageIdx) {
		const notificationMessages = browser.$(".notification-panel-messages").$$(".notifications-button-container");
		const messageDetails = notificationMessages[messageIdx].$(".notification-message-details");
		messageDetails.$("a").click();
	});

	this.Then(/^I verify the browser has (\d+) tabs$/, function(numTabs) {
		const tabIds = browser.getTabIds();
		expect(tabIds.length).toEqual(Number(numTabs));
	});

	this.Then("I switch focus back to main tab", function() {
		browser.switchTab(browser.getCurrentTabId());
	});

	this.Then("I close the notification panel by clicking on the canvas", function() {
		browser.leftClick("#common-canvas-items-container-0", 400, 400);
	});

	this.Then("I verify the notification panel is closed", function() {
		const notificationPanel = browser.$$(".notification-panel-container.panel-hidden");
		expect(notificationPanel.length).toEqual(1);
	});
};
