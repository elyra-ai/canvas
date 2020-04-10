import React from "react";
import PropTypes from "prop-types";

import { CommonCanvas, CanvasController } from "common-canvas";

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
			enableConnectionType: "Ports",
			enableNodeFormatType: "Horizontal",
			enableAssocLinkCreation: true,
			enableAssocLinkType: "RightSideCurve",
			enableParentClass: "tables-join",
			enableNodeLayout: {
				defaultNodeWidth: 220,
				defaultNodeHeight: 50,
				bodyPath: this.getPath(this.left, this.right, this.top, this.bot),
				selectionPath: this.getPath(this.left, this.right, this.top, this.bot),
				labelAndIconVerticalJustification: "none",
				imageDisplay: false,
				labelPosX: 25,
				labelPosY: 20,
				// portPosY: 25,
				inputPortLeftPosY: 25,
				outputPortRightPosY: 25,
				portRadius: 8,
				ellipsisPosX: 190,
				ellipsisPosY: 16,
				inputPortObject: "image",
				inputPortImage: "/images/custom-canvases/tables/tables-port-left.png",
				inputPortWidth: 20,
				inputPortHeight: 20,
				outputPortObject: "image",
				outputPortImage: "/images/custom-canvases/tables/tables-port-right.png",
				outputPortWidth: 20,
				outputPortHeight: 20
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
				labelPosY: 45,
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
		const decImage = decs.find((d) => d.id === id);
		const decLabel = decs.find((d) => d.label);
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
					"id": "assocDec1",
					"x_pos": -35,
					"y_pos": -20,
					"height": 40,
					"width": 80,
					"class_name": "tables-join-keys-decoration-outline",
					"image": "/images/custom-canvases/tables/tables-join-keys-unselected.png",
					"hotspot": true
				},
				{
					"id": "assocDec2",
					"x_pos": 0,
					"y_pos": 4,
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
