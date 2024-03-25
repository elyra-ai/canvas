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
import { Play, StopFilledAlt } from "@carbon/react/icons";

import ProgressCanvasFlow from "./progress.json";
import ProgressPalette from "../../../../../test_resources/palettes/modelerPalette.json";

const nodeAnimation =
	"animation-duration:1000ms; animation-name:wiggle2; " +
	"animation-iteration-count:infinite; fill: skyblue;";

const nodeStyle = {
	body: { default: nodeAnimation, hover: "fill: orange; stroke: coralred; stroke-width: 5;" },
	// selection_outline: { default: animation },
	image: { default: null },
	label: { default: "fill: blue" },
	text: { default: "fill: white" }
};

const removeNodeStyle = {
	body: { default: null, hover: null },
	// selection_outline: { default: animation },
	image: { default: null },
	label: { default: null },
	text: { default: null }
};

const nodeCompleteDec = [{
	id: "done",
	position: "topCenter",
	x_pos: -10,
	y_pos: -25,
	height: 20,
	width: 20,
	outline: false,
	image: "/images/decorators/checkmark--filled.svg",
	temporary: true
}];

const linkAnimation =
	"animation-duration:1000ms; animation-name:blink; " +
	"animation-iteration-count:infinite; animation-direction: alternate";

const linkStyle = {
	line: { default: linkAnimation, hover: "stroke: yellow; stroke-width: 2" }
};

const removeLinkStyle = {
	line: { default: null, hover: null }
};

export default class ProgressCanvas extends React.Component {
	constructor(props) {
		super(props);
		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(ProgressCanvasFlow);
		this.canvasController.setPipelineFlowPalette(ProgressPalette);

		this.getConfig = this.getConfig.bind(this);
		this.runProgress = this.runProgress.bind(this);
		this.editActionHandler = this.editActionHandler.bind(this);
	}

	getConfig() {
		const config = Object.assign({}, this.props.config, {
			enableParentClass: "progress",
			enableNodeFormatType: "Vertical",
			enableMarkdownInComments: true,
			tipConfig: {
				palette: true,
				nodes: true,
				ports: false,
				links: false
			}
		});
		return config;
	}

	getToolbarConfig() {
		const toolbarConfig = [
			{ action: "palette", label: "Palette", enable: true },
			{ divider: true },
			{ action: "runit", label: "Run", enable: true, incLabelWithIcon: "before", iconEnabled: (<Play size={32} />), kind: "primary" },
			{ divider: true },
			{ action: "stopit", label: "Stop", enable: true, incLabelWithIcon: "before", iconEnabled: (<StopFilledAlt size={32} />) },
			{ divider: true },
			{ action: "undo", label: "Undo", enable: true },
			{ action: "redo", label: "Redo", enable: true },
			{ action: "cut", label: "Cut", enable: true, tooltip: "Cut from clipboard" },
			{ action: "copy", label: "Copy", enable: true, tooltip: "Copy from clipboard" },
			{ action: "paste", label: "Paste", enable: true, tooltip: "Paste to canvas" },
			{ action: "createAutoComment", label: "Add Comment", enable: true },
			{ action: "deleteSelectedObjects", label: "Delete", enable: true }
		];

		return toolbarConfig;
	}

	editActionHandler(data, command, inExtraCanvas) {
		switch (data.editType) {
		case "runit": {
			this.runProgress();
			break;
		}
		case "stopit": {
			this.stopProgress();
			break;
		}
		default: {
			// Do nothing
		}
		}
	}

	runProgress() {
		// Note: The pipelineId uses special characters for testing purposes.
		const pipelineId = "`~!@#$%^&*()_+=-{}][|:;<,>.9?/";

		const bindingEntryNode = "id8I6RH2V91XW";
		const executionNode = "|:;<,>.9?/`~!@#$%^&*()_+=-{}]["; // The executiion node id uses special characters for testing.
		const superNode = "nodeIDSuperNodePE";
		const modelNode = "id125TTEEIK7V";
		const bindingExitNode = "id5KIRGGJ3FYT";

		this.objects1 = [];
		this.objects2 = [];
		this.objects3 = [];
		this.objects4 = [];

		this.objects1[pipelineId] = [bindingEntryNode];
		this.objects2[pipelineId] = [executionNode];
		this.objects3[pipelineId] = [superNode];
		this.objects4[pipelineId] = [modelNode, bindingExitNode];

		const lnk1 = this.canvasController.getNodeDataLinkFromInfo(bindingEntryNode, "outPort", executionNode, "inPort");
		const lnk2 = this.canvasController.getNodeDataLinkFromInfo(executionNode, null, superNode, "input2SuperNodePE");
		const lnk3 = this.canvasController.getNodeDataLinkFromInfo(superNode, null, modelNode, "inPort");
		const lnk4 = this.canvasController.getNodeDataLinkFromInfo(superNode, "output1SuperNodePE", bindingExitNode, "inPort");

		this.link1 = [];
		this.link2 = [];
		this.link3 = [];

		this.link1[pipelineId] = [lnk1.id];
		this.link2[pipelineId] = [lnk2.id];
		this.link3[pipelineId] = [lnk3.id, lnk4.id];

		const that = this;

		// On run, first clear all node decorations
		this.clearNodeDecorations();

		// Now begin displaying progress indication using setTimeout to
		// simulate the passage of time.
		that.canvasController.setObjectsStyle(this.objects1, nodeStyle, true);

		this.part1 = setTimeout(() => {
			that.canvasController.setLinksStyle(this.link1, linkStyle, true);
			that.canvasController.setObjectsStyle(this.objects2, nodeStyle, true);
		}, 2000);

		this.part2 = setTimeout(() => {
			that.canvasController.setObjectsStyle(this.objects1, removeNodeStyle, true);
			that.canvasController.setNodeDecorations(bindingEntryNode, nodeCompleteDec);
			that.canvasController.setLinksStyle(this.link1, removeLinkStyle, true);
		}, 4000);

		this.part3 = setTimeout(() => {
			that.canvasController.setLinksStyle(this.link2, linkStyle, true);
			that.canvasController.setObjectsStyle(this.objects3, nodeStyle, true);
		}, 6000);

		this.part4 = setTimeout(() => {
			that.canvasController.setObjectsStyle(this.objects2, removeNodeStyle, true);
			that.canvasController.setNodeDecorations(executionNode, nodeCompleteDec);
			that.canvasController.setLinksStyle(this.link2, removeLinkStyle, true);
		}, 8000);

		this.part5 = setTimeout(() => {
			that.canvasController.setLinksStyle(this.link3, linkStyle, true);
			that.canvasController.setObjectsStyle(this.objects4, nodeStyle, true);
		}, 10000);

		this.part6 = setTimeout(() => {
			that.canvasController.setLinksStyle(this.link3, removeLinkStyle, true);
			that.canvasController.setObjectsStyle(this.objects3, removeNodeStyle, true);
			that.canvasController.setNodeDecorations(superNode, nodeCompleteDec);
		}, 12000);

		this.part7 = setTimeout(() => {
			that.canvasController.setObjectsStyle(this.objects4, removeNodeStyle, true);
			that.canvasController.setNodeDecorations(modelNode, nodeCompleteDec);
			that.canvasController.setNodeDecorations(bindingExitNode, nodeCompleteDec);
		}, 14000);
	}

	stopProgress() {
		// Stop the annimations
		clearTimeout(this.part1);
		clearTimeout(this.part2);
		clearTimeout(this.part3);
		clearTimeout(this.part4);
		clearTimeout(this.part5);
		clearTimeout(this.part6);
		clearTimeout(this.part7);

		// Clear any current node decorations
		this.clearNodeDecorations();

		// Clear any current node styles
		this.canvasController.setObjectsStyle(this.objects1, removeNodeStyle, true);
		this.canvasController.setObjectsStyle(this.objects2, removeNodeStyle, true);
		this.canvasController.setObjectsStyle(this.objects3, removeNodeStyle, true);
		this.canvasController.setObjectsStyle(this.objects4, removeNodeStyle, true);

		// Clear any current link styles
		this.canvasController.setLinksStyle(this.link1, removeLinkStyle, true);
		this.canvasController.setLinksStyle(this.link2, removeLinkStyle, true);
		this.canvasController.setLinksStyle(this.link3, removeLinkStyle, true);
		this.canvasController.setLinksStyle(this.link4, removeLinkStyle, true);
	}

	clearNodeDecorations() {
		this.canvasController.getNodes().forEach((n) => {
			this.canvasController.setNodeDecorations(n.id, []);
		});
	}

	render() {
		const config = this.getConfig();
		const toolbarConfig = this.getToolbarConfig();
		return (
			<CommonCanvas
				canvasController={this.canvasController}
				editActionHandler={this.editActionHandler}
				toolbarConfig={toolbarConfig}
				config={config}
			/>
		);
	}
}

ProgressCanvas.propTypes = {
	config: PropTypes.object
};
