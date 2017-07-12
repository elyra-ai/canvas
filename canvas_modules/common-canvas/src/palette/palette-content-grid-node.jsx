/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";

import { DND_DATA_TEXT } from "../../constants/common-constants.js";

class PaletteContentNode extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};

		this.tempNodeCreated = false;

		this.onDragStart = this.onDragStart.bind(this);
		this.onDragOver = this.onDragOver.bind(this);
	}

	onDragStart(ev) {
		ev.dataTransfer.setData(DND_DATA_TEXT,
			JSON.stringify({
				operation: "createFromTemplate",
				typeId: this.props.nodeTemplate.typeId,
				label: this.props.nodeTemplate.label
			}));
			// Create a temp node and use it to display a drag image.
			// let tempNode = this.props.createTempNode(ev.target.id);
			// this.tempNodeCreated = true;
			// ev.dataTransfer.setDragImage(tempNode.obj, tempNode.xOffset, 0);
	}

	onDragOver(ev) {
		// Delete the temp node as soon as we start dragging the temp node's image.
		if (this.tempNodeCreated === true) {
			this.props.deleteTempNode();
			this.tempNodeCreated = false;
		}
	}

	render() {
		return (
			<div id={this.props.nodeTemplate.id}
				draggable="true"
				onDragStart={this.onDragStart}
				onDragOver={this.onDragOver}
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
	nodeTemplate: React.PropTypes.object,
	deleteTempNode: React.PropTypes.func.isRequired
};

export default PaletteContentNode;
