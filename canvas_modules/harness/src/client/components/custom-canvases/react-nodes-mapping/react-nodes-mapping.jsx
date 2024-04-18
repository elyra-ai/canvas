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
import PropTypes from "prop-types";

import { Add, Edit } from "@carbon/react/icons";

import { CommonCanvas, CanvasController } from "common-canvas"; // eslint-disable-line import/no-unresolved

import MappingContainerNode from "./mapping-container-node.jsx";

import ReactNodesMappingFlow from "./react-nodes-mapping-flow.json";


export default class ReactNodesMappingCanvas extends React.Component {
	constructor(props) {
		super(props);

		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(ReactNodesMappingFlow);

		this.toolbarConfig = {
			leftBar: [
				{ action: "undo", label: "Undo", enable: true },
				{ action: "redo", label: "Redo", enable: true }
			]
		};

		this.getConfig = this.getConfig.bind(this);
		this.contextMenuHandler = this.contextMenuHandler.bind(this);
	}

	getConfig() {
		const config = Object.assign({}, this.props.config, {
			enableParentClass: "react-nodes-scrollable",
			enableNodeFormatType: "Vertical",
			enableLinkType: "Curve",
			enableLinkSelection: "LinkOnly",
			enablePaletteLayout: "None",
			enableDropZoneOnExternalDrag: false,
			enableEditingActions: true,
			enableRaiseNodesToTopOnHover: false,
			enableMarkdownInComments: true,
			enableContextToolbar: true,
			tipConfig: {
				palette: false,
				nodes: false,
				ports: false,
				links: false
			},
			enableNodeLayout: {
				drawNodeLinkLineFromTo: "node_center",
				drawCommentLinkLineTo: "node_center",
				nodeShapeDisplay: false,
				nodeExternalObject: MappingContainerNode,
				defaultNodeWidth: 400,
				defaultNodeHeight: 30,
				contextToolbarPosition: "topRight",
				ellipsisDisplay: false,
				imageDisplay: false,
				labelDisplay: false,
				inputPortDisplay: false,
				outputPortDisplay: false,
				autoSizeNode: false
			},
			enableCanvasLayout: {
				dataLinkArrowHead: true,
				linkGap: 4
			}
		});
		return config;
	}

	getCanvasController() {
		return this.canvasController;
	}

	contextMenuHandler(source, defaultMenu) {
		if (source.type === "node") {
			return [
				{ action: "add", label: "Add", icon: (<Add size={32} />), enable: true, toolbarItem: true },
				{ action: "edit", label: "Edit", icon: (<Edit size={32} />), enable: true, toolbarItem: true },
				{ action: "select", label: "Select", enable: true },
				{ action: "select_All", label: "Select All", enable: true },
				{ action: "findReplace", label: "Find/Replace", enable: true }
			];
		}
		return [];
	}

	render() {
		const config = this.getConfig();
		return (
			<CommonCanvas
				canvasController={this.canvasController}
				config={config}
				contextMenuHandler={this.contextMenuHandler}
				toolbarConfig={this.toolbarConfig}
			/>
		);
	}
}

ReactNodesMappingCanvas.propTypes = {
	config: PropTypes.object
};
