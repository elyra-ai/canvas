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

import zoomInIcon from "../../assets/images/canvas_toolbar_icons/zoom_in.svg";
import zoomOutIcon from "../../assets/images/canvas_toolbar_icons/zoom_out.svg";
import zoomToFitIcon from "../../assets/images/canvas_toolbar_icons/zoom_to_fit.svg";
import zoomToFitDisabledIcon from "../../assets/images/canvas_toolbar_icons/zoom_to_fit_disabled.svg";

import overflowIcon from "../../assets/images/canvas_toolbar_icons/overflow.svg";
import overflowDisabledIcon from "../../assets/images/canvas_toolbar_icons/overflow_disabled.svg";

import { TOOLBAR } from "../../constants/common-constants.js";

// eslint override
/* global window document */

class Toolbar extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			toolbarDefinition: [],
			defaultToolbarWidth: 258, // width of toolbar with default paletter and zoom icons
			maxToolbarWidth: 0, // width of toolbar if displaying all icons and dividers
			showExtendedMenu: []
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

		this.paletteDisabledIcon = paletteDisabledIcon;
		this.paletteCloseIcon = paletteCloseIcon;
		this.paletteOpenIcon = paletteOpenIcon;
		this.zoomInIcon = zoomInIcon;
		this.zoomOutIcon = zoomOutIcon;
		this.zoomToFitIcon = zoomToFitIcon;
		this.zoomToFitDisabledIcon = zoomToFitDisabledIcon;
		this.overflowIcon = overflowIcon;

		this.toogleShowExtendedMenu = this.toogleShowExtendedMenu.bind(this);
		this.updateToolbarWidth = this.updateToolbarWidth.bind(this);
	}

	componentDidMount() {
		this.updateToolbarWidth();
		window.addEventListener("resize", this.updateToolbarWidth);

		this.sortActionList(this.props.config.toolbarDefinition);
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

	/**
		Create the structure like below:
		[
			{
				definition: [
					{ action: "stop", label: "Stop Execution", disable: true },
					{ action: "run", label: "Run Pipeline", disable: true }
				],
				divider: true,
				overflow: false
			},
			{
				definition: [
					{ action: "undo", label: "Undo", disable: false },
					{ action: "redo", label: "Redo", disable: false },
					{ action: "cut", label: "Cut", disable: true },
					{ action: "copy", label: "Copy", disable: true },
					{ action: "paste", label: "Paste", disable: true },
					{ action: "addComment", label: "Add Comment", disable: false },
					{ action: "delete", label: "Delete", disable: false }
				],
				divider: true,
				overflow: true
			}
		]
	*/
	sortActionList(list) {
		const listSections = [];
		let dividerCount = 0;
		let totalWidthSize = this.state.defaultToolbarWidth;
		for (let i = 0; i < list.length; i++) {
			if (list[i].action) {
				if (typeof listSections[dividerCount] !== "undefined") {
					const tempArray = listSections[dividerCount].definition;
					listSections[dividerCount] = { definition: tempArray.concat(list[i]) };
				} else {
					listSections[dividerCount] = { definition: [list[i]] };
				}
				totalWidthSize += TOOLBAR.ICON_WIDTH;
			} else if (list[i].divider) {
				listSections[dividerCount].divider = list[i].divider;
				listSections[dividerCount].overflow = list[i].overflow;
				dividerCount++;
				totalWidthSize += TOOLBAR.DIVIDER_WIDTH;
			}
		}

		this.setState({
			toolbarDefinition: listSections,
			maxToolbarWidth: totalWidthSize
		});
	}

	calculateDisplayItems(toolbarPaletteWidth, index) {
		const toolbarDefinitionLength = this.state.toolbarDefinition.length;

		if (this.state.maxToolbarWidth >= toolbarPaletteWidth) { // need to minimize
			const availableWidth = toolbarPaletteWidth - this.state.defaultToolbarWidth;
			let otherContainerWidth = 0;
			for (let i = 0; i < toolbarDefinitionLength; i++) {
				if (index < i) {
					otherContainerWidth += TOOLBAR.ICON_WIDTH;
				} else if (index > i) {
					otherContainerWidth += this.state.toolbarDefinition[i].definition.length * TOOLBAR.ICON_WIDTH;
				}
				otherContainerWidth += this.state.toolbarDefinition[i].divider ? TOOLBAR.DIVIDER_WIDTH : 0;
			}

			if (availableWidth - otherContainerWidth < TOOLBAR.ICON_WIDTH) {
				return 0;
			}
			const icons = parseInt((availableWidth - otherContainerWidth) / TOOLBAR.ICON_WIDTH, 10);
			if (icons < this.state.toolbarDefinition[index].definition.length) {
				return icons - 1;
			}
		}
		return this.state.toolbarDefinition[index].definition.length;
	}

	updateToolbarWidth() {
		const toolbarWidth = this.getObjectWidth("#canvas-toolbar");
		this.setState({
			toolbarWidth: toolbarWidth
		});
	}

	generateActionItems(actions, displayItems, actionsHandler, actionsContainerNum) {
		const that = this;
		let utilityActions = [];
		if (actions.length === displayItems) {
			utilityActions = actions.map(function(actionObj, actionObjNum) {
				const actionId = actionObj.action + "-action";
				if (actionObj.disable === false) {
					return that.generateEnabledActionIcon(actionObj, actionId, actionsHandler);
				}
				// disable
				return that.generateDisabledActionIcon(actionObj, actionId);
			});
		} else {
			for (let i = 0; i < displayItems; i++) {
				const actionObj = actions[i];
				const actionId = actionObj.action + "-action";
				if (actionObj.disable === false) {
					utilityActions[i] = this.generateEnabledActionIcon(actionObj, actionId, actionsHandler);
				} else { // disable
					utilityActions[i] = this.generateDisabledActionIcon(actionObj, actionId);
				}
			}
			utilityActions[displayItems] = this.generatedExtendedMenu(actions, displayItems, actionsHandler, actionsContainerNum);
		}
		return utilityActions;
	}

	generateEnabledActionIcon(actionObj, actionId, actionsHandler) {
		let actionClickHandler = actionObj.callback;
		if (typeof actionsHandler === "function") {
			actionClickHandler = () => actionsHandler(actionObj.action);
		}
		let icon = this[actionObj.action + "Icon"];
		if (actionObj.iconEnabled) {
			icon = actionObj.iconEnabled;
		}

		return (<li id={actionId} key={actionId} className="list-item">
			<a onClick={actionClickHandler} className="list-item">
				<div className="toolbar-item">
					<img id={"toolbar-icon-" + actionObj.action} className="toolbar-icons"
						src={icon}
					/>
				</div>
			</a>
		</li>);
	}

	generateDisabledActionIcon(actionObj, actionId) {
		let icon = this[actionObj.action + "DisabledIcon"];
		if (actionObj.iconDisabled) {
			icon = actionObj.iconDisabled;
		}

		return (<li id={actionId} key={actionId} className="list-item">
			<a className="list-item list-item-disabled ">
				<div className="toolbar-item">
					<img id={"toolbar-icon-" + actionObj.action} className="toolbar-icons"
						src={icon}
					/>
				</div>
			</a>
		</li>);
	}

	generatedExtendedMenu(actions, displayItems, actionsHandler, actionsContainerNum) {
		const subActionsList = actions.slice(displayItems, actions.length);
		const subActionsListItems = this.generateActionItems(subActionsList, subActionsList.length, actionsHandler, actionsHandler);
		const subMenuClassName = this.state.showExtendedMenu[actionsContainerNum] === true ? "" : "toolbar-popover-list-hide";
		return (
			<li id={"overflow-action" + actionsContainerNum} key={"overflow-action" + actionsContainerNum} className="list-item">
				<a onClick={() => this.toogleShowExtendedMenu(actionsContainerNum)} className="overflow-action-list-item list-item toolbar-divider">
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

	toogleShowExtendedMenu(actionsContainerNum) {
		const extMenuState = this.state.showExtendedMenu;
		extMenuState[actionsContainerNum] = !extMenuState[actionsContainerNum];
		this.setState({ showExtendedMenu: extMenuState });
	}

	render() {
		const divider = (<div className="toolbar-divider" />);
		const canvasWidth = window.innerWidth;
		let toolbarPaletteWidth = window.innerWidth;

		const openPaletteAction = { action: "paletteOpen", label: "Open Palette", disable: false, callback: this.props.openPalette };
		let palette = <div />;

		if (this.props.config.showPalette) {
			palette = this.generateEnabledActionIcon(openPaletteAction, "palette-open", null);

			if (this.props.paletteState) {
				const closePaletteAction = { action: "paletteClose", label: "Close Palette", disable: false, callback: this.props.closePalette };
				palette = this.generateEnabledActionIcon(closePaletteAction, "palette-close", null);

				if (this.props.paletteType !== "Modal") {
					toolbarPaletteWidth = canvasWidth - 250;
				}
			}

			if (this.props.config.enablePalette === false) { // disable palette if no json
				const disablePaletteAction = { action: "palette", label: "Close Palette", disable: false };
				palette = this.generateDisabledActionIcon(disablePaletteAction, "palette-disabled", null);
			}
		}

		const that = this;
		let actionContainer = <div />;
		if (this.state.toolbarDefinition.length > 0) {
			actionContainer = this.state.toolbarDefinition.map(function(section, sectionNum) {
				let displayItems = section.definition.length;
				if (section.overflow === true) {
					displayItems = that.calculateDisplayItems(toolbarPaletteWidth, sectionNum);
				}
				const actions = that.generateActionItems(
					section.definition,
					displayItems,
					that.props.toolbarMenuActionHandler,
					sectionNum
				);
				let displayDivider = <div />;
				if (section.divider && (sectionNum < that.state.toolbarDefinition.length - 1 || section.overflow === false)) {
					displayDivider = divider;
				}
				return (<div key={"actions-container" + sectionNum} id={"actions-container" + sectionNum} className="toolbar-items-container">
					{actions}
					{displayDivider}
				</div>);
			});
		}

		const zoomActionItems = [
			{ action: "zoomIn", label: "Zoom In", disable: false, callback: this.props.zoomIn },
			{ action: "zoomOut", label: "Zoom Out", disable: false, callback: this.props.zoomOut },
			{ action: "zoomToFit", label: "Zoom to Fit", disable: true, callback: this.props.zoomToFit }
		];
		const zoomContainerItems = this.generateActionItems(zoomActionItems, zoomActionItems.length, null);
		const zoomContainer = (<div id="zoom-actions-container" className="toolbar-items-container">
			{zoomContainerItems}
		</div>);

		const canvasToolbar = (<div id="canvas-toolbar" style={{ width: toolbarPaletteWidth + "px" }}>
			<ul id="toolbar-items">
				{palette}
				{divider}
				{actionContainer}
				{zoomContainer}
			</ul>
		</div>);

		return canvasToolbar;
	}
}

Toolbar.propTypes = {
	config: PropTypes.object,
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
