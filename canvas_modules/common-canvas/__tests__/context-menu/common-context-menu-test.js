/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import CommonContextMenu from "../../src/context-menu/common-context-menu.jsx";
import { shallow, mount } from "enzyme";
import { expect } from "chai";
import sinon from "sinon";
import { MenuItem, SubMenu } from "react-contextmenu";
import isEqual from "lodash/isEqual";

describe("CommonContextMenu renders correctly", () => {

	it("all required props should have been defined", () => {
		const _contextHandler = sinon.spy();
		const _menuDefinition = getMenuDefinition();
		const wrapper = mount(<CommonContextMenu contextHandler={_contextHandler} menuDefinition={_menuDefinition} />);
		expect(wrapper.prop("contextHandler")).to.equal(_contextHandler);
		expect(wrapper.prop("menuDefinition")).to.equal(_menuDefinition);
	});

	it("should render three <MenuItem/> components", () => {
		const _contextHandler = sinon.spy();
		const _menuDefinition = getMenuDefinition();
		const wrapper = shallow(<CommonContextMenu contextHandler={_contextHandler} menuDefinition={_menuDefinition} />);
		expect(wrapper.find(MenuItem)).to.have.length(3);
	});

	it("should render a <div>", () => {
		const _contextHandler = sinon.spy();
		const _menuDefinition = getMenuDefinition();
		const wrapper = shallow(<CommonContextMenu contextHandler={_contextHandler} menuDefinition={_menuDefinition} />);
		expect(wrapper.find("div")).to.have.length(1);
	});

	it("simulates click events", () => {
		const _contextHandler = sinon.spy();
		const _menuDefinition = getMenuDefinition();
		const wrapper = shallow(<CommonContextMenu contextHandler={_contextHandler} menuDefinition={_menuDefinition} />);
		wrapper.find(MenuItem).at(0)
			.simulate("click");
		expect(_contextHandler.calledOnce).to.equal(true);
	});

	it("correctly positions submenus that are near the right viewport edge", () => {
		const _contextHandler = sinon.spy();
		const _menuDefinition = getNestedMenuDefinition();
		const _menuRect = { left: 950, top: 100, width: 160, height: 300 };
		const _canvasRect = { left: 0, top: 0, width: 1000, height: 1000 };
		const wrapper = mount(<CommonContextMenu contextHandler={_contextHandler}
			menuDefinition={_menuDefinition} menuRect={_menuRect} canvasRect={_canvasRect}
		/>);
		expect(wrapper.prop("contextHandler")).to.equal(_contextHandler);
		expect(wrapper.prop("menuDefinition")).to.equal(_menuDefinition);
		const subMenuItem = wrapper.find(SubMenu);
		expect(isEqual(subMenuItem.props().rtl, true)).to.be.true;
	});

});

function getMenuDefinition() {
	return [
		{ action: "dosomething", label: "Do something" },
		{ divider: true },
		{ action: "dosomethingelse", label: "Do something else" }
	];
}

function getNestedMenuDefinition() {
	const EDIT_SUB_MENU = [
		{ action: "cut", label: "Cut" },
		{ action: "copy", label: "Copy" }
	];
	return [
		{ action: "editNode", label: "Open" },
		{ action: "disconnectNode", label: "Disconnect" },
		{ action: "previewNode", label: "Preview" },
		{ divider: true },
		{ action: "createSuperNode", label: "Create supernode" },
		{ divider: true },
		{ submenu: true, label: "Edit", menu: EDIT_SUB_MENU },
		{ divider: true },
		{ action: "deleteObjects", label: "Delete" },
		{ divider: true },
		{ action: "executeNode", label: "Execute" }
	];
}
