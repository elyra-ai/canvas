/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* eslint complexity: ["error", 17] */
/* eslint max-depth: ["error", 6] */

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
import BlankCanvasImage from "../assets/images/blank_canvas.png";
import CanvasController from "./common-canvas-controller.js";

export default class CommonCanvas extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isPaletteOpen: this.props.config.paletteInitialState || false,
			showContextMenu: false,
			contextMenuDef: {},
			toolbarConfig: this.props.toolbarConfig,
			rightFlyoutContent: this.props.rightFlyoutContent
		};

		ObjectModel.subscribe(() => {
			this.forceUpdate();
		});

		this.openContextMenu = this.openContextMenu.bind(this);
		this.closeContextMenu = this.closeContextMenu.bind(this);
		this.isContextMenuDisplayed = this.isContextMenuDisplayed.bind(this);

		this.openPalette = this.openPalette.bind(this);
		this.closePalette = this.closePalette.bind(this);

		this.initializeController = this.initializeController.bind(this);

		this.initializeController();
	}

	componentWillReceiveProps(newProps) {
		if (newProps.toolbarConfig) {
			const newToolbarConfig = newProps.toolbarConfig;
			const oldToolbarConfig = this.state.toolbarConfig;

			let identical = true;
			if (newToolbarConfig.length !== oldToolbarConfig.length) {
				identical = false;
			}
			if (identical) {
				for (let i = 0; i < newToolbarConfig.length; i++) {
					for (let j = 0; j < oldToolbarConfig.length; j++) {
						if (newToolbarConfig[i].action && oldToolbarConfig[j].action &&
								((newToolbarConfig[i].action.startsWith("palette") &&
									oldToolbarConfig[j].action.startsWith("palette")) &&
									newToolbarConfig[i].enable !== oldToolbarConfig[j].enable) ||
								(newToolbarConfig[i].action === oldToolbarConfig[j].action) &&
									(newToolbarConfig[i].label !== oldToolbarConfig[j].label ||
									newToolbarConfig[i].enable !== oldToolbarConfig[j].enable)) {
							identical = false;
							break;
						}
					}
				}
			}

			if (!identical) {
				this.setState({ toolbarConfig: newProps.toolbarConfig });
			}
		}

		if (newProps.rightFlyoutContent !== this.state.rightFlyoutContent) {
			this.setState({
				rightFlyoutContent: newProps.rightFlyoutContent
			});
		}

		this.initializeController();
	}

	initializeController() {
		CanvasController.setCanvasConfig({
			enableRenderingEngine: this.props.config.enableRenderingEngine,
			enableConnectionType: this.props.config.enableConnectionType,
			enableNodeFormatType: this.props.config.enableNodeFormatType,
			enableLinkType: this.props.config.enableLinkType,
			enableInternalObjectModel: this.props.config.enableInternalObjectModel,
			enablePaletteLayout: this.props.config.enablePaletteLayout,
			emptyCanvasContent: this.props.config.emptyCanvasContent,
			toolbarConfig: this.props.toolbarConfig,
			rightFlyoutContent: this.props.rightFlyoutContent,
			showRightFlyout: this.props.showRightFlyout,
			closeRightFlyout: this.props.closeRightFlyout
		});


		CanvasController.setHandlers({
			contextMenuHandler: this.props.contextMenuHandler,
			contextMenuActionHandler: this.props.contextMenuActionHandler,
			editActionHandler: this.props.editActionHandler,
			clickActionHandler: this.props.clickActionHandler,
			decorationActionHandler: this.props.decorationActionHandler,
			toolbarMenuActionHandler: this.props.toolbarMenuActionHandler,
		});

		CanvasController.setCommonCanvas(this);
	}

	openPalette() {
		if (ObjectModel.getPaletteData()) {
			this.setState({ isPaletteOpen: true });
		}
	}

	closePalette() {
		this.setState({ isPaletteOpen: false });
	}

	openContextMenu(menuDef) {
		this.setState({ showContextMenu: true, contextMenuDef: menuDef });
	}

	closeContextMenu() {
		this.setState({ showContextMenu: false, contextMenuDef: {} });
	}

	isContextMenuDisplayed() {
		return this.state.showContextMenu;
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

	focusOnCanvas() {
		this.refs.canvas.focusOnCanvas(); // Set focus on div so keybord events go there.
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

	render() {
		let canvas = null;
		let palette = null;
		let paletteClass = "canvas-palette-flyout-div-closed";
		let contextMenuWrapper = null;
		let canvasToolbar = null;
		let rightFlyout = (<div id="right-flyout-panel" style={{ width: "0px" }} />);
		const canvasStyle = { minWidth: "258px" };
		const canvasJSON = ObjectModel.getCanvasInfo();

		if (canvasJSON !== null) {
			if (this.state.showContextMenu) {
				contextMenuWrapper = (<ContextMenuWrapper
					containingDivId={"common-canvas"}
					contextMenuDef={this.state.contextMenuDef}
				/>);
			}

			if (this.props.config.enableRenderingEngine === "D3") {
				canvas = (<DiagramCanvasD3
					ref="canvas"
					canvas={canvasJSON}
					config={this.props.config}
				>
					{contextMenuWrapper}
				</DiagramCanvasD3>);
			} else {
				canvas = (<DiagramCanvasLegacy
					ref="canvas"
					canvas={canvasJSON}
				>
					{contextMenuWrapper}
				</DiagramCanvasLegacy>);
			}

			if (ObjectModel.getPaletteData()) {
				if (this.props.config.enablePaletteLayout === "Modal") {
					palette = (<Palette
						paletteJSON={ObjectModel.getPaletteData()}
						showPalette={this.state.isPaletteOpen}
					/>);
				} else {
					if (this.state.isPaletteOpen) {
						paletteClass = "canvas-palette-flyout-div-open";
						canvasStyle.minWidth = (parseFloat(canvasStyle.minWidth) + 250) + "px";
					}
					palette = (<PaletteFlyout
						paletteJSON={ObjectModel.getPaletteData()}
						showPalette={this.state.isPaletteOpen}
					/>);
				}
			}

			if (this.props.toolbarConfig) {
				this.canUndoRedo();
				canvasToolbar = (<Toolbar
					config={this.state.toolbarConfig}
					renderingEngine={this.props.config.enableRenderingEngine}
					paletteState={this.state.isPaletteOpen}
					paletteType={this.props.config.enablePaletteLayout}
					rightFlyoutOpen={this.props.showRightFlyout}
				/>);
			}
		}

		if (typeof this.state.rightFlyoutContent !== "undefined" && this.state.rightFlyoutContent !== null && this.props.showRightFlyout) {
			paletteClass += " canvas-flyout-div-open";
			canvasStyle.minWidth = (parseFloat(canvasStyle.minWidth) + 318) + "px";
			rightFlyout = (<div id="right-flyout-panel" style={{ width: "318px" }}>
				{this.state.rightFlyoutContent}
			</div>);
		}

		let emptyCanvas = null;

		if (canvasJSON === null ||
				(canvasJSON.nodes.length === 0 &&
					canvasJSON.comments.length === 0)) {
			if (this.props.config.emptyCanvasContent) {
				emptyCanvas = (
					<div id="empty-canvas">
						{this.props.config.emptyCanvasContent}
					</div>);
			} else {
				emptyCanvas = (
					<div id="empty-canvas">
						<div>
							<img src={BlankCanvasImage} className="empty-canvas-image" />
							<span className="empty-canvas-text">Your flow is empty!</span>
						</div>
					</div>);
			}
		}

		return (
			<div id="common-canvas" style={canvasStyle}>
				{palette}
				<div id="common-canvas-items-container" className={paletteClass}>
					{canvasToolbar}
					{canvas}
					{emptyCanvas}
				</div>
				{rightFlyout}
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
	toolbarConfig: PropTypes.array,
	rightFlyoutContent: PropTypes.object,
	showRightFlyout: PropTypes.bool,
	closeRightFlyout: PropTypes.func
};
