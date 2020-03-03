/*
 * Copyright 2017-2020 IBM Corporation
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
// import SVG from "react-inlinesvg";
import { CANVAS_CARBON_ICONS, DND_DATA_TEXT, TIP_TYPE_PALETTE_ITEM } from "../common-canvas/constants/canvas-constants.js";

class PaletteContentGridNode extends React.Component {
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
			const image = this.props.nodeTemplate.app_data.ui_data.image;
			icon = (<img className="node-icon" src={image}
				alt={label}
			/>);
			// When the palette icons are displayed as inline SVG the images become
			// corrupted because they are zoomed to a smaller size than their designer
			// expected. Therefore, we choose to display them using <img> which allows
			// them to appear OK.
			// if (image.endsWith(".svg")) {
			// 	icon = <SVG src={image} className="node-icon" alt={label} />;
			// }
		}

		let draggable = "true";
		let txtClassName = "palette-grid-node-text";

		// Special case for when there are no nodes in the category so we show
		// a dummy node to include the empty text from the category.
		if (this.props.category && this.props.category.node_types.length === 0 && this.props.category.empty_text) {
			label = this.props.category.empty_text;
			draggable = "false";
			txtClassName = "palette-grid-node-text-warning";
			icon = (<Icon type={CANVAS_CARBON_ICONS.WARNING_UNFILLED} className="palette-grid-node-icon-warning" draggable="false" />);
		}

		return (
			<div id={this.props.nodeTemplate.id}
				draggable={draggable}
				onDragStart={this.onDragStart}
				onDoubleClick={this.onDoubleClick}
				onMouseOver={this.onMouseOver}
				onMouseLeave={this.onMouseLeave}
				className="palette-grid-node-outer"
			>
				<div className="palette-grid-node-inner">
					<div className="palette-grid-node-icon">
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

PaletteContentGridNode.propTypes = {
	category: PropTypes.object.isRequired,
	nodeTemplate: PropTypes.object.isRequired,
	canvasController: PropTypes.object.isRequired
};

export default PaletteContentGridNode;
