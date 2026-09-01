/*
 * Copyright 2017-2026 Elyra Authors
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

import ProgressFlow from "./progress-flow.json";
import ProgressPalette from "../../../../../test_resources/palettes/modelerPalette.json";

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

export default class ProgressCanvas extends React.Component {
	constructor(props) {
		super(props);
		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(ProgressFlow);
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
		const executionNode = "|:;<,>.9?/`~!@#$%^&*()_+=-{}]["; // The execution node id uses special characters for testing.
		const superNode = "nodeIDSuperNodePE";
		const modelNode = "id125TTEEIK7V";
		const bindingExitNode = "id5KIRGGJ3FYT";

		this.pipelineId = pipelineId;

		this.nodes1 = [bindingEntryNode];
		this.nodes2 = [executionNode];
		this.nodes3 = [superNode];
		this.nodes4 = [modelNode, bindingExitNode];

		const lnk1 = this.canvasController.getNodeDataLinkFromInfo(bindingEntryNode, "outPort", executionNode, "inPort");
		const lnk2 = this.canvasController.getNodeDataLinkFromInfo(executionNode, null, superNode, "input2SuperNodePE");
		const lnk3 = this.canvasController.getNodeDataLinkFromInfo(superNode, null, modelNode, "inPort");
		const lnk4 = this.canvasController.getNodeDataLinkFromInfo(superNode, "output1SuperNodePE", bindingExitNode, "inPort");

		this.link1 = [lnk1.id];
		this.link2 = [lnk2.id];
		this.link3 = [lnk3.id, lnk4.id];

		const that = this;

		// On run, first clear all node decorations
		this.clearNodeDecorations();

		// Now begin displaying progress indication using setTimeout to
		// simulate the passage of time.
		that.canvasController.setNodesClassName(this.nodes1, "progress-node-running", pipelineId);

		this.part1 = setTimeout(() => {
			that.canvasController.setLinksClassName(this.link1, "progress-link-running", pipelineId);
			that.canvasController.setNodesClassName(this.nodes2, "progress-node-running", pipelineId);
		}, 2000);

		this.part2 = setTimeout(() => {
			that.canvasController.setNodesClassName(this.nodes1, "", pipelineId);
			that.canvasController.setNodeDecorations(bindingEntryNode, nodeCompleteDec);
			that.canvasController.setLinksClassName(this.link1, "", pipelineId);
		}, 4000);

		this.part3 = setTimeout(() => {
			that.canvasController.setLinksClassName(this.link2, "progress-link-running", pipelineId);
			that.canvasController.setNodesClassName(this.nodes3, "progress-node-running", pipelineId);
		}, 6000);

		this.part4 = setTimeout(() => {
			that.canvasController.setNodesClassName(this.nodes2, "", pipelineId);
			that.canvasController.setNodeDecorations(executionNode, nodeCompleteDec);
			that.canvasController.setLinksClassName(this.link2, "", pipelineId);
		}, 8000);

		this.part5 = setTimeout(() => {
			that.canvasController.setLinksClassName(this.link3, "progress-link-running", pipelineId);
			that.canvasController.setNodesClassName(this.nodes4, "progress-node-running", pipelineId);
		}, 10000);

		this.part6 = setTimeout(() => {
			that.canvasController.setLinksClassName(this.link3, "", pipelineId);
			that.canvasController.setNodesClassName(this.nodes3, "", pipelineId);
			that.canvasController.setNodeDecorations(superNode, nodeCompleteDec);
		}, 12000);

		this.part7 = setTimeout(() => {
			that.canvasController.setNodesClassName(this.nodes4, "", pipelineId);
			that.canvasController.setNodeDecorations(modelNode, nodeCompleteDec);
			that.canvasController.setNodeDecorations(bindingExitNode, nodeCompleteDec);
		}, 14000);
	}

	stopProgress() {
		// Stop the animations
		clearTimeout(this.part1);
		clearTimeout(this.part2);
		clearTimeout(this.part3);
		clearTimeout(this.part4);
		clearTimeout(this.part5);
		clearTimeout(this.part6);
		clearTimeout(this.part7);

		// Clear any current node decorations
		this.clearNodeDecorations();

		// Clear any current node classes
		this.canvasController.setNodesClassName(this.nodes1, "", this.pipelineId);
		this.canvasController.setNodesClassName(this.nodes2, "", this.pipelineId);
		this.canvasController.setNodesClassName(this.nodes3, "", this.pipelineId);
		this.canvasController.setNodesClassName(this.nodes4, "", this.pipelineId);

		// Clear any current link classes
		this.canvasController.setLinksClassName(this.link1, "", this.pipelineId);
		this.canvasController.setLinksClassName(this.link2, "", this.pipelineId);
		this.canvasController.setLinksClassName(this.link3, "", this.pipelineId);
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
