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

import { CommonCanvas, CanvasController } from "common-canvas"; // eslint-disable-line import/no-unresolved

import FlowsFlow from "./flows-flow.json";
import FlowsPalette from "./flows-palette.json";
import FlowsProperties from "./flows-properties";

export default class FlowsCanvas extends React.Component {
	constructor(props) {
		super(props);
		this.propertiesRef = React.createRef();
		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(FlowsFlow);
		this.canvasController.setPipelineFlowPalette(FlowsPalette);

		this.getConfig = this.getConfig.bind(this);
		this.decorationActionHandler = this.decorationActionHandler.bind(this);
		this.clickActionHandler = this.clickActionHandler.bind(this);
	}

	getConfig() {
		const config = Object.assign({}, this.props.config, {
			enableParentClass: "flows",
			enableNodeFormatType: "Vertical",
			enableLinkType: "Straight",
			enableLinkMethod: "Freeform",
			enableLinkDirection: "LeftRight",
			enableSaveZoom: "LocalStorage",
			enableSnapToGridType: "After",
			enableLinkSelection: "None",
			enableLinkReplaceOnNewConnection: true,
			paletteInitialState: true,
			enableDropZoneOnExternalDrag: true,
			enableContextToolbar: true,
			enableHighlightNodeOnNewLinkDrag: true,
			tipConfig: {
				palette: true,
				nodes: true,
				ports: false,
				links: false
			},
			enableNodeLayout: {
				drawNodeLinkLineFromTo: "image_center",
				drawCommentLinkLineTo: "image_center",
				defaultNodeWidth: 72,
				defaultNodeHeight: 72,
				selectionPath: "M 8 0 L 64 0 64 56 8 56 8 0",
				ellipsisWidth: 12,
				ellipsisHeight: 16,
				ellipsisPosY: -1,
				ellipsisPosX: 64.5,
				imageWidth: 48,
				imageHeight: 48,
				imagePosX: 12,
				imagePosY: 4,
				labelEditable: true,
				labelPosX: 36,
				labelPosY: 56,
				labelWidth: 120,
				labelHeight: 18,
				portRadius: 10,
				inputPortDisplay: false,
				outputPortRightPosX: 5,
				outputPortRightPosY: 30,
				outputPortObject: "image",
				outputPortImage: "/images/custom-canvases/flows/decorations/dragStateArrow.svg",
				outputPortWidth: 20,
				outputPortHeight: 20,
				outputPortGuideObject: "image",
				outputPortGuideImage: "/images/custom-canvases/flows/decorations/dragStateArrow.svg"
			},
			enableCanvasLayout: {
				dataLinkArrowHead: true,
				linkGap: 4,
				displayLinkOnOverlap: false
			}
		});
		return config;
	}

	decorationActionHandler(data) {
		this.canvasController.displaySubPipelineForSupernode(
			data.id,
			this.canvasController.getCurrentPipelineId()
		);
	}

	clickActionHandler(source) {
		if (this.propertiesRef.current &&
				source.objectType === "node" &&
				source.clickType === "DOUBLE_CLICK") {
			this.propertiesRef.current.editNodeHandler(source.id, source.pipelineId);
		}
	}

	render() {
		const config = this.getConfig();

		const rightFlyoutContent = (
			<FlowsProperties
				ref={this.propertiesRef}
				canvasController={this.canvasController}
			/>
		);

		return (
			<CommonCanvas
				canvasController={this.canvasController}
				decorationActionHandler={this.decorationActionHandler}
				config={config}
				rightFlyoutContent={rightFlyoutContent}
				clickActionHandler={this.clickActionHandler}
				showRightFlyout
			/>
		);
	}
}

FlowsCanvas.propTypes = {
	config: PropTypes.object
};
