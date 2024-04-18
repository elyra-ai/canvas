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

import TablesCanvasFlow from "./tablesCanvas.json";


export default class TablesCanvas extends React.Component {
	constructor(props) {
		super(props);

		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(TablesCanvasFlow);

		this.left = 10;
		this.right = 210;
		this.top = 0;
		this.bot = 50;

		this.config = Object.assign({}, props.config, {
			enableNodeFormatType: "Horizontal",
			enableAssocLinkCreation: true,
			enableAssocLinkType: "RightSideCurve",
			enableLinkDirection: "LeftRight",
			enableParentClass: "tables-join",
			enableHighlightNodeOnNewLinkDrag: true,
			enableNodeLayout: {
				defaultNodeWidth: 220,
				defaultNodeHeight: 50,

				bodyPath: this.getPath(this.left, this.right, this.top, this.bot),
				selectionPath: this.getPath(this.left, this.right, this.top, this.bot),

				imageDisplay: false,

				labelEditable: true,
				labelWidth: 150,
				labelPosX: 23,
				labelPosY: 8,

				ellipsisPosX: 190,
				ellipsisPosY: 16,

				portRadius: 8,

				inputPortObject: "image",
				inputPortImage: "/images/custom-canvases/tables/tables-port-left.png",
				inputPortWidth: 20,
				inputPortHeight: 20,
				inputPortLeftPosY: 25,
				inputPortLeftPosX: 0,

				outputPortObject: "image",
				outputPortImage: "/images/custom-canvases/tables/tables-port-right.png",
				outputPortWidth: 20,
				outputPortHeight: 20,
				outputPortRightPosY: 25,
			}
		});
		this.layoutHandler = this.layoutHandler.bind(this);
		this.editActionHandler = this.editActionHandler.bind(this);
		this.decorationActionHandler = this.decorationActionHandler.bind(this);
	}

	getPath(l, r, t, b) {
		return `M ${l} ${t} L ${l} ${b} ${r} ${b} ${r} ${t} ${l} ${t} Z`;
	}

	layoutHandler(data) {
		if (data.op === "main_table") {
			this.left = 10;
			this.right = 210;
			this.top = 0;
			this.bot = 80;
			const nodeFormat = {
				defaultNodeWidth: 220,
				defaultNodeHeight: 80,
				bodyPath: this.getPath(this.left, this.right, this.top, this.bot),
				selectionPath: this.getPath(this.left, this.right, this.top, this.bot),
				labelPosY: 33,
				inputPortLeftPosY: 48,
				outputPortRightPosY: 48,
				// portPosY: 48,
				ellipsisPosX: 190,
				ellipsisPosY: 40,
				decorations: [
					{
						id: "default-dec3",
						image: "/images/custom-canvases/tables/tables-main-table.png",
						width: 201,
						height: 23,
						x_pos: 10,
						y_pos: 0,
						outline: false
					}
				]
			};
			return nodeFormat;
		}
		return {};
	}

	decorationActionHandler(link, id, pipeline) {
		const decs = this.canvasController.getLinkDecorations(link.id);
		const decImage = decs.find((d) => d.id === "assoc-dec-image");
		const decLabel = decs.find((d) => d.id === "assoc-dec-label");
		if (decImage && decLabel) {
			if (decImage.image && decImage.image === "/images/custom-canvases/tables/tables-join-keys-selected.png") {
				decImage.image = "/images/custom-canvases/tables/tables-join-keys-unselected.png";
				decLabel.class_name = "tables-join-keys-decoration-text-unselected";
			} else {
				decImage.image = "/images/custom-canvases/tables/tables-join-keys-selected.png";
				decLabel.class_name = "tables-join-keys-decoration-text-selected";
			}
			this.canvasController.setLinkDecorations(link.id, decs);
		}
	}

	editActionHandler(data) {
		if (data.editType === "linkNodes") {
			const decs = [
				{
					"id": "assoc-dec-image",
					"x_pos": -35,
					"y_pos": -20,
					"height": 40,
					"width": 80,
					"class_name": "tables-join-keys-decoration-outline",
					"image": "/images/custom-canvases/tables/tables-join-keys-unselected.png",
					"hotspot": true
				},
				{
					"id": "assoc-dec-label",
					"x_pos": 0,
					"y_pos": -5,
					"label": "0 Keys",
					"class_name": "tables-join-keys-decoration-text-unselected",
					"hotspot": true
				}
			];
			this.canvasController.setLinkDecorations(data.linkIds[0], decs);
		}
	}

	render() {
		return (
			<CommonCanvas
				canvasController={this.canvasController}
				config={this.config}
				editActionHandler= {this.editActionHandler}
				decorationActionHandler= {this.decorationActionHandler}
				layoutHandler={this.layoutHandler}
			/>
		);
	}
}

TablesCanvas.propTypes = {
	config: PropTypes.object
};
