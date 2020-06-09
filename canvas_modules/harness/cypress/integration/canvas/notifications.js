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

describe("Test of notification center message API", function() {
	before(() => {
		cy.visit("/");
	});

	it("Sanity test notification message callback, custom content, dismiss, and clear all", function() {
		cy.openCanvasAPI("Add Notification Message");

		cy.verifyNotificationCounter(0);
		cy.verifyNotificationMessagesLength(0);
		cy.verifyNotificationIconType();

		cy.clickToolbarNotifications();

		cy.generateNotificationMessage("info", true, true, false);
		cy.verifyLatestNotificationMessage(1, "info", true);
		cy.verifyNotificationMessagesCallbackInConsole(0, "harness-message-0");

		cy.generateNotificationMessage("success", true, true, true);
		cy.verifyLatestNotificationMessage(2, "success", false);

		cy.generateNotificationMessage("warning", false, true, false);
		cy.verifyLatestNotificationMessage(3, "warning", false);
		cy.verifyNotificationMessagesCallbackInConsole(2, "harness-message-2");

		cy.generateNotificationMessage("error", true, true, false);
		cy.verifyLatestNotificationMessage(4, "error", true);

		cy.dismissNotificationMessage(3);
		cy.verifyLatestNotificationMessage(3, "warning", false);

		cy.dismissNotificationMessage(1);
		cy.verifyLatestNotificationMessage(2, "warning", false);

		cy.clearAllNotificationMessages();

		cy.verifyNotificationCounter(0);
		cy.verifyNotificationMessagesLength(0);
		cy.verifyNotificationIconType();

	});
});

describe("Test of notification center configuration", function() {
	before(() => {
		cy.visit("/");
	});

	it("Sanity test proper rendering of notification center components", function() {
		cy.toggleCommonCanvasSidePanel();

		cy.verifyNotificationCenterHidden(true);
		cy.clickToolbarNotifications();
		cy.verifyNotificationCenterHidden(false);

		cy.clickOutsideNotificationPanel();
		cy.verifyNotificationCenterHidden(false);

		cy.setNotificationCenterContent("notificationHeader", "test header");
		cy.verifyNotificationCenterContent("header", "test header");

		cy.clearNotificationCenterContent("notificationHeader");
		cy.verifyNotificationCenterContent("header", "Notifications");

		cy.setNotificationCenterContent("notificationSubtitle", "test subtitle");
		cy.verifyNotificationCenterContent("subtitle", "test subtitle");

		cy.clearNotificationCenterContent("notificationSubtitle");
		cy.verifyNotificationCenterContent("subtitle");

		cy.setNotificationCenterContent("emptyMessage", "test empty message");
		cy.verifyNotificationCenterContent("empty-message", "test empty message");

		cy.clearNotificationCenterContent("emptyMessage");
		cy.verifyNotificationCenterContent("empty-message", "");

		cy.setNotificationCenterContent("clearAllMessage", "test clear all");
		cy.verifyNotificationCenterContent("clear-all", "test clear all");

		cy.clearNotificationCenterContent("clearAllMessage");
		cy.verifyNotificationCenterContent("clear-all");

	});
});
