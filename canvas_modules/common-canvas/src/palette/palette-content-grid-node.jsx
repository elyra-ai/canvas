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
import { DND_DATA_TEXT } from "../../constants/common-constants.js";

class PaletteContentNode extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};

		this.onDragStart = this.onDragStart.bind(this);
	}

	onDragStart(ev) {
		ev.dataTransfer.setData(DND_DATA_TEXT,
			JSON.stringify({
				operation: "createFromTemplate",
				typeId: this.props.nodeTemplate.typeId,
				label: this.props.nodeTemplate.label
			}));
	}


	render() {
		return (
			<div id={this.props.nodeTemplate.id}
				draggable="true"
				onDragStart={this.onDragStart}
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
