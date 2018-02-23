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
/* eslint no-return-assign: "off" */

import React from "react";
import PropTypes from "prop-types";
import ContextMenuWrapper from "../context-menu/context-menu-wrapper.jsx";
import DiagramCanvasLegacy from "../legacy/diagram-canvas.jsx";
import DiagramCanvasD3 from "./diagram-canvas-d3.jsx";
import Palette from "../palette/palette.jsx";
import PaletteFlyout from "../palette/palette-flyout.jsx";
import Toolbar from "../toolbar/toolbar.jsx";
import BlankCanvasImage from "../../assets/images/blank_canvas.svg";
import TooltipWrapper from "../tooltip/tooltip-wrapper.jsx";
import isEmpty from "lodash/isEmpty";
import { FLYOUT_WIDTH } from "../constants/constants";


export default class CommonCanvas extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isPaletteOpen: this.props.config.paletteInitialState || false,
			showContextMenu: false,
			contextMenuDef: {},
			toolbarConfig: this.props.toolbarConfig,
			rightFlyoutContent: this.props.rightFlyoutContent,
			tipDef: {}
		};

		this.openContextMenu = this.openContextMenu.bind(this);
		this.closeContextMenu = this.closeContextMenu.bind(this);
		this.isContextMenuDisplayed = this.isContextMenuDisplayed.bind(this);

		this.showTip = this.showTip.bind(this);
		this.hideTip = this.hideTip.bind(this);
		this.isTipShowing = this.isTipShowing.bind(this);

		this.openPalette = this.openPalette.bind(this);
		this.closePalette = this.closePalette.bind(this);
		this.initializeController = this.initializeController.bind(this);
		this.getEditorWidth = this.getEditorWidth.bind(this);

		this.canvasController = this.props.canvasController;
		this.initializeController(props);

		this.canvasController.setCommonCanvas(this);

		this.itemsContainerDivId = "common-canvas-items-container-" + this.canvasController.getInstanceId();

		this.objectModel = this.canvasController.getObjectModel();

		this.unsubscribe = this.objectModel.subscribe(() => {
			this.forceUpdate();
		});

		this.pendingTooltip = null;
	}

	componentDidMount() {
		document.addEventListener("mousedown", this.hideTip, true);
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

		this.initializeController(newProps);
	}

	componentWillUnmount() {
		this.unsubscribe();
		document.removeEventListener("mousedown", this.hideTip, true);
	}

	getEditorWidth() {
		let width = FLYOUT_WIDTH.SMALL;
		let className = "canvas-flyout-div-open";
		if (this.flyoutContent) {
			width = this.flyoutContent.offsetWidth;
		}
		if (width > FLYOUT_WIDTH.SMALL + 10) {
			if (width > FLYOUT_WIDTH.MEDIUM + 10) {
				className = "canvas-flyout-div-open-large";
			} else {
				className = "canvas-flyout-div-open-medium";
			}
		}
		return {
			width: width,
			className: className
		};
	}

	initializeController(props) {
		this.canvasController.setCanvasConfig({
			enableRenderingEngine: props.config.enableRenderingEngine,
			enableConnectionType: props.config.enableConnectionType,
			enableNodeFormatType: props.config.enableNodeFormatType,
			enableLinkType: props.config.enableLinkType,
			enableInternalObjectModel: props.config.enableInternalObjectModel,
			enablePaletteLayout: props.config.enablePaletteLayout,
			emptyCanvasContent: props.config.emptyCanvasContent,
			toolbarConfig: props.toolbarConfig,
			tipConfig: props.config.tipConfig,
			rightFlyoutContent: props.rightFlyoutContent,
			showRightFlyout: props.showRightFlyout,
			closeRightFlyout: props.closeRightFlyout
		});

		this.canvasController.setHandlers({
			contextMenuHandler: props.contextMenuHandler,
			contextMenuActionHandler: props.contextMenuActionHandler,
			editActionHandler: props.editActionHandler,
			clickActionHandler: props.clickActionHandler,
			decorationActionHandler: props.decorationActionHandler,
			toolbarMenuActionHandler: props.toolbarMenuActionHandler,
			tipHandler: props.tipHandler,
			idGeneratorHandler: props.idGeneratorHandler,
			selectionChangeHandler: props.selectionChangeHandler
		});
	}

	openPalette() {
		if (this.objectModel.getPaletteData()) {
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

	showTip(tipDef) {
		const that = this;
		if (this.pendingTooltip) {
			clearTimeout(this.pendingTooltip);
		}

		this.pendingTooltip = setTimeout(function() {
			that.setState({ tipDef: tipDef });
		}, tipDef.delay ? tipDef.delay : 750);
	}

	hideTip() {
		if (this.pendingTooltip) {
			clearTimeout(this.pendingTooltip);
		}
		if (this.isTipShowing()) {
			this.setState({ tipDef: {} });
		}
	}

	isTipShowing() {
		return !isEmpty(this.state.tipDef);
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

	configureToolbarButtonsState() {
		// We only set toolbar state with the internal object model. With the
		// external object model the host app must set toolbar state through the
		// toolbar config params.
		if (!this.canvasController.isInternalObjectModelEnabled()) {
			return;
		}

		let undoState = true;
		let redoState = true;
		let cutState = true;
		let copyState = true;
		let pasteState = true;
		let deleteState = true;

		if (!this.canvasController.getCommandStack().canUndo()) {
			undoState = false;
		}
		if (!this.canvasController.getCommandStack().canRedo()) {
			redoState = false;
		}
		if (this.objectModel.getSelectedObjectIds().length === 0) {
			cutState = false;
			copyState = false;
			deleteState = false;
		}
		if (this.canvasController.isClipboardEmpty()) {
			pasteState = false;
		}

		if (typeof this.state.toolbarConfig !== "undefined") {
			for (let i = 0; i < this.state.toolbarConfig.length; i++) {
				if (this.state.toolbarConfig[i].action === "undo") {
					this.state.toolbarConfig[i].enable = undoState;
				}
				if (this.state.toolbarConfig[i].action === "redo") {
					this.state.toolbarConfig[i].enable = redoState;
				}
				if (this.state.toolbarConfig[i].action === "cut") {
					this.state.toolbarConfig[i].enable = cutState;
				}
				if (this.state.toolbarConfig[i].action === "copy") {
					this.state.toolbarConfig[i].enable = copyState;
				}
				if (this.state.toolbarConfig[i].action === "paste") {
					this.state.toolbarConfig[i].enable = pasteState;
				}
				if (this.state.toolbarConfig[i].action === "delete") {
					this.state.toolbarConfig[i].enable = deleteState;
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
		let rightFlyout = (<div className="right-flyout-panel" />);
		let tip = null;
		const canvasStyle = { minWidth: "258px" };
		const canvasJSON = this.objectModel.getCanvasInfo();

		if (canvasJSON !== null) {
			if (this.state.showContextMenu) {
				contextMenuWrapper = (<ContextMenuWrapper
					containingDivId={this.itemsContainerDivId}
					contextMenuDef={this.state.contextMenuDef}
					canvasController={this.canvasController}
				/>);
			}

			if (this.props.config.enableRenderingEngine === "D3") {
				canvas = (<DiagramCanvasD3
					ref="canvas"
					canvas={canvasJSON}
					config={this.props.config}
					canvasController={this.canvasController}
				>
					<div>
						{contextMenuWrapper}
					</div>
				</DiagramCanvasD3>);
			} else {
				canvas = (<DiagramCanvasLegacy
					ref="canvas"
					canvas={canvasJSON}
					parentDivId={this.itemsContainerDivId}
					canvasController={this.canvasController}
				>
					{contextMenuWrapper}
				</DiagramCanvasLegacy>);
			}

			if (this.objectModel.getPaletteData()) {
				if (this.props.config.enablePaletteLayout === "Modal") {
					palette = (<Palette
						paletteJSON={this.objectModel.getPaletteData()}
						showPalette={this.state.isPaletteOpen}
						parentDivId={this.itemsContainerDivId}
						canvasController={this.canvasController}
					/>);
				} else {
					if (this.state.isPaletteOpen) {
						paletteClass = "canvas-palette-flyout-div-open";
						canvasStyle.minWidth = (parseFloat(canvasStyle.minWidth) + 250) + "px";
					}
					palette = (<PaletteFlyout
						paletteJSON={this.objectModel.getPaletteData()}
						showPalette={this.state.isPaletteOpen}
						canvasController={this.canvasController}
					/>);
				}
			}

			if (this.props.toolbarConfig) {
				this.configureToolbarButtonsState();
				canvasToolbar = (<Toolbar
					config={this.state.toolbarConfig}
					renderingEngine={this.props.config.enableRenderingEngine}
					paletteState={this.state.isPaletteOpen}
					paletteType={this.props.config.enablePaletteLayout}
					rightFlyoutOpen={this.props.showRightFlyout}
					canvasController={this.canvasController}
				/>);
			}
		}

		if (typeof this.state.rightFlyoutContent !== "undefined" &&
				this.state.rightFlyoutContent !== null &&
				this.props.showRightFlyout) {
			const widthObj = this.getEditorWidth();
			paletteClass += (" " + widthObj.className);
			canvasStyle.minWidth = (parseFloat(canvasStyle.minWidth) + widthObj.width) + "px";
			rightFlyout = (<div className="right-flyout-panel" ref={ (elem) => this.flyoutContent = elem} >
				{this.state.rightFlyoutContent}
			</div>);
		}

		let emptyCanvas = null;

		if (canvasJSON === null ||
				(canvasJSON.nodes.length === 0 &&
					canvasJSON.comments.length === 0)) {
			if (this.props.config.emptyCanvasContent) {
				emptyCanvas = (
					<div className="empty-canvas">
						{this.props.config.emptyCanvasContent}
					</div>);
			} else {
				emptyCanvas = (
					<div className="empty-canvas">
						<div>
							<img src={BlankCanvasImage} className="empty-canvas-image" />
							<span className="empty-canvas-text">Your flow is empty!</span>
						</div>
					</div>);
			}
		}

		if (!isEmpty(this.state.tipDef)) {

			tip = (<TooltipWrapper
				id={this.state.tipDef.id}
				type={this.state.tipDef.type}
				customContent={this.state.tipDef.customContent}
				targetObj={this.state.tipDef.targetObj}
				mousePos={this.state.tipDef.mousePos}
				node={this.state.tipDef.node}
				port={this.state.tipDef.port}
				nodeTemplate={this.state.tipDef.nodeTemplate}
				canvasController={this.canvasController}
			/>);
		}

		return (
			<div className="common-canvas" style={canvasStyle}>
				{palette}
				<div id={this.itemsContainerDivId} className={"common-canvas-items-container " + paletteClass}>
					{canvas}
					{emptyCanvas}
					{canvasToolbar}
				</div>
				{rightFlyout}
				{tip}
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
	closeRightFlyout: PropTypes.func,
	tipHandler: PropTypes.func,
	idGeneratorHandler: PropTypes.func,
	selectionChangeHandler: PropTypes.func,
	canvasController: PropTypes.object.isRequired
};
