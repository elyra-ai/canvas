/*
 * Copyright 2017-2022 Elyra Authors
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
import { InlineLoading } from "carbon-components-react";
import SVG from "react-inlinesvg";
import { TIP_TYPE_PALETTE_CATEGORY } from "../common-canvas/constants/canvas-constants.js";
import { get } from "lodash";
import { AccordionItem } from "carbon-components-react";
import PaletteContentList from "./palette-content-list.jsx";


class PaletteFlyoutContentCategory extends React.Component {
	constructor(props) {
		super(props);

		this.onMouseOver = this.onMouseOver.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
		this.categoryClicked = this.categoryClicked.bind(this);
	}

	onMouseOver(ev) {
		this.props.canvasController.openTip({
			id: "paletteTip_" + this.props.category.id,
			type: TIP_TYPE_PALETTE_CATEGORY,
			targetObj: ev.currentTarget,
			category: this.props.category
		});
	}

	onMouseLeave() {
		this.props.canvasController.closeTip();
	}

	getDisplayLabel() {
		if (this.props.isPaletteOpen === true) {
			return this.props.category.label;

		// With narrow palette, if there's no image just display first 3 letters
		} else if (!this.props.category.image &&
								this.props.category.label &&
								this.props.category.label.length > 0) {
			return this.props.category.label.substr(0, 3);
		}
		return null;
	}

	getInlineLoadingRenderCategory() {

		// TODO - This loading functionality should be replaced with a skeleton
		// graphic to indicate the category is loading instead of using the
		// InlineLoading component.

		let description = "";
		if (this.props.isPaletteOpen) {
			description = this.props.category.loading_text;
		}

		// We do not specify an iconDescription below because doing so overrides
		// the icon label which causes a problem with the accessibility checker.
		const titleLoadingObj = (
			<div className="palette-flyout-category">
				<div className="palette-flyout-category-item-loading">
					<InlineLoading
						description={ description }
						onSuccess={function noRefCheck() {
							return null;
						}}
						status="active"
						successDelay={1500}
					/>
				</div>
			</div>
		);

		const content = (
			<AccordionItem className="palette-loading-category" title={titleLoadingObj} />
		);
		return content;
	}

	// Returns the category object for a regular category.
	getRenderCategory() {
		const titleObj = this.getTitleObj();
		const content = this.getContent();
		return (
			<AccordionItem title={titleObj} open={this.props.category.is_open}>
				{content}
			</AccordionItem>
		);
	}

	// Returns the title object for the category consisting of the image and text.
	getTitleObj() {
		const itemImage = this.getItemImage();
		const itemText = this.getItemText();
		return (
			<div className="palette-flyout-category"
				data-id={get(this.props.category, "id", "")}
				onClick={this.categoryClicked}
				value={this.props.category.label}
				onMouseOver={this.onMouseOver}
				onMouseLeave={this.onMouseLeave}
			>
				<div className="palette-flyout-category-item">
					{itemImage}
					{itemText}
				</div></div>
		);
	}

	// Returns the text for the category
	getItemText() {
		let itemText = null;
		const label = this.getDisplayLabel();
		if (this.props.isPaletteOpen === true) {
			const className = this.props.category.image ? "palette-flyout-category-text" : "palette-flyout-category-text-no-image";
			itemText = (
				<span className={className}>
					{label}
				</span>
			);

		// With narrow palette, if there's no image just display first 3 letters
		} else if (!this.props.category.image &&
								this.props.category.label &&
								this.props.category.label.length > 0) {
			itemText = (
				<span className="palette-flyout-category-text-abbr">
					{label}
				</span>
			);
		}
		return itemText;
	}

	// Returns the image for the category
	getItemImage() {
		let itemImage = null;
		if (this.props.category.image && this.props.category.image !== "") {
			if (this.props.category.image.endsWith(".svg")) {
				itemImage = (
					<div>
						<SVG src={this.props.category.image} className="palette-flyout-category-item-icon" draggable="false" />
					</div>
				);
			} else {
				itemImage = (
					<div>
						<img src={this.props.category.image} className="palette-flyout-category-item-icon" draggable="false" alt={this.props.category.label} />
					</div>
				);
			}
		}
		return itemImage;
	}

	// Returns the content object for the AccordionItem. This is only set to
	// something if the category is open (that is: this.props.category.is_open
	// is true). We remove the nodes from the DOM, when the category
	// is closed, because this helps inline SVG icons on the canvas, that
	// reference elements in the <defs> element, to appear correctly.
	getContent() {
		if (this.props.category.is_open) {
			const nodeTypeInfos = this.props.category.node_types.map((nt) => ({ nodeType: nt, category: this.props.category }));
			return (
				<PaletteContentList
					key={this.props.category.id + "-nodes"}
					category={this.props.category}
					nodeTypeInfos={nodeTypeInfos}
					canvasController={this.props.canvasController}
					isPaletteOpen={this.props.isPaletteOpen}
					isEditingEnabled={this.props.isEditingEnabled}
				/>
			);
		}
		return null;
	}

	categoryClicked(evt) {
		// Stopping event propagation prevents an extra refresh of the node icons when
		// a category is opened.
		evt.stopPropagation();

		if (this.props.canvasController.isPaletteCategoryOpen(this.props.category.id)) {
			this.props.canvasController.closePaletteCategory(this.props.category.id);
		} else {
			this.props.canvasController.openPaletteCategory(this.props.category.id);
		}
	}

	render() {
		return this.props.category.loading_text
			? this.getInlineLoadingRenderCategory()
			: this.getRenderCategory();
	}
}

PaletteFlyoutContentCategory.propTypes = {
	category: PropTypes.object.isRequired,
	canvasController: PropTypes.object.isRequired,
	isPaletteOpen: PropTypes.bool.isRequired,
	isEditingEnabled: PropTypes.bool.isRequired,
};

export default PaletteFlyoutContentCategory;
