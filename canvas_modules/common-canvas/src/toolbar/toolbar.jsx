/*
 * Copyright 2017-2020 IBM Corporation
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

import React from "react";
import { injectIntl } from "react-intl";

import PropTypes from "prop-types";
import Tooltip from "../tooltip/tooltip.jsx";
import ReactResizeDetector from "react-resize-detector";
import Icon from "../icons/icon.jsx";
import { Button } from "carbon-components-react";
import constants from "../common-canvas/constants/canvas-constants";
import classNames from "classnames";
import SVG from "react-inlinesvg";

import styles from "./toolbar.scss";

import defaultMessages from "../../locales/toolbar/locales/en.json";

// eslint override
/* eslint no-return-assign: "off" */

class Toolbar extends React.Component {
	constructor(props) {
		super(props);

		this.toolbarIconWidth = parseInt(styles.toolbarButtonWidth, 10); // ParseInt to remove "px"
		this.dividerWidth = parseInt(styles.toolbarDividerWidth, 10); // ParseInt to remove "px"

		const numDefaultIcons = this.props.notificationConfig ? 5 : 4;
		this.defaultToolbarWidth = this.toolbarIconWidth * numDefaultIcons; // Width of toolbar with palette, zoom, and notification icons
		this.maxToolbarWidth = 0; // Width of toolbar if displaying all icons and dividers

		this.state = {
			showExtendedMenu: false
		};

		this.setToolbarDisplayItemsCount = this.setToolbarDisplayItemsCount.bind(this);
		this.generatePaletteIcon = this.generatePaletteIcon.bind(this);
		this.generateNotificationIcon = this.generateNotificationIcon.bind(this);
		this.toggleShowExtendedMenu = this.toggleShowExtendedMenu.bind(this);
		this.toolbarMenuActionHandler = this.toolbarMenuActionHandler.bind(this);
		this.getLabel = this.getLabel.bind(this);
	}

	componentDidMount() {
		if (this.props.config) {
			this.calculateMaxToolbarWidth(this.props.config);
		}
		this.setToolbarDisplayItemsCount();
	}

	setToolbarDisplayItemsCount() {
		const displayItemsCount = this.calculateDisplayItems(this.toolbar.offsetWidth);
		if (displayItemsCount !== this.state.displayItemsCount) {
			this.setState({ displayItemsCount: displayItemsCount });
		}
	}

	// Need to set a className for notification counter icon in the DOM
	// to be used in notification-panel.jsx: handleNotificationPanelClickOutside()
	getActionClassName(action) {
		return action.indexOf(constants.NOTIFICATION_ICON) > -1 ? "notificationCounterIcon" : action;
	}

	getLabel(labelId) {
		return this.props.intl.formatMessage({ id: labelId, defaultMessage: defaultMessages[labelId] });
	}

	getNotificationIconStateObject(isIconEnabled) {
		const notificationMessages = this.props.canvasController.getNotificationMessages();
		const errorMessages = this.props.canvasController.getNotificationMessages(constants.ERROR);
		const warningMessages = this.props.canvasController.getNotificationMessages(constants.WARNING);
		const successMessages = this.props.canvasController.getNotificationMessages(constants.SUCCESS);

		let className = "fill " + constants.NOTIFICATION_ICON;
		if (isIconEnabled) {
			const notificationIconClassName = "fill " + constants.NOTIFICATION_ICON + " ";
			if (errorMessages.length > 0) {
				className = notificationIconClassName + constants.ERROR;
			} else if (warningMessages.length > 0) {
				className = notificationIconClassName + constants.WARNING;
			} else if (successMessages.length > 0) {
				className = notificationIconClassName + constants.SUCCESS;
			} else if (notificationMessages.length > 0) {
				className = notificationIconClassName + constants.INFO;
			} else {
				className = notificationIconClassName;
			}
		}
		return {
			icon: constants.NOTIFICATION_ICON,
			className: className,
			notificationCount: notificationMessages.length
		};
	}

	calculateMaxToolbarWidth(list) {
		let totalWidthSize = this.defaultToolbarWidth;
		for (let i = 0; i < list.length; i++) {
			if (list[i].action) {
				totalWidthSize += this.toolbarIconWidth;
			} else if (list[i].divider) {
				totalWidthSize += this.dividerWidth;
			}
		}

		this.maxToolbarWidth = totalWidthSize;
	}

	calculateDisplayItems(toolbarWidth) {
		const numObjects = this.props.config.length;
		if (this.maxToolbarWidth >= toolbarWidth) { // need to minimize
			const definition = this.props.config;
			let availableWidth = toolbarWidth - this.defaultToolbarWidth + this.toolbarIconWidth;

			if (availableWidth < this.toolbarIconWidth) {
				return 0;
			}

			let items = 0;
			for (let i = 0; i < definition.length; i++) {
				if (definition[i].action) {
					availableWidth -= this.toolbarIconWidth;
					items++;
				} else if (definition[i].divider) {
					availableWidth -= this.dividerWidth;
					items++;
				}

				if (availableWidth < this.toolbarIconWidth) {
					items--;
					break;
				}
			}
			return items;
		}
		return numObjects;
	}

	generateActionItems(definition, displayItemsCount, actionsHandler, overflow) {
		const utilityActions = [];
		const dividerClassName = overflow ? "overflow-toolbar-divider" : "toolbar-divider";
		for (let i = 0; i < displayItemsCount; i++) {
			const actionObj = definition[i];
			if (actionObj.action) {
				const actionId = actionObj.action + "-action";
				if (actionObj.action.startsWith("notification") || actionObj.action.startsWith(constants.NOTIFICATION_ICON)) {
					utilityActions[i] = this.generateNotificationIcon(actionObj, actionId, overflow);
				} else if (actionObj.action.startsWith("palette")) {
					actionObj.enable = true;
					utilityActions[i] = this.generatePaletteIcon(actionObj, overflow);
				} else if (actionObj.enable === true) {
					utilityActions[i] = this.generateActionIcon(actionObj, actionId, actionsHandler, overflow);
				} else { // disable
					utilityActions[i] = this.generateActionIcon(actionObj, actionId, null, overflow);
				}
			} else {
				utilityActions[i] = (<div key={"toolbar-divider-" + i} className={dividerClassName} />);
			}
		}

		if (definition.length !== displayItemsCount &&
			!(definition.length - 1 === displayItemsCount && definition[displayItemsCount].divider)) { // Don't show overflow icon if last item is divider.
			utilityActions[displayItemsCount] = this.generatedExtendedMenu(definition, displayItemsCount, actionsHandler);
			utilityActions[displayItemsCount + 1] = (<div key={"toolbar-divider-" + displayItemsCount} className="toolbar-divider" />);
		}

		return utilityActions;
	}

	generateActionIcon(actionObj, actionId, actionsHandler, overflow) {
		const overflowClassName = overflow ? "overflow" : "";
		let actionClickHandler = actionObj.callback;
		if (typeof actionsHandler === "function") {
			actionClickHandler = () => actionsHandler(actionObj.action);
		}

		const iconClassname = actionObj.className ? actionObj.className : "";
		let icon = <Icon type={actionObj.action} disabled={!actionObj.enable} className={iconClassname} />;

		// Customer provided icon.
		if (actionObj.iconEnabled && actionObj.iconDisabled) {
			const customIcon = actionObj.enable ? actionObj.iconEnabled : actionObj.iconDisabled;
			const customIconClass = classNames("canvas-icon", "toolbar-icons", overflowClassName, iconClassname);
			icon = (<SVG id={"toolbar-icon-" + actionObj.action} className={customIconClass} disabled={!actionObj.enable}
				src={customIcon}
			/>);
		}

		const textContent = (typeof actionObj.textContent !== "undefined") ? <div className="text-content"> {actionObj.textContent} </div> : null;

		const tooltipId = actionId + "-" + this.props.canvasController.getInstanceId() + "-tooltip";
		const iconButtonClassname = classNames("list-item", overflowClassName, { "list-item-disabled": !actionObj.enable });
		const itemContainersClassname = classNames("list-item-containers", overflowClassName, this.getActionClassName(actionObj.action));

		return (
			<li id={actionId} key={actionId} className={itemContainersClassname}>
				<Button kind="ghost"
					onClick={actionClickHandler}
					className={iconButtonClassname}
					disabled={!actionObj.enable}
				>
					<Tooltip id={tooltipId} tip={actionObj.label} disable={overflow}>
						<div className={"toolbar-item " + overflowClassName}>
							{icon}
							{this.generateLabel(!actionObj.enable, overflow, actionObj.label)}
							{textContent}
						</div>
					</Tooltip>
				</Button>
			</li>
		);
	}

	generatePaletteIcon(actionObj, overflow) {
		actionObj.action = "paletteOpen";
		actionObj.callback = this.props.canvasController.openPalette.bind(this.props.canvasController);
		let palette = this.generateActionIcon(actionObj, "palette-open-action", null, overflow);

		if (this.props.isPaletteOpen) {
			actionObj.action = "paletteClose";
			actionObj.callback = this.props.canvasController.closePalette.bind(this.props.canvasController);
			palette = this.generateActionIcon(actionObj, "palette-close-action", null, overflow);
		}
		return palette;
	}

	generateNotificationIcon(actionObj, actionId, overflow) {
		const notificationStateObj = this.getNotificationIconStateObject(actionObj.enable);
		actionObj.icon = notificationStateObj.icon;
		actionObj.className = notificationStateObj.className;
		actionObj.callback = this.toolbarMenuActionHandler.bind(this.canvasController, "openNotificationPanel");
		actionObj.textContent = (notificationStateObj.notificationCount > 9) ? "9+" : notificationStateObj.notificationCount.toString();

		let notification;
		actionObj.action = constants.NOTIFICATION_ICON;
		if (actionObj.enable) {
			notification = this.generateActionIcon(actionObj, "notification-open-action", null, overflow);
		} else {
			notification = this.generateActionIcon(actionObj, actionId, null, overflow);
		}

		if (this.props.isNotificationOpen) {
			actionObj.callback = this.toolbarMenuActionHandler.bind(this.canvasController, "closeNotificationPanel");
			notification = this.generateActionIcon(actionObj, "notification-close-action", null, overflow);
		}
		return notification;
	}

	generatedExtendedMenu(actions, displayItemsCount, actionsHandler) {
		const subActionsList = actions.slice(displayItemsCount, actions.length);
		const subActionsListItems = this.generateActionItems(subActionsList, subActionsList.length, actionsHandler, true);
		const subMenuClassName = this.state.showExtendedMenu === true ? "" : "toolbar-popover-list-hide";
		return (
			<li id={"overflow-action"} key={"overflow-action"} className="list-item-containers" >
				<Button kind="ghost"
					onClick={() => this.toggleShowExtendedMenu()}
					className="overflow-action-list-item list-item"
				>
					<div className="toolbar-item">
						<Icon type={constants.CANVAS_CARBON_ICONS.OVERFLOWMENU} />
					</div>
				</Button>
				<ul className={"toolbar-popover-list " + subMenuClassName}>
					{subActionsListItems}
				</ul>

			</li>
		);
	}

	generateLabel(disable, overflow, label) {
		const disabled = disable ? "disabled" : "";
		if (overflow) {
			return (<div className={"overflow-toolbar-icon-label " + disabled}>{label}</div>);
		}
		return (<div />);
	}

	toggleShowExtendedMenu() {
		this.setState({ showExtendedMenu: !this.state.showExtendedMenu });
	}

	toolbarMenuActionHandler(action) {
		this.props.canvasController.toolbarActionHandler(action);
	}

	render() {
		const that = this;
		let actionContainer = <div />;
		if (this.props.config && this.props.config.length > 0) {
			const actions = that.generateActionItems(that.props.config, this.state.displayItemsCount, this.toolbarMenuActionHandler, false);
			actionContainer = (<div key={"actions-container"} id={"actions-container"} className="toolbar-items-container">
				{actions}
			</div>);
		}

		let rightAlignedActionItems = [
			{ action: "zoomIn",
				label: this.getLabel("toolbar.zoomIn"),
				enable: true,
				callback: this.props.canvasController.zoomIn.bind(this.props.canvasController) },
			{ action: "zoomOut",
				label: this.getLabel("toolbar.zoomOut"),
				enable: true,
				callback: this.props.canvasController.zoomOut.bind(this.props.canvasController) },
			{ action: "zoomToFit",
				label: this.getLabel("toolbar.zoomToFit"),
				enable: true,
				callback: this.props.canvasController.zoomToFit.bind(this.props.canvasController) }
		];

		if (this.props.notificationConfig &&
			typeof this.props.notificationConfig.action !== "undefined" &&
			typeof this.props.notificationConfig.enable !== "undefined") {
			const notificationCounter = [
				{ divider: true },
				this.props.notificationConfig
			];
			rightAlignedActionItems = rightAlignedActionItems.concat(notificationCounter);
		}

		const rightAlignedContainerItems = this.generateActionItems(rightAlignedActionItems, rightAlignedActionItems.length, null, false);
		const rightAlignedContainer = (<div id="zoom-actions-container" className="toolbar-items-container">
			{rightAlignedContainerItems}
		</div>);

		const canvasToolbar = (
			<ReactResizeDetector handleWidth onResize={this.setToolbarDisplayItemsCount}>
				<div id="canvas-toolbar" ref={ (elem) => this.toolbar = elem}>
					<ul id="toolbar-items">
						{actionContainer}
						{rightAlignedContainer}
					</ul>
				</div>
			</ReactResizeDetector>);

		return canvasToolbar;
	}
}

Toolbar.propTypes = {
	intl: PropTypes.object.isRequired,
	config: PropTypes.array,
	isPaletteOpen: PropTypes.bool,
	isNotificationOpen: PropTypes.bool,
	notificationConfig: PropTypes.object,
	canvasController: PropTypes.object.isRequired
};

export default injectIntl(Toolbar);
