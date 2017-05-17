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
import ContextMenuWrapper from "../src/context-menu-wrapper.jsx";
import { shallow } from "enzyme";
import { expect } from "chai";
import sinon from "sinon";

describe("ContextMenuWrapper renders correctly", () => {

	var wrapper;

	const _contextMenuClicked = sinon.spy();
	const _closeContextMenu = sinon.spy();

	const _menu = [
		{ action: "item1", label: "Item 1" },
		{ divider: true },
		{ action: "item2", label: "Item 2" }
	];

	const _mousePos = { x: 100, y: 100 };

	beforeEach(function() {
		wrapper = shallow(
			<ContextMenuWrapper
				containingDivId={"common-canvas"}
				mousePos={_mousePos}
				contextMenuDef={_menu}
				contextMenuClicked={_contextMenuClicked}
				closeContextMenu={_closeContextMenu}>
			/>
		);
	});

	it("all required props should have been defined", () => {
		expect(wrapper.containingDivId).to.be.defined;
		expect(wrapper.mousePos).to.be.defined;
		expect(wrapper.contextMenuDef).to.be.defined;
		expect(wrapper.contextMenuClicked).to.be.defined;
		expect(wrapper.closeContextMenu).to.be.defined;
	});


});
