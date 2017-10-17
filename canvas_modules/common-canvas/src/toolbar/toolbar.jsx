/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import Tooltips from "./tooltips.js";

import paletteDisabledIcon from "../../assets/images/canvas_toolbar_icons/palette_open_disabled.svg";
import paletteCloseIcon from "../../assets/images/canvas_toolbar_icons/palette_close.svg";
import paletteOpenIcon from "../../assets/images/canvas_toolbar_icons/palette_open.svg";

import runIcon from "../../assets/images/canvas_toolbar_icons/run.svg";
import runDisabledIcon from "../../assets/images/canvas_toolbar_icons/run_disabled.svg";
import stopIcon from "../../assets/images/canvas_toolbar_icons/stop.svg";
import stopDisabledIcon from "../../assets/images/canvas_toolbar_icons/stop_disabled.svg";

import addCommentIcon from "../../assets/images/canvas_toolbar_icons/add_comment.svg";
import addCommentDisabledIcon from "../../assets/images/canvas_toolbar_icons/add_comment_disabled.svg";
import copyIcon from "../../assets/images/canvas_toolbar_icons/copy.svg";
import copyDisabledIcon from "../../assets/images/canvas_toolbar_icons/copy_disabled.svg";
import cutIcon from "../../assets/images/canvas_toolbar_icons/cut.svg";
import cutDisabledIcon from "../../assets/images/canvas_toolbar_icons/cut_disabled.svg";
import deleteIcon from "../../assets/images/canvas_toolbar_icons/delete.svg";
import deleteDisabledIcon from "../../assets/images/canvas_toolbar_icons/delete_disabled.svg";
import pasteIcon from "../../assets/images/canvas_toolbar_icons/paste.svg";
import pasteDisabledIcon from "../../assets/images/canvas_toolbar_icons/paste_disabled.svg";
import redoIcon from "../../assets/images/canvas_toolbar_icons/redo.svg";
import redoDisabledIcon from "../../assets/images/canvas_toolbar_icons/redo_disabled.svg";
import undoIcon from "../../assets/images/canvas_toolbar_icons/undo.svg";
import undoDisabledIcon from "../../assets/images/canvas_toolbar_icons/undo_disabled.svg";
import arrangeHorizontallyIcon from "../../assets/images/canvas_toolbar_icons/arrange_horizontally.svg";
import arrangeHorizontallyDisabledIcon from "../../assets/images/canvas_toolbar_icons/arrange_horizontally_disabled.svg";
import arrangeVerticallyIcon from "../../assets/images/canvas_toolbar_icons/arrange_vertically.svg";
import arrangeVerticallyDisabledIcon from "../../assets/images/canvas_toolbar_icons/arrange_vertically_disabled.svg";

import zoomInIcon from "../../assets/images/canvas_toolbar_icons/zoom_in.svg";
import zoomOutIcon from "../../assets/images/canvas_toolbar_icons/zoom_out.svg";
import zoomToFitIcon from "../../assets/images/canvas_toolbar_icons/zoom_to_fit.svg";
import zoomToFitDisabledIcon from "../../assets/images/canvas_toolbar_icons/zoom_to_fit_disabled.svg";

import overflowIcon from "../../assets/images/canvas_toolbar_icons/overflow.svg";
import overflowDisabledIcon from "../../assets/images/canvas_toolbar_icons/overflow_disabled.svg";

import { TOOLBAR } from "../../constants/common-constants.js";

// eslint override
/* global window document */
/* eslint max-depth: ["error", 5] */

class Toolbar extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			config: this.props.config,
			defaultToolbarWidth: 256, // width of toolbar with default zoom icons
			maxToolbarWidth: 0, // width of toolbar if displaying all icons and dividers
			dividerCount: 0,
			showExtendedMenu: false
		};

		this.addCommentIcon = addCommentIcon;
		this.addCommentDisabledIcon = addCommentDisabledIcon;
		this.copyIcon = copyIcon;
		this.copyDisabledIcon = copyDisabledIcon;
		this.cutIcon = cutIcon;
		this.cutDisabledIcon = cutDisabledIcon;
		this.deleteIcon = deleteIcon;
		this.deleteDisabledIcon = deleteDisabledIcon;
		this.overflowIcon = overflowIcon;
		this.overflowDisabledIcon = overflowDisabledIcon;
		this.pasteIcon = pasteIcon;
		this.pasteDisabledIcon = pasteDisabledIcon;
		this.redoIcon = redoIcon;
		this.redoDisabledIcon = redoDisabledIcon;
		this.runIcon = runIcon;
		this.runDisabledIcon = runDisabledIcon;
		this.stopIcon = stopIcon;
		this.stopDisabledIcon = stopDisabledIcon;
		this.undoIcon = undoIcon;
		this.undoDisabledIcon = undoDisabledIcon;
		this.arrangeHorizontallyIcon = arrangeHorizontallyIcon;
		this.arrangeHorizontallyDisabledIcon = arrangeHorizontallyDisabledIcon;
		this.arrangeVerticallyIcon = arrangeVerticallyIcon;
		this.arrangeVerticallyDisabledIcon = arrangeVerticallyDisabledIcon;

		this.paletteDisabledIcon = paletteDisabledIcon;
		this.paletteCloseIcon = paletteCloseIcon;
		this.paletteOpenIcon = paletteOpenIcon;
		this.zoomInIcon = zoomInIcon;
		this.zoomOutIcon = zoomOutIcon;
		this.zoomToFitIcon = zoomToFitIcon;
		this.zoomToFitDisabledIcon = zoomToFitDisabledIcon;
		this.overflowIcon = overflowIcon;

		this.generatePaletteIcon = this.generatePaletteIcon.bind(this);
		this.toggleShowExtendedMenu = this.toggleShowExtendedMenu.bind(this);
		this.updateToolbarWidth = this.updateToolbarWidth.bind(this);
	}

	componentDidMount() {
		this.updateToolbarWidth();
		window.addEventListener("resize", this.updateToolbarWidth);

		if (this.props.config) {
			this.calculateMaxToolbarWidth(this.props.config);
		}
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.updateToolbarWidth);
	}

	getObjectWidth(classOrId) {
		const firstChar = classOrId.charAt(0);
		const remaining = classOrId.substring(1);
		const elem = (firstChar === "#") ? document.getElementById(remaining) : document.getElementsByClassName(remaining)[0];
		if (elem !== null) {
			return window.getComputedStyle(elem, null).getPropertyValue("width");
		}
		return null;
	}

	calculateMaxToolbarWidth(list) {
		let dividerCount = 0;
		let totalWidthSize = this.state.defaultToolbarWidth;
		for (let i = 0; i < list.length; i++) {
			if (list[i].action) {
				totalWidthSize += TOOLBAR.ICON_WIDTH;
			} else if (list[i].divider) {
				totalWidthSize += TOOLBAR.DIVIDER_WIDTH;
				dividerCount++;
			}
		}

		this.setState({
			dividerCount: dividerCount,
			maxToolbarWidth: totalWidthSize
		});
	}

	calculateDisplayItems(toolbarWidth) {
		const numObjects = this.props.config.length;
		if (this.state.maxToolbarWidth >= toolbarWidth) { // need to minimize
			let availableWidth = toolbarWidth - this.state.defaultToolbarWidth + TOOLBAR.ICON_WIDTH;
			if (toolbarWidth - this.state.defaultToolbarWidth <= (3 * TOOLBAR.ICON_WIDTH)) {
				availableWidth = toolbarWidth - this.state.defaultToolbarWidth;
			}

			if (availableWidth < TOOLBAR.ICON_WIDTH) {
				return 0;
			}
			const icons = parseInt((availableWidth - (this.state.dividerCount * TOOLBAR.DIVIDER_WIDTH)) / TOOLBAR.ICON_WIDTH, 10);
			if (icons < numObjects) {
				return icons + this.state.dividerCount - 1; // subtract 1 for the overflow icon
			}
		}
		return numObjects;
	}

	updateToolbarWidth() {
		const toolbarWidth = this.getObjectWidth("#canvas-toolbar");
		this.setState({
			toolbarWidth: toolbarWidth
		});
	}

	generateActionItems(definition, displayItems, actionsHandler, overflow) {
		const that = this;
		let utilityActions = [];
		let dividerClassName = "toolbar-divider";
		if (overflow) {
			dividerClassName = "overflow-toolbar-divider";
		}
		if (definition.length === displayItems) {
			utilityActions = definition.map(function(actionObj, actionObjNum) {
				if (actionObj.action) {
					const actionId = actionObj.action + "-action";
					if (actionObj.enable === true) {
						if (actionObj.action.startsWith("palette")) {
							return that.generatePaletteIcon(actionObj, overflow);
						}
						return that.generateEnabledActionIcon(actionObj, actionId, actionsHandler, overflow);
					}
					// disable
					return that.generateDisabledActionIcon(actionObj, actionId, overflow);
				}
				return (<div key={"toolbar-divider-" + actionObjNum} className={dividerClassName} />);
			});
		} else {
			for (let i = 0; i < displayItems; i++) {
				const actionObj = definition[i];
				if (actionObj.action) {
					const actionId = actionObj.action + "-action";
					if (actionObj.enable === true) {
						if (actionObj.action.startsWith("palette")) {
							utilityActions[i] = this.generatePaletteIcon(actionObj, overflow);
						} else {
							utilityActions[i] = this.generateEnabledActionIcon(actionObj, actionId, actionsHandler, overflow);
						}
					} else { // disable
						utilityActions[i] = this.generateDisabledActionIcon(actionObj, actionId, overflow);
					}
				} else {
					utilityActions[i] = (<div key={"toolbar-divider-" + i} className={dividerClassName} />);
				}
			}
			utilityActions[displayItems] = this.generatedExtendedMenu(definition, displayItems, actionsHandler);
		}
		return utilityActions;
	}

	generateEnabledActionIcon(actionObj, actionId, actionsHandler, overflow) {
		const overflowClassName = overflow ? "overflow" : "";
		let actionClickHandler = actionObj.callback;
		if (typeof actionsHandler === "function") {
			actionClickHandler = () => actionsHandler(actionObj.action);
		}
		let icon = this[actionObj.action + "Icon"];
		if (actionObj.iconEnabled) {
			icon = actionObj.iconEnabled;
		}

		return (<li id={actionId} key={actionId} className={"list-item-containers " + overflowClassName}>
			<a onClick={actionClickHandler} className={"list-item " + overflowClassName} data-tooltip={actionObj.label} data-action={actionId}>
				<div className={"toolbar-item " + overflowClassName}>
					<img id={"toolbar-icon-" + actionObj.action} className={"toolbar-icons " + overflowClassName}
						src={icon}
					/>
					{this.generateTooltip(false, overflow, actionObj.label, actionId + "-tooltip")}
				</div>
			</a>
		</li>);
	}

	generateDisabledActionIcon(actionObj, actionId, overflow) {
		const overflowClassName = overflow ? "overflow" : "";
		let icon = this[actionObj.action + "DisabledIcon"];
		if (actionObj.action.startsWith("palette")) {
			icon = this.paletteDisabledIcon;
		}
		if (actionObj.iconDisabled) {
			icon = actionObj.iconDisabled;
		}

		return (<li id={actionId} key={actionId} className={"list-item-containers " + overflowClassName}>
			<a className={"list-item list-item-disabled " + overflowClassName} data-tooltip={actionObj.label} data-action={actionId}>
				<div className={"toolbar-item " + overflowClassName}>
					<img id={"toolbar-icon-" + actionObj.action} className={"toolbar-icons " + overflowClassName}
						src={icon}
					/>
					{this.generateTooltip(true, overflow, actionObj.label, actionId + "-tooltip")}
				</div>
			</a>
		</li>);
	}

	generatePaletteIcon(actionObj, overflow) {
		actionObj.action = "paletteOpen";
		if (this.props.openPalette) {
			actionObj.callback = this.props.openPalette;
		}
		let palette = this.generateEnabledActionIcon(actionObj, "palette-open-action", null, overflow);

		if (this.props.paletteState) {
			actionObj.action = "paletteClose";
			if (this.props.closePalette) {
				actionObj.callback = this.props.closePalette;
			}
			palette = this.generateEnabledActionIcon(actionObj, "palette-close-action", null, overflow);
		}
		return palette;
	}

	generatedExtendedMenu(actions, displayItems, actionsHandler) {
		const subActionsList = actions.slice(displayItems, actions.length);
		const subActionsListItems = this.generateActionItems(subActionsList, subActionsList.length, actionsHandler, true);
		const subMenuClassName = this.state.showExtendedMenu === true ? "" : "toolbar-popover-list-hide";
		return (
			<li id={"overflow-action"} key={"overflow-action"} className="list-item-containers">
				<a onClick={() => this.toggleShowExtendedMenu()} className="overflow-action-list-item list-item toolbar-divider">
					<div className="toolbar-item">
						<img id={"toolbar-icon-overflow"} className="toolbar-icons"
							src={this.overflowIcon}
						/>
					</div>
				</a>
				<ul className={"toolbar-popover-list " + subMenuClassName}>
					{subActionsListItems}
				</ul>
			</li>
		);
	}

	generateTooltip(disable, overflow, label, tooltipId) {
		const disabled = disable ? "disabled" : "";
		let iconLabel = <div />;
		if (overflow) {
			iconLabel = (<div className={"overflow-toolbar-icon-label " + disabled}>{label}</div>);
		}
		return iconLabel;
	}

	toggleShowExtendedMenu() {
		this.setState({ showExtendedMenu: !this.state.showExtendedMenu });
	}

	render() {
		const canvasWidth = window.innerWidth;
		let toolbarWidth = window.innerWidth;

		if (this.props.paletteState && this.props.paletteType !== "Modal") {
			toolbarWidth = canvasWidth - 250;
		}

		const that = this;
		let actionContainer = <div />;
		if (this.state.config && this.state.config.length > 0) {
			const displayItems = this.calculateDisplayItems(toolbarWidth);
			const actions = that.generateActionItems(
				that.props.config,
				displayItems,
				that.props.toolbarMenuActionHandler,
				""
			);
			actionContainer = (<div key={"actions-container"} id={"actions-container"} className="toolbar-items-container">
				{actions}
			</div>);
		}

		const zoomActionItems = [
			{ action: "zoomIn", label: "Zoom In", enable: true, callback: this.props.zoomIn },
			{ action: "zoomOut", label: "Zoom Out", enable: true, callback: this.props.zoomOut },
			{ action: "zoomToFit", label: "Zoom to Fit", enable: true, callback: this.props.zoomToFit }
		];
		const zoomContainerItems = this.generateActionItems(zoomActionItems, zoomActionItems.length, null, "");
		const zoomContainer = (<div id="zoom-actions-container" className="toolbar-items-container">
			{zoomContainerItems}
		</div>);

		Tooltips.updateTooltips("toolbar-items-container");

		let toolbarClass = "toolbar-fixed-location";
		if (this.props.renderingEngine === "D3") {
			toolbarClass = "";
		}

		const canvasToolbar = (<div id="canvas-toolbar" className={toolbarClass} style={{ width: toolbarWidth + "px" }}>
			<ul id="toolbar-items">
				{actionContainer}
				{zoomContainer}
			</ul>
		</div>);

		return canvasToolbar;
	}
}

Toolbar.propTypes = {
	config: PropTypes.array,
	renderingEngine: PropTypes.string,
	paletteState: PropTypes.bool,
	paletteType: PropTypes.string,
	closePalette: PropTypes.func,
	openPalette: PropTypes.func,
	zoomIn: PropTypes.func,
	zoomOut: PropTypes.func,
	zoomToFit: PropTypes.func,
	toolbarMenuActionHandler: PropTypes.func
};

export default Toolbar;
