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

import { Add, Bee, Compass, FlowConnection, DirectionCurve } from "@carbon/react/icons";

import { CommonCanvas, CanvasController } from "common-canvas"; // eslint-disable-line import/no-unresolved

import allPortsFlow from "./all-ports-flow.json";
import allPortsPalette from "./all-ports-palette.json";

export default class AllPortsCanvas extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			linkType: "Curve",
			linkDirection: "LeftRight",
			portsLocation: "East"
		};

		this.decorations = null;

		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(allPortsFlow);
		this.canvasController.setPipelineFlowPalette(allPortsPalette);
		this.canvasController.openPalette();

		this.getConfig = this.getConfig.bind(this);
		this.editActionHandler = this.editActionHandler.bind(this);
	}

	getConfig() {
		const config = Object.assign({}, this.props.config, {
			enableParentClass: "all-ports-canvas",
			enableNodeFormatType: "Vertical",
			enableLinkType: this.state.linkType,
			enableLinkDirection: this.state.linkDirection,
			enableLinkSelection: "Detachable",
			enableStraightLinksAsFreeform: false,
			enableSelfRefLinks: true,
			enableMarkdownInComments: true,
			enableContextToolbar: true,
			enableSaveZoom: "LocalStorage",
			enableResizableNodes: true,
			enableSnapToGridType: "During",
			// enableLinksOverNodes: true,
			tipConfig: {
				palette: true,
				nodes: true,
				ports: false,
				links: false
			},
			enableNodeLayout: {
				drawNodeLinkLineFromTo: "node_center",
				drawCommentLinkLineTo: "node_center",
				nodeHighlightGap: 6,

				autoSizeNode: false,

				inputPortAutoPosition: false,
				inputPortPositions: [
					{ x_pos: -20, y_pos: 0, pos: "topCenter" },
					{ x_pos: 0, y_pos: -20, pos: "middleLeft" },
					{ x_pos: 0, y_pos: -20, pos: "middleRight" },
					{ x_pos: -20, y_pos: 0, pos: "bottomCenter" }
				],

				inputPortWidth: 15,
				inputPortHeight: 15,
				inputPortObject: "circle",
				inputPortImage: "/images/custom-canvases/flows/decorations/dragStateArrow.svg",

				outputPortAutoPosition: false,
				outputPortPositions: [
					{ x_pos: 20, y_pos: 0, pos: "topCenter" },
					{ x_pos: 0, y_pos: 20, pos: "middleLeft" },
					{ x_pos: 0, y_pos: 20, pos: "middleRight" },
					{ x_pos: 20, y_pos: 0, pos: "bottomCenter" }
				],

				outputPortWidth: 15,
				outputPortHeight: 15,
				outputPortObject: "image",
				outputPortImage: "/images/custom-canvases/flows/decorations/dragStateArrow.svg",

				outputPortGuideObject: "image",
				outputPortGuideImage: "/images/custom-canvases/flows/decorations/dragStateArrow.svg",
				outputPortGuideImageRotate: true
			},
			enableCanvasLayout: {
				dataLinkArrowHead: true
			}
		});
		return config;
	}

	getToolbarConfig() {
		const subMenuLinkType = [
			{ action: "Curve", label: "Curve", enable: true },
			{ action: "Elbow", label: "Elbow", enable: true },
			{ action: "Straight", label: "Straight", enable: true },
			{ action: "Parallax", label: "Parallax", enable: true }
		];

		const subMenuLinkDirection = [
			{ action: "LeftRight", label: "Ports", enable: true },
			{ action: "Freeform", label: "Freeform", enable: true }
		];

		const subMenuPortLocations = [
			{ action: "North", label: "North", enable: true },
			{ action: "South", label: "South", enable: true },
			{ action: "East", label: "East", enable: true },
			{ action: "West", label: "West", enable: true }
		];

		return {
			leftBar: [
				{ action: "undo" },
				{ action: "redo" },
				{ divider: true },
				{ action: "linkDir", label: this.state.linkDirection === "LeftRight" ? "Ports" : "Freeform",
					incLabelWithIcon: "after", iconEnabled: (<FlowConnection size={32} />),
					subMenu: subMenuLinkDirection, enable: true, closeSubAreaOnClick: true },
				{ divider: true },
				{ action: "linkType", label: this.state.linkType, incLabelWithIcon: "after",
					iconEnabled: (<DirectionCurve size={32} />),
					subMenu: subMenuLinkType, enable: true, closeSubAreaOnClick: true },
				{ divider: true },
				{ action: "subMenuPortLocations", label: this.state.portsLocation, incLabelWithIcon: "after",
					iconEnabled: (<Compass size={32} />),
					subMenu: subMenuPortLocations, enable: true, closeSubAreaOnClick: true },
				{ divider: true },
				{ action: "addDecorations", label: "Add decorations", incLabelWithIcon: "after", iconEnabled: (<Add size={32} />),
					isSelected: Boolean(this.decorations), enable: true },
				{ divider: true }
			]
		};
	}

	editActionHandler(data, command) {
		if (data.editType === "Curve" || data.editType === "Elbow" || data.editType === "Straight" || data.editType === "Parallax") {
			this.setState({ linkType: data.editType });

		} else if (data.editType === "LeftRight" || data.editType === "Freeform") {
			this.setState({ linkDirection: data.editType });

		} else if (data.editType === "North" || data.editType === "South" || data.editType === "East" || data.editType === "West") {
			this.changePortsLocation(data.editType);

		} else if (data.editType === "addDecorations") {
			this.toggleDecorations();
		}
	}

	changePortsLocation(dir) {
		this.canvasController.getNodes().forEach((n) => {
			if (n.outputs && n.outputs.length > 0 && n.type === "binding") {
				this.canvasController.setNodeProperties(n.id, { op: this.convertOpForDir(dir) });
			}
		});
		this.setState({ portsLocation: dir });
	}

	convertOpForDir(dir) {
		switch (dir) {
		case "North":
			return "north-output-port";
		case "South":
			return "south-output-port";
		case "West":
			return "west-output-port";
		case "East":
		default:
			return "east-output-port";
		}
	}

	toggleDecorations() {
		if (this.decorations) {
			this.decorations = null;
		} else {
			this.decorations = [{
				id: "123",
				jsx: (<Bee />),
				position: "middle",
				x_pos: -10,
				y_pos: -10
			}];
		}

		this.canvasController.getLinks().forEach((l) => {
			this.canvasController.setLinkProperties(l.id, { decorations: this.decorations });
		});
	}

	layoutHandler(node) {
		switch (node.op) {
		case "north-output-port":
			return {
				outputPortPositions: [
					{ x_pos: 0, y_pos: 0, pos: "topCenter" }
				]
			};

		case "south-output-port":
			return {
				outputPortPositions: [
					{ x_pos: 0, y_pos: 0, pos: "bottomCenter" }
				]
			};

		case "east-output-port":
			return {
				outputPortPositions: [
					{ x_pos: 0, y_pos: 0, pos: "middleRight" }
				]
			};

		case "west-output-port":
			return {
				outputPortPositions: [
					{ x_pos: 0, y_pos: 0, pos: "middleLeft" }
				]
			};
		case "north-input-port":
			return {
				inputPortPositions: [
					{ x_pos: 0, y_pos: 0, pos: "topCenter" }
				]
			};

		case "south-input-port":
			return {
				inputPortPositions: [
					{ x_pos: 0, y_pos: 0, pos: "bottomCenter" }
				]
			};

		case "east-input-port":
			return {
				inputPortPositions: [
					{ x_pos: 0, y_pos: 0, pos: "middleRight" }
				]
			};

		case "west-input-port":
			return {
				inputPortPositions: [
					{ x_pos: 0, y_pos: 0, pos: "middleLeft" }
				]
			};
		default:
		}

		return {};
	}

	render() {
		const config = this.getConfig();
		const toolbarConfig = this.getToolbarConfig();

		return (
			<CommonCanvas
				canvasController={this.canvasController}
				editActionHandler={this.editActionHandler}
				layoutHandler={this.layoutHandler}
				toolbarConfig={toolbarConfig}
				config={config}
			/>
		);
	}
}

AllPortsCanvas.propTypes = {
	config: PropTypes.object
};
