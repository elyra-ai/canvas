/*
 * Copyright 2017-2023 Elyra Authors
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
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import defaultMessages from "../../locales/common-canvas/locales/en.json";
import defaultToolbarMessages from "../../locales/toolbar/locales/en.json";
import Toolbar from "../toolbar/toolbar.jsx";
import Logger from "../logging/canvas-logger.js";
import NotificationPanel from "../notification-panel/notification-panel.jsx";
import { ERROR, WARNING, SUCCESS, INFO, PALETTE_LAYOUT_NONE,
	NOTIFICATION_ICON_CLASS, TOOLBAR_TOGGLE_NOTIFICATION_PANEL, TOOLBAR_LAYOUT_TOP,
	TOOLBAR_TOGGLE_PALETTE }
	from "../common-canvas/constants/canvas-constants";
import { SidePanelOpenFilled, SidePanelCloseFilled } from "@carbon/react/icons";

class CommonCanvasToolbar extends React.Component {
	constructor(props) {
		super(props);

		this.logger = new Logger("CC-Toolbar");

		this.getLabel = this.getLabel.bind(this);
		this.toolbarActionHandler = this.toolbarActionHandler.bind(this);
	}

	getLabel(labelId, substituteObj) {
		const defaultMessage = defaultMessages[labelId] ? defaultMessages[labelId] : defaultToolbarMessages[labelId];
		return this.props.intl.formatMessage({ id: labelId, defaultMessage: defaultMessage }, substituteObj);
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
	// and a fixed set of 'rightBar' items.
	getConvertedLegacyToolbar(leftBarItems) {
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

	// Returns the index of the action passed in, in the
	// 'bar' passed in.
	getToolIndexByAction(action, bar) {
		return bar?.findIndex((a) => a.action === action);
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

		config = this.optionallyAddPaletteTool(config);
		config = this.optionallyAddNotificationTool(config);

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
		if (this.props.config.overrideAutoEnableDisable) {
			config.overrideAutoEnableDisable = true;
		}
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

	optionallyAddPaletteTool(config) {
		const leftBar = config.leftBar || [];
		const rightBar = config.rightBar || [];

		let paletteLabel = this.getLabel("toolbar.palette");

		// If the leftBar contains and old palette action and if followed by a
		// divider remove them.
		let newLeftBar = leftBar;
		if (leftBar && leftBar.length > 0 && leftBar[0].action === "palette") {
			// Use the existing palette label if one was provided.
			paletteLabel = leftBar[0].label ? leftBar[0].label : paletteLabel;
			newLeftBar = leftBar.slice(1);
			if (leftBar.length > 1 && leftBar[1].divider) {
				newLeftBar = leftBar.slice(2);
			}
		}

		// Add a new togglePalette icon if the palette is enabled and the app
		// has not provided its own palette action.
		if (this.props.isPaletteEnabled) {
			// Applications may need to detect these legacy classes to detect which action
			// is to be performed. So add them as additional classes. Also, jest tests require them.
			// TODO - In next major release, remove "paletteClose-action" and "paletteOpen-action"
			const className = this.props.isPaletteOpen ? "closePalette-action paletteClose-action" : "openPalette-action paletteOpen-action";
			const icon = this.props.isPaletteOpen ? (<SidePanelCloseFilled />) : (<SidePanelOpenFilled />);

			const togglePaletteAction =
				{ action: TOOLBAR_TOGGLE_PALETTE, label: paletteLabel, enable: true, iconEnabled: icon,
					isSelected: this.props.isPaletteOpen, className };

			const lbIdx = this.getToolIndexByAction(TOOLBAR_TOGGLE_PALETTE, leftBar);
			const rbIdx = this.getToolIndexByAction(TOOLBAR_TOGGLE_PALETTE, rightBar);

			if (lbIdx > -1) {
				const lbAction = leftBar[lbIdx];
				config.leftBar[lbIdx] = {
					...togglePaletteAction,
					label: lbAction.label ? lbAction.label : paletteLabel,
					iconEnabled: lbAction.iconEnabled ? lbAction.iconEnabled : null, // null means Icon provided by the toolbar
					incLabelWithIcon: lbAction.incLabelWithIcon ? lbAction.incLabelWithIcon : null,
					tooltip: lbAction.tooltip ? lbAction.tooltip : null
				};

			} else if (rbIdx > -1) {
				const rbAction = rightBar[rbIdx];
				config.rightBar[rbIdx] = {
					...togglePaletteAction,
					label: rbAction.label ? rbAction.label : paletteLabel,
					iconEnabled: rbAction.iconEnabled ? rbAction.iconEnabled : null, // null means Icon provided by the toolbar
					incLabelWithIcon: rbAction.incLabelWithIcon ? rbAction.incLabelWithIcon : null,
					tooltip: rbAction.tooltip ? rbAction.tooltip : null
				};

			} else {
				const paletteTools = [
					togglePaletteAction,
					{ divider: true }
				];
				config.leftBar = paletteTools.concat(newLeftBar);
			}
		}
		return config;
	}

	optionallyAddNotificationTool(config) {
		const leftBar = config.leftBar || [];
		const rightBar = config.rightBar || [];

		// Add a new toggleNotificationPanel icon if the notification panel exists
		// and the app has not provided its own notification panel action.
		if (this.props.notificationConfigExists) {
			const notificationCount = this.props.notificationMessages.length;

			const toggleNotificationAction =
				{ action: TOOLBAR_TOGGLE_NOTIFICATION_PANEL,
					label: this.props.notificationConfigLabel,
					enable: this.props.notificationConfigEnable,
					extIsSubAreaDisplayed: this.props.isNotificationOpen,
					setExtIsSubAreaDisplayed: this.callExtIsSubAreaDisplayed.bind(this),
					className: this.getNotificationClassName(),
					textContent: (notificationCount > 9) ? "9+" : notificationCount.toString(),
					subPanel: NotificationPanel,
					subPanelData: { canvasController: this.props.canvasController },
					leaveSubAreaOpenOnClickOutside: this.props.notificationConfigKeepOpen
				};

			const lbIdx = this.getToolIndexByAction(TOOLBAR_TOGGLE_NOTIFICATION_PANEL, leftBar);
			const rbIdx = this.getToolIndexByAction(TOOLBAR_TOGGLE_NOTIFICATION_PANEL, rightBar);

			if (lbIdx > -1) {
				const lbAction = leftBar[lbIdx];
				config.leftBar[lbIdx] = {
					...toggleNotificationAction,
					iconEnabled: lbAction.iconEnabled ? lbAction.iconEnabled : null, // null means Icon provided by the toolbar
					incLabelWithIcon: lbAction.incLabelWithIcon ? lbAction.incLabelWithIcon : null,
					tooltip: lbAction.tooltip ? lbAction.tooltip : null,
					textContent: null // Assume text conents is not needed with customized action
				};

			} else if (rbIdx > -1) {
				const rbAction = rightBar[rbIdx];
				config.rightBar[rbIdx] = {
					...toggleNotificationAction,
					iconEnabled: rbAction.iconEnabled ? rbAction.iconEnabled : null, // null means Icon provided by the toolbar
					incLabelWithIcon: rbAction.incLabelWithIcon ? rbAction.incLabelWithIcon : null,
					tooltip: rbAction.tooltip ? rbAction.tooltip : null,
					textContent: null }; // Assume text conents is not needed with customized action


			} else {
				const notificationTools = [
					{ divider: true },
					toggleNotificationAction
				];

				config.rightBar = config.rightBar.concat(notificationTools);
			}
		}
		return config;
	}

	callExtIsSubAreaDisplayed(state) {
		if (state) {
			this.props.canvasController.openNotificationPanel();
		} else {
			this.props.canvasController.closeNotificationPanel();
		}
	}

	configureToolbarButtonsState(toolbarConfig) {
		// We only set toolbar state with the internal object model. With the
		// external object model the host app must set toolbar state through the
		// toolbar config params.
		if (!this.props.enableInternalObjectModel ||
				toolbarConfig.overrideAutoEnableDisable) {
			return toolbarConfig;
		}

		if (typeof toolbarConfig !== "undefined") {
			const editingAllowed = this.props.enableEditingActions;
			this.applyToolState("undo", toolbarConfig, editingAllowed && this.props.canUndo);
			this.applyToolState("redo", toolbarConfig, editingAllowed && this.props.canRedo);
			this.applyToolState("cut", toolbarConfig, editingAllowed && this.props.canCutCopy);
			this.applyToolState("copy", toolbarConfig, editingAllowed && this.props.canCutCopy);
			this.applyToolState("paste", toolbarConfig, editingAllowed && this.props.canPaste);
			this.applyToolState("deleteSelectedObjects", toolbarConfig, editingAllowed && this.props.canDelete);
			this.applyToolState("createAutoComment", toolbarConfig, editingAllowed);
			this.applyToolState("arrangeHorizontally", toolbarConfig, editingAllowed);
			this.applyToolState("arrangeVertically", toolbarConfig, editingAllowed);
			// editingAllowed = false doesn't stop zoom capability
			this.applyToolState("zoomIn", toolbarConfig, this.props.canZoomIn);
			this.applyToolState("zoomOut", toolbarConfig, this.props.canZoomOut);
			this.applyToolState("zoomToFit", toolbarConfig, this.props.canZoomToFit);
		}
		return toolbarConfig;
	}

	addUndoRedoCommandLabels(toolbarConfig) {
		const undoLabel = this.props.undoLabel;
		const redoLabel = this.props.redoLabel;

		if (undoLabel) {
			const undoTool = this.findTool("undo", toolbarConfig);
			if (undoTool) {
				undoTool.label = this.getLabel("canvas.undoCommand", { undo_command: undoLabel });
			}
		}
		if (redoLabel) {
			const redoTool = this.findTool("redo", toolbarConfig);
			if (redoTool) {
				redoTool.label = this.getLabel("canvas.redoCommand", { redo_command: redoLabel });
			}
		}
		return toolbarConfig;
	}

	applyToolState(action, toolbarConfig, state) {
		const tool = this.findTool(action, toolbarConfig);
		if (tool) {
			tool.enable = state;
		} else {
			this.logger.log("Toolbar tool " + action + " could not be found to set state to " + state);
		}
	}

	findTool(action, toolbarConfig) {
		let tool = {};
		if (toolbarConfig.leftBar) {
			tool = toolbarConfig.leftBar.find((o) => o.action === action);
		}
		if (!tool && toolbarConfig.rightBar) {
			tool = toolbarConfig.rightBar.find((o) => o.action === action);
		}
		return tool;
	}

	render() {
		this.logger.log("render");

		let toolbarConfig = this.generateToolbarConfig();
		toolbarConfig = this.configureToolbarButtonsState(toolbarConfig);
		toolbarConfig = this.addUndoRedoCommandLabels(toolbarConfig);
		let canvasToolbar = null;

		if (this.props.enableToolbarLayout === TOOLBAR_LAYOUT_TOP) {
			canvasToolbar = (
				<div aria-label={this.getLabel("toolbar.label")} role="navigation" className={"common-canvas-toolbar"} >
					<Toolbar
						config={toolbarConfig}
						containingDivId={this.props.containingDivId}
						instanceId={this.props.canvasController.getInstanceId()}
						toolbarActionHandler={this.toolbarActionHandler}
						additionalText={{ overflowMenuLabel: this.getLabel("toolbar.overflowMenu") }}
					/>
				</div>
			);
		}
		return canvasToolbar;
	}
}

CommonCanvasToolbar.propTypes = {
	// Provided by CommonCanvas
	intl: PropTypes.object.isRequired,
	canvasController: PropTypes.object.isRequired,
	containingDivId: PropTypes.string.isRequired,

	// Provided by redux
	enableToolbarLayout: PropTypes.string.isRequired,
	config: PropTypes.oneOfType([
		PropTypes.array.isRequired,
		PropTypes.object.isRequired
	]),
	isPaletteEnabled: PropTypes.bool,
	isPaletteOpen: PropTypes.bool,
	isNotificationOpen: PropTypes.bool,
	notificationMessages: PropTypes.array,
	notificationConfigExists: PropTypes.object,
	notificationConfigEnable: PropTypes.bool,
	notificationConfigLabel: PropTypes.string,
	notificationConfigKeepOpen: PropTypes.bool,
	enableInternalObjectModel: PropTypes.bool,
	enableEditingActions: PropTypes.bool,
	canUndo: PropTypes.bool,
	canRedo: PropTypes.bool,
	canCutCopy: PropTypes.bool,
	canPaste: PropTypes.bool,
	canDelete: PropTypes.bool,
	canZoomIn: PropTypes.bool,
	canZoomOut: PropTypes.bool,
	canZoomToFit: PropTypes.bool,
	undoLabel: PropTypes.string,
	redoLabel: PropTypes.string
};

const mapStateToProps = (state, ownProps) => ({
	enableToolbarLayout: state.canvasconfig.enableToolbarLayout,
	config: state.canvastoolbar.config,
	isPaletteEnabled: state.canvasconfig.enablePaletteLayout !== PALETTE_LAYOUT_NONE,
	isPaletteOpen: state.palette.isOpen,
	isNotificationOpen: state.notificationpanel.isOpen,
	notificationConfigExists: state.notificationpanel?.config,
	notificationConfigEnable: state.notificationpanel?.config?.enable,
	notificationConfigLabel: state.notificationpanel?.config?.label,
	notificationConfigKeepOpen: state.notificationpanel?.config?.keepOpen,
	notificationMessages: state.notifications,
	enableInternalObjectModel: state.canvasconfig.enableInternalObjectModel,
	enableEditingActions: state.canvasconfig.enableEditingActions,
	canUndo: ownProps.canvasController.canUndo(),
	canRedo: ownProps.canvasController.canRedo(),
	canCutCopy: ownProps.canvasController.canCutCopy(),
	canPaste: ownProps.canvasController.canPaste(),
	canDelete: ownProps.canvasController.canDelete(),
	canZoomIn: ownProps.canvasController.canZoomIn(),
	canZoomOut: ownProps.canvasController.canZoomOut(),
	canZoomToFit: ownProps.canvasController.canZoomToFit(),
	undoLabel: ownProps.canvasController.getUndoLabel(),
	redoLabel: ownProps.canvasController.getRedoLabel()
});

export default connect(mapStateToProps)(injectIntl(CommonCanvasToolbar));
