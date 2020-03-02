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

	imageDrag() {
		return false;
	}

	render() {
		let itemText = null;
		let image = null;

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
			image = this.props.nodeTemplate.app_data.ui_data.image;
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
					<img className="palette-list-item-icon" src={image} draggable="false" />
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
