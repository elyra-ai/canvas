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

import { ChartColumn, CurrencyPound, Db2Database, DataTable, Debug, FaceCool,
	Fish, Folder, FolderOpen, FolderMoveTo,
	JoinInner, MachineLearning } from "@carbon/react/icons";

import JsxIconsFlow from "./jsx-icons-flow.json";
import JsxIconsPalette from "./jsx-icons-palette.json";

export default class JsxIconsCanvas extends React.Component {
	constructor(props) {
		super(props);
		this.canvasController = new CanvasController();

		this.canvasController.setPipelineFlowPalette(this.getConvertedPalette(JsxIconsPalette));
		this.canvasController.setPipelineFlow(this.getConvertedFlow(JsxIconsFlow));

		this.getConfig = this.getConfig.bind(this);
		this.beforeEditActionHandler = this.beforeEditActionHandler.bind(this);
	}

	getConvertedPalette(palette) {
		palette.categories.forEach((cat) => {
			cat.image = this.convertOpToImage(cat.app_data.icon);
			cat.node_types.forEach((nt) => {
				nt.app_data.ui_data.image = this.convertOpToImage(nt.op);
			});
		});
		return palette;
	}

	getConvertedFlow(flow) {
		flow.pipelines.forEach((pipeline) => {
			pipeline.nodes.forEach((n) => {
				n.app_data.ui_data.image = this.convertOpToImage(n.op);
			});
		});
		return flow;
	}

	getConfig() {
		const config = Object.assign({}, this.props.config, {
			enableParentClass: "jsx-icons-canvas",
			enableNodeFormatType: "Horizontal",
			enableMarkdownInComments: true,
			enableContextToolbar: true
		});
		return config;
	}

	convertOpToImage(op) {
		switch (op) {
		case "DataTable":
			return (<DataTable size={20} />);
		case "Db2Database":
			return (<Db2Database size={20} />);
		case "MachineLearning":
			return (<MachineLearning size={20} />);
		case "CurrencyPound":
			return (<CurrencyPound size={20} />);
		case "JoinInner":
			return (<JoinInner size={20} />);
		case "Fish":
			return (<Fish size={20} />);
		case "ChartColumn":
			return (<ChartColumn size={20} />);
		case "Debug":
			return (<Debug size={20} />);
		case "FolderOpen":
			return (<FolderOpen size={20} />);
		case "Folder":
			return (<Folder size={20} />);
		case "FolderMoveTo":
			return (<FolderMoveTo size={20} />);
		default:
			return (<FaceCool size={20} />);
		}
	}

	// If nodes are pasted into the canvas ensure their image fields
	// are set appropriately.
	beforeEditActionHandler(data, command) {
		if (data.editType === "paste") {
			data.objects?.nodes?.forEach((n) => {
				n.image = this.convertOpToImage(n.op);
			});
		}
		return data;
	}

	render() {
		const config = this.getConfig();

		return (
			<CommonCanvas
				canvasController={this.canvasController}
				beforeEditActionHandler={this.beforeEditActionHandler}
				config={config}
			/>
		);
	}
}

JsxIconsCanvas.propTypes = {
	config: PropTypes.object
};
