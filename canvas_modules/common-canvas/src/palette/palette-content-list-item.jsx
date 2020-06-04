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
import SVG from "react-inlinesvg";
import { CANVAS_CARBON_ICONS, DND_DATA_TEXT, TIP_TYPE_PALETTE_ITEM } from "../common-canvas/constants/canvas-constants.js";

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

	imageDrag() {
		return false;
	}

	render() {
		let itemText = null;
		let draggable = "true";
		let icon = <div className="palette-list-item-icon" />;

		if (this.props.isPaletteOpen &&
				has(this.props.nodeTemplate, "app_data.ui_data.label")) {
			itemText = this.props.nodeTemplate.app_data.ui_data.label;
		}

		if (has(this.props.nodeTemplate, "app_data.ui_data.image")) {
			const image = this.props.nodeTemplate.app_data.ui_data.image;

			icon = <img src={image} className="palette-list-item-icon" draggable="false" />;
			if (image.endsWith(".svg")) {
				icon = <SVG src={image} className="palette-list-item-icon" draggable="false" />;
			}
		}

		// Special case for when there are no nodes in the category so we show
		// a dummy node to include the empty text from the category.
		if (this.props.category.node_types.length === 0 && this.props.category.empty_text) {
			if (this.props.isPaletteOpen) {
				itemText = this.props.category.empty_text;
			}
			draggable = "false";
			icon = (<Icon type={CANVAS_CARBON_ICONS.WARNING_UNFILLED} className="palette-list-item-icon-warning" draggable="false" />);
		}

		return (
			<div id={this.props.nodeTemplate.id}
				draggable={draggable}
				onDragStart={this.onDragStart}
				onDoubleClick={this.onDoubleClick}
				className="palette-list-item"
				onMouseOver={this.onMouseOver}
				onMouseLeave={this.onMouseLeave}
			>
				<div>
					{icon}
				</div>
				<div className="palette-list-item-text-div">
					<span className="palette-list-item-text-span">
						{itemText}
					</span>
				</div>
			</div>
		);
	}
}

PaletteContentListItem.propTypes = {
	category: PropTypes.object.isRequired,
	nodeTemplate: PropTypes.object.isRequired,
	canvasController: PropTypes.object.isRequired,
	isPaletteOpen: PropTypes.bool.isRequired
};

export default PaletteContentListItem;
