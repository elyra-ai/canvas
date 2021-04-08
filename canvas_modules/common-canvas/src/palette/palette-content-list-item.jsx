/*
 * Copyright 2017-2020 Elyra Authors
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
import { injectIntl } from "react-intl";
import defaultMessages from "../../locales/palette/locales/en.json";
import Icon from "../icons/icon.jsx";
import SVG from "react-inlinesvg";
import { CANVAS_CARBON_ICONS, DND_DATA_TEXT, TIP_TYPE_PALETTE_ITEM, USE_DEFAULT_ICON } from "../common-canvas/constants/canvas-constants.js";
import SUPERNODE_ICON from "../../assets/images/supernode.svg";

class PaletteContentListItem extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			showFullDescription: false
		};

		this.ghostData = null;

		this.showFullDescription = this.showFullDescription.bind(this);
		this.showShortDescription = this.showShortDescription.bind(this);

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
		this.ghostData = this.props.canvasController.getGhostNode(this.props.nodeTypeInfo.nodeType);
	}

	onDragStart(ev) {
		// We cannot use the dataTransfer object for the nodeTemplate because
		// the dataTransfer data is not available during dragOver events so we set
		// the nodeTemplate into the canvas controller.
		this.props.canvasController.setDragNodeTemplate(this.props.nodeTypeInfo.nodeType);

		// On firefox, the drag will not start unless something is written to
		// the dataTransfer object so just write an empty string
		ev.dataTransfer.setData(DND_DATA_TEXT, "");

		if (this.ghostData) {
			ev.dataTransfer.setDragImage(this.ghostData.element, this.ghostData.centerX, this.ghostData.centerY);
		}
	}

	onDoubleClick() {
		if (this.props.canvasController.createAutoNode) {
			this.props.canvasController.createAutoNode(this.props.nodeTypeInfo.nodeType);
		}
	}

	onMouseOver(ev) {
		if (ev.buttons === 0) {
			const nodeTemplate = this.props.nodeTypeInfo.category.empty_text
				? { app_data: { ui_data: { label: this.props.nodeTypeInfo.category.empty_text } } }
				: this.props.nodeTypeInfo.nodeType;

			this.props.canvasController.openTip({
				id: "paletteTip_" + this.props.nodeTypeInfo.nodeType.op,
				type: TIP_TYPE_PALETTE_ITEM,
				targetObj: ev.currentTarget,
				nodeTemplate: nodeTemplate,
				category: this.props.nodeTypeInfo.category
			});
		}
	}

	onMouseLeave() {
		this.props.canvasController.closeTip();
	}

	getHighlightedLabel() {
		return this.getHighlightedText(
			this.props.nodeTypeInfo.nodeType.app_data.ui_data.label,
			this.props.nodeTypeInfo.occuranceInfo.labelOccurances);
	}

	getHighlightedDesc() {
		let desc = this.props.nodeTypeInfo.nodeType.app_data.ui_data.description;
		let isLongDescription = false;
		if (desc.length > 150) {
			isLongDescription = true;
			if (!this.state.showFullDescription) {
				desc = desc.substring(0, 150);
			}
		}

		const elements = this.getHighlightedText(
			desc,
			this.props.nodeTypeInfo.occuranceInfo.descOccurances);

		if (isLongDescription) {
			if (this.state.showFullDescription) {
				const less =
					this.props.intl.formatMessage({ id: "palette.flyout.search.less", defaultMessage: defaultMessages["palette.flyout.search.less"] });
				elements.push(<div key="l_btn" className = "palette-list-item-desc-button" onClick={this.showShortDescription}>{less}</div>);
			} else {
				const more =
					this.props.intl.formatMessage({ id: "palette.flyout.search.more", defaultMessage: defaultMessages["palette.flyout.search.more"] });
				elements.push(<div key="m_btn" className = "palette-list-item-desc-button" onClick={this.showFullDescription}>{more}</div>);
			}
		}
		return elements;
	}

	getHighlightedText(textToHighlight, occurances) {
		if (!occurances || occurances.length === 0) {
			return (<span>{textToHighlight}</span>);
		}

		const highlightedElements = [];
		let index = 0;
		let text = "";
		occurances.forEach((occ, i) => {
			text = textToHighlight.substring(index, occ.start);
			highlightedElements.push(<span key={"s" + i}>{text}</span>);

			text = textToHighlight.substring(occ.start, occ.end);
			highlightedElements.push(<mark key={"m" + i}>{text}</mark>);

			index = occ.end;

			if (i === occurances.length - 1 &&
					occ.end < textToHighlight.length) {
				text = textToHighlight.substring(occ.end);
				highlightedElements.push(<span key={"f" + i}>{text}</span>);
			}
		});

		return (highlightedElements);
	}

	showFullDescription() {
		this.setState({ showFullDescription: true });
	}

	showShortDescription() {
		this.setState({ showFullDescription: false });
	}

	imageDrag() {
		return false;
	}

	render() {
		let itemText = null;
		let draggable = "true";
		let icon = null;

		if (has(this.props.nodeTypeInfo.nodeType, "app_data.ui_data.image")) {
			let image = this.props.nodeTypeInfo.nodeType.app_data.ui_data.image;

			if (image === USE_DEFAULT_ICON) {
				image = SUPERNODE_ICON;
			}
			icon = image.endsWith(".svg")
				? <SVG src={image} className="palette-list-item-icon" draggable="false" />
				: <img src={image} className="palette-list-item-icon" draggable="false" />;
		}

		if (has(this.props.nodeTypeInfo.nodeType, "app_data.ui_data.label") &&
				(this.props.isPaletteOpen || !icon)) {
			itemText = this.props.isDisplaySearchResult
				? this.getHighlightedLabel()
				: (<span>{this.props.nodeTypeInfo.nodeType.app_data.ui_data.label}</span>);
		}

		// Special case for when there are no nodes in the category so we show
		// a dummy node to include the empty text from the category.
		if (this.props.nodeTypeInfo.category.node_types.length === 0 && this.props.nodeTypeInfo.category.empty_text) {
			if (this.props.isPaletteOpen) {
				itemText = this.props.nodeTypeInfo.category.empty_text;
			}
			draggable = "false";
			icon = (<Icon type={CANVAS_CARBON_ICONS.WARNING_UNFILLED} className="palette-list-item-icon-warning" draggable="false" />);
		}

		const mainDivClass = this.props.isDisplaySearchResult
			? "palette-list-item search-result"
			: "palette-list-item";

		const categoryLabel = this.props.isDisplaySearchResult
			? (<div className={"palette-list-item-category-label"}>{this.props.nodeTypeInfo.category.label}</div>)
			: null;

		const description = this.props.isDisplaySearchResult && has(this.props.nodeTypeInfo.nodeType, "app_data.ui_data.description")
			? (<div className={"palette-list-item-description"}>{this.getHighlightedDesc()}</div>)
			: null;

		const nodeLabel = itemText
			? <div className="palette-list-item-text-div">{itemText}</div>
			: null;

		return (
			<div id={this.props.nodeTypeInfo.nodeType.id}
				draggable={draggable}
				onDragStart={this.onDragStart}
				onDoubleClick={this.onDoubleClick}
				className={mainDivClass}
				onMouseOver={this.onMouseOver}
				onMouseLeave={this.onMouseLeave}
				onMouseDown={this.onMouseDown}
			>
				{categoryLabel}
				<div className="palette-list-item-icon-and-text">
					{icon}
					{nodeLabel}
				</div>
				{description}
			</div>
		);
	}
}

PaletteContentListItem.propTypes = {
	intl: PropTypes.object.isRequired,
	nodeTypeInfo: PropTypes.object.isRequired,
	isDisplaySearchResult: PropTypes.bool.isRequired,
	canvasController: PropTypes.object.isRequired,
	isPaletteOpen: PropTypes.bool.isRequired
};

export default injectIntl(PaletteContentListItem);
