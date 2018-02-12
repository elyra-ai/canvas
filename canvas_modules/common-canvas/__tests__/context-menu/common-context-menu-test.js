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
import { MenuItem } from "react-contextmenu";

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

});

function getMenuDefinition() {
	return [
		{ action: "dosomething", label: "Do something" },
		{ divider: true },
		{ action: "dosomethingelse", label: "Do something else" }
	];
}
