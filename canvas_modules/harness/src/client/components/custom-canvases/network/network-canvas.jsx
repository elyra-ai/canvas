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

import { CommonCanvas, CanvasController } from "common-canvas"; // eslint-disable-line import/no-unresolved

import networkFlow from "./network-flow.json";
import networkPalette from "./network-palette.json";

export default class NetworkCanvas extends React.Component {
	constructor(props) {
		super(props);

		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(networkFlow);
		this.canvasController.setPipelineFlowPalette(networkPalette);
		this.canvasController.openPaletteCategory("items-nodes");

		this.getConfig = this.getConfig.bind(this);
	}

	getConfig() {
		const config = Object.assign({}, this.props.config, {
			enableParentClass: "network-canvas",
			enableNodeFormatType: "Vertical",
			enableLinkType: "Elbow",
			enableLinkMethod: "Freeform",
			enableMarkdownInComments: true,
			enableContextToolbar: true,
			enableSaveZoom: "LocalStorage",
			enableSnapToGridType: "During",
			tipConfig: {
				palette: true,
				nodes: true,
				ports: false,
				links: false
			},
			enableNodeLayout: {
				nodeHighlightGap: 6,

				nodeShapeDisplay: false,

				labelEditable: true,
				labelWidth: 200,

				inputPortDisplay: false,
				outputPortDisplay: true,

				outputPortGuideObject: "image",
				outputPortGuideImage: "/images/custom-canvases/flows/decorations/dragStateArrow.svg",
				outputPortGuideImageRotate: true
			},
			enableCanvasLayout: {
				dataLinkArrowHead: "M 0 0 L -5 -2 -5 2 Z"
			}
		});
		return config;
	}

	render() {
		const config = this.getConfig();

		return (
			<CommonCanvas
				canvasController={this.canvasController}
				config={config}
			/>
		);
	}
}

NetworkCanvas.propTypes = {
	config: PropTypes.object
};
