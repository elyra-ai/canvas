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
import AutoAICanvas from "../../test_resources/diagrams/autoAICanvas.json";
import { CommonCanvas, CanvasController } from "common-canvas";

class App extends React.Component {
	constructor(props) {
		super(props);

		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(AutoAICanvas);

		this.decorationActionHandler = this.decorationActionHandler.bind(this);
		this.layoutHandler = this.layoutHandler.bind(this);
	}

	getPath(l, r, t, b) {
		return `M ${l} ${t} L ${l} ${b} ${r} ${b} ${r} ${t} ${l} ${t} Z`;
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

	layoutHandler(data) {
		if (data.op === "main_table") {
			const left = 10;
			const right = 210;
			const top = 0;
			const bot = 80;
			const nodeFormat = {
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
					},
					{
						id: "default-dec1",
						x_pos: -10,
						y_pos: 11
					},
					{
						id: "default-dec2",
						x_pos: -14,
						y_pos: 11
					}
				]
			};
			return nodeFormat;
		}
		return {};
	}

	render() {
		const left = 10;
		const right = 210;
		const top = 0;
		const bot = 50;

		const commonCanvasConfig = {
			enableNodeFormatType: "Horizontal",
			enableAssocLinkCreation: true,
			enableNodeLayout: {
				defaultNodeWidth: 220,
				defaultNodeHeight: 50,
				bodyPath: this.getPath(left, right, top, bot),
				selectionPath: this.getPath(left, right, top, bot),
				labelAndIconVerticalJustification: "none",
				labelPosX: 25,
				labelPosY: 20,
				portPosY: 25,
				portRadius: 8,
				ellipsisPosX: 190,
				ellipsisPosY: 16,
				decorations: [
					{
						id: "default-dec1",
						image: "/images/decorators/ai-port-right.png",
						class_name: "ai-node-port-image",
						width: 25,
						height: 25,
						position: "middleRight",
						x_pos: -10,
						y_pos: -12,
						outline: false
					},
					{
						id: "default-dec2",
						image: "/images/decorators/ai-port-left.png",
						class_name: "ai-node-port-image",
						width: 25,
						height: 25,
						position: "middleLeft",
						x_pos: -14,
						y_pos: -12,
						outline: false
					}
				]
			}
		};

		return (
			<div id="harness-app-container">
				<CommonCanvas
					canvasController={this.canvasController}
					config = {commonCanvasConfig}
					layoutHandler={this.layoutHandler}
					decorationActionHandler={this.decorationActionHandler}
				/>
			</div>
		);
	}
}

export default App;
