/*
 * Copyright 2017-2023 Elyra Authors
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
import * as testUtils from "../../utils/eventlog-utils";

describe("Test of notification center message API", function() {
	beforeEach(() => {
		cy.visit("/");
	});

	it("Test notification message callback, custom content, dismiss, and clear all", function() {
		cy.openCanvasAPI("Add Notification Message");

		cy.verifyNotificationCounter(0);
		cy.verifyNotificationMessagesLength(0);
		cy.verifyNotificationIconType();

		cy.clickToolbarNotifications();

		cy.generateNotificationMessage("info", true, true, false);
		cy.verifyLatestNotificationMessage(1, "info", true);
		cy.clickNotificationAtIndex(0);
		verifyNotificationMessagesCallbackInConsole("harness-message-0");

		cy.generateNotificationMessage("success", true, true, true);
		cy.verifyLatestNotificationMessage(2, "success", false);

		cy.generateNotificationMessage("warning", false, true, false);
		cy.verifyLatestNotificationMessage(3, "warning", false);
		cy.clickNotificationAtIndex(2);
		verifyNotificationMessagesCallbackInConsole("harness-message-2");

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
	beforeEach(() => {
		cy.visit("/");
	});

	it("Test proper rendering of notification center components", function() {
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

function verifyNotificationMessagesCallbackInConsole(id) {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastEventLogData(doc);
		expect(lastEventLog.event).to.equal("Notification Message Callback");
		if (id) {
			expect(lastEventLog.data).to.equal("Message " + id + " was clicked.");
		}
	});
}
