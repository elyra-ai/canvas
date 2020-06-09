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

import React from "react";
import NotificationPanel from "./../../src/notification-panel/notification-panel";
import CanvasController from "./../../src/common-canvas/canvas-controller";
import CommonCanvas from "../../src/common-canvas/common-canvas.jsx";

import { mountWithIntl } from "../_utils_/intl-utils";
import { expect } from "chai";
import sinon from "sinon";
import isEqual from "lodash/isEqual";

let canvasController = new CanvasController();

const canvasConfig = { enableInternalObjectModel: true };
const toolbarConfig = [{ action: "palette", label: "Palette", enable: true }];

const contextMenuHandler = sinon.spy();
const contextMenuActionHandler = sinon.spy();
const editActionHandler = sinon.spy();
const clickActionHandler = sinon.spy();
const decorationActionHandler = sinon.spy();
const selectionChangeHandler = sinon.spy();
const tipHandler = sinon.spy();
const toolbarMenuActionHandler = sinon.spy();

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

describe("notification panel renders correctly", () => {
	let wrapper;
	afterEach(() => {
		wrapper.unmount();
	});

	it("props should have been defined", () => {
		wrapper = mountWithIntl(
			<NotificationPanel
				notificationConfig={notificationConfigDefault}
				isNotificationOpen
				messages={notificationMessages}
				canvasController={canvasController}
			/>
		);

		expect(wrapper.prop("notificationConfig")).to.equal(notificationConfigDefault);
		expect(wrapper.prop("isNotificationOpen")).to.equal(true);
		expect(wrapper.prop("messages")).to.equal(notificationMessages);
		expect(wrapper.prop("canvasController")).to.equal(canvasController);
	});

	it("notification panel should be hidden if isNotificationOpen is false", () => {
		wrapper = mountWithIntl(
			<NotificationPanel
				notificationConfig={notificationConfigDefault}
				isNotificationOpen={false}
				messages={[]}
				canvasController={canvasController}
			/>
		);

		expect(wrapper.find(".notification-panel-container.panel-hidden")).to.have.length(1);
	});

	it("notification panel should have 4 types of messages", () => {
		wrapper = mountWithIntl(
			<NotificationPanel
				notificationConfig={{
					action: "notification",
					label: "Notifications Panel",
					enable: true,
					notificationHeader: "Custom",
					notificationSubtitle: "Custom subtitle",
					emptyMessage: "custom empty message",
					clearAllMessage: "Clear all"
				}}
				isNotificationOpen={false}
				messages={notificationMessages}
				canvasController={canvasController}
			/>
		);

		expect(wrapper.find(".notification-panel-container.panel-hidden")).to.have.length(1);
		const messages = wrapper.find(".notifications-button-container");
		expect(messages).to.have.length(4);

		const message0 = messages.at(0);
		expect(message0.find(".notifications.info")).to.have.length(1);
		expect(message0.find(".notification-message-content").text()).to.equal("");
		expect(message0.find(".notification-message-timestamp")).to.have.length(0);

		const message1 = messages.at(1);
		expect(message1.find(".notifications.success")).to.have.length(1);
		expect(message1.find(".notification-message-content").text()).to.equal(notificationMessage1.content);
		expect(message1.find(".notification-message-timestamp")).to.have.length(0);

		const message2 = messages.at(2);
		expect(message2.find(".notifications.warning")).to.have.length(1);
		expect(message2.find(".notification-message-content").text()).to.equal(notificationMessage2.content);
		expect(message2.find(".notification-message-timestamp-icon")).to.have.length(1);
		expect(message2.find(".notification-message-string").text()).to.equal("May 7, 2018");

		const message3 = messages.at(3);
		expect(message3.find(".notifications.clickable.error")).to.have.length(1);
		expect(message3.find(".notification-message-content").text()).to.equal(notificationMessage3.content);
		expect(message3.find(".notification-message-timestamp-icon")).to.have.length(1);
		expect(message3.find(".notification-message-string").text()).to.equal("May 7, 2018");
	});

	it("notification panel should have render extra messages if passed in", () => {
		wrapper = mountWithIntl(
			<NotificationPanel
				notificationConfig={{
					action: "notification",
					label: "Notifications Panel",
					enable: true,
					notificationHeader: notificationHeaderString,
					notificationSubtitle: "Custom subtitle",
					emptyMessage: "Custom empty message",
					clearAllMessage: "Clear all"
				}}
				isNotificationOpen={false}
				messages={[]}
				canvasController={canvasController}
			/>
		);

		const subtitle = wrapper.find(".notification-panel-container .notification-panel-subtitle");
		expect(subtitle).to.have.length(1);
		expect(subtitle.text()).to.eql("Custom subtitle");

		const emptyMessage = wrapper.find(".notification-panel-container .notification-panel-empty-message");
		expect(emptyMessage).to.have.length(1);
		expect(emptyMessage.text()).to.eql("Custom empty message");

		const clearAll = wrapper.find(".notification-panel-container button.notification-panel-clear-all");
		expect(clearAll).to.have.length(1);
		expect(clearAll.text()).to.eql("Clear all");
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
		// all these messages already have keys, so no new keys should be generated for them
		expect(canvasController.getNotificationMessages()).to.eql(notificationMessages);
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
	let wrapper;

	beforeEach(() => {
		canvasController = new CanvasController();
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("notification icon should be empty in toolbar if no messages", () => {
		const notificationConfig = { action: "notification", label: "Notifications Panel", enable: true, notificationHeader: "Custom" };
		wrapper = mountWithIntl(<CommonCanvas
			config={canvasConfig}
			contextMenuHandler={contextMenuHandler}
			contextMenuActionHandler={contextMenuActionHandler}
			editActionHandler={editActionHandler}
			clickActionHandler={clickActionHandler}
			decorationActionHandler={decorationActionHandler}
			selectionChangeHandler={selectionChangeHandler}
			tipHandler={tipHandler}
			toolbarConfig={toolbarConfig}
			notificationConfig={notificationConfig}
			toolbarMenuActionHandler={toolbarMenuActionHandler}
			showRightFlyout={false}
			canvasController={canvasController}
		/>);

		expect(wrapper.find(".notification-panel-container.panel-hidden")).to.have.length(1);
		expect(canvasController.getNotificationMessages().length).to.equal(0);
		expect(wrapper.find(".notification-panel-empty-message-container")).to.have.length(1);

		canvasController.setNotificationMessages([notificationMessage0]);
		wrapper.update();
		expect(wrapper.find("li[id='notification-open-action']")).to.have.length(1);
		expect(wrapper.find(".notification-panel-empty-message-container")).to.have.length(0);
	});

	it("notification icon should be in correct states in toolbar", () => {
		const notificationConfig = { action: "notification", label: "Notifications Panel", enable: true, notificationHeader: "Custom" };
		wrapper = mountWithIntl(<CommonCanvas
			config={canvasConfig}
			contextMenuHandler={contextMenuHandler}
			contextMenuActionHandler={contextMenuActionHandler}
			editActionHandler={editActionHandler}
			clickActionHandler={clickActionHandler}
			decorationActionHandler={decorationActionHandler}
			selectionChangeHandler={selectionChangeHandler}
			tipHandler={tipHandler}
			toolbarConfig={toolbarConfig}
			notificationConfig={notificationConfig}
			toolbarMenuActionHandler={toolbarMenuActionHandler}
			showRightFlyout={false}
			canvasController={canvasController}
		/>);

		canvasController.setNotificationMessages([notificationMessage0]);
		wrapper.update();
		let notificationIcon = wrapper.find("li[id='notification-open-action']");
		expect(notificationIcon).to.have.length(1);
		expect(notificationIcon.find("svg.canvas-icon.fill.notificationCounterIcon.info")).to.have.length(1);

		canvasController.setNotificationMessages([notificationMessage0, notificationMessage1]);
		wrapper.update();
		notificationIcon = wrapper.find("li[id='notification-open-action']");
		expect(notificationIcon.find("svg.canvas-icon.fill.notificationCounterIcon.success")).to.have.length(1);

		canvasController.setNotificationMessages([notificationMessage0, notificationMessage1, notificationMessage2]);
		wrapper.update();
		notificationIcon = wrapper.find("li[id='notification-open-action']");
		expect(notificationIcon.find("svg.canvas-icon.fill.notificationCounterIcon.warning")).to.have.length(1);

		canvasController.setNotificationMessages(notificationMessages);
		wrapper.update();
		notificationIcon = wrapper.find("li[id='notification-open-action']");
		expect(notificationIcon.find("svg.canvas-icon.fill.notificationCounterIcon.error")).to.have.length(1);

		expect(canvasController.getNotificationMessages().length).to.equal(4);

		canvasController.setNotificationMessages([notificationMessage0, notificationMessage1, notificationMessage2]);
		wrapper.update();
		notificationIcon = wrapper.find("li[id='notification-open-action']");
		expect(notificationIcon.find("svg.canvas-icon.fill.notificationCounterIcon.warning")).to.have.length(1);

		canvasController.setNotificationMessages([notificationMessage0, notificationMessage1]);
		wrapper.update();
		notificationIcon = wrapper.find("li[id='notification-open-action']");
		expect(notificationIcon.find("svg.canvas-icon.fill.notificationCounterIcon.success")).to.have.length(1);

		canvasController.setNotificationMessages([notificationMessage0]);
		wrapper.update();
		notificationIcon = wrapper.find("li[id='notification-open-action']");
		expect(notificationIcon.find("svg.canvas-icon.fill.notificationCounterIcon.info")).to.have.length(1);
		canvasController.setNotificationMessages([]);
		wrapper.update();
		// TODO need to fix
		// notificationIcon = wrapper.find("li[id='notification-open-action']");
		// expect(notificationIcon).to.have.length(1);
		// expect(notificationIcon.find("svg[type='notificationCounterIcon']")).to.have.length(1);
	});
});

describe("notification counter and color updates correctly", () => {
	let wrapper;

	beforeEach(() => {
		canvasController = new CanvasController();
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("notification counter updates correctly", () => {
		const notificationConfig = { action: "notification", label: "Notifications Panel", enable: true, notificationHeader: "Custom" };
		wrapper = mountWithIntl(<CommonCanvas
			config={canvasConfig}
			contextMenuHandler={contextMenuHandler}
			contextMenuActionHandler={contextMenuActionHandler}
			editActionHandler={editActionHandler}
			clickActionHandler={clickActionHandler}
			decorationActionHandler={decorationActionHandler}
			selectionChangeHandler={selectionChangeHandler}
			tipHandler={tipHandler}
			toolbarConfig={toolbarConfig}
			notificationConfig={notificationConfig}
			toolbarMenuActionHandler={toolbarMenuActionHandler}
			showRightFlyout={false}
			canvasController={canvasController}
		/>);
		let notificationIcon = wrapper.find("li[id='notification-open-action']");
		let notificationCounter = notificationIcon.find(".notificationCounterIcon .text-content");
		expect(notificationCounter.text()).to.equal(" 0 ");
		canvasController.setNotificationMessages([notificationMessage0]);
		wrapper.update();
		notificationIcon = wrapper.find("li[id='notification-open-action']");
		notificationCounter = notificationIcon.find(".text-content");
		expect(notificationIcon).to.have.length(1);
		expect(notificationCounter.text()).to.equal(" 1 ");
		expect(notificationIcon.find("svg.canvas-icon.fill.notificationCounterIcon.info")).to.have.length(1);
		canvasController.setNotificationMessages(Array(9).fill(notificationMessage0));
		wrapper.update();
		notificationIcon = wrapper.find("li[id='notification-open-action']");
		notificationCounter = notificationIcon.find(".text-content");
		expect(notificationCounter.text()).to.equal(" 9 ");
		expect(notificationIcon.find("svg.canvas-icon.fill.notificationCounterIcon.info")).to.have.length(1);
		canvasController.setNotificationMessages(Array(10).fill(notificationMessage0));
		wrapper.update();
		notificationIcon = wrapper.find("li[id='notification-open-action']");
		notificationCounter = notificationIcon.find(".text-content");
		expect(notificationCounter.text()).to.equal(" 9+ ");
		expect(notificationIcon.find("svg.canvas-icon.fill.notificationCounterIcon.info")).to.have.length(1);
	});
	it("notification dot updates to indicate the correct message type", () => {
		const notificationConfig = { action: "notification", label: "Notifications Panel", enable: true, notificationHeader: "Custom" };
		wrapper = mountWithIntl(<CommonCanvas
			config={canvasConfig}
			contextMenuHandler={contextMenuHandler}
			contextMenuActionHandler={contextMenuActionHandler}
			editActionHandler={editActionHandler}
			clickActionHandler={clickActionHandler}
			decorationActionHandler={decorationActionHandler}
			selectionChangeHandler={selectionChangeHandler}
			tipHandler={tipHandler}
			toolbarConfig={toolbarConfig}
			notificationConfig={notificationConfig}
			toolbarMenuActionHandler={toolbarMenuActionHandler}
			showRightFlyout={false}
			canvasController={canvasController}
		/>);

		let notificationIcon = wrapper.find("li.notificationCounterIcon svg.canvas-icon");
		let indicatorClasses = notificationIcon.prop("className");
		expect(indicatorClasses).to.equal("canvas-icon properties-icon fill notificationCounterIcon");

		canvasController.setNotificationMessages([notificationMessage0]);
		wrapper.update();
		notificationIcon = wrapper.find("li.notificationCounterIcon svg.canvas-icon");
		indicatorClasses = notificationIcon.prop("className");
		expect(indicatorClasses).to.equal("canvas-icon properties-icon fill notificationCounterIcon info");

		canvasController.setNotificationMessages([notificationMessage0, notificationMessage1]);
		wrapper.update();
		notificationIcon = wrapper.find("li.notificationCounterIcon svg.canvas-icon");
		indicatorClasses = notificationIcon.prop("className");
		expect(indicatorClasses).to.equal("canvas-icon properties-icon fill notificationCounterIcon success");

		canvasController.setNotificationMessages([notificationMessage0, notificationMessage1, notificationMessage2]);
		wrapper.update();
		notificationIcon = wrapper.find("li.notificationCounterIcon svg.canvas-icon");
		indicatorClasses = notificationIcon.prop("className");
		expect(indicatorClasses).to.equal("canvas-icon properties-icon fill notificationCounterIcon warning");

		canvasController.setNotificationMessages([notificationMessage0, notificationMessage1, notificationMessage2, notificationMessage3]);
		wrapper.update();
		notificationIcon = wrapper.find("li.notificationCounterIcon svg.canvas-icon");
		indicatorClasses = notificationIcon.prop("className");
		expect(indicatorClasses).to.equal("canvas-icon properties-icon fill notificationCounterIcon error");
	});
});

describe("notification center buttons work properly", () => {
	let wrapper;

	beforeEach(() => {
		canvasController = new CanvasController();
	});
	afterEach(() => {
		wrapper.unmount();
	});

	it("notification clear all button", () => {
		const notificationConfig = { action: "notification", label: "Notifications Panel", enable: true, notificationHeader: "Custom" };
		wrapper = mountWithIntl(<CommonCanvas
			config={canvasConfig}
			contextMenuHandler={contextMenuHandler}
			contextMenuActionHandler={contextMenuActionHandler}
			editActionHandler={editActionHandler}
			clickActionHandler={clickActionHandler}
			decorationActionHandler={decorationActionHandler}
			selectionChangeHandler={selectionChangeHandler}
			tipHandler={tipHandler}
			toolbarConfig={toolbarConfig}
			notificationConfig={notificationConfig}
			toolbarMenuActionHandler={toolbarMenuActionHandler}
			showRightFlyout={false}
			canvasController={canvasController}
		/>);
		// open the notification center
		const notificationButton = wrapper.find("li[id='notification-open-action'] button.list-item");
		expect(wrapper.find(".notification-panel-container.panel-hidden")).to.have.length(1);
		notificationButton.simulate("click");
		wrapper.update();
		expect(wrapper.find(".notification-panel-container.panel-hidden")).to.have.length(0);

		// check that there are no messages and the clear all button is disabled
		let clearAllButton = wrapper.find(".notification-panel-container button.notification-panel-clear-all");
		expect(clearAllButton.prop("disabled")).to.equal(true);
		expect(wrapper.find(".notification-panel-container .notification-panel-empty-message").length).to.equal(1);
		expect(wrapper.find(".notification-panel-container .notifications").length).to.equal(0);
		expect(canvasController.getNotificationMessages().length).to.equal(0);

		// add a message and check if the clear all button is enabled
		canvasController.setNotificationMessages([notificationMessage0]);
		wrapper.update();
		clearAllButton = wrapper.find(".notification-panel-container button.notification-panel-clear-all");
		expect(clearAllButton.prop("disabled")).to.equal(false);
		expect(wrapper.find(".notification-panel-container .notification-panel-empty-message").length).to.equal(0);
		expect(wrapper.find(".notification-panel-container .notifications").length).to.equal(1);
		expect(canvasController.getNotificationMessages().length).to.equal(1);

		// after clicking the clear all button, messages should be removed and button disabled again
		clearAllButton.simulate("click");
		wrapper.update();

		clearAllButton = wrapper.find(".notification-panel-container button.notification-panel-clear-all");
		expect(clearAllButton.prop("disabled")).to.equal(true);
		expect(wrapper.find(".notification-panel-container .notification-panel-empty-message").length).to.equal(1);
		expect(wrapper.find(".notification-panel-container .notifications").length).to.equal(0);
		expect(canvasController.getNotificationMessages().length).to.equal(0);
	});
	it("notification close button", () => {
		const notificationConfig = { action: "notification", label: "Notifications Panel", enable: true, notificationHeader: "Custom" };
		wrapper = mountWithIntl(<CommonCanvas
			config={canvasConfig}
			contextMenuHandler={contextMenuHandler}
			contextMenuActionHandler={contextMenuActionHandler}
			editActionHandler={editActionHandler}
			clickActionHandler={clickActionHandler}
			decorationActionHandler={decorationActionHandler}
			selectionChangeHandler={selectionChangeHandler}
			tipHandler={tipHandler}
			toolbarConfig={toolbarConfig}
			notificationConfig={notificationConfig}
			toolbarMenuActionHandler={toolbarMenuActionHandler}
			showRightFlyout={false}
			canvasController={canvasController}
		/>);
		// open the notification center
		const notificationButton = wrapper.find("li[id='notification-open-action'] button.list-item");
		expect(wrapper.find(".notification-panel-container.panel-hidden")).to.have.length(1);
		notificationButton.simulate("click");
		expect(wrapper.find(".notification-panel-container.panel-hidden")).to.have.length(0);
		wrapper.update();
		// click the close button
		wrapper.find(".notification-panel-container svg.notification-panel-close-icon").simulate("click");

		// check that notification panel is closed
		wrapper.update();
		expect(wrapper.find(".notification-panel-container.panel-hidden")).to.have.length(1);

	});
});
