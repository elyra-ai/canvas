/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
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

// eslint override
/* global window document */

class Toolbar extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			showExtendedMenu: false
		};

		this.runIcon = runIcon;
		this.runDisabledIcon = runDisabledIcon;
		this.stopIcon = stopIcon;
		this.stopDisabledIcon = stopDisabledIcon;

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
		this.undoIcon = undoIcon;
		this.undoDisabledIcon = undoDisabledIcon;

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

	updateToolbarWidth() {
		const toolbarWidth = this.getObjectWidth("#canvas-toolbar");
		this.setState({
			toolbarWidth: toolbarWidth
		});
	}

	generateActionItems(list, actions, displayItems, showSubMenu, actionsHandler) {
		const that = this;
		let utilityActions = [];
		if (actions.length === displayItems) {
			utilityActions = actions.map(function(action, ind) {
				const actionId = action + "-action";
				if (list[action]) {
					return that.generateEnabledActionIcon(list, action, actionId, actionsHandler);
				} else if (typeof list[action] === "undefined") {
					return <div key={action + ind} />;
				}
				// disable
				return that.generateDisabledActionIcon(list, action, actionId);
			});
		} else {
			for (let i = 0; i < displayItems; i++) {
				const action = actions[i];
				const actionId = action + "-action";
				if (list[action]) {
					utilityActions[i] = this.generateEnabledActionIcon(list, action, actionId, actionsHandler);
				} else if (typeof list[action] === "undefined") {
					return <div key={action + i} />;
				} else { // disable
					utilityActions[i] = this.generateDisabledActionIcon(list, action, actionId);
				}
			}
			utilityActions[displayItems] = this.generatedExtendedMenu(list, actions, displayItems, showSubMenu, actionsHandler);
		}
		return utilityActions;
	}

	generateEnabledActionIcon(list, action, actionId, actionsHandler) {
		let actionClickHandler = list[action];
		if (typeof actionsHandler === "function") {
			actionClickHandler = () => actionsHandler(action);
		}
		return (<li id={actionId} key={actionId} className="list-item">
			<a onClick={actionClickHandler} className="list-item">
				<div className="toolbar-item">
					<img id={"toolbar-icon-" + action} className="toolbar-icons"
						src={this[action + "Icon"]}
					/>
				</div>
			</a>
		</li>);
	}

	generateDisabledActionIcon(list, action, actionId) {
		return (<li id={actionId} key={actionId} className="list-item">
			<a className="list-item list-item-disabled ">
				<div className="toolbar-item">
					<img id={"toolbar-icon-" + action} className="toolbar-icons"
						src={this[action + "DisabledIcon"]}
					/>
				</div>
			</a>
		</li>);
	}

	generatedExtendedMenu(list, actions, displayItems, showSubMenu, actionsHandler) {
		const subActionsList = actions.slice(displayItems, actions.length);
		const subActionsListItems = this.generateActionItems(list, subActionsList, subActionsList.length, false, actionsHandler);
		const subMenuClassName = showSubMenu ? "" : "toolbar-popover-list-hide";
		return (
			<li id="overflow-action" key="overflow-action" className="list-item">
				<a onClick={this.toogleShowExtendedMenu} className="overflow-action-list-item list-item toolbar-divider">
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

	toogleShowExtendedMenu() {
		this.setState({ showExtendedMenu: !this.state.showExtendedMenu });
	}

	render() {
		const divider = (<div className="toolbar-divider" />);
		const canvasWidth = parseFloat(this.getObjectWidth("#common-canvas"));
		let toolbarPaletteWidth = canvasWidth;

		let paletteOpenClass = "";
		let palette = (<li id="palette-open" className="list-item">
			<a onClick={this.props.openPalette} className="list-item">
				<div className="toolbar-item">
					<img id="toolbar-icon-palette-open" className="toolbar-icons"
						src={paletteOpenIcon}
					/>
				</div>
			</a>
		</li>);

		if (this.props.paletteState) {
			palette = (<li id="palette-close" className="list-item">
				<a onClick={this.props.closePalette} className="list-item">
					<div className="toolbar-item">
						<img id="toolbar-icon-palette-close" className="toolbar-icons"
							src={paletteCloseIcon}
						/>
					</div>
				</a>
			</li>);

			if (this.props.paletteType === "Flyout") {
				paletteOpenClass = "toolbar-palette-opened";
				toolbarPaletteWidth = canvasWidth - 250;
			}
		}

		if (!this.props.config.enablePalette) { // disable palette if no json
			palette = (<li id="palette-disabled" className="list-item">
				<a className="list-item list-item-disabled">
					<div className="toolbar-item">
						<img id="toolbar-icon-palette-disabled" className="toolbar-icons"
							src={paletteDisabledIcon}
						/>
					</div>
				</a>
			</li>);
		}

		const executionActionItems = ["stop", "run"];
		let executionContainer = <div />;
		if (typeof this.props.config.stop !== "undefined" && typeof this.props.config.run !== "undefined") {
			const executionContainerItems = this.generateActionItems(this.props.config, executionActionItems, executionActionItems.length, this.props.toolbarMenuActionHandler);
			executionContainer = (<div id="execution-actions-container" className="toolbar-items-container">
				{executionContainerItems}
				{divider}
			</div>);
		}

		// show popover menu if width is too narrow
		const minToolbarWidth = 836; // min width to start showing popover
		const currentToolbarWidth = toolbarPaletteWidth;
		const utilityActionItems = ["undo", "redo", "cut", "copy", "paste", "addComment", "delete"];
		let showUtilActionItems = utilityActionItems.length;
		if (currentToolbarWidth < minToolbarWidth) {
			if (currentToolbarWidth < 516) { // hide all util icons and display menu, 7
				showUtilActionItems = 0;
			} else if (currentToolbarWidth < 580) { // show 1 icon and hide the other 6
				showUtilActionItems = 1;
			} else if (currentToolbarWidth < 644) { // show 2 icon and hide the other 5
				showUtilActionItems = 2;
			} else if (currentToolbarWidth < 708) { // show 3 icon and hide the other 4
				showUtilActionItems = 3;
			} else if (currentToolbarWidth < 772) { // show 4 icon and hide the other 3
				showUtilActionItems = 4;
			} else if (currentToolbarWidth < minToolbarWidth) { // show 5 icon and hide the other 2
				showUtilActionItems = 5;
			}
		}

		const utilityContainerItems = this.generateActionItems(this.props.config, utilityActionItems, showUtilActionItems,
			this.state.showExtendedMenu, this.props.toolbarMenuActionHandler);
		const utilityContainer = (<div id="utility-actions-container" className="toolbar-items-container">
			{utilityContainerItems}
		</div>);

		const zoomActionItems = ["zoomIn", "zoomOut", "zoomToFit"];
		const zoomContainerItems = this.generateActionItems(this.props, zoomActionItems, zoomActionItems.length, null);
		const zoomContainer = (<div id="zoom-actions-container" className="toolbar-items-container">
			{zoomContainerItems}
		</div>);


		const canvasToolbar = (<div id="canvas-toolbar" className={paletteOpenClass} style={{ width: toolbarPaletteWidth + "px" }}>
			<ul id="toolbar-items">
				{palette}
				{divider}
				{executionContainer}
				{utilityContainer}
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
	toolbarMenuActionHandler: PropTypes.func
};

export default Toolbar;
