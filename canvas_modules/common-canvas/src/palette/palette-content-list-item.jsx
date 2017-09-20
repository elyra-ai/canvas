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

class PaletteContentListItem extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};

		this.onDragStart = this.onDragStart.bind(this);
		this.onDoubleClick = this.onDoubleClick.bind(this);
	}

	onDragStart(ev) {
		ev.dataTransfer.setData(DND_DATA_TEXT,
			JSON.stringify({
				operation: "createFromTemplate",
				operator_id_ref: this.props.nodeTemplate.operator_id_ref
			}));
	}

	onDoubleClick() {
		if (this.props.addNodeToCanvas) {
			this.props.addNodeToCanvas({
				operator_id_ref: this.props.nodeTemplate.operator_id_ref
			});
		}
	}

	render() {
		return (
			<div id={this.props.nodeTemplate.id}
				draggable="true"
				onDragStart={this.onDragStart}
				onDoubleClick={this.onDoubleClick}
				className="palette-list-item"
			>
				<div className="palette-list-item-icon">
					<img src={this.props.nodeTemplate.image} alt={this.props.nodeTemplate.label} />
				</div>
				<div className="palette-list-item-text-div">
					<span className="palette-list-item-text-span">
						{this.props.nodeTemplate.label}
					</span>
				</div>
			</div>
		);
	}
}

PaletteContentListItem.propTypes = {
	nodeTemplate: PropTypes.object.isRequired,
	addNodeToCanvas: PropTypes.func
};

export default PaletteContentListItem;
