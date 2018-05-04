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
import DiagramCanvasD3 from "./diagram-canvas-d3.jsx";
import Palette from "../palette/palette.jsx";
import PaletteFlyout from "../palette/palette-flyout.jsx";
import Toolbar from "../toolbar/toolbar.jsx";
import NotificationPanel from "../notification-panel/notification-panel.jsx";
import BlankCanvasImage from "../../assets/images/blank_canvas.svg";
import TooltipWrapper from "../tooltip/tooltip-wrapper.jsx";
import isEmpty from "lodash/isEmpty";

import { DEFAULT_NOTIFICATION_HEADER } from "./constants/canvas-constants.js";

import globalStyles from "../../assets/styles/global.scss";
import canvasStyles from "../../assets/styles/common-canvas.scss";


export default class CommonCanvas extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isPaletteOpen: this.props.config.paletteInitialState || false,
			isNotificationOpen: false,
			showContextMenu: false,
			contextMenuDef: {},
			toolbarConfig: this.props.toolbarConfig,
			notificationConfig: this.props.notificationConfig,
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
		this.openNotificationPanel = this.openNotificationPanel.bind(this);
		this.closeNotificationPanel = this.closeNotificationPanel.bind(this);

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

		this.configureToolbarBellIconClassName = this.configureToolbarBellIconClassName.bind(this);
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

		if (newProps.notificationConfig) {
			if ((this.state.notificationConfig.label !== newProps.notificationConfig.label) ||
					(this.state.notificationConfig.enable !== newProps.notificationConfig.enable)) {
				this.setState({ notificationConfig: newProps.notificationConfig });
			}
		}

		this.initializeController(newProps);
	}

	componentWillUnmount() {
		this.unsubscribe();
		document.removeEventListener("mousedown", this.hideTip, true);
	}

	getEditorWidth() {
		let width = parseInt(globalStyles.smallFlyoutWidth, 10);
		let className = "canvas-flyout-div-open";
		if (this.flyoutContent) {
			width = this.flyoutContent.offsetWidth;
		}
		if (width > parseInt(globalStyles.smallFlyoutWidth, 10) + 10) {
			if (width > parseInt(globalStyles.mediumFlyoutWidth, 10) + 10) {
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

	getSvgViewportOffset() {
		return this.refs.canvas.getSvgViewportOffset();
	}

	initializeController(props) {
		this.canvasController.setCanvasConfig({
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
			closeRightFlyout: props.closeRightFlyout,
			schemaValidation: props.config.schemaValidation
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

	openNotificationPanel() {
		this.setState({ isNotificationOpen: true });
	}

	closeNotificationPanel() {
		this.setState({ isNotificationOpen: false });
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

	configureToolbarBellIconClassName(newState) {
		const newConfig = Object.assign({}, this.state.notificationConfig);
		newConfig.className = newState;
		this.setState({ notificationConfig: newConfig });
	}

	render() {
		let canvas = null;
		let palette = null;
		const showNarrowPalette = this.props.config.enableNarrowPalette || typeof this.props.config.enableNarrowPalette === "undefined";
		let paletteClass = showNarrowPalette ? "canvas-palette-flyout-div-closed-narrow" : "canvas-palette-flyout-div-closed-none";
		let contextMenuWrapper = null;
		let canvasToolbar = null;
		let notificationPanel = null;
		let rightFlyout = (<div className="right-flyout-panel" />);
		let tip = null;
		let commonCanvasWidth = parseInt(canvasStyles.canvasMinWidth, 10); // ParseInt to remove "px"
		const paletteFlyoutWidth = parseInt(canvasStyles.paletteFlyoutWidth, 10); // ParseInt to remove "px"
		const canvasInfo = this.objectModel.getCanvasInfo();

		if (canvasInfo !== null) {
			if (this.state.showContextMenu) {
				contextMenuWrapper = (<ContextMenuWrapper
					containingDivId={this.itemsContainerDivId}
					contextMenuDef={this.state.contextMenuDef}
					canvasController={this.canvasController}
				/>);
			}

			canvas = (
				<DiagramCanvasD3
					ref="canvas"
					canvasInfo={canvasInfo}
					config={this.props.config}
					canvasController={this.canvasController}
				>
					<div>
						{contextMenuWrapper}
					</div>
				</DiagramCanvasD3>);

			if (this.objectModel.getPaletteData()) {
				if (this.props.config.enablePaletteLayout === "Modal") {
					paletteClass = "canvas-palette-flyout-div-closed-none";
					palette = (<Palette
						paletteJSON={this.objectModel.getPaletteData()}
						showPalette={this.state.isPaletteOpen}
						parentDivId={this.itemsContainerDivId}
						canvasController={this.canvasController}
					/>);
				} else {
					if (this.state.isPaletteOpen) {
						paletteClass = "canvas-palette-flyout-div-open";
						commonCanvasWidth += paletteFlyoutWidth;
					}
					palette = (<PaletteFlyout
						paletteJSON={this.objectModel.getPaletteData()}
						showPalette={this.state.isPaletteOpen}
						canvasController={this.canvasController}
						showNarrowPalette={showNarrowPalette}
					/>);
				}
			}

			const notificationHeader = this.state.notificationConfig && this.state.notificationConfig.notificationHeader
				? this.state.notificationConfig.notificationHeader
				: DEFAULT_NOTIFICATION_HEADER;
			notificationPanel = (<NotificationPanel
				notificationHeader={notificationHeader}
				isNotificationOpen={this.state.isNotificationOpen}
				messages={this.canvasController.getNotificationMessages()}
				canvasController={this.canvasController}
			/>);

			if (this.props.toolbarConfig) {
				this.configureToolbarButtonsState();
				canvasToolbar = (<Toolbar
					config={this.state.toolbarConfig}
					notificationConfig={this.state.notificationConfig}
					isPaletteOpen={this.state.isPaletteOpen}
					isNotificationOpen={this.state.isNotificationOpen}
					canvasController={this.canvasController}
				/>);
			}
		}

		if (typeof this.state.rightFlyoutContent !== "undefined" &&
				this.state.rightFlyoutContent !== null &&
				this.props.showRightFlyout) {
			const widthObj = this.getEditorWidth();
			paletteClass += (" " + widthObj.className);
			commonCanvasWidth += widthObj.width;
			rightFlyout = (<div className="right-flyout-panel" ref={ (elem) => this.flyoutContent = elem} >
				{this.state.rightFlyoutContent}
			</div>);
		}

		let emptyCanvas = null;

		const primaryPipeline = this.objectModel.getCanvasInfoPipeline();
		if (primaryPipeline === null ||
				(primaryPipeline.nodes.length === 0 &&
					primaryPipeline.comments.length === 0)) {
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
				category={this.state.tipDef.category}
				canvasController={this.canvasController}
			/>);
		}

		return (
			<div className="common-canvas" style={{ minWidth: commonCanvasWidth + "px" }}>
				{palette}
				<div id={this.itemsContainerDivId} className={"common-canvas-items-container " + paletteClass}>
					{canvas}
					{emptyCanvas}
					{canvasToolbar}
					{notificationPanel}
				</div>
				{rightFlyout}
				{tip}
			</div>
		);
	}
}

CommonCanvas.propTypes = {
	config: PropTypes.object.isRequired,
	contextMenuHandler: PropTypes.func,
	contextMenuActionHandler: PropTypes.func,
	editActionHandler: PropTypes.func,
	clickActionHandler: PropTypes.func,
	decorationActionHandler: PropTypes.func,
	toolbarMenuActionHandler: PropTypes.func,
	toolbarConfig: PropTypes.array,
	notificationConfig: PropTypes.object,
	rightFlyoutContent: PropTypes.object,
	showRightFlyout: PropTypes.bool,
	closeRightFlyout: PropTypes.func,
	tipHandler: PropTypes.func,
	idGeneratorHandler: PropTypes.func,
	selectionChangeHandler: PropTypes.func,
	canvasController: PropTypes.object.isRequired
};
