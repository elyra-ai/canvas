/*
 * Copyright 2024 Elyra Authors
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

import parallaxFlow from "./parallax-flow.json";
import parallaxPalette from "./parallax-palette.json";

export default class ParallaxCanvas extends React.Component {
	constructor(props) {
		super(props);

		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(parallaxFlow);
		this.canvasController.setPipelineFlowPalette(parallaxPalette);
		this.canvasController.openPalette();

		this.getConfig = this.getConfig.bind(this);
	}

	getConfig() {
		const config = Object.assign({}, this.props.config, {
			enableParentClass: "parallax-canvas",
			enableNodeFormatType: "Horizontal",
			enableLinkType: "Parallax",
			enableSelfRefLinks: true,
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

				nodeShape: "rectangle",

				defaultNodeWidth: 250,
				defaultNodeHeight: 25,

				autoSizeNode: false,

				labelPosX: 20,
				labelPosY: 5,

				inputPortDisplay: false,
				inputPortAutoPosition: false,
				inputPortPositions: [
					{ x_pos: 0, y_pos: 5, pos: "topLeft" },
					{ x_pos: 0, y_pos: -5, pos: "bottomRight" }
				],

				outputPortDisplay: true,
				outputPortAutoPosition: false,
				outputPortPositions: [
					{ x_pos: 0, y_pos: 5, pos: "topRight" },
					{ x_pos: 0, y_pos: -5, pos: "bottomLeft" }
				],

				outputPortGuideObject: "image",
				outputPortGuideImage: "/images/custom-canvases/flows/decorations/dragStateArrow.svg",
				outputPortGuideImageRotate: true
			},
			enableCanvasLayout: {
				dataLinkArrowHead: "M 0 0 L -5 -4 -5 4 Z"
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

ParallaxCanvas.propTypes = {
	config: PropTypes.object
};
