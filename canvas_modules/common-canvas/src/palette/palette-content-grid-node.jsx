/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import CanvasController from "../common-canvas-controller.js";
import React from "react";
import PropTypes from "prop-types";
import { DND_DATA_TEXT, TIP_TYPE_PALETTE_ITEM } from "../../constants/common-constants.js";

class PaletteContentNode extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};

		this.onDragStart = this.onDragStart.bind(this);
		this.onDoubleClick = this.onDoubleClick.bind(this);
		this.onMouseOver = this.onMouseOver.bind(this);
		this.onMouseOut = this.onMouseOut.bind(this);
	}

	onDragStart(ev) {
		ev.dataTransfer.setData(DND_DATA_TEXT,
			JSON.stringify({
				operation: "createFromTemplate",
				operator_id_ref: this.props.nodeTemplate.operator_id_ref,
				label: this.props.nodeTemplate.label
			}));
	}

	onDoubleClick() {
		if (CanvasController.createAutoNode) {
			CanvasController.createAutoNode(this.props.nodeTemplate);
		}
	}

	onMouseOver(ev) {
		CanvasController.showTip({
			id: "paletteTip_" + this.props.nodeTemplate.operator_id_ref,
			type: TIP_TYPE_PALETTE_ITEM,
			targetObj: ev.currentTarget,
			paletteItem: this.props.nodeTemplate
		});
	}

	onMouseOut() {
		CanvasController.hideTip();
	}

	render() {
		return (
			<div id={this.props.nodeTemplate.id}
				draggable="true"
				onDragStart={this.onDragStart}
				onDoubleClick={this.onDoubleClick}
				onMouseOver={this.onMouseOver}
				onMouseOut={this.onMouseOut}
				className="palette-grid-node-outer"
			>
				<div className="palette-grid-node-inner">
					<div className="palette-grid-node-icon">
						<img className="node-icon" src={this.props.nodeTemplate.image}
							alt={this.props.nodeTemplate.label}
						/>
					</div>
					<div className="palette-grid-node-text">
						{this.props.nodeTemplate.label}
					</div>
				</div>
			</div>
		);
	}
}

PaletteContentNode.propTypes = {
	nodeTemplate: PropTypes.object
};

export default PaletteContentNode;
