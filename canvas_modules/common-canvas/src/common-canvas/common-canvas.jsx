/*
 * Copyright 2017-2020 Elyra Authors
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

/* eslint max-depth: ["error", 5] */
/* eslint no-return-assign: "off" */

import React from "react";
import { injectIntl } from "react-intl";

import PropTypes from "prop-types";
import ContextMenuWrapper from "../context-menu/context-menu-wrapper.jsx";
import DiagramCanvasD3 from "./diagram-canvas-d3.jsx";
import PaletteDialog from "../palette/palette-dialog.jsx";
import PaletteFlyout from "../palette/palette-flyout.jsx";
import CommonCanvasToolbar from "./common-canvas-toolbar.jsx";
import NotificationPanel from "../notification-panel/notification-panel.jsx";
import TooltipWrapper from "../tooltip/tooltip-wrapper.jsx";
import isEmpty from "lodash/isEmpty";
import Logger from "../logging/canvas-logger.js";

import { PALETTE } from "./constants/canvas-constants.js";

class CommonCanvas extends React.Component {
	constructor(props) {
		super(props);

		this.logger = new Logger(["CommonCanvas"]);
		this.logger.log("constructor");

		let paletteInitialState = this.props.config ? this.props.config.paletteInitialState : false;
		if (!paletteInitialState) {
			paletteInitialState = false; // Ensure any falsey value is set to false.
		}

		this.state = {
			isPaletteOpen: paletteInitialState,
			isNotificationOpen: false,
			showContextMenu: false,
			contextMenuDef: {},
			tipDef: {},
			paletteWidth: PALETTE.OPEN_WIDTH
		};

		this.diagramCanvasRef = React.createRef();

		this.openContextMenu = this.openContextMenu.bind(this);
		this.closeContextMenu = this.closeContextMenu.bind(this);
		this.isContextMenuDisplayed = this.isContextMenuDisplayed.bind(this);

		this.openTip = this.openTip.bind(this);
		this.closeTip = this.closeTip.bind(this);
		this.isTipOpen = this.isTipOpen.bind(this);
		this.isTipOpening = this.isTipOpening.bind(this);
		this.isTipClosing = this.isTipClosing.bind(this);

		this.openPalette = this.openPalette.bind(this);
		this.closePalette = this.closePalette.bind(this);

		this.openNotificationPanel = this.openNotificationPanel.bind(this);
		this.closeNotificationPanel = this.closeNotificationPanel.bind(this);

		this.initializeController = this.initializeController.bind(this);
		this.setPaletteWidth = this.setPaletteWidth.bind(this);

		this.canvasController = this.props.canvasController;
		this.canvasController.setIntl(props.intl);
		this.canvasController.setCommonCanvas(this);

		this.allowForceUpdate = true;
		this.pendingTooltip = null;
		this.tipOpening = false;
		this.tipClosing = false;
		this.itemsContainerDivId = "common-canvas-items-container-" + this.canvasController.getInstanceId();

		this.objectModel = this.canvasController.getObjectModel();

		// The host application may set one or more callback functions to execute their own
		// code after an update has been performed caused by a redux update.
		this.afterUpdateCallbacks = [];

		this.unsubscribe = this.objectModel.subscribe(() => {
			if (this.allowForceUpdate) {
				this.logger.log("Force Update");
				this.forceUpdate(this.afterUpdate);
			}
		});
	}

	componentDidMount() {
		document.addEventListener("mousedown", this.canvasController.closeTip.bind(this.canvasController), true);
		this.setPaletteWidth();
	}

	componentDidUpdate() {
		this.setPaletteWidth();
	}

	componentWillUnmount() {
		this.unsubscribe();
		document.removeEventListener("mousedown", this.canvasController.closeTip, true);
	}

	// Prevent the default behavior (which is to show a plus-sign pointer) as
	// an object is being dragged over the common canvas components.
	// Note: this is overriden by the canvas area itself to allow external objects
	// to be dragged over it.
	onDragOver(evt) {
		evt.preventDefault();
	}

	// Prevent an object being dropped on the common canvas causing a file
	// download event (which is the default!). Note: this is overriden by the
	// canvas area itself to allow external objects to be dropped on it.
	onDrop(evt) {
		evt.preventDefault();
	}

	setPaletteWidth() {
		const config = this.canvasController.getCanvasConfig();
		let paletteWidth = config.enableNarrowPalette || typeof config.enableNarrowPalette === "undefined" ? PALETTE.NARROW_WIDTH : PALETTE.CLOSED_WIDTH;
		if (this.state.isPaletteOpen) {
			paletteWidth = PALETTE.OPEN_WIDTH;
		}
		if (paletteWidth !== this.state.paletteWidth) {
			this.setState({ paletteWidth: paletteWidth });
		}
	}

	getSvgViewportOffset() {
		return this.diagramCanvasRef.current.getSvgViewportOffset();
	}

	getTransformedViewportDimensions() {
		return this.diagramCanvasRef.current.getTransformedViewportDimensions();
	}

	getGhostNode(nodeTemplate) {
		return this.diagramCanvasRef.current.getGhostNode(nodeTemplate);
	}

	getZoomToReveal(objectIds, xPos, yPos) {
		return this.diagramCanvasRef.current.getZoomToReveal(objectIds, xPos, yPos);
	}

	getZoom() {
		return this.diagramCanvasRef.current.getZoom();
	}

	afterUpdate() {
		this.afterUpdateCallbacks.forEach((callback) => callback());
	}

	addAfterUpdateCallback(callback) {
		const pos = this.afterUpdateCallbacks.findIndex((cb) => cb === callback);
		if (pos === -1) {
			this.afterUpdateCallbacks.push(callback);
		}
	}

	removeAfterUpdateCallback(callback) {
		const pos = this.afterUpdateCallbacks.findIndex((cb) => cb === callback);
		if (pos > -1) {
			this.afterUpdateCallbacks.splice(pos, 1);
		}
	}

	initializeController(props) {
		this.logger.log("initializeController");
		// Updating canvas config causes the layout info to be updated in redux
		// which, in turn, causes forceUpdate to be called. So we prevent force
		// update running here because we are rendering common canvas anyway.
		this.allowForceUpdate = false;
		this.canvasController.setCanvasConfig(props.config);
		this.allowForceUpdate = true;

		this.canvasController.setContextMenuConfig(props.contextMenuConfig);
		this.canvasController.setKeyboardConfig(props.keyboardConfig);

		this.canvasController.setHandlers({
			contextMenuHandler: props.contextMenuHandler,
			beforeEditActionHandler: props.beforeEditActionHandler,
			editActionHandler: props.editActionHandler,
			clickActionHandler: props.clickActionHandler,
			decorationActionHandler: props.decorationActionHandler,
			tipHandler: props.tipHandler,
			layoutHandler: props.layoutHandler,
			idGeneratorHandler: props.idGeneratorHandler,
			selectionChangeHandler: props.selectionChangeHandler
		});
	}

	togglePalette() {
		if (this.state.isPaletteOpen) {
			this.closePalette();
		} else {
			this.openPalette();
		}
	}

	openPalette() {
		if (this.canvasController.getPaletteData()) {
			this.setState({ isPaletteOpen: true });
		}
		this.setPaletteWidth();
	}

	closePalette() {
		this.setState({ isPaletteOpen: false });
		this.setPaletteWidth();
	}

	isPaletteOpen() {
		return this.state.isPaletteOpen;
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

	toggleNotificationPanel() {
		if (this.state.isNotificationOpen) {
			this.closeNotificationPanel();
		} else {
			this.openNotificationPanel();
		}
	}

	openNotificationPanel() {
		this.setState({ isNotificationOpen: true });
	}

	closeNotificationPanel() {
		this.setState({ isNotificationOpen: false });
	}

	isRightFlyoutOpen() {
		return this.props.showRightFlyout;
	}

	openTip(tipDef) {
		const that = this;
		if (this.pendingTooltip) {
			clearTimeout(this.pendingTooltip);
		}

		this.pendingTooltip = setTimeout(function() {
			that.tipOpening = true;
			that.setState({ tipDef: tipDef });
			that.tipOpening = false;
		}, tipDef.delay ? tipDef.delay : 200);
	}

	closeTip() {
		if (this.pendingTooltip) {
			clearTimeout(this.pendingTooltip);
		}
		if (this.isTipOpen()) {
			this.tipClosing = true;
			this.setState({ tipDef: {} });
			this.tipClosing = false;
		}
	}

	isTipOpen() {
		return !isEmpty(this.state.tipDef);
	}

	isTipOpening() {
		return this.tipOpening;
	}

	isTipClosing() {
		return this.tipClosing;
	}

	zoomIn() {
		this.diagramCanvasRef.current.zoomIn();
	}

	zoomOut() {
		this.diagramCanvasRef.current.zoomOut();
	}

	zoomToFit() {
		this.diagramCanvasRef.current.zoomToFit();
	}

	zoomTo(zoomObject) {
		this.diagramCanvasRef.current.zoomTo(zoomObject);
	}

	translateBy(x, y, animateTime) {
		this.diagramCanvasRef.current.translateBy(x, y, animateTime);
	}

	focusOnCanvas() {
		this.diagramCanvasRef.current.focusOnCanvas(); // Set focus on div so keybord events go there.
	}

	render() {
		this.logger.log("render");
		let canvas = null;
		let palette = null;
		let contextMenuWrapper = null;
		let canvasToolbar = null;
		let notificationPanel = null;
		let rightSideItems = null;
		let rightFlyout = (<div className="right-flyout-panel" />);
		let tip = null;

		this.initializeController(this.props);

		const canvasInfo = this.canvasController.getCanvasInfo();
		const config = this.canvasController.getCanvasConfig();

		if (canvasInfo !== null) {
			if (this.state.showContextMenu) {
				contextMenuWrapper = (<ContextMenuWrapper
					containingDivId={this.itemsContainerDivId}
					contextMenuDef={this.state.contextMenuDef}
					contextMenuActionHandler={this.canvasController.contextMenuActionHandler}
					contextMenuPos={this.canvasController.getContextMenuPos()}
					closeContextMenu={this.canvasController.closeContextMenu}
					stopPropagation
				/>);
			}

			canvas = (
				<DiagramCanvasD3
					ref={this.diagramCanvasRef}
					canvasInfo={canvasInfo}
					config={config}
					canvasController={this.canvasController}
					isCanvasEmpty={this.canvasController.isPrimaryPipelineEmpty()}
				>
					{contextMenuWrapper}
				</DiagramCanvasD3>);

			// If there's no config we still want the palette
			if (!config || config.enablePaletteLayout === "Flyout") {
				palette = (<PaletteFlyout
					paletteJSON={this.canvasController.getPaletteData()}
					showPalette={this.state.isPaletteOpen}
					canvasController={this.canvasController}
					paletteWidth={this.state.paletteWidth}
				/>);
			} else if (config.enablePaletteLayout === "Modal") {
				palette = (<PaletteDialog
					paletteJSON={this.canvasController.getPaletteData()}
					showPalette={this.state.isPaletteOpen}
					parentDivId={this.itemsContainerDivId}
					canvasController={this.canvasController}
				/>);
			}

			if (this.props.notificationConfig) {
				notificationPanel = (<NotificationPanel
					notificationConfig={this.props.notificationConfig}
					isNotificationOpen={this.state.isNotificationOpen}
					messages={this.canvasController.getNotificationMessages()}
					canvasController={this.canvasController}
				/>);
			}

			// If there's no config we still want the toolbar
			if (!config || config.enableToolbarLayout === "Top") {
				canvasToolbar = (<CommonCanvasToolbar
					config={this.props.toolbarConfig}
					isPaletteEnabled={!config || config.enablePaletteLayout !== "None"}
					isPaletteOpen={this.state.isPaletteOpen}
					isNotificationOpen={this.state.isNotificationOpen}
					notificationConfig={this.props.notificationConfig}
					canvasController={this.canvasController}
				/>);
			}
		}

		if (typeof this.props.rightFlyoutContent !== "undefined" &&
				this.props.rightFlyoutContent !== null &&
				this.props.showRightFlyout) {
			const rfClass = this.props.config.enableRightFlyoutUnderToolbar
				? "right-flyout-panel under-toolbar"
				: "right-flyout-panel";
			rightFlyout = (
				<div className={rfClass}>
					{this.props.rightFlyoutContent}
				</div>
			);
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

		if (config.enableRightFlyoutUnderToolbar) {
			rightSideItems = (
				<div className="common-canvas-right-side-items-under-toolbar">
					{canvasToolbar}
					<div id={this.itemsContainerDivId} className="common-canvas-items-container-under-toolbar">
						{canvas}
						{rightFlyout}
						{notificationPanel}
					</div>
				</div>
			);

		} else {
			rightSideItems = (
				<div className="common-canvas-right-side-items">
					<div id={this.itemsContainerDivId} className="common-canvas-items-container">
						{canvasToolbar}
						{canvas}
						{notificationPanel}
					</div>
					{rightFlyout}
				</div>
			);
		}

		const className = "common-canvas" + (
			this.props.config && this.props.config.enableParentClass
				? " " + this.props.config.enableParentClass
				: "");

		return (
			<div className={className} onDragOver={this.onDragOver} onDrop={this.onDrop}>
				{palette}
				{rightSideItems}
				{tip}
			</div>
		);
	}
}

CommonCanvas.propTypes = {
	intl: PropTypes.object.isRequired,
	canvasController: PropTypes.object.isRequired,
	config: PropTypes.object,
	toolbarConfig: PropTypes.oneOfType([
		PropTypes.array,
		PropTypes.object
	]),
	notificationConfig: PropTypes.object,
	contextMenuConfig: PropTypes.object,
	keyboardConfig: PropTypes.object,
	contextMenuHandler: PropTypes.func,
	beforeEditActionHandler: PropTypes.func,
	editActionHandler: PropTypes.func,
	clickActionHandler: PropTypes.func,
	decorationActionHandler: PropTypes.func,
	tipHandler: PropTypes.func,
	layoutHandler: PropTypes.func,
	idGeneratorHandler: PropTypes.func,
	selectionChangeHandler: PropTypes.func,
	rightFlyoutContent: PropTypes.object,
	showRightFlyout: PropTypes.bool
};

export default injectIntl(CommonCanvas);
