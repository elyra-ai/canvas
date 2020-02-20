/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint no-console: ["error", { allow: ["log", "info", "warn", "error", "time", "timeEnd"] }] */

import React from "react";
import { IntlProvider } from "react-intl";
import AutoAICanvas from "../../test_resources/diagrams/autoAICanvas.json";
import { CommonCanvas, CanvasController } from "common-canvas";

class App extends React.Component {
	constructor(props) {
		super(props);

		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(AutoAICanvas);

		this.decorationActionHandler = this.decorationActionHandler.bind(this);
		this.editActionHandler = this.editActionHandler.bind(this);
		this.layoutHandler = this.layoutHandler.bind(this);
	}

	getPath(l, r, t, b) {
		return `M ${l} ${t} L ${l} ${b} ${r} ${b} ${r} ${t} ${l} ${t} Z`;
	}

	getCommonCanvasConfig() {
		const left = 10;
		const right = 210;
		const top = 0;
		const bot = 50;

		const commonCanvasConfig = {
			enableConnectionType: "Ports",
			enableNodeFormatType: "Horizontal",
			enableAssocLinkCreation: true,
			enableAssocLinkType: "RightSideCurve",
			enableNodeLayout: {
				defaultNodeWidth: 220,
				defaultNodeHeight: 50,
				bodyPath: this.getPath(left, right, top, bot),
				selectionPath: this.getPath(left, right, top, bot),
				labelAndIconVerticalJustification: "none",
				imageDisplay: false,
				labelPosX: 25,
				labelPosY: 20,
				portPosY: 25,
				portRadius: 8,
				ellipsisPosX: 190,
				ellipsisPosY: 16,
				inputPortObject: "image",
				inputPortImage: "/images/decorators/ai-port-left.png",
				inputPortWidth: 20,
				inputPortHeight: 20,
				outputPortObject: "image",
				outputPortImage: "/images/decorators/ai-port-right.png",
				outputPortWidth: 20,
				outputPortHeight: 20
			}
		};
		return commonCanvasConfig;
	}

	layoutHandler(data) {
		if (data.op === "main_table") {
			const left = 10;
			const right = 210;
			const top = 0;
			const bot = 80;
			const nodeFormat = {
				defaultNodeWidth: 220,
				defaultNodeHeight: 80,
				bodyPath: this.getPath(left, right, top, bot),
				selectionPath: this.getPath(left, right, top, bot),
				labelPosY: 45,
				portPosY: 48,
				ellipsisPosX: 190,
				ellipsisPosY: 40,
				decorations: [
					{
						id: "default-dec3",
						image: "/images/decorators/ai-main-table.png",
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
			if (decImage.image && decImage.image === "/images/decorators/ai-join-keys-selected.png") {
				decImage.image = "/images/decorators/ai-join-keys-unselected.png";
				decLabel.class_name = "ai-join-keys-decoration-text-unselected";
			} else {
				decImage.image = "/images/decorators/ai-join-keys-selected.png";
				decLabel.class_name = "ai-join-keys-decoration-text-selected";
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
					"class_name": "ai-join-keys-decoration-outline",
					"image": "/images/decorators/ai-join-keys-unselected.png",
					"hotspot": true
				},
				{
					"id": "assocDec2",
					"x_pos": 0,
					"y_pos": 4,
					"label": "0 Keys",
					"class_name": "ai-join-keys-decoration-text-unselected",
					"hotspot": true
				}
			];
			this.canvasController.setLinkDecorations(data.linkIds[0], decs);
		}
	}

	render() {
		const commonCanvasConfig = this.getCommonCanvasConfig();

		return (
			<div id="harness-app-container">
				<IntlProvider>
					<CommonCanvas
						canvasController={this.canvasController}
						config = {commonCanvasConfig}
						layoutHandler={this.layoutHandler}
						decorationActionHandler={this.decorationActionHandler}
						editActionHandler={this.editActionHandler}
					/>
				</IntlProvider>
			</div>
		);
	}
}

export default App;
