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
// import SVG from "react-inlinesvg";
import { DND_DATA_TEXT, TIP_TYPE_PALETTE_ITEM } from "../common-canvas/constants/canvas-constants.js";

class PaletteContentListItem extends React.Component {
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
		// We cannot use the dataTransfer object for the nodeTemplate because
		// the dataTransfer data is not available during dragOver events so we set
		// the nodeTemplate into an event field.
		ev.canvasNodeTemplate = this.props.nodeTemplate;

		// On firefox, the drag will not start unless something is written to
		// the dataTransfer object so just write an empty string
		ev.dataTransfer.setData(DND_DATA_TEXT, "");
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

	imageDrag() {
		return false;
	}

	render() {
		let itemText = null;
		let icon = <div className="palette-list-item-icon" />;

		if (this.props.isPaletteOpen &&
				has(this.props.nodeTemplate, "app_data.ui_data.label")) {
			itemText = (
				<div className="palette-list-item-text-div">
					<span className="palette-list-item-text-span">
						{this.props.nodeTemplate.app_data.ui_data.label}
					</span>
				</div>
			);
		}

		if (has(this.props.nodeTemplate, "app_data.ui_data.image")) {
			const image = this.props.nodeTemplate.app_data.ui_data.image;

			icon = <img src={image} className="palette-list-item-icon" draggable="false" />;
			// When the palette icons are displayed as inline SVG the images become
			// corrupted because they are zoomed to a smaller size than their designer
			// expected. Therefore, we choose to display them using <img> which allows
			// them to appear OK.
			// if (image.endsWith(".svg")) {
			// 	icon = <SVG src={image} className="palette-list-item-icon" draggable="false" />;
			// }
		}

		return (
			<div id={this.props.nodeTemplate.id}
				draggable="true"
				onDragStart={this.onDragStart}
				onDoubleClick={this.onDoubleClick}
				className="palette-list-item"
				onMouseOver={this.onMouseOver}
				onMouseLeave={this.onMouseLeave}
			>
				<div>
					{icon}
				</div>
				{itemText}
			</div>
		);
	}
}

PaletteContentListItem.propTypes = {
	nodeTemplate: PropTypes.object.isRequired,
	canvasController: PropTypes.object.isRequired,
	isPaletteOpen: PropTypes.bool.isRequired
};

export default PaletteContentListItem;
