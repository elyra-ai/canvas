/*
 * Copyright 2025 Elyra Authors
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
import { Provider } from "react-redux";
import { Palette, CanvasController } from "common-canvas"; // eslint-disable-line import/no-unresolved

const BACKSPACE_KEY = "Backspace";
const DELETE_KEY = "Delete";
const SPACE_KEY = "Space";
const TAB_KEY = "Tab";

export default class PromptSubPalette extends React.Component {
	constructor(props) {
		super(props);

		this.onScroll = this.onScroll.bind(this);

		// Create the palette's own canvas controller so it can contain
		// a modified palette and have its own config separate from the
		// Common Canvas controller.
		this.canvasController = new CanvasController();
		this.canvasController.setCanvasConfig({
			enableSingleClickAddFromPalette: true,
		});
		this.canvasController.openPalette();
		this.canvasController.setPipelineFlowPalette(props.palette);
	}

	onScroll(evt) {
		evt.stopPropagation();
	}

	onMouseDown(evt) {
		if (evt.target?.classList?.contains("cds--search-input")) {
			evt.stopPropagation();
		}
	}

	onKeyDown(evt) {
		// Stop delete and backspace going to canvas background to
		// prevent the node being deleted.
		if (evt.code === BACKSPACE_KEY || evt.code === DELETE_KEY || evt.code === SPACE_KEY || evt.code === TAB_KEY) {
			evt.stopPropagation();
		}
	}

	render() {
		return (
			<div style={{ height: "100%", width: "100%" }}
				onScroll={this.onScroll} onWheel={this.onScroll} onKeyDown={this.onKeyDown} onMouseDown={this.onMouseDown}
			>
				<Provider store={this.canvasController.getStore()}>
					<Palette canvasController={this.canvasController} createAutoNode={this.props.createAutoNode} />
				</Provider>
			</div>
		);
	}
}

PromptSubPalette.propTypes = {
	palette: PropTypes.object.isRequired,
	createAutoNode: PropTypes.func.isRequired
};

