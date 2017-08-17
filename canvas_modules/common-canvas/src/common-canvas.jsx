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
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import ContextMenuWrapper from "./context-menu-wrapper.jsx";
import DiagramCanvasLegacy from "./diagram-canvas.jsx";
import DiagramCanvasD3 from "./diagram-canvas-d3.jsx";
import Palette from "./palette/palette.jsx";
import ObjectModel from "./object-model/object-model.js";
import CommandStack from "./command-stack/command-stack.js";
import CreateNodeAction from "./command-actions/createNodeAction.js";
import CreateCommentAction from "./command-actions/createCommentAction.js";
import LinkNodesAction from "./command-actions/linkNodesAction.js";
import LinkCommentAction from "./command-actions/linkCommentAction.js";
import DeleteObjectsAction from "./command-actions/deleteObjectsAction.js";
import DeleteLinkAction from "./command-actions/deleteLinkAction.js";
import DisconnectNodesAction from "./command-actions/disconnectNodesAction.js";
import MoveObjectsAction from "./command-actions/moveObjectsAction.js";
import EditCommentAction from "./command-actions/editCommentAction.js";
import ZoomIn24Icon from "../assets/images/zoom-in_24.svg";
import ZoomOut24Icon from "../assets/images/zoom-out_24.svg";
import OpenNodePaletteIcon from "../assets/images/open_node_palette.svg";

export default class CommonCanvas extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isPaletteOpen: false,
			showContextMenu: false,
			contextMenuDef: {}
		};

		ObjectModel.subscribe(() => {
			this.forceUpdate();
		});

		this.contextMenuSource = null;
		this.closeContextMenu = this.closeContextMenu.bind(this);
		this.contextMenuClicked = this.contextMenuClicked.bind(this);

		this.openPalette = this.openPalette.bind(this);
		this.closePalette = this.closePalette.bind(this);

		this.createTempNode = this.createTempNode.bind(this);
		this.deleteTempNode = this.deleteTempNode.bind(this);

		this.zoomIn = this.zoomIn.bind(this);
		this.zoomOut = this.zoomOut.bind(this);

		this.editActionHandler = this.editActionHandler.bind(this);
		this.contextMenuActionHandler = this.contextMenuActionHandler.bind(this);
		this.contextMenuHandler = this.contextMenuHandler.bind(this);
		this.clickActionHandler = this.clickActionHandler.bind(this);
		this.decorationActionHandler = this.decorationActionHandler.bind(this);
	}

	openPalette() {
		if (this.props.config.enablePalette) {
			this.setState({ isPaletteOpen: true });
		}
	}

	closePalette() {
		this.setState({ isPaletteOpen: false });
	}

	createTempNode(paletteId) {
		return this.refs.canvas.createTempNode(paletteId);
	}

	deleteTempNode(paletteId) {
		return this.refs.canvas.deleteTempNode(paletteId);
	}

	zoomIn() {
		this.refs.canvas.zoomIn();
	}

	zoomOut() {
		this.refs.canvas.zoomOut();
	}

	closeContextMenu() {
		this.contextMenuSource = null;
		this.setState({ showContextMenu: false, contextMenuDef: {} });
	}

	contextMenuClicked(action) {
		if (action === "selectAll") { // Common Canvas provided default action
			ObjectModel.selectAll();
		} else {
			this.contextMenuActionHandler(action);
		}

		this.closeContextMenu();
	}

	editActionHandler(data) {
		if (this.props.config.enableInternalObjectModel) {
			switch (data.editType) {
			case "createNode": {
				const node = ObjectModel.createNode(data);
				const command = new CreateNodeAction(node);
				CommandStack.do(command);
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
				const command = new LinkNodesAction(linkNodesList);
				CommandStack.do(command);
				break;
			}
			case "linkComment": {
				const linkCommentList = ObjectModel.createCommentLinks(data);
				const command = new LinkCommentAction(linkCommentList);
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

	clickActionHandler(source) {
		if (source.clickType === "DOUBLE_CLICK" && source.objectType === "canvas") {
			this.openPalette();
		} else if (source.clickType === "SINGLE_CLICK" && source.objectType === "canvas") {
			// Don"t clear the selection if the canvas context menu is up
			if (!this.state.showContextMenu) {
				ObjectModel.clearSelection();
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
		let popupPalette = null;
		let addButton = null;
		let zoomControls = null;
		let contextMenuWrapper = null;
		const canvasJSON = ObjectModel.getCanvas();

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
					paletteJSON={ObjectModel.getPaletteData()}
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
					paletteJSON={ObjectModel.getPaletteData()}
					closeContextMenu={this.closeContextMenu}
					contextMenuHandler={this.contextMenuHandler}
					editActionHandler={this.editActionHandler}
					clickActionHandler={this.clickActionHandler}
					decorationActionHandler={this.decorationActionHandler}
				>
					{contextMenuWrapper}
				</DiagramCanvasLegacy>);
			}

			if (this.props.config.enablePalette) {
				popupPalette = (<Palette
					paletteJSON={ObjectModel.getPaletteData()}
					showPalette={this.state.isPaletteOpen}
					closePalette={this.closePalette}
					createTempNode={this.createTempNode}
					deleteTempNode={this.deleteTempNode}
				/>);

				const paletteTooltip = <Tooltip id="paletteTooltip">{this.props.config.paletteTooltip}</Tooltip>;

				addButton = (<OverlayTrigger placement="right" overlay={paletteTooltip}>
					<div className="palette-show-button">
						<img src={OpenNodePaletteIcon} onClick={this.openPalette} />
					</div>
				</OverlayTrigger>);
			}

			zoomControls = (<div className="canvas-zoom-controls">
				<div><img src={ZoomIn24Icon} onClick={this.zoomIn} /></div>
				<div><img src={ZoomOut24Icon} onClick={this.zoomOut} /></div>
			</div>);

		}

		return (
			<div id="common-canvas">
				{canvas}
				{zoomControls}
				{addButton}
				{popupPalette}
			</div>
		);
	}
}

CommonCanvas.propTypes = {
	config: React.PropTypes.object,
	contextMenuHandler: React.PropTypes.func,
	contextMenuActionHandler: React.PropTypes.func,
	editActionHandler: React.PropTypes.func,
	clickActionHandler: React.PropTypes.func,
	decorationActionHandler: React.PropTypes.func
};
