/*
 * Copyright 2023-2024 Elyra Authors
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
import { createRoot } from "react-dom/client";
import ReactDOM from "react-dom";

import Logger from "../logging/canvas-logger.js";
import CanvasUtils from "./common-canvas-utils.js";

export default class SvgCanvasExternal {
	constructor(renderer) {
		this.logger = new Logger("SVGCanvasExternal");
		this.ren = renderer;
	}

	isValidJsxElement(el) {
		return React.isValidElement(el);
	}

	isReact18OrHigher() {
		return Number(React.version.split(".")[0]) >= 18;
	}

	addNodeExternalObject(node, i, foreignObjects) {
		const jsx = (
			<node.layout.nodeExternalObject
				nodeData={node}
				canvasController={this.ren.canvasController}
				externalUtils={this}
			/>
		);
		this.renderExternalObject(jsx, foreignObjects[i]);
	}

	addNodeImageExternalObject(image, i, foreignObjects) {
		this.renderExternalObject(image, foreignObjects[i]);
	}

	addDecExternalObject(dec, i, foreignObjects) {
		this.renderExternalObject(dec.jsx, foreignObjects[i]);
	}

	renderExternalObject(jsx, container) {
		// createRoot only available in React v18
		if (this.isReact18OrHigher()) {
			if (!container.ccExtRoot) {
				container.ccExtRoot = createRoot(container);
			}
			container.ccExtRoot.render(jsx);

		// Prior to React v18 we use ReatDOM.render
		} else {
			ReactDOM.render(jsx, container);
		}
	}

	removeExternalObject(obj, i, foreignObjects) {
		// createRoot only available in React v18
		if (this.isReact18OrHigher()) {
			const container = foreignObjects[i];
			if (!container.ccExtRoot) {
				container.ccExtRoot = createRoot(container);
			}
			// Unmount in Timeout to stop this warning from appearing:
			// "Warning: Attempted to synchronously unmount a root while
			// React was already rendering."
			setTimeout(() => {
				container.ccExtRoot.unmount();
				container.ccExtRoot = null;
			});

		// Prior to React v18 we use ReatDOM.unmountComponentAtNode
		} else {
			ReactDOM.unmountComponentAtNode(foreignObjects[i]);
		}
	}

	getActiveNodes() {
		return this.ren.activePipeline.getNodes();
	}

	getActiveNode(nodeId) {
		return this.ren.activePipeline.getNode(nodeId);
	}

	setPortPositions(info) {
		const node = this.ren.activePipeline.getNode(info.nodeId);
		const k = this.ren.zoomUtils.getZoomScale();

		if (info.inputPositions) {
			info.inputPositions.forEach((inputPos) => {
				const inp = node.inputs.find((input) => input.id === inputPos.id);
				inp.cx = inputPos.cx / k;
				inp.cy = inputPos.cy / k;
				inp.dir = CanvasUtils.getPortDir(inp.cx, inp.cy, node);
			});
		}
		if (info.outputPositions) {
			info.outputPositions.forEach((outputPos) => {
				const out = node.outputs.find((output) => output.id === outputPos.id);
				out.cx = outputPos.cx / k;
				out.cy = outputPos.cy / k;
				out.dir = CanvasUtils.getPortDir(out.cx, out.cy, node);
			});
		}
		this.ren.displayMovedLinks();
	}

	setNodesProperties(newProps) {
		if (newProps) {
			newProps.forEach((np) => {
				const node = this.ren.activePipeline.getNode(np.id);
				if (np.height) {
					node.height = np.height;
				}
				if (np.width) {
					node.width = np.width;
				}
				if (np.x_pos) {
					node.x_pos = np.x_pos;
				}
				if (np.y_pos) {
					node.y_pos = np.y_pos;
				}
			});

			this.ren.displayNodes();
		}
	}
}
