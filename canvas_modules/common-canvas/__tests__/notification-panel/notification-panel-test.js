/*
 * Copyright 2017-2025 Elyra Authors
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

import React from "react";
import { Provider } from "react-redux";
import NotificationPanel from "./../../src/notification-panel/notification-panel";
import CanvasController from "./../../src/common-canvas/canvas-controller";

import { createIntlCommonCanvasRTL } from "../_utils_/cc-utils.js";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import sinon from "sinon";
import isEqual from "lodash/isEqual";
import { renderWithIntl } from "../_utils_/intl-utils";
import { fireEvent, waitFor } from "@testing-library/react";

let canvasController = new CanvasController();

const canvasConfig = { enableInternalObjectModel: true };
const toolbarConfig = [{ action: "palette", label: "Palette", enable: true }];
const contextMenuConfig = null;

const contextMenuHandler = sinon.spy();
const beforeEditActionHandler = null; // If set, must reurn data
const editActionHandler = sinon.spy();
const clickActionHandler = sinon.spy();
const decorationActionHandler = sinon.spy();
const selectionChangeHandler = sinon.spy();
const tipHandler = sinon.spy();

const canvasParameters = {};

const notificationHeaderString = "Notifications Panel";

const notificationConfigDefault = {
	action: "notification",
	label: "Notifications Panel",
	enable: true,
	notificationHeader: notificationHeaderString,
};

const notificationMessageCallback = sinon.spy();

const notificationMessage0 = {
	id: "notification-0",
	title: "Notification Message 0",
	type: "info"
};
const notificationMessage1 = {
	id: "notification-1",
	title: "Notification Message 1",
	type: "success",
	content: "Notification message 1 content"
};
const notificationMessage2 = {
	id: "notification-2",
	title: "Notification Message 2",
	type: "warning",
	content: "Notification message 2 content. This second line should wrap to the next line.",
	timestamp: "May 7, 2018"
};
const notificationMessage3 = {
	id: "notification-3",
	title: "Notification Message 3",
	type: "error",
	content: "Notification message 3 content",
	timestamp: "May 7, 2018",
	callback: notificationMessageCallback
};

const notificationMessage4 = {
	id: "notification-4",
	title: "Notification Message 4",
	type: ""
};

const notificationMessage5 = {
	id: "notification-5",
	title: "Notification Message 5",
	type: null
};

const notificationMessage6 = {
	id: "notification-6",
	title: "Notification Message 6"
};

const notificationMessages = [
	notificationMessage0,
	notificationMessage1,
	notificationMessage2,
	notificationMessage3
];

const mockNotificationPanel = jest.fn();
jest.mock("./../../src/notification-panel/notification-panel",
	() => (props) => mockNotificationPanel(props)
);

mockNotificationPanel.mockImplementation((props) => {
	const NotificationPanelComp = jest.requireActual(
		"./../../src/notification-panel/notification-panel",
	).default;
	return <NotificationPanelComp {...props} />;
});

describe("notification panel renders correctly", () => {
	beforeEach(() => {
		canvasController = new CanvasController();
	});

	it("props should have been defined", () => {
		canvasController.setNotificationPanelConfig(notificationConfigDefault);
		canvasController.setNotificationMessages(notificationMessages);
		canvasController.openNotificationPanel();
		const subPanelData = { canvasController };
		const closePanelFn = () => null;

		// Render the component with required props
		renderWithIntl(
			<Provider store={canvasController.getStore()}>
				<NotificationPanel
					notificationConfig={notificationConfigDefault}
					messages={notificationMessages}
					closeSubPanel={closePanelFn}
					subPanelData={subPanelData}
				/>
			</Provider>
		);

		expectJest(mockNotificationPanel).toHaveBeenCalledWith({
			"notificationConfig": notificationConfigDefault,
			"messages": notificationMessages,
			"closeSubPanel": closePanelFn,
			"subPanelData": subPanelData
		});
	});

	it("notification panel should have 4 types of messages", () => {
		const notificationConfig = {
			action: "notification",
			label: "Notifications Panel",
			enable: true,
			notificationHeader: "Custom",
			notificationSubtitle: "Custom subtitle",
			emptyMessage: "custom empty message",
			clearAllMessage: "Clear all"
		};

		canvasController.setNotificationPanelConfig(notificationConfig);
		canvasController.setNotificationMessages(notificationMessages);

		const subPanelData = { canvasController };
		const closePanelFn = () => null;

		const { container } = renderWithIntl(
			<Provider store={canvasController.getStore()}>
				<NotificationPanel
					closeSubPanel={ closePanelFn }
					subPanelData={ subPanelData }
				/>
			</Provider>
		);

		expect(container.getElementsByClassName("notification-panel")).to.have.length(1);
		const messages = container.getElementsByClassName("notifications-button-container");
		expect(messages).to.have.length(4);

		expect(container.querySelectorAll(".notifications.info")).to.have.length(1);

		const message0 = messages[0];
		expect(message0.querySelectorAll(".notifications.info")).to.have.length(1);
		expect(message0.querySelector(".notification-message-content").textContent).to.equal("");
		expect(message0.querySelectorAll(".notification-message-timestamp")).to.have.length(0);

		const message1 = messages[1];
		expect(message1.querySelectorAll(".notifications.success")).to.have.length(1);
		expect(message1.querySelector(".notification-message-content").textContent).to.equal(notificationMessage1.content);
		expect(message1.querySelectorAll(".notification-message-timestamp")).to.have.length(0);

		const message2 = messages[2];
		expect(message2.querySelectorAll(".notifications.warning")).to.have.length(1);
		expect(message2.querySelector(".notification-message-content").textContent).to.equal(notificationMessage2.content);
		expect(message2.querySelectorAll(".notification-message-timestamp-icon")).to.have.length(1);
		expect(message2.querySelector(".notification-message-string").textContent).to.equal("May 7, 2018");

		const message3 = messages[3];
		expect(message3.querySelectorAll(".notifications.clickable.error")).to.have.length(1);
		expect(message3.querySelector(".notification-message-content").textContent).to.equal(notificationMessage3.content);
		expect(message3.querySelectorAll(".notification-message-timestamp-icon")).to.have.length(1);
		expect(message3.querySelector(".notification-message-string").textContent).to.equal("May 7, 2018");
	});

	it("notification panel should have render extra messages if passed in", () => {
		const notificationConfig = {
			action: "notification",
			label: "Notifications Panel",
			enable: true,
			notificationHeader: notificationHeaderString,
			notificationSubtitle: "Custom subtitle",
			emptyMessage: "Custom empty message",
			clearAllMessage: "Clear all"
		};

		canvasController.setNotificationPanelConfig(notificationConfig);
		canvasController.setNotificationMessages([]);

		const subPanelData = { canvasController };
		const closePanelFn = () => null;

		const { container } = renderWithIntl(
			<Provider store={canvasController.getStore()}>
				<NotificationPanel
					closeSubPanel={ closePanelFn }
					subPanelData={ subPanelData }
				/>
			</Provider>
		);

		const subtitle = container.querySelectorAll(".notification-panel .notification-panel-subtitle");
		expect(subtitle).to.have.length(1);
		expect(subtitle[0].textContent).to.eql("Custom subtitle");

		const emptyMessage = container.querySelectorAll(".notification-panel .notification-panel-empty-message");
		expect(emptyMessage).to.have.length(1);
		expect(emptyMessage[0].textContent).to.eql("Custom empty message");

		const clearAll = container.querySelectorAll(".notification-panel button.notification-panel-clear-all");
		expect(clearAll).to.have.length(1);
		expect(clearAll[0].textContent).to.eql("Clear all");
	});
});

describe("canvas controller APIs for notification panel work correctly", () => {
	beforeEach(() => {
		canvasController = new CanvasController();
	});

	it("set messages correctly in canvasController", () => {
		canvasController.setNotificationMessages([]);
		expect(canvasController.getNotificationMessages()).to.eql([]);

		canvasController.setNotificationMessages(notificationMessages);

		// Note: These JSON strings don't indclude the 'callback' property from each message object.
		// console.log(JSON.stringify(canvasController.getNotificationMessages(), null, 2));
		// console.log(JSON.stringify(notificationMessages, null, 2));

		// all these messages already have keys, so no new keys should be generated for them
		expect(areMessagesEqual(canvasController.getNotificationMessages(), notificationMessages)).to.be.true;
	});

	it("get messages correctly in canvasController", () => {
		canvasController.setNotificationMessages(notificationMessages);

		expect(isEqual(canvasController.getNotificationMessages("info"), [notificationMessage0])).to.be.true;
		expect(isEqual(canvasController.getNotificationMessages("success"), [notificationMessage1])).to.be.true;
		expect(isEqual(canvasController.getNotificationMessages("warning"), [notificationMessage2])).to.be.true;
		expect(isEqual(canvasController.getNotificationMessages("error"), [notificationMessage3])).to.be.true;

	});

	it("clear messages correctly in canvasController", () => {
		canvasController.setNotificationMessages(notificationMessages);
		canvasController.clearNotificationMessages();
		expect(isEqual(canvasController.getNotificationMessages(), [])).to.be.true;

	});
});

describe("null, empty string and undefined type messages are handled correctly", () => {
	beforeEach(() => {
		canvasController = new CanvasController();
	});

	it("gets unspecified message correctly if type passed in is an empty string", () => {
		const expectedMessage4 = {
			id: "notification-4",
			title: "Notification Message 4",
			type: "unspecified"
		};
		canvasController.setNotificationMessages([notificationMessage4]);
		expect(canvasController.getNotificationMessages("unspecified")).to.eql([expectedMessage4]);
	});

	it("gets unspecified message correctly if type passed in is null", () => {
		const expectedMessage5 = {
			id: "notification-5",
			title: "Notification Message 5",
			type: "unspecified"
		};
		canvasController.setNotificationMessages([notificationMessage5]);
		expect(canvasController.getNotificationMessages("unspecified")).to.eql([expectedMessage5]);
	});

	it("gets unspecified message correctly if type is not passed in", () => {
		const expectedMessage6 = {
			id: "notification-6",
			title: "Notification Message 6",
			type: "unspecified"
		};
		canvasController.setNotificationMessages([notificationMessage6]);
		expect(canvasController.getNotificationMessages("unspecified")).to.eql([expectedMessage6]);
	});
});

describe("toolbar notification icon state renders correctly", () => {
	beforeEach(() => {
		canvasController = new CanvasController();
	});

	it("notification icon should be empty in toolbar if no messages", async() => {
		const notificationConfig = { action: "notification", label: "Notifications Panel", enable: true, notificationHeader: "Custom" };
		canvasController.openNotificationPanel();
		const { container } = createIntlCommonCanvasRTL(
			canvasConfig,
			contextMenuHandler,
			beforeEditActionHandler,
			editActionHandler,
			clickActionHandler,
			decorationActionHandler,
			selectionChangeHandler,
			tipHandler,
			canvasParameters.showBottomPanel,
			canvasParameters.showRightFlyout,
			canvasParameters.rightFlyoutContent,
			toolbarConfig,
			notificationConfig,
			contextMenuConfig,
			canvasController
		);

		expect(container.querySelectorAll(".notification-panel")).to.have.length(1);
		expect(canvasController.getNotificationMessages().length).to.equal(0);
		expect(container.querySelectorAll(".notification-panel-empty-message-container")).to.have.length(1);

		canvasController.setNotificationMessages([notificationMessage0]);

		await waitFor(() => {
			expect(container.querySelectorAll(".toggleNotificationPanel-action")).to.have.length(1);
			expect(container.querySelectorAll(".notification-panel-empty-message-container")).to.have.length(0);
		});
	});

	it("notification icon should be in correct states in toolbar", async() => {
		const notificationConfig = { action: "notification", label: "Notifications Panel", enable: true, notificationHeader: "Custom" };
		const { container } = createIntlCommonCanvasRTL(
			canvasConfig,
			contextMenuHandler,
			beforeEditActionHandler,
			editActionHandler,
			clickActionHandler,
			decorationActionHandler,
			selectionChangeHandler,
			tipHandler,
			canvasParameters.showBottomPanel,
			canvasParameters.showRightFlyout,
			canvasParameters.rightFlyoutContent,
			toolbarConfig,
			notificationConfig,
			contextMenuConfig,
			canvasController
		);

		canvasController.setNotificationMessages([notificationMessage0]);
		await waitFor(() => {
			const notificationIcon = container.querySelectorAll(".toggleNotificationPanel-action");
			expect(notificationIcon).to.have.length(1);
			expect(container.querySelectorAll(".toolbar-item.notificationCounterIcon.info")).to.have.length(1);
		});

		canvasController.setNotificationMessages([notificationMessage0, notificationMessage1]);

		await waitFor(() => {
			expect(container.querySelectorAll(".toolbar-item.notificationCounterIcon.success")).to.have.length(1);
		});
		canvasController.setNotificationMessages([notificationMessage0, notificationMessage1, notificationMessage2]);
		await waitFor(() => {
			expect(container.querySelectorAll(".toolbar-item.notificationCounterIcon.warning")).to.have.length(1);
		});

		canvasController.setNotificationMessages(notificationMessages);
		await waitFor(() => {
			expect(container.querySelectorAll(".toolbar-item.notificationCounterIcon.error")).to.have.length(1);
		});

		expect(canvasController.getNotificationMessages().length).to.equal(4);

		canvasController.setNotificationMessages([notificationMessage0, notificationMessage1, notificationMessage2]);
		await waitFor(() => {
			expect(container.querySelectorAll(".toolbar-item.notificationCounterIcon.warning")).to.have.length(1);
		});

		canvasController.setNotificationMessages([notificationMessage0, notificationMessage1]);
		await waitFor(() => {
			expect(container.querySelectorAll(".toolbar-item.notificationCounterIcon.success")).to.have.length(1);
		});
		canvasController.setNotificationMessages([notificationMessage0]);
		await waitFor(() => {
			expect(container.querySelectorAll(".toolbar-item.notificationCounterIcon.info")).to.have.length(1);
		});
		canvasController.setNotificationMessages([]);
		// TODO need to fix
		// notificationIcon = wrapper.find(".toggleNotificationPanel-action");
		// expect(notificationIcon).to.have.length(1);
		// expect(notificationIcon.find("svg[type='notificationCounterIcon']")).to.have.length(1);
	});
});

describe("notification counter and color updates correctly", () => {

	beforeEach(() => {
		canvasController = new CanvasController();
	});

	it("notification counter updates correctly", async() => {
		const notificationConfig = { action: "notification", label: "Notifications Panel", enable: true, notificationHeader: "Custom" };
		const { container } = createIntlCommonCanvasRTL(
			canvasConfig,
			contextMenuHandler,
			beforeEditActionHandler,
			editActionHandler,
			clickActionHandler,
			decorationActionHandler,
			selectionChangeHandler,
			tipHandler,
			canvasParameters.showBottomPanel,
			canvasParameters.showRightFlyout,
			canvasParameters.rightFlyoutContent,
			toolbarConfig,
			notificationConfig,
			contextMenuConfig,
			canvasController
		);
		let notificationCounter = container.querySelector(".toolbar-item.notificationCounterIcon .toolbar-text-content");
		expect(notificationCounter.textContent).to.equal(" 0 ");
		canvasController.setNotificationMessages([notificationMessage0]);

		await waitFor(() => {
			const notificationIcon = container.querySelectorAll(".toggleNotificationPanel-action");
			notificationCounter = container.querySelector(".toolbar-item.notificationCounterIcon .toolbar-text-content");
			expect(notificationIcon).to.have.length(1);
			expect(notificationCounter.textContent).to.equal(" 1 ");
			expect(container.querySelectorAll(".toolbar-item.notificationCounterIcon.info")).to.have.length(1);
		});

		canvasController.setNotificationMessages(Array(9).fill(notificationMessage0));

		await waitFor(() => {
			notificationCounter = container.querySelector(".toolbar-item.notificationCounterIcon .toolbar-text-content");
			expect(notificationCounter.textContent).to.equal(" 9 ");
			expect(container.querySelectorAll(".toolbar-item.notificationCounterIcon.info")).to.have.length(1);
		});
		canvasController.setNotificationMessages(Array(10).fill(notificationMessage0));

		await waitFor(() => {
			notificationCounter = container.querySelector(".toolbar-item.notificationCounterIcon .toolbar-text-content");
			expect(notificationCounter.textContent).to.equal(" 9+ ");
			expect(container.querySelectorAll(".toolbar-item.notificationCounterIcon.info")).to.have.length(1);
		});
	});

	it("notification dot updates to indicate the correct message type", async() => {
		const notificationConfig = { action: "notification", label: "Notifications Panel", enable: true, notificationHeader: "Custom" };
		const { container } = createIntlCommonCanvasRTL(
			canvasConfig,
			contextMenuHandler,
			beforeEditActionHandler,
			editActionHandler,
			clickActionHandler,
			decorationActionHandler,
			selectionChangeHandler,
			tipHandler,
			canvasParameters.showBottomPanel,
			canvasParameters.showRightFlyout,
			canvasParameters.rightFlyoutContent,
			toolbarConfig,
			notificationConfig,
			contextMenuConfig,
			canvasController
		);

		let notificationIcon = container.querySelector(".toolbar-item.toggleNotificationPanel-action");
		let indicatorClasses = notificationIcon.className;
		expect(indicatorClasses).to.equal("toolbar-item default toggleNotificationPanel-action notificationCounterIcon");

		canvasController.setNotificationMessages([notificationMessage0]);
		await waitFor(() => {
			notificationIcon = container.querySelector(".toolbar-item.toggleNotificationPanel-action");
			indicatorClasses = notificationIcon.className;
			expect(indicatorClasses).to.equal("toolbar-item default toggleNotificationPanel-action notificationCounterIcon info");
		});

		canvasController.setNotificationMessages([notificationMessage0, notificationMessage1]);
		await waitFor(() => {
			notificationIcon = container.querySelector(".toolbar-item.toggleNotificationPanel-action");
			indicatorClasses = notificationIcon.className;
			expect(indicatorClasses).to.equal("toolbar-item default toggleNotificationPanel-action notificationCounterIcon success");
		});

		canvasController.setNotificationMessages([notificationMessage0, notificationMessage1, notificationMessage2]);
		await waitFor(() => {
			notificationIcon = container.querySelector(".toolbar-item.toggleNotificationPanel-action");
			indicatorClasses = notificationIcon.className;
			expect(indicatorClasses).to.equal("toolbar-item default toggleNotificationPanel-action notificationCounterIcon warning");
		});

		canvasController.setNotificationMessages([notificationMessage0, notificationMessage1, notificationMessage2, notificationMessage3]);
		await waitFor(() => {
			notificationIcon = container.querySelector(".toolbar-item.toggleNotificationPanel-action");
			indicatorClasses = notificationIcon.className;
			expect(indicatorClasses).to.equal("toolbar-item default toggleNotificationPanel-action notificationCounterIcon error");
		});
	});
});

describe("notification center buttons work properly", () => {

	beforeEach(() => {
		canvasController = new CanvasController();
	});

	it("notification clear all button doesn't render when disabled", async() => {
		const notificationConfig = { action: "notification", label: "Notifications Panel", enable: true, notificationHeader: "Custom" };
		const { container } = createIntlCommonCanvasRTL(
			canvasConfig,
			contextMenuHandler,
			beforeEditActionHandler,
			editActionHandler,
			clickActionHandler,
			decorationActionHandler,
			selectionChangeHandler,
			tipHandler,
			canvasParameters.showBottomPanel,
			canvasParameters.showRightFlyout,
			canvasParameters.rightFlyoutContent,
			toolbarConfig,
			notificationConfig,
			contextMenuConfig,
			canvasController
		);
		expect(container.querySelectorAll(".notification-panel")).to.have.length(0);

		// Open the notification center
		const notificationButton = container.querySelector(".toggleNotificationPanel-action button");
		fireEvent.click(notificationButton);
		await waitFor(() => {
			expect(container.querySelectorAll(".notification-panel")).to.have.length(1);

			// Check that there is no clear all button
			expect(container.querySelectorAll(".notification-panel button.notification-panel-clear-all")).to.have.length(0);
		});
	});

	it("notification clear all button renders and works when enabled", async() => {
		const notificationConfig = { action: "notification", label: "Notifications Panel", enable: true, notificationHeader: "Custom", clearAllMessage: "clear all" };
		const { container } = createIntlCommonCanvasRTL(
			canvasConfig,
			contextMenuHandler,
			beforeEditActionHandler,
			editActionHandler,
			clickActionHandler,
			decorationActionHandler,
			selectionChangeHandler,
			tipHandler,
			canvasParameters.showBottomPanel,
			canvasParameters.showRightFlyout,
			canvasParameters.rightFlyoutContent,
			toolbarConfig,
			notificationConfig,
			contextMenuConfig,
			canvasController
		);

		expect(container.querySelectorAll(".notification-panel")).to.have.length(0);

		// open the notification center
		const notificationButton = container.querySelector(".toggleNotificationPanel-action button");
		fireEvent.click(notificationButton);
		await waitFor(() => {
			expect(container.querySelectorAll(".notification-panel")).to.have.length(1);
		});

		// check that there are no messages and the clear all button is disabled
		let clearAllButton = container.querySelector(".notification-panel button.notification-panel-clear-all");
		expect(clearAllButton.disabled).to.equal(true);
		expect(container.querySelectorAll(".notification-panel .notification-panel-empty-message").length).to.equal(1);
		expect(container.querySelectorAll(".notification-panel .notifications").length).to.equal(0);
		expect(canvasController.getNotificationMessages().length).to.equal(0);

		// add a message and check if the clear all button is enabled
		canvasController.setNotificationMessages([notificationMessage0]);
		await waitFor(() => {
			clearAllButton = container.querySelector(".notification-panel button.notification-panel-clear-all");
		});
		expect(clearAllButton.disabled).to.equal(false);
		expect(container.querySelectorAll(".notification-panel .notification-panel-empty-message").length).to.equal(0);
		expect(container.querySelectorAll(".notification-panel .notifications").length).to.equal(1);
		expect(canvasController.getNotificationMessages().length).to.equal(1);

		// after clicking the clear all button, messages should be removed and button disabled again
		fireEvent.click(clearAllButton);
		await waitFor(() => {
			clearAllButton = container.querySelector(".notification-panel button.notification-panel-clear-all");
			expect(clearAllButton.disabled).to.equal(true);
			expect(container.querySelectorAll(".notification-panel .notification-panel-empty-message").length).to.equal(1);
			expect(container.querySelectorAll(".notification-panel .notifications").length).to.equal(0);
			expect(canvasController.getNotificationMessages().length).to.equal(0);
		});
	});

	it("notification close button", async() => {
		const notificationConfig = { action: "notification", label: "Notifications Panel", enable: true, notificationHeader: "Custom" };
		const { container } = createIntlCommonCanvasRTL(
			canvasConfig,
			contextMenuHandler,
			beforeEditActionHandler,
			editActionHandler,
			clickActionHandler,
			decorationActionHandler,
			selectionChangeHandler,
			tipHandler,
			canvasParameters.showBottomPanel,
			canvasParameters.showRightFlyout,
			canvasParameters.rightFlyoutContent,
			toolbarConfig,
			notificationConfig,
			contextMenuConfig,
			canvasController
		);
		expect(container.querySelectorAll(".notification-panel")).to.have.length(0);

		// open the notification center
		const notificationButton = container.querySelector(".toggleNotificationPanel-action button");
		fireEvent.click(notificationButton);
		expect(container.querySelectorAll(".notification-panel")).to.have.length(1);
		await waitFor(() => {
			// click the close button
			fireEvent.click(container.querySelector(".notification-panel-close-button .cds--btn--sm"));
			expect(container.querySelectorAll(".notification-panel")).to.have.length(0);
		});

	});

	it("notification secondary button renders and works when specified", async() => {
		const spySecondaryButtonCallback = sinon.spy();
		const notificationConfig = {
			action: "notification",
			label: "Notifications Panel",
			enable: true,
			notificationHeader: "Custom",
			clearAllMessage: "clear all",
			secondaryButtonLabel: "Custom action",
			secondaryButtonCallback: spySecondaryButtonCallback,
			secondaryButtonDisabled: false
		};
		const { container } = createIntlCommonCanvasRTL(
			canvasConfig,
			contextMenuHandler,
			beforeEditActionHandler,
			editActionHandler,
			clickActionHandler,
			decorationActionHandler,
			selectionChangeHandler,
			tipHandler,
			canvasParameters.showBottomPanel,
			canvasParameters.showRightFlyout,
			canvasParameters.rightFlyoutContent,
			toolbarConfig,
			notificationConfig,
			contextMenuConfig,
			canvasController
		);
		expect(container.querySelectorAll(".notification-panel")).to.have.length(0);

		// open the notification center
		const notificationButton = container.querySelector(".toggleNotificationPanel-action button");
		fireEvent.click(notificationButton);
		await waitFor(() => {
			expect(container.querySelectorAll(".notification-panel")).to.have.length(1);
		});
		// check that secondary button is enabled and callback works
		let secondaryButton = container.querySelector(".notification-panel button.notification-panel-secondary-button");
		expect(secondaryButton.disabled).to.equal(false);
		expect(secondaryButton.textContent).to.equal(notificationConfig.secondaryButtonLabel);
		fireEvent.click(secondaryButton);
		expect(spySecondaryButtonCallback.calledOnce).to.equal(true);

		// disable secondary button
		notificationConfig.secondaryButtonDisabled = true;
		canvasController.setNotificationPanelConfig(notificationConfig);
		await waitFor(() => {
			// verify secondary button is disabled
			secondaryButton = container.querySelector(".notification-panel button.notification-panel-secondary-button");
			expect(secondaryButton.disabled).to.equal(true);
		});
	});
});

function areMessagesEqual(messages1, messages2) {
	if (messages1.length !== messages2.length) {
		return false;
	}
	for (let i = 0; i < messages1.length; i++) {
		const msg1 = messages1[i];
		const msg2 = messages2[i];
		if (!areMessageFieldsEqual(msg1, msg2, "id") ||
				!areMessageFieldsEqual(msg1, msg2, "title") ||
				!areMessageFieldsEqual(msg1, msg2, "type") ||
				!areMessageFieldsEqual(msg1, msg2, "content") ||
				!areMessageFieldsEqual(msg1, msg2, "timestamp") ||
				!areMessageFieldsEqual(msg1, msg2, "callback")) {
			return false;
		}
	}
	return true;
}

function areMessageFieldsEqual(msg1, msg2, field) {
	if ((msg1[field] && !msg2[field]) || (!msg1[field] && msg2[field]) || (msg1[field] && msg2[field] && msg1[field] !== msg2[field])) {
		return false;
	}
	return true;
}
