/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* eslint complexity: ["error", 14] */

import React from "react";
import PropTypes from "prop-types";
import ContextMenuWrapper from "./context-menu-wrapper.jsx";
import DiagramCanvasLegacy from "./diagram-canvas.jsx";
import DiagramCanvasD3 from "./diagram-canvas-d3.jsx";
import Palette from "./palette/palette.jsx";
import PaletteFlyout from "./palette/palette-flyout.jsx";
import Toolbar from "./toolbar/toolbar.jsx";
import ObjectModel from "./object-model/object-model.js";
import CommandStack from "./command-stack/command-stack.js";
import CreateNodeAction from "./command-actions/createNodeAction.js";
import CreateCommentAction from "./command-actions/createCommentAction.js";
import AddLinksAction from "./command-actions/addLinksAction.js";
import DeleteObjectsAction from "./command-actions/deleteObjectsAction.js";
import DeleteLinkAction from "./command-actions/deleteLinkAction.js";
import DisconnectNodesAction from "./command-actions/disconnectNodesAction.js";
import MoveObjectsAction from "./command-actions/moveObjectsAction.js";
import EditCommentAction from "./command-actions/editCommentAction.js";
import ArrangeLayoutAction from "./command-actions/arrangeLayoutAction.js";
import constants from "../constants/common-constants.js";

export default class CommonCanvas extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isPaletteOpen: false,
			showContextMenu: false,
			contextMenuDef: {},
			toolbarConfig: this.props.toolbarConfig,
			posLastClicked: { x: 0, y: 0 }
		};

		ObjectModel.subscribe(() => {
			this.forceUpdate();
		});

		this.paletteClosedByUser = false;

		this.contextMenuSource = null;
		this.closeContextMenu = this.closeContextMenu.bind(this);
		this.contextMenuClicked = this.contextMenuClicked.bind(this);

		this.openPalette = this.openPalette.bind(this);
		this.closePalette = this.closePalette.bind(this);

		this.addNodeToCanvas = this.addNodeToCanvas.bind(this);

		this.zoomIn = this.zoomIn.bind(this);
		this.zoomOut = this.zoomOut.bind(this);
		this.zoomToFit = this.zoomToFit.bind(this);

		this.editActionHandler = this.editActionHandler.bind(this);
		this.contextMenuActionHandler = this.contextMenuActionHandler.bind(this);
		this.contextMenuHandler = this.contextMenuHandler.bind(this);
		this.clickActionHandler = this.clickActionHandler.bind(this);
		this.decorationActionHandler = this.decorationActionHandler.bind(this);
		this.toolbarMenuActionHandler = this.toolbarMenuActionHandler.bind(this);
	}

	openPalette() {
		if (ObjectModel.getPaletteData()) {
			this.setState({ isPaletteOpen: true });
		}
	}

	closePalette() {
		this.paletteClosedByUser = true;
		this.setState({ isPaletteOpen: false });
	}

	zoomIn() {
		this.refs.canvas.zoomIn();
	}

	zoomOut() {
		this.refs.canvas.zoomOut();
	}

	zoomToFit() {
		this.refs.canvas.zoomToFit();
	}

	closeContextMenu() {
		this.contextMenuSource = null;
		this.setState({ showContextMenu: false, contextMenuDef: {} });
	}

	contextMenuClicked(action) {
		if (action === "selectAll") { // Common Canvas provided default action
			ObjectModel.selectAll();
			// Set focus on canvas so keybord events go there.
			this.refs.canvas.focusOnCanvas();
		} else {
			this.contextMenuActionHandler(action);
		}

		this.closeContextMenu();
	}

	addNodeToCanvas(typeId, label) {
		return this.refs.canvas.addNodeToCanvas(typeId, label);
	}

	editActionHandler(data) {
		if (this.props.config.enableInternalObjectModel) {
			switch (data.editType) {
			case "createNode": {
				const node = ObjectModel.createNode(data);
				const command = new CreateNodeAction(node);
				CommandStack.do(command);
				// need to pass the nodeid along to any this.props.editActionHandlers
				data.nodeId = node.id;
				break;
			}
			case "moveObjects": {
				const command = new MoveObjectsAction(data);
				CommandStack.do(command);
				break;
			}
			case "editComment": {
				// only add editComment action, if value or size of comment has changed
				const selectedComment = ObjectModel.getComment(data.nodes[0]);
				if (selectedComment.content !== data.label ||
						selectedComment.height !== data.height ||
						selectedComment.width !== data.height) {
					const command = new EditCommentAction(data);
					CommandStack.do(command);
				}
				break;
			}
			case "linkNodes": {
				const linkNodesList = ObjectModel.createNodeLinks(data);
				const command = new AddLinksAction(linkNodesList);
				CommandStack.do(command);
				break;
			}
			case "linkComment": {
				const linkCommentList = ObjectModel.createCommentLinks(data);
				const command = new AddLinksAction(linkCommentList);
				CommandStack.do(command);
				break;
			}
			case "deleteSelectedObjects": {
				const command = new DeleteObjectsAction(data);
				CommandStack.do(command);
				break;
			}
			case "undo":
				CommandStack.undo();
				break;
			case "redo":
				CommandStack.redo();
				break;
			default:
			}
		}

		if (this.props.editActionHandler) {
			this.props.editActionHandler(data);
		}
	}

	contextMenuActionHandler(action) {
		if (this.props.config.enableInternalObjectModel) {
			switch (action) {
			case "deleteObjects": {
				const command = new DeleteObjectsAction(this.contextMenuSource);
				CommandStack.do(command);
				break;
			}
			case "addComment": {
				const comment = ObjectModel.createComment(this.contextMenuSource);
				const command = new CreateCommentAction(comment);
				CommandStack.do(command);
				break;
			}
			case "deleteLink": {
				const command = new DeleteLinkAction(this.contextMenuSource);
				CommandStack.do(command);
				break;
			}
			case "disconnectNode": {
				const command = new DisconnectNodesAction(this.contextMenuSource);
				CommandStack.do(command);
				break;
			}
			case "undo":
				CommandStack.undo();
				break;
			case "redo":
				CommandStack.redo();
				break;
			default:
			}
		}

		if (this.props.contextMenuActionHandler) {
			this.props.contextMenuActionHandler(action, this.contextMenuSource);
		}
	}

	contextMenuHandler(source) {
		if (this.props.contextMenuHandler) {
			this.contextMenuSource = source;
			const menuDef = this.props.contextMenuHandler(source);
			if (typeof menuDef !== "undefined") {
				this.setState({ showContextMenu: true, contextMenuDef: menuDef });
			}
		}
	}

	toolbarMenuActionHandler(action) {
		const source = {
			selectedObjectIds: ObjectModel.getSelectedObjectIds(),
			mousePos: this.state.posLastClicked
		};
		if (this.props.config.enableInternalObjectModel) {
			switch (action) {
			case "delete": {
				const command = new DeleteObjectsAction(source);
				CommandStack.do(command);
				break;
			}
			case "addComment": {
				const comment = ObjectModel.createComment(source);
				const command = new CreateCommentAction(comment);
				CommandStack.do(command);
				break;
			}
			case "arrangeHorizontally": {
				const command = new ArrangeLayoutAction(constants.HORIZONTAL);
				CommandStack.do(command);
				break;
			}
			case "arrangeVertically": {
				const command = new ArrangeLayoutAction(constants.VERTICAL);
				CommandStack.do(command);
				break;
			}
			case "undo":
				CommandStack.undo();
				this.canUndoRedo();
				break;
			case "redo":
				CommandStack.redo();
				this.canUndoRedo();
				break;
			default:
			}
		}

		if (this.props.toolbarMenuActionHandler) {
			this.props.toolbarMenuActionHandler(action, source);
		}
	}

	canUndoRedo() {
		let undoState = true;
		let redoState = true;
		if (!CommandStack.canUndo()) {
			undoState = false;
		}
		if (!CommandStack.canRedo()) {
			redoState = false;
		}

		if (typeof this.state.toolbarConfig !== "undefined") {
			for (let i = 0; i < this.state.toolbarConfig.length; i++) {
				if (this.state.toolbarConfig[i].action === "undo") {
					this.state.toolbarConfig[i].enable = undoState;
				}
				if (this.state.toolbarConfig[i].action === "redo") {
					this.state.toolbarConfig[i].enable = redoState;
				}
			}
		}
	}

	clickActionHandler(source) {
		if (source.clickType === "DOUBLE_CLICK" && source.objectType === "canvas") {
			this.openPalette();
		} else if (source.clickType === "SINGLE_CLICK" && source.objectType === "canvas") {
			// Don"t clear the selection if the canvas context menu is up
			if (!this.state.showContextMenu) {
				ObjectModel.clearSelection();
			}

			// store last clicked position
			if (source.clickedPos) {
				this.setState({ posLastClicked: source.clickedPos });
			}
		}

		if (this.props.clickActionHandler) {
			this.props.clickActionHandler(source);
		}
	}

	decorationActionHandler(node, id) {
		if (this.props.decorationActionHandler) {
			this.props.decorationActionHandler(node, id);
		}
	}

	render() {
		let canvas = null;
		let palette = null;
		let paletteClass = "canvas-palette-flyout-div-closed";
		let contextMenuWrapper = null;
		let canvasToolbar = null;
		const canvasJSON = ObjectModel.getCanvasInfo();

		var isPaletteOpen = this.state.isPaletteOpen;

		// Always open the palette when we start up (i.e. before the user
		// interacts with it) with an emoty canvas and with some palette data.
		if (!this.state.isPaletteOpen &&
				!this.paletteClosedByUser &&
				!ObjectModel.getPaletteData() &&
				ObjectModel.isCanvasEmpty()) {
			isPaletteOpen = true;
		}

		if (canvasJSON !== null) {
			if (this.state.showContextMenu) {
				contextMenuWrapper = (<ContextMenuWrapper
					containingDivId={"common-canvas"}
					mousePos={this.contextMenuSource.cmPos}
					contextMenuDef={this.state.contextMenuDef}
					contextMenuClicked={this.contextMenuClicked}
					closeContextMenu={this.closeContextMenu}
				/>);
			}

			if (this.props.config.enableRenderingEngine === "D3") {
				canvas = (<DiagramCanvasD3
					ref="canvas"
					canvas={canvasJSON}
					config={this.props.config}
					closeContextMenu={this.closeContextMenu}
					contextMenuHandler={this.contextMenuHandler}
					editActionHandler={this.editActionHandler}
					clickActionHandler={this.clickActionHandler}
					decorationActionHandler={this.decorationActionHandler}
				>
					{contextMenuWrapper}
				</DiagramCanvasD3>);
			} else {
				canvas = (<DiagramCanvasLegacy
					ref="canvas"
					canvas={canvasJSON}
					closeContextMenu={this.closeContextMenu}
					contextMenuHandler={this.contextMenuHandler}
					editActionHandler={this.editActionHandler}
					clickActionHandler={this.clickActionHandler}
					decorationActionHandler={this.decorationActionHandler}
				>
					{contextMenuWrapper}
				</DiagramCanvasLegacy>);
			}

			if (ObjectModel.getPaletteData()) {
				if (this.props.config.enablePaletteLayout === "Modal") {
					palette = (<Palette
						paletteJSON={ObjectModel.getPaletteData()}
						showPalette={isPaletteOpen}
						closePalette={this.closePalette}
					/>);
				} else {
					if (isPaletteOpen) {
						paletteClass = "canvas-palette-flyout-div-open";
					}
					palette = (<PaletteFlyout
						paletteJSON={ObjectModel.getPaletteData()}
						addNodeToCanvas={this.addNodeToCanvas}
						showPalette={isPaletteOpen}
					/>);
				}
			}

			if (this.props.toolbarConfig) {
				this.canUndoRedo();
				canvasToolbar = (<Toolbar
					config={this.state.toolbarConfig}
					renderingEngine={this.props.config.enableRenderingEngine}
					paletteState={isPaletteOpen}
					paletteType={this.props.config.enablePaletteLayout}
					closePalette={this.closePalette}
					openPalette={this.openPalette}
					zoomIn={this.zoomIn}
					zoomOut={this.zoomOut}
					zoomToFit={this.zoomToFit}
					toolbarMenuActionHandler={this.toolbarMenuActionHandler}
				/>);
			}
		}

		return (
			<div id="common-canvas" >
				{palette}
				<div id="common-canvas-items-container" className={paletteClass}>
					{canvasToolbar}
					{canvas}
				</div>
			</div>
		);
	}
}

CommonCanvas.propTypes = {
	config: PropTypes.object,
	contextMenuHandler: PropTypes.func,
	contextMenuActionHandler: PropTypes.func,
	editActionHandler: PropTypes.func,
	clickActionHandler: PropTypes.func,
	decorationActionHandler: PropTypes.func,
	toolbarMenuActionHandler: PropTypes.func,
	toolbarConfig: PropTypes.array
};
