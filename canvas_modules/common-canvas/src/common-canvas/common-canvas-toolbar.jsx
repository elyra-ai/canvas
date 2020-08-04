/*
 * Copyright 2020 IBM Corporation
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
import PropTypes from "prop-types";
import { injectIntl } from "react-intl";
import defaultMessages from "../../locales/common-canvas/locales/en.json";
import defaultToolbarMessages from "../../locales/toolbar/locales/en.json";
import Toolbar from "../toolbar/toolbar.jsx";
import Logger from "../logging/canvas-logger.js";
import { ERROR, WARNING, SUCCESS, INFO,
	NOTIFICATION_ICON_CLASS } from "../common-canvas/constants/canvas-constants";

const TOGGLE_NOTIFICATION_PANEL = "toggleNotificationPanel";

class CommonCanvasToolbar extends React.Component {
	constructor(props) {
		super(props);

		this.getLabel = this.getLabel.bind(this);
		this.toolbarActionHandler = this.toolbarActionHandler.bind(this);
		this.logger = new Logger(["CommonCanvasToolbar"]);
	}

	getLabel(labelId) {
		const defaultMessage = defaultMessages[labelId] ? defaultMessages[labelId] : defaultToolbarMessages[labelId];
		return this.props.intl.formatMessage({ id: labelId, defaultMessage: defaultMessage });
	}

	// Returns the default toolbar which is shown if the user does not specify
	// a toolbar config.
	getDefaultToolbar() {
		return {
			leftBar: [
				{ action: "undo", label: this.getLabel("canvas.undo"), enable: true },
				{ action: "redo", label: this.getLabel("canvas.redo"), enable: true },
				{ action: "cut", label: this.getLabel("edit.cutSelection"), enable: true },
				{ action: "copy", label: this.getLabel("edit.copySelection"), enable: true },
				{ action: "paste", label: this.getLabel("edit.pasteSelection"), enable: true },
				{ action: "createAutoComment", label: this.getLabel("canvas.addComment"), enable: true },
				{ action: "deleteSelectedObjects", label: this.getLabel("canvas.deleteObject"), enable: true }
			],
			rightBar: [
				{ action: "zoomIn", label: this.getLabel("toolbar.zoomIn"), enable: true },
				{ action: "zoomOut", label: this.getLabel("toolbar.zoomOut"), enable: true },
				{ action: "zoomToFit", label: this.getLabel("toolbar.zoomToFit"), enable: true }
			]
		};
	}

	// Returns a toolbar config for the toolbar the way it was initially supported.
	// That is, with an array of 'leftBar' items passed in to the toolbar config
	// and a fixed set of 'rightBar' items. We remove any palette action item
	// and following divider passed in because that will be replaced by a
	// 'paletteToggle' item and divider, in the optionallyAddPaletteTool method
	// called from the render method.
	getConvertedLegacyToolbar(itemsArray) {
		let leftBarItems = itemsArray;

		if (leftBarItems.length > 0 && leftBarItems[0].action === "palette") {
			leftBarItems = leftBarItems.slice(1);
			if (leftBarItems.length > 0 && leftBarItems[0].divider) {
				leftBarItems = leftBarItems.slice(1);
			}
		}

		return {
			leftBar: leftBarItems,
			rightBar: this.getDefaultRightBar()
		};
	}

	getDefaultRightBar() {
		return [
			{ action: "zoomIn", label: this.getLabel("toolbar.zoomIn"), enable: true },
			{ action: "zoomOut", label: this.getLabel("toolbar.zoomOut"), enable: true },
			{ action: "zoomToFit", label: this.getLabel("toolbar.zoomToFit"), enable: true }
		];
	}

	getNotificationClassName() {
		const maxMessageType = this.props.canvasController.getNotificationMessagesMaxType();
		let className = NOTIFICATION_ICON_CLASS;

		// notification color indicator will show the highest severity status
		if (maxMessageType === ERROR) {
			className += " error";
		} else if (maxMessageType === WARNING) {
			className += " warning";
		} else if (maxMessageType === SUCCESS) {
			className += " success";
		} else if (maxMessageType === INFO) {
			className += " info";
		}
		return className;
	}

	generateToolbarConfig() {
		let config = this.copyConfig();

		if (config) {
			if (Array.isArray(config)) {
				config = this.getConvertedLegacyToolbar(config);
			} else if (typeof config.rightBar === "undefined") {
				config.rightBar = this.getDefaultRightBar();
			}

		} else {
			config = this.getDefaultToolbar();
		}

		config = Object.assign({},
			{ leftBar: this.optionallyAddPaletteTool(config.leftBar || []) },
			{ rightBar: this.optionallyAddNotificationTool(config.rightBar || []) }
		);

		return config;
	}

	// Copy the props config because we will alter its contents and we don't want to
	// alter a props variable since that would alter the parent variable.
	copyConfig() {
		if (!this.props.config) {
			return null;
		}
		if (Array.isArray(this.props.config)) {
			return [...this.props.config];
		}

		const config = {};
		if (this.props.config && this.props.config.leftBar) {
			config.leftBar = [...this.props.config.leftBar];
		}
		if (this.props.config && this.props.config.rightBar) {
			config.rightBar = [...this.props.config.rightBar];
		}
		return config;
	}

	toolbarActionHandler(action) {
		this.props.canvasController.toolbarActionHandler(action);
	}

	optionallyAddPaletteTool(leftBar) {
		// If the leftBar contains and old palette action and if followed by a
		// divider remove them.
		let newLeftBar = leftBar;
		if (leftBar && leftBar.length > 0 && leftBar[0].action === "palette") {
			newLeftBar = leftBar.slice(1);
			if (leftBar.length > 1 && leftBar[1].divider) {
				newLeftBar = leftBar.slice(2);
			}
		}

		if (this.props.isPaletteEnabled) {
			const paletteTools = [
				{ action: "togglePalette",
					label: "Palette",
					enable: true,
					iconTypeOverride: this.props.isPaletteOpen ? "paletteClose" : "paletteOpen"
				},
				{ divider: true }
			];
			return paletteTools.concat(newLeftBar);
		}
		return newLeftBar;
	}

	optionallyAddNotificationTool(rightBar) {
		if (this.props.notificationConfig &&
			typeof this.props.notificationConfig.action !== "undefined" &&
			typeof this.props.notificationConfig.enable !== "undefined") {
			const notificationCount = this.props.canvasController.getNotificationMessages().length;
			const notificationTools = [
				{ divider: true },
				{ action: TOGGLE_NOTIFICATION_PANEL,
					label: this.props.notificationConfig.label,
					enable: true,
					className: this.getNotificationClassName(),
					textContent: (notificationCount > 9) ? "9+" : notificationCount.toString()
				}
			];
			return rightBar.concat(notificationTools);
		}
		return rightBar;
	}

	configureToolbarButtonsState(toolbarConfig) {
		// We only set toolbar state with the internal object model. With the
		// external object model the host app must set toolbar state through the
		// toolbar config params.
		if (!this.props.canvasController.isInternalObjectModelEnabled()) {
			return toolbarConfig;
		}

		if (typeof toolbarConfig !== "undefined") {
			let undoState = true;
			let redoState = true;
			let cutState = true;
			let copyState = true;
			let pasteState = true;
			let deleteState = true;

			if (!this.props.canvasController.canUndo()) {
				undoState = false;
			}
			if (!this.props.canvasController.canRedo()) {
				redoState = false;
			}
			if (this.props.canvasController.getSelectedObjectIds().length === 0) {
				cutState = false;
				copyState = false;
				deleteState = false;
			}
			if (this.props.canvasController.isClipboardEmpty()) {
				pasteState = false;
			}

			this.applyToolState("undo", toolbarConfig, undoState);
			this.applyToolState("redo", toolbarConfig, redoState);
			this.applyToolState("cut", toolbarConfig, cutState);
			this.applyToolState("copy", toolbarConfig, copyState);
			this.applyToolState("paste", toolbarConfig, pasteState);
			this.applyToolState("deleteSelectedObjects", toolbarConfig, deleteState);
		}
		return toolbarConfig;
	}

	applyToolState(action, toolbarConfig, state) {
		let tool = {};
		if (toolbarConfig.leftBar) {
			tool = toolbarConfig.leftBar.find((o) => o.action === action);
		}
		if (!tool && toolbarConfig.rightBar) {
			tool = toolbarConfig.rightBar.find((o) => o.action === action);
		}

		if (tool) {
			tool.enable = state;
		} else {
			this.logger.log("Toolbar tool " + action + " could not be found to set state to " + state);
		}
	}

	render() {
		let toolbarConfig = this.generateToolbarConfig();
		toolbarConfig = this.configureToolbarButtonsState(toolbarConfig);

		return (
			<Toolbar
				config={toolbarConfig}
				instanceId={this.props.canvasController.getInstanceId()}
				toolbarActionHandler={this.toolbarActionHandler}
				additionalText={{ overflowMenuLabel: this.getLabel("toolbar.overflowMenu") }}
			/>
		);
	}
}

CommonCanvasToolbar.propTypes = {
	intl: PropTypes.object.isRequired,
	canvasController: PropTypes.object.isRequired,
	config: PropTypes.oneOfType([
		PropTypes.array.isRequired,
		PropTypes.object.isRequired
	]),
	isPaletteEnabled: PropTypes.bool,
	isPaletteOpen: PropTypes.bool,
	isNotificationOpen: PropTypes.bool,
	notificationConfig: PropTypes.object
};

export default injectIntl(CommonCanvasToolbar);
