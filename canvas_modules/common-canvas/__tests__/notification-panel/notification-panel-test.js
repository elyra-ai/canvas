/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import NotificationPanel from "./../../src/notification-panel/notification-panel";
import CanvasController from "./../../src/common-canvas/canvas-controller";
import CommonCanvas from "../../src/common-canvas/common-canvas.jsx";

import { mountWithIntl } from "enzyme-react-intl";
import { expect } from "chai";
import sinon from "sinon";
import isEqual from "lodash/isEqual";

let canvasController = new CanvasController();

const canvasConfig = { canvasController: canvasController, enableInternalObjectModel: true };
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
const notificationMessageCallback = sinon.spy();

const notificationMessage0 = {
	id: "notification-0",
	title: "Notification Message 0",
	type: "informational"
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
				notificationHeader={notificationHeaderString}
				isNotificationOpen
				messages={notificationMessages}
				canvasController={canvasController}
			/>
		);

		expect(wrapper.prop("notificationHeader")).to.equal(notificationHeaderString);
		expect(wrapper.prop("isNotificationOpen")).to.equal(true);
		expect(wrapper.prop("messages")).to.equal(notificationMessages);
		expect(wrapper.prop("canvasController")).to.equal(canvasController);
	});

	it("notification panel should be hidden if isNotificationOpen is false", () => {
		wrapper = mountWithIntl(
			<NotificationPanel
				notificationHeader={notificationHeaderString}
				isNotificationOpen={false}
				messages={[]}
				canvasController={canvasController}
			/>
		);

		expect(wrapper.find(".notification-panel-container.panel-hidden")).to.have.length(1);
		expect(wrapper.find(".notification-panel-messages")).to.have.length(0);
	});

	it("notification panel should have 4 types of messages", () => {
		wrapper = mountWithIntl(
			<NotificationPanel
				notificationHeader={notificationHeaderString}
				isNotificationOpen={false}
				messages={notificationMessages}
				canvasController={canvasController}
			/>
		);

		expect(wrapper.find(".notification-panel-container.panel-hidden")).to.have.length(1);
		const messages = wrapper.find(".notifications-button-container");
		expect(messages).to.have.length(4);

		const message0 = messages.at(0);
		expect(message0.find(".notifications.informational")).to.have.length(1);
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
});

describe("canvas controller APIs for notification panel work correctly", () => {
	beforeEach(() => {
		canvasController = new CanvasController();
	});

	it("set messages correctly in canvasController", () => {
		canvasController.setNotificationMessages([]);
		expect(canvasController.getNotificationMessages()).to.eql([]);

		canvasController.setNotificationMessages(notificationMessages);
		expect(canvasController.getNotificationMessages()).to.eql(notificationMessages);
	});

	it("get messages correctly in canvasController", () => {
		canvasController.setNotificationMessages(notificationMessages);

		expect(isEqual(canvasController.getNotificationMessages("informational"), [notificationMessage0])).to.be.true;
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
		expect(isEqual(canvasController.getNotificationMessages("unspecified"), [expectedMessage4])).to.be.true;
	});

	it("gets unspecified message correctly if type passed in is null", () => {
		const expectedMessage5 = {
			id: "notification-5",
			title: "Notification Message 5",
			type: "unspecified"
		};
		canvasController.setNotificationMessages([notificationMessage5]);
		expect(isEqual(canvasController.getNotificationMessages("unspecified"), [expectedMessage5])).to.be.true;
	});

	it("gets unspecified message correctly if type is not passed in", () => {
		const expectedMessage6 = {
			id: "notification-6",
			title: "Notification Message 6",
			type: "unspecified"
		};
		canvasController.setNotificationMessages([notificationMessage6]);
		expect(isEqual(canvasController.getNotificationMessages("unspecified"), [expectedMessage6])).to.be.true;
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

	it("notification icon should be disabled in toolbar if no messages", () => {
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
		expect(wrapper.find("li[id='bell-action']").find(".list-item-disabled")).to.have.length(1);

		canvasController.setNotificationMessages([notificationMessage0]);
		wrapper.update();
		expect(wrapper.find("li[id='notification-open-action']")).to.have.length(1);
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
		expect(notificationIcon.find("svg.canvas-icon.fill.bellDot.info")).to.have.length(1);

		canvasController.setNotificationMessages([notificationMessage0, notificationMessage1]);
		wrapper.update();
		notificationIcon = wrapper.find("li[id='notification-open-action']");
		expect(notificationIcon.find("svg.canvas-icon.fill.bellDot.success")).to.have.length(1);

		canvasController.setNotificationMessages([notificationMessage0, notificationMessage1, notificationMessage2]);
		wrapper.update();
		notificationIcon = wrapper.find("li[id='notification-open-action']");
		expect(notificationIcon.find("svg.canvas-icon.fill.bellDot.warning")).to.have.length(1);

		canvasController.setNotificationMessages(notificationMessages);
		wrapper.update();
		notificationIcon = wrapper.find("li[id='notification-open-action']");
		expect(notificationIcon.find("svg.canvas-icon.fill.bellDot.error")).to.have.length(1);

		expect(canvasController.getNotificationMessages().length).to.equal(4);

		canvasController.setNotificationMessages([notificationMessage0, notificationMessage1, notificationMessage2]);
		wrapper.update();
		notificationIcon = wrapper.find("li[id='notification-open-action']");
		expect(notificationIcon.find("svg.canvas-icon.fill.bellDot.warning")).to.have.length(1);

		canvasController.setNotificationMessages([notificationMessage0, notificationMessage1]);
		wrapper.update();
		notificationIcon = wrapper.find("li[id='notification-open-action']");
		expect(notificationIcon.find("svg.canvas-icon.fill.bellDot.success")).to.have.length(1);

		canvasController.setNotificationMessages([notificationMessage0]);
		wrapper.update();
		notificationIcon = wrapper.find("li[id='notification-open-action']");
		expect(notificationIcon.find("svg.canvas-icon.fill.bellDot.info")).to.have.length(1);
		canvasController.setNotificationMessages([]);
		wrapper.update();
		// TODO need to fix
		// notificationIcon = wrapper.find("li[id='bell-action']");
		// expect(notificationIcon).to.have.length(1);
		// expect(notificationIcon.find("svg[type='bell']")).to.have.length(1);
	});
});
