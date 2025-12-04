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

import { CommonCanvas, CanvasController } from "@elyra/canvas";

import LinkTypesFlow from "./link-types-flow.json";
import LinkTypesPalette from "./link-types-palette.json";


export default class LinkTypesCanvas extends React.Component {
	constructor(props) {
		super(props);
		this.canvasController = new CanvasController();

		this.canvasController.setPipelineFlow(LinkTypesFlow);
		this.canvasController.setPipelineFlowPalette(LinkTypesPalette);

		// Define a backwards pointing arrow for the source end of a link
		this.sourceDecoration = {
			id: "sourceArrow",
			position: "source",
			path: "M 6 6 L 0 0 6 -6",
			class_name: "arrow",
			rotate: true,
			temporary: true
		};

		// Define a forwards pointing arrow for the target end of a link
		this.targetDecoration = {
			id: "targetArrow",
			position: "target",
			path: "M -6 6 L 0 0 -6 -6",
			class_name: "arrow",
			rotate: true,
			temporary: true
		};

		// Add the decorations to the links in the flow
		this.setArrowsToLinks();

		this.getConfig = this.getConfig.bind(this);
	}

	getConfig() {
		const imgSrc = "/images/custom-canvases/logic/decorations/dragStateArrow.svg";

		const config = Object.assign({}, this.props.config, {
			enableParentClass: "link-types-canvas",
			enableNodeFormatType: "Vertical",
			enableLinkType: "Straight",
			enableLinkMethod: "Freeform",
			enableLinkSelection: "LinkOnly",
			enableSnapToGridType: "After",
			enableSelfRefLinks: true,
			enableSplitLinkDroppedOnNode: true,
			enableMarkdownInComments: true,
			enableContextToolbar: true,
			enableKeyboardNavigation: true,
			tipConfig: {
				palette: true,
				nodes: false,
				ports: false,
				links: false
			},
			enableNodeLayout: {
				defaultNodeWidth: 60,
				defaultNodeHeight: 60,

				nodeShape: "rectangle-rounded-corners",

				imageWidth: 40,
				imageHeight: 40,
				imagePosX: 10,
				imagePosY: 4,

				labelPosition: "topLeft",
				labelPosX: 30,
				labelPosY: 40,

				inputPortDisplay: false,

				// Output port properties
				outputPortDisplay: true,
				outputPortDisplayObjects: [
					{ type: "image", width: 20, height: 20, src: imgSrc }
				],
				outputPortGuideObjects: [
					{ type: "image", width: 20, height: 20, src: imgSrc }
				],
				outputPortGuideImageRotate: true
			},
			enableCanvasLayout: {
				dataLinkArrowHead: false
			}
		});
		return config;
	}

	// Adds decorations for the arrow heads to the link objects
	// depending on app_data.linkType in the link.
	setArrowsToLinks() {
		const links = this.canvasController.getLinks();
		const newLinks = links.map((l) => {
			l.decorations = this.getArrowDecorations(l);
			return l;
		});

		this.canvasController.setLinks(newLinks);
	}

	// Returns a decorations array to draw arrows based on the value
	// in app_data.linkType in the link.
	getArrowDecorations(link) {
		if (link.app_data?.linkType === "bothArrow") {
			return [this.sourceDecoration, this.targetDecoration];

		} else if (link.app_data?.linkType === "sourceArrow") {
			return [this.sourceDecoration];

		} else if (link.app_data?.linkType === "targetArrow") {
			return [this.targetDecoration];
		}
		return [];
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

LinkTypesCanvas.propTypes = {
	config: PropTypes.object
};
