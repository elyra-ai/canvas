/*
 * Copyright 2023 Elyra Authors
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
import ReactDOM from "react-dom";

import Logger from "../logging/canvas-logger.js";

export default class SvgCanvasExternal {
	constructor(renderer) {
		this.logger = new Logger("SVGCanvasExternal");
		this.ren = renderer;
	}

	addNodeExternalObject(node, i, foreignObjects) {
		ReactDOM.render(
			<node.layout.nodeExternalObject
				nodeData={node}
				canvasController={this.ren.canvasController}
				externalUtils={this}
			/>,
			foreignObjects[i]
		);
	}

	addDecExternalObject(dec, i, foreignObjects) {
		ReactDOM.render(dec.jsx, foreignObjects[i]);
	}

	removeExternalObject(obj, i, foreignObjects) {
		ReactDOM.unmountComponentAtNode(foreignObjects[i]);
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
			});
		}
		if (info.outputPositions) {
			info.outputPositions.forEach((outputPos) => {
				const out = node.outputs.find((output) => output.id === outputPos.id);
				out.cx = outputPos.cx / k;
				out.cy = outputPos.cy / k;
			});
		}
		this.ren.displayLinks();
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

	raiseNodeToTopById(nodeId) {
		this.ren.raiseNodeToTopById(nodeId);
	}
}
