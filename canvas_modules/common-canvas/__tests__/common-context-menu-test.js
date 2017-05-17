/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2016
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/

import React from "react";
import CommonContextMenu from "../src/common-context-menu.jsx";
import { shallow } from "enzyme";
import { expect } from "chai";
import sinon from "sinon";
import { MenuItem } from "react-contextmenu";

describe("CommonContextMenu renders correctly", () => {

	it("all required props should have been defined", () => {
		const _contextHandler = sinon.spy();
		const _menuDefinition = getMenuDefinition();
		const wrapper = shallow(<CommonContextMenu contextHandler={_contextHandler} menuDefinition={_menuDefinition} />);
		expect(wrapper.contextHandler).to.be.defined;
		expect(wrapper.menuDefinition).to.be.defined;
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
