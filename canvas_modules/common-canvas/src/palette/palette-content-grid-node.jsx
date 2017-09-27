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
				operator_id_ref: this.props.nodeTemplate.operator_id_ref,
				label: this.props.nodeTemplate.label
			}));
		// only display the node image when dragging
		const paletteItems = document.getElementsByClassName("palette-grid-node-icon");
		for (var indx = 0; indx < paletteItems.length; indx++) {
			var item = paletteItems[indx].getElementsByTagName("img")[0];
			if (item.getAttribute("alt") === this.props.nodeTemplate.label) {
				ev.dataTransfer.setDragImage(item, 0, 0);
			}
		}
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
