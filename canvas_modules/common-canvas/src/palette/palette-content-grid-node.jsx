/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import has from "lodash/has";
import { DND_DATA_TEXT, TIP_TYPE_PALETTE_ITEM } from "../common-canvas/constants/canvas-constants.js";

class PaletteContentNode extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};

		this.onDragStart = this.onDragStart.bind(this);
		this.onDoubleClick = this.onDoubleClick.bind(this);
		this.onMouseOver = this.onMouseOver.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
	}

	onDragStart(ev) {
		ev.dataTransfer.setData(DND_DATA_TEXT,
			JSON.stringify({
				operation: "createFromTemplate",
				nodeTemplate: this.props.nodeTemplate
			}));
	}

	onDoubleClick() {
		if (this.props.canvasController.createAutoNode) {
			this.props.canvasController.createAutoNode(this.props.nodeTemplate);
		}
	}

	onMouseOver(ev) {
		if (ev.button === 0) {
			this.props.canvasController.openTip({
				id: "paletteTip_" + this.props.nodeTemplate.op,
				type: TIP_TYPE_PALETTE_ITEM,
				targetObj: ev.currentTarget,
				nodeTemplate: this.props.nodeTemplate
			});
		}
	}

	onMouseLeave() {
		this.props.canvasController.closeTip();
	}

	render() {
		let image = null;
		let label = "";
		if (has(this.props.nodeTemplate, "app_data.ui_data.image")) {
			image = this.props.nodeTemplate.app_data.ui_data.image;
		}
		if (has(this.props.nodeTemplate, "app_data.ui_data.label")) {
			label = this.props.nodeTemplate.app_data.ui_data.label;
		}

		return (
			<div id={this.props.nodeTemplate.id}
				draggable="true"
				onDragStart={this.onDragStart}
				onDoubleClick={this.onDoubleClick}
				onMouseOver={this.onMouseOver}
				onMouseLeave={this.onMouseLeave}
				className="palette-grid-node-outer"
			>
				<div className="palette-grid-node-inner">
					<div className="palette-grid-node-icon">
						<img className="node-icon" src={image}
							alt={label}
						/>
					</div>
					<div className="palette-grid-node-text">
						{label}
					</div>
				</div>
			</div>
		);
	}
}

PaletteContentNode.propTypes = {
	nodeTemplate: PropTypes.object.isRequired,
	canvasController: PropTypes.object.isRequired
};

export default PaletteContentNode;
