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
import CommonContextMenu from "./../../src/context-menu/common-context-menu";
import { createIntlCommonCanvasRTL } from "../_utils_/cc-utils.js";
import { expect } from "chai";
import { expect as expectJest } from "@jest/globals";
import sinon from "sinon";
import { fireEvent } from "@testing-library/react";
import CanvasController from "../../src/common-canvas/canvas-controller";
import getContextMenuDefiniton from "../../src/common-canvas/canvas-controller-menu-utils";
import supernodeFlow from "../../../harness/test_resources/diagrams/supernodeCanvas.json";
import canvasObj from "../test_resources/json/context-menu-test_canvasObject.json";
import oneNodeObj from "../test_resources/json/context-menu-test_oneNodeObject.json";
import multNodeObj from "../test_resources/json/context-menu-test_multNodeObject.json";
import supernodeCollObj from "../test_resources/json/context-menu-test_supernodeCollObject.json";
import supernodeExpObj from "../test_resources/json/context-menu-test_supernodeExpObject.json";
import commentObj from "../test_resources/json/context-menu-test_commentObject.json";
import multipleCommentsObj from "../test_resources/json/context-menu-test_multipleCommentsObject.json";
import linkObj from "../test_resources/json/context-menu-test_linkObject.json";
import commentPlusNodeObj from "../test_resources/json/context-menu-test_commentPlusNodeObject1.json";
import manyNodesCommentsObj from "../test_resources/json/context-menu-test_manyNodesCommentsObject.json";
import expSupernodeCommentObj from "../test_resources/json/context-menu-test_expSupernodePlusCommentObject.json";
import collSupernodeCommentObj from "../test_resources/json/context-menu-test_collSupernodePlusCommentObject.json";
import nonContiguousSelection from "../test_resources/json/context-menu-test_noncontiguous-selection.json";
import { renderWithIntl } from "../_utils_/intl-utils.js";


const mockContextMenu = jest.fn();
jest.mock("../../src/context-menu/common-context-menu",
	() => (props) => mockContextMenu(props)
);

mockContextMenu.mockImplementation((props) => {
	const ContextMenuComp = jest.requireActual(
		"./../../src/context-menu/common-context-menu",
	).default;
	return <ContextMenuComp {...props} />;
});

describe("CommonContextMenu renders correctly", () => {

	it("all required props should have been defined", () => {

		const _contextHandler = sinon.spy();
		const _menuDefinition = getMenuDefinition();
		const _canvasRect = { width: 1000, height: 800, top: 0, bottom: 800, left: 0, right: 1000 };
		const _mousePos = { x: 20, y: 20 };
		renderWithIntl(<CommonContextMenu contextHandler={_contextHandler} menuDefinition={_menuDefinition} canvasRect={_canvasRect} mousePos={_mousePos} />);
		expectJest(mockContextMenu).toHaveBeenCalledWith({
			"contextHandler": _contextHandler,
			"menuDefinition": _menuDefinition,
			"canvasRect": _canvasRect,
			"mousePos": _mousePos
		});
	});

	it("should render two context menu items and one divider components", () => {
		const _contextHandler = sinon.spy();
		const _menuDefinition = getMenuDefinition();
		const _canvasRect = { width: 1000, height: 800, top: 0, bottom: 800, left: 0, right: 1000 };
		const _mousePos = { x: 20, y: 20 };
		const { container } = renderWithIntl(<CommonContextMenu contextHandler={_contextHandler} menuDefinition={_menuDefinition} canvasRect={_canvasRect} mousePos={_mousePos} />);

		expect(container.getElementsByClassName("context-menu-item")).to.have.length(2);
		expect(container.getElementsByClassName("context-menu-divider")).to.have.length(1);
	});

	it("simulates click events", () => {
		const _contextHandler = sinon.spy();
		const _menuDefinition = getMenuDefinition();
		const _canvasRect = { width: 1000, height: 800, top: 0, bottom: 800, left: 0, right: 1000 };
		const _mousePos = { x: 20, y: 20 };
		const wrapper = renderWithIntl(<CommonContextMenu contextHandler={_contextHandler} menuDefinition={_menuDefinition} canvasRect={_canvasRect} mousePos={_mousePos} />);
		// To simulate click events, we want to click on the menu item, and one of the menu items has the text "Do something"
		// so we use getByText to click the on that specific menu item
		fireEvent.click(wrapper.getByText("Do something"));
		expect(_contextHandler.calledOnce).to.equal(true);
	});

	it("correctly positions submenus that are near the right viewport edge", () => {
		const _contextHandler = sinon.spy();
		const _menuDefinition = getNestedMenuDefinition();
		const _canvasRect = { width: 1000, height: 1000, left: 0, top: 0, right: 1000, bottom: 1000 };
		const _mousePos = { x: 950, y: 100 };
		const wrapper = renderWithIntl(<CommonContextMenu contextHandler={_contextHandler} menuDefinition={_menuDefinition} canvasRect={_canvasRect} mousePos={_mousePos} />);
		const { container } = wrapper;
		expectJest(mockContextMenu).toHaveBeenCalledWith({
			"contextHandler": _contextHandler,
			"menuDefinition": _menuDefinition,
			"canvasRect": _canvasRect,
			"mousePos": _mousePos
		});
		const subMenuItem = container.getElementsByClassName("context-menu-submenu")[0];
		const style = subMenuItem.style;

		// If left property is negative, the submenu is on the left of the main menu.
		expect(style.left).to.equal("-160px");
	});
});

describe("DefaultMenu renders correctly", () => {
	let canvasController;
	beforeEach(() => {
		canvasController = new CanvasController();
		canvasController.getObjectModel().setPipelineFlow(supernodeFlow);
		const config = {
			enableAutoLayout: "none",
			enableInternalObjectModel: true
		};
		createCommonCanvas(config, canvasController);
	});
	it("correctly displays canvas menu when canvas is selected", () => {
		const defMenu = [
			{ "action": "createComment", "label": "New comment" },
			{ "action": "selectAll", "label": "Select All" },
			{ "divider": true },
			{ "submenu": true, "menu": [{ "action": "cut", "label": "Cut" }, { "action": "copy", "label": "Copy" }, { "action": "paste", "label": "Paste" }], "label": "Edit" },
			{ "divider": true },
			{ "action": "undo", "label": "Undo" },
			{ "action": "redo", "label": "Redo" },
			{ "divider": true }
		];
		const menuDef = getContextMenuDefiniton(canvasObj, canvasController);
		expect(menuDef, defMenu).to.be.equal;
	});
	it("correctly displays one node menu when only one node is selected", () => {
		const defMenu = [
			{ "action": "disconnectNode", "label": "Disconnect" },
			{ "divider": true },
			{ "submenu": true, "menu": [{ "action": "cut", "label": "Cut" }, { "action": "copy", "label": "Copy" }], "label": "Edit" },
			{ "divider": true },
			{ "action": "deleteObjects", "label": "Delete" },
			{ "divider": true }
		];
		const menuDef = getContextMenuDefiniton(oneNodeObj, canvasController);
		expect(menuDef, defMenu).to.be.equal;
	});
	it("correctly displays multiple node menu when multiple nodes are selected", () => {
		const defMenu = [
			{ "action": "disconnectNode", "label": "Disconnect" },
			{ "divider": true },
			{ "submenu": true, "menu": [{ "action": "cut", "label": "Cut" }, { "action": "copy", "label": "Copy" }], "label": "Edit" },
			{ "divider": true },
			{ "action": "deleteObjects", "label": "Delete" },
			{ "divider": true }
		];
		const menuDef = getContextMenuDefiniton(multNodeObj, canvasController);
		expect(menuDef, defMenu).to.be.equal;
	});
	it("correctly displays single, collapsed supernode menu when a single, collapsed supernode is selected", () => {
		const defMenu = [
			{ "action": "disconnectNode", "label": "Disconnect" },
			{ "divider": true },
			{ "submenu": true, "menu": [{ "action": "cut", "label": "Cut" }, { "action": "copy", "label": "Copy" }], "label": "Edit" },
			{ "divider": true },
			{ "action": "deleteObjects", "label": "Delete" },
			{ "divider": true },
			{ "action": "expandSuperNodeInPlace", "label": "Expand supernode" },
			{ "divider": true }
		];
		const menuDef = getContextMenuDefiniton(supernodeCollObj, canvasController);
		expect(menuDef, defMenu).to.be.equal;
	});

	it("correctly displays single, expanded supernode menu when a single, expanded supernode is selected", () => {
		const defMenu = [
			{ "action": "disconnectNode", "label": "Disconnect" },
			{ "divider": true },
			{ "submenu": true, "menu": [{ "action": "cut", "label": "Cut" }, { "action": "copy", "label": "Copy" }], "label": "Edit" },
			{ "divider": true },
			{ "action": "deleteObjects", "label": "Delete" },
			{ "divider": true },
			{ "action": "collapseSuperNodeInPlace", "label": "Collapse supernode" },
			{ "divider": true }
		];
		const menuDef = getContextMenuDefiniton(supernodeExpObj, canvasController);
		expect(menuDef, defMenu).to.be.equal;
	});
	it("correctly displays comment menu when a single comment is selected", () => {
		const defMenu = [
			{ "action": "disconnectNode", "label": "Disconnect" },
			{ "divider": true },
			{ "submenu": true, "menu": [{ "action": "cut", "label": "Cut" }, { "action": "copy", "label": "Copy" }], "label": "Edit" },
			{ "divider": true },
			{ "action": "deleteObjects", "label": "Delete" },
			{ "divider": true }
		];
		const menuDef = getContextMenuDefiniton(commentObj, canvasController);
		expect(menuDef, defMenu).to.be.equal;
	});
	it("correctly displays comment menu when multiple comments are selected", () => {
		const defMenu = [
			{ "action": "disconnectNode", "label": "Disconnect" },
			{ "divider": true },
			{ "submenu": true, "menu": [{ "action": "cut", "label": "Cut" }, { "action": "copy", "label": "Copy" }], "label": "Edit" },
			{ "divider": true },
			{ "action": "deleteObjects", "label": "Delete" },
			{ "divider": true }
		];
		const menuDef = getContextMenuDefiniton(multipleCommentsObj, canvasController);
		expect(menuDef, defMenu).to.be.equal;
	});
	it("correctly displays delete link when a single link is selected", () => {
		const defMenu = [
			{ "action": "deleteLink", "label": "Delete" }
		];
		const menuDef = getContextMenuDefiniton(linkObj, canvasController);
		expect(menuDef, defMenu).to.be.equal;
	});
	it("correctly displays comment + node menu when a comment and a node are selected", () => {
		const defMenu = [
			{ "submenu": true, "menu": [{ "action": "cut", "label": "Cut" }, { "action": "copy", "label": "Copy" }], "label": "Edit" },
			{ "divider": true	},
			{ "action": "createSuperNode", "label": "Create supernode" },
			{ "divider": true },
			{ "action": "disconnectNode", "label": "Disconnect" },
			{ "action": "deleteObjects", "label": "Delete"	},
			{ "divider": true }
		];
		const menuDef = getContextMenuDefiniton(commentPlusNodeObj, canvasController);
		expect(menuDef, defMenu).to.be.equal;
	});
	it("correctly displays comment + node menu when multiple comments and nodes are selected", () => {
		const defMenu = [
			{ "submenu": true, "menu": [{ "action": "cut", "label": "Cut" }, { "action": "copy", "label": "Copy" }], "label": "Edit" },
			{ "divider": true },
			{ "action": "createSuperNode", "label": "Create supernode" },
			{ "divider": true },
			{ "action": "disconnectNode", "label": "Disconnect" },
			{ "action": "deleteObjects", "label": "Delete" },
			{ "divider": true }
		];
		const menuDef = getContextMenuDefiniton(manyNodesCommentsObj, canvasController);
		expect(menuDef, defMenu).to.be.equal;
	});
	it("correctly displays comment + node menu when an expanded supernode and a comment are selected", () => {
		const defMenu = [
			{ "submenu": true, "menu": [{ "action": "cut", "label": "Cut" }, { "action": "copy", "label": "Copy" }], "label": "Edit" },
			{ "divider": true },
			{ "action": "createSuperNode", "label": "Create supernode" },
			{ "divider": true },
			{ "action": "disconnectNode", "label": "Disconnect" },
			{ "action": "deleteObjects", "label": "Delete" },
			{ "divider": true }
		];
		const menuDef = getContextMenuDefiniton(expSupernodeCommentObj, canvasController);
		expect(menuDef, defMenu).to.be.equal;
	});
	it("correctly displays comment + node menu when a collapsed supernode and a comment are selected", () => {
		const defMenu = [
			{ "submenu": true, "menu": [{ "action": "cut", "label": "Cut" }, { "action": "copy", "label": "Copy" }], "label": "Edit" },
			{ "divider": true },
			{ "action": "createSuperNode", "label": "Create supernode" },
			{ "divider": true },
			{ "action": "disconnectNode", "label": "Disconnect" },
			{ "action": "deleteObjects", "label": "Delete" },
			{ "divider": true }
		];
		const menuDef = getContextMenuDefiniton(collSupernodeCommentObj, canvasController);
		expect(menuDef, defMenu).to.be.equal;
	});
});

describe("create supernode renders correctly", () => {
	let canvasController;
	it("correctly does not display 'create supernode' for non-contiguous nodes when enableCreateSupernodeNonContiguous is false", () => {
		canvasController = new CanvasController();
		canvasController.getObjectModel().setPipelineFlow(supernodeFlow);
		const config = {
			enableAutoLayout: "none",
			enableInternalObjectModel: true,
		};
		const contextMenuConfig = {
			enableCreateSupernodeNonContiguous: false
		};
		createCommonCanvas(config, canvasController, contextMenuConfig);
		const menuDef = getContextMenuDefiniton(nonContiguousSelection, canvasController);
		const isCreateSupernode = isCreateSupernodeThere(menuDef);
		expect(isCreateSupernode).to.be.false;
	});

	it("correctly displays 'create supernode' for non-contiguous nodes when enableCreateSupernodeNonContiguous is true", () => {
		canvasController = new CanvasController();
		canvasController.getObjectModel().setPipelineFlow(supernodeFlow);
		const config = {
			enableAutoLayout: "none",
			enableInternalObjectModel: true,
		};
		const contextMenuConfig = {
			enableCreateSupernodeNonContiguous: true
		};
		const canvasParams = {};
		createCommonCanvas(config, canvasController, canvasParams, contextMenuConfig);
		const menuDef = getContextMenuDefiniton(nonContiguousSelection, canvasController);
		const isCreateSupernode = isCreateSupernodeThere(menuDef);
		expect(isCreateSupernode).to.be.true;
	});
});

function getMenuDefinition() {
	return [
		{
			action: "dosomething",
			label: "Do something"
		}, {
			divider: true
		}, {
			action: "dosomethingelse",
			label: "Do something else"
		}
	];
}

function getNestedMenuDefinition() {
	const EDIT_SUB_MENU = [
		{
			action: "cut",
			label: "Cut"
		}, {
			action: "copy",
			label: "Copy"
		}
	];
	return [
		{
			action: "editNode",
			label: "Open"
		}, {
			action: "disconnectNode",
			label: "Disconnect"
		}, {
			action: "previewNode",
			label: "Preview"
		}, {
			divider: true
		}, {
			action: "createSuperNode",
			label: "Create supernode"
		}, {
			divider: true
		}, {
			submenu: true,
			label: "Edit",
			menu: EDIT_SUB_MENU
		}, {
			divider: true
		}, {
			action: "deleteObjects",
			label: "Delete"
		}, {
			divider: true
		}, {
			action: "executeNode",
			label: "Execute"
		}
	];
}

function createCommonCanvas(config, canvasController, canvasParams, contextMenuConfig) {
	const contextMenuHandler = (source, defaultMenu) => defaultMenu;
	const beforeEditActionHandler = null; // If sepcified, must return data
	const editActionHandler = sinon.spy();
	const clickActionHandler = sinon.spy();
	const decorationActionHandler = sinon.spy();
	const selectionChangeHandler = sinon.spy();
	const tipHandler = sinon.spy();
	const toolbarConfig = [
		{
			action: "palette",
			label: "Palette",
			enable: true
		}
	];
	const notificationConfig = {
		action: "notification",
		label: "Notifications",
		enable: true
	};
	const canvasParameters = canvasParams || {};
	const wrapper = createIntlCommonCanvasRTL(
		config,
		contextMenuHandler,
		beforeEditActionHandler,
		editActionHandler,
		clickActionHandler,
		decorationActionHandler,
		selectionChangeHandler,
		tipHandler,
		canvasParameters.showBottomPanel,
		canvasParameters.showRightFlyout,
		toolbarConfig,
		notificationConfig,
		contextMenuConfig,
		canvasController
	);

	return wrapper;
}

function isCreateSupernodeThere(defaultMenu) {
	let isCreateSupernode = false;
	defaultMenu.forEach(function(entry) {
		if (entry.action === "createSuperNode") {
			isCreateSupernode = true;
		}
	});
	return isCreateSupernode;
}

