/*
 * Copyright 2017-2022 Elyra Authors
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
import Toolbar from "../toolbar/toolbar.jsx";
import Logger from "../logging/canvas-logger.js";

class TextToolbar extends React.Component {
	constructor(props) {
		super(props);

		this.getLabel = this.getLabel.bind(this);
		this.toolbarActionHandler = this.toolbarActionHandler.bind(this);
		this.logger = new Logger("Text-Toolbar");
	}

	// configureToolbarButtonsState(toolbarConfig) {
	// 	// We only set toolbar state with the internal object model. With the
	// 	// external object model the host app must set toolbar state through the
	// 	// toolbar config params.
	// 	if (!this.props.enableInternalObjectModel ||
	// 			toolbarConfig.overrideAutoEnableDisable) {
	// 		return toolbarConfig;
	// 	}
	//
	// 	if (typeof toolbarConfig !== "undefined") {
	// 		const editingAllowed = this.props.enableEditingActions;
	// 		this.applyToolState("undo", toolbarConfig, editingAllowed && this.props.canUndo);
	// 		this.applyToolState("redo", toolbarConfig, editingAllowed && this.props.canRedo);
	// 		this.applyToolState("cut", toolbarConfig, editingAllowed && this.props.canCutCopy);
	// 		this.applyToolState("copy", toolbarConfig, editingAllowed && this.props.canCutCopy);
	// 		this.applyToolState("paste", toolbarConfig, editingAllowed && this.props.canPaste);
	// 		this.applyToolState("deleteSelectedObjects", toolbarConfig, editingAllowed && this.props.canDelete);
	// 		this.applyToolState("createAutoComment", toolbarConfig, editingAllowed);
	// 		this.applyToolState("arrangeHorizontally", toolbarConfig, editingAllowed);
	// 		this.applyToolState("arrangeVertically", toolbarConfig, editingAllowed);
	// 		// editingAllowed = false doesn't stop zoom capability
	// 		this.applyToolState("zoomIn", toolbarConfig, this.props.canZoomIn);
	// 		this.applyToolState("zoomOut", toolbarConfig, this.props.canZoomOut);
	// 		this.applyToolState("zoomToFit", toolbarConfig, this.props.canZoomToFit);
	// 	}
	// 	return toolbarConfig;
	// }
	//
	// addUndoRedoCommandLabels(toolbarConfig) {
	// 	const undoLabel = this.props.undoLabel;
	// 	const redoLabel = this.props.redoLabel;
	//
	// 	if (undoLabel) {
	// 		const undoTool = this.findTool("undo", toolbarConfig);
	// 		if (undoTool) {
	// 			undoTool.label = this.getLabel("canvas.undoCommand", { undo_command: undoLabel });
	// 		}
	// 	}
	// 	if (redoLabel) {
	// 		const redoTool = this.findTool("redo", toolbarConfig);
	// 		if (redoTool) {
	// 			redoTool.label = this.getLabel("canvas.redoCommand", { redo_command: redoLabel });
	// 		}
	// 	}
	// 	return toolbarConfig;
	// }
	//
	// applyToolState(action, toolbarConfig, state) {
	// 	const tool = this.findTool(action, toolbarConfig);
	// 	if (tool) {
	// 		tool.enable = state;
	// 	} else {
	// 		this.logger.log("Toolbar tool " + action + " could not be found to set state to " + state);
	// 	}
	// }
	//
	// findTool(action, toolbarConfig) {
	// 	let tool = {};
	// 	if (toolbarConfig.leftBar) {
	// 		tool = toolbarConfig.leftBar.find((o) => o.action === action);
	// 	}
	// 	if (!tool && toolbarConfig.rightBar) {
	// 		tool = toolbarConfig.rightBar.find((o) => o.action === action);
	// 	}
	// 	return tool;
	// }

	render() {
		this.logger.log("render");

		const toolbarConfig = {
			leftBar: [
				{ action: "cut", label: "Cut", enable: true, tooltip: "Cut from clipboard" },
				{ action: "copy", label: "Copy", enable: true, tooltip: "Copy from clipboard" },
				{ action: "paste", label: "Paste", enable: true, tooltip: "Paste to canvas" }
			]
		};

		const textToolbar = (
			<Toolbar
				config={toolbarConfig}
				instanceId={this.props.instanceId}
				toolbarActionHandler={this.props.toolbarActionHandler}
				additionalText={this.props.additionalText}
			/>
		);

		return textToolbar;
	}
}

TextToolbar.propTypes = {
	instanceId: PropTypes.string.isRequired,
	toolbarActionHandler: PropTypes.func.isRequired,
	additionalText: PropTypes.object.isRequired
};

export default TextToolbar;
