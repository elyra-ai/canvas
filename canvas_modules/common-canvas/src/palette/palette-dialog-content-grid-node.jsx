/*
 * Copyright 2017-2021 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react";
import PropTypes from "prop-types";
import has from "lodash/has";
import Icon from "../icons/icon.jsx";
import SVG from "react-inlinesvg";
import { CANVAS_CARBON_ICONS, DND_DATA_TEXT, TIP_TYPE_PALETTE_ITEM, USE_DEFAULT_ICON } from "../common-canvas/constants/canvas-constants.js";
import SUPERNODE_ICON from "../../assets/images/supernode.svg";

class PaletteDialogContentGridNode extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};

		this.ghostData = null;

		this.onDragStart = this.onDragStart.bind(this);
		this.onDoubleClick = this.onDoubleClick.bind(this);
		this.onMouseOver = this.onMouseOver.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
		this.onMouseDown = this.onMouseDown.bind(this);
	}

	onMouseDown() {
		// Make sure the tip doesn't appear when starting to drag a node.
		this.props.canvasController.closeTip();

		// Prepare the ghost image on mouse down because asynchronous loading of
		// SVG files will be too slow if this is done in onDragStart.
		this.ghostData = this.props.canvasController.getGhostNode(this.props.nodeTemplate);
	}

	onDragStart(ev) {
		// We cannot use the dataTransfer object for the nodeTemplate because
		// the dataTransfer data is not available during dragOver events so we set
		// the nodeTemplate into the canvas controller.
		this.props.canvasController.setDragNodeTemplate(this.props.nodeTemplate);

		// On firefox, the drag will not start unless something is written to
		// the dataTransfer object so just write an empty string
		ev.dataTransfer.setData(DND_DATA_TEXT, "");

		if (this.ghostData) {
			ev.dataTransfer.setDragImage(this.ghostData.element, this.ghostData.centerX, this.ghostData.centerY);
		}
	}

	onDoubleClick() {
		if (this.props.canvasController.createAutoNode) {
			this.props.canvasController.createAutoNode(this.props.nodeTemplate);
		}
	}

	onMouseOver(ev) {
		if (ev.buttons === 0) {
			const nodeTemplate = this.props.category.empty_text
				? { app_data: { ui_data: { label: this.props.category.empty_text } } }
				: this.props.nodeTemplate;

			this.props.canvasController.openTip({
				id: "paletteTip_" + this.props.nodeTemplate.op,
				type: TIP_TYPE_PALETTE_ITEM,
				targetObj: ev.currentTarget,
				nodeTemplate: nodeTemplate,
				category: this.props.category
			});
		}
	}

	onMouseLeave() {
		this.props.canvasController.closeTip();
	}

	render() {
		let label = "";
		if (has(this.props.nodeTemplate, "app_data.ui_data.label")) {
			label = this.props.nodeTemplate.app_data.ui_data.label;
		}

		let icon = <div className="node-icon" />;

		if (has(this.props.nodeTemplate, "app_data.ui_data.image")) {
			let image = this.props.nodeTemplate.app_data.ui_data.image;

			if (image === USE_DEFAULT_ICON) {
				image = SUPERNODE_ICON;
			}

			icon = image.endsWith(".svg")
				? <SVG src={image} className="node-icon" alt={label} />
				: <img src={image} className="node-icon" alt={label} />;
		}

		let draggable = "true";
		let txtClassName = "palette-dialog-grid-node-text";

		// Special case for when there are no nodes in the category so we show
		// a dummy node to include the empty text from the category.
		if (this.props.category && this.props.category.node_types.length === 0 && this.props.category.empty_text) {
			label = this.props.category.empty_text;
			draggable = "false";
			txtClassName = "palette-dialog-grid-node-text-warning";
			icon = (<Icon type={CANVAS_CARBON_ICONS.WARNING_UNFILLED} className="palette-dialog-grid-node-icon-warning" draggable="false" />);
		}

		return (
			<div id={this.props.nodeTemplate.id}
				draggable={draggable}
				onDragStart={this.onDragStart}
				onDoubleClick={this.onDoubleClick}
				onMouseOver={this.onMouseOver}
				onMouseLeave={this.onMouseLeave}
				onMouseDown={this.onMouseDown}
				className="palette-dialog-grid-node-outer"
			>
				<div className="palette-dialog-grid-node-inner">
					<div className="palette-dialog-grid-node-icon">
						{icon}
					</div>
					<div className={ txtClassName }>
						{label}
					</div>
				</div>
			</div>
		);
	}
}

PaletteDialogContentGridNode.propTypes = {
	category: PropTypes.object.isRequired,
	nodeTemplate: PropTypes.object.isRequired,
	canvasController: PropTypes.object.isRequired
};

export default PaletteDialogContentGridNode;
