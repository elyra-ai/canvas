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
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import ContextMenuWrapper from "./context-menu-wrapper.jsx";
import DiagramCanvas from "./diagram-canvas.jsx";
import Palette from "./palette/palette.jsx";
import ObjectModel from "./object-model/object-model.js";
import Flow24Icon from "../assets/images/flow_24.svg";
import ZoomIn24Icon from "../assets/images/zoom-in_24.svg";
import ZoomOut24Icon from "../assets/images/zoom-out_24.svg";
import OpenNodePaletteIcon from "../assets/images/open_node_palette.svg";
import { DAGRE_HORIZONTAL } from "../constants/common-constants.js";

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

		this.enableAutoLayout = this.enableAutoLayout.bind(this);

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

	enableAutoLayout() {
		this.refs.canvas.autoLayout(DAGRE_HORIZONTAL); // Default to HORIZONTAL
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
			case "createNode":
				ObjectModel.createNode(data);
				break;
			case "moveObjects":
				ObjectModel.moveObjects(data);
				break;
			case "editComment":
				ObjectModel.editComment(data);
				break;
			case "linkNodes":
				ObjectModel.linkNodes(data);
				break;
			case "linkComment":
				ObjectModel.linkComment(data);
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
			case "deleteObjects":
				ObjectModel.deleteObjects(this.contextMenuSource);
				break;
			case "addComment":
				ObjectModel.createComment(this.contextMenuSource);
				break;
			case "deleteLink":
				ObjectModel.deleteLink(this.contextMenuSource);
				break;
			case "disconnectNode":
				ObjectModel.disconnectNodes(this.contextMenuSource);
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
		let autoLayoutControls = null;
		let contextMenuWrapper = null;
		const canvasJSON = ObjectModel.getCanvas();

		if (canvasJSON !== null) {
			if (this.state.showContextMenu) {
				contextMenuWrapper = (<ContextMenuWrapper
					containingDivId={"common-canvas"}
					mousePos={this.contextMenuSource.mousePos}
					contextMenuDef={this.state.contextMenuDef} c
					contextMenuClicked={this.contextMenuClicked}
					closeContextMenu={this.closeContextMenu}
				/>);
			}

			canvas = (<DiagramCanvas
				ref="canvas"
				canvas={canvasJSON}
				paletteJSON={ObjectModel.getPaletteData()}
				autoLayoutDirection={this.props.config.enableAutoLayout}
				closeContextMenu={this.closeContextMenu}
				contextMenuHandler={this.contextMenuHandler}
				editActionHandler={this.editActionHandler}
				clickActionHandler={this.clickActionHandler}
				decorationActionHandler={this.decorationActionHandler}
			>
				{contextMenuWrapper}
			</DiagramCanvas>);

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

			autoLayoutControls = (<div className="canvas-autolayout-controls">
				<div><img src={Flow24Icon} onClick={this.enableAutoLayout} /></div>
			</div>);
		}

		return (
			<div id="common-canvas">
				{canvas}
				{zoomControls}
				{autoLayoutControls}
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
