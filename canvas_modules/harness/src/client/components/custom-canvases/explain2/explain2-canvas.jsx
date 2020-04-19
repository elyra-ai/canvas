import React from "react";
import PropTypes from "prop-types";
import { CommonCanvas, CanvasController } from "common-canvas";
import Explain2CanvasFlow from "./explain2Canvas.json";


const DEFAULT_HEIGHT = 80;
const DEFAULT_WIDTH = 220;
const LABEL_POSX = 15;
const LABEL_MAX_WIDTH = 120;
const PERCENTAGE_BAR_WIDTH = 8;
const CHARACTER_WIDTH = 9; // Allow 8px per character and 5px for extra padding

export default class Explain2Canvas extends React.Component {
	constructor(props) {
		super(props);

		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(Explain2CanvasFlow);

		this.config = Object.assign({}, props.config, {
			enableConnectionType: "Ports",
			enableParentClass: "explain2",
			enableNodeFormatType: "Horizontal",
			enableLinkType: "Elbow",
			enableLinkDirection: "BottomTop",
			enableSnapToGridType: "During",
			enableNodeLayout:
			{
				defaultNodeWidth: DEFAULT_WIDTH,
				defaultNodeHeight: DEFAULT_HEIGHT,
				bodyPath: `M  0 0  L  0 ${DEFAULT_HEIGHT} ${DEFAULT_WIDTH} ${DEFAULT_HEIGHT} ${DEFAULT_WIDTH} 0 Z`,
				selectionPath: `M -1 -1 L -1 ${DEFAULT_HEIGHT + 1} ${DEFAULT_WIDTH + 1} ${DEFAULT_HEIGHT + 1} ${DEFAULT_WIDTH + 1} -1 Z`,
				inputPortBottomPosX: DEFAULT_WIDTH / 2,
				inputPortBottomPosY: 0,
				outputPortTopPosX: DEFAULT_WIDTH / 2,
				outputPortTopPosY: 0,
				labelAndIconVerticalJustification: "none",
				inputPortDisplay: false,
				outputPortDisplay: false,
				labelPosX: LABEL_POSX,
				labelPosY: 20,
				labelMaxWidth: LABEL_MAX_WIDTH,
				ellipsisDisplay: true,
				ellipsisWidth: 10,
				ellipsisPosX: DEFAULT_WIDTH + 1,
				ellipsisPosY: 0,
				decorations: [
					{
						"id": "dec_right_bar",
						"position": "topRight",
						"x_pos": -PERCENTAGE_BAR_WIDTH,
						"y_pos": 0,
						"width": PERCENTAGE_BAR_WIDTH,
						"height": DEFAULT_HEIGHT,
						"ouline": true,
						"class_name": "dec-right-bar"
					}
				]
			},
			enableCanvasLayout: {
				dataLinkArrowHead: true,
				elbowSize: 2
			},
			tipConfig: {
				"palette": false,
				"nodes": true,
				"ports": false,
				"links": false
			}
		});
	}

	layoutHandler(node) {
		const indexNo = node.app_data.explain && node.app_data.explain.index ? node.app_data.explain.index : " ";
		const sqlCost = node.app_data.explain && node.app_data.explain.sql_cost ? node.app_data.explain.sql_cost : 0;
		const percentage = node.app_data.explain && node.app_data.explain.percentage ? node.app_data.explain.percentage : 0;
		const percentageBarHt = DEFAULT_HEIGHT * (percentage / 100);
		const labelWidth = node.label.length * CHARACTER_WIDTH;
		const limitedLabelWidth = Math.min(labelWidth, LABEL_MAX_WIDTH);

		const percentageBarClassName = percentage >= 30 ? "dec-percentage-bar-red" : "dec-percentage-bar-gray";

		const nodeLayout = {
			decorations: [
				{
					"id": "dec_index_label",
					"x_pos": LABEL_POSX + limitedLabelWidth + 5,
					"y_pos": 20,
					"label": indexNo,
					"class_name": "dec-index-label"
				},
				{
					"id": "dec_percentage_label",
					"x_pos": DEFAULT_WIDTH - PERCENTAGE_BAR_WIDTH - 5,
					"y_pos": 20,
					"label": percentage + "%",
					"class_name": "dec-percentage-label"
				},
				{
					"id": "dec_percentage_bar",
					"position": "topRight",
					"x_pos": -PERCENTAGE_BAR_WIDTH,
					"y_pos": DEFAULT_HEIGHT - percentageBarHt,
					"width": PERCENTAGE_BAR_WIDTH,
					"height": percentageBarHt,
					"ouline": true,
					"class_name": percentageBarClassName
				},
				{
					"id": "dec_sql_cost_label",
					"x_pos": LABEL_POSX,
					"y_pos": DEFAULT_HEIGHT - 15,
					"label": "SQL cost " + sqlCost.toFixed(2),
					"class_name": "dec-sql-cost-label"
				}
			]
		};
		return nodeLayout;
	}

	tipHandler(tipType, data) {
		const index = data.node.app_data.explain.index || "";
		const labelTxt = data.node.label + " " + index;
		const estCard = data.node.app_data.explain.estimated_cardinality || "xxxxxxxxx";
		const cumulativeTotalCost = data.node.app_data.explain.cumulative_total_cost || "xxxxxxxxx";
		const cumulativeCPUCost = data.node.app_data.explain.cumulative_cpu_cost || "xxxxxxxxx";
		const totalCost = data.node.app_data.explain.total_cost || "xxxxxxxxx";
		const cpuCost = data.node.app_data.explain.cpu_cost || "xxxxxxxxx";
		if (tipType === "tipTypeNode") {
			return (
				<div>
					<table className="tipTable">
						<tbody>
							<tr><td align="left">{labelTxt}</td><td /></tr>
							<tr><td align="left">Operation</td><td align="left">Hash Join</td></tr>
							<tr><td align="left">Estimated Cardinality</td><td align="left">{estCard}</td></tr>
							<tr><td align="left">Cumulative Total Cost (timeron)</td><td align="left">{cumulativeTotalCost}</td></tr>
							<tr><td align="left">Cumulative CPU Cost (timeron)</td><td align="left">{cumulativeCPUCost}</td></tr>
							<tr><td align="left">Total Cost (timeron)</td><td align="left">{totalCost}</td></tr>
							<tr><td align="left">CPU Cost (timeron)</td><td align="left">{cpuCost}</td></tr>
						</tbody>
					</table>
				</div>
			);
		}
		return null;
	}

	render() {
		return (
			<CommonCanvas
				canvasController={this.canvasController}
				layoutHandler={this.layoutHandler}
				tipHandler={this.tipHandler}
				config={this.config}
			/>
		);
	}
}

Explain2Canvas.propTypes = {
	config: PropTypes.object
};
