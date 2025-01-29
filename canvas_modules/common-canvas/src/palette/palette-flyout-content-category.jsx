/*
 * Copyright 2017-2023 Elyra Authors
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
import { AccordionItem, InlineLoading } from "@carbon/react";
import { get } from "lodash";
import SVG from "react-inlinesvg";
import { TIP_TYPE_PALETTE_CATEGORY } from "../common-canvas/constants/canvas-constants.js";
import CanvasUtils from "../common-canvas/common-canvas-utils.js";
import KeyboardUtils from "../common-canvas/keyboard-utils.js";
import PaletteContentList from "./palette-content-list.jsx";


class PaletteFlyoutContentCategory extends React.Component {
	constructor(props) {
		super(props);

		this.onMouseOver = this.onMouseOver.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.categoryClicked = this.categoryClicked.bind(this);
		this.categoryKeyPressed = this.categoryKeyPressed.bind(this);
		this.setPaletteCategory = this.setPaletteCategory.bind(this);
	}

	onMouseOver(evt) {
		this.displayTip(evt);
	}

	onMouseLeave() {
		this.props.canvasController.closeTip();
	}

	onFocus(evt) {
		this.displayTip(evt);
	}

	getDisplayLabel() {
		if (this.props.isPaletteWide === true) {
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
		if (this.props.isPaletteWide) {
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

	setPaletteCategory(isOpen) {
		if (isOpen) {
			this.props.canvasController.closePaletteCategory(this.props.category.id);
		} else {
			this.props.canvasController.openPaletteCategory(this.props.category.id);
		}
	}

	// Returns the category object for a regular category.
	getRenderCategory() {
		const titleObj = this.getTitleObj();
		const content = this.getContent();
		return (
			<AccordionItem title={titleObj} open={this.props.category.is_open}
				onKeyDown={this.categoryKeyPressed} onFocus={this.onFocus}
			>
				{content}
			</AccordionItem>
		);
	}

	// Returns the title object for the category consisting of the image and text.
	getTitleObj() {
		const itemImage = this.getItemImage();
		const itemText = this.getItemText();
		this.catRef = React.createRef();
		return (
			<div className="palette-flyout-category"
				ref={this.catRef}
				data-id={get(this.props.category, "id", "")}
				onClick={this.categoryClicked}
				value={this.props.category.label}
				onMouseOver={this.onMouseOver}
				onMouseLeave={this.onMouseLeave}
			>
				<div className="palette-flyout-category-item" tabIndex={-1}>
					{itemImage}
					{itemText}
				</div></div>
		);
	}

	// Returns the text for the category
	getItemText() {
		let itemText = null;
		const label = this.getDisplayLabel();
		if (this.props.isPaletteWide) {
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
			if (typeof this.props.category.image === "object" && React.isValidElement(this.props.category.image)) {
				itemImage = this.props.category.image;

			} else if (this.props.category.image.endsWith(".svg")) {
				itemImage = (
					<div>
						<SVG src={this.props.category.image} className="palette-flyout-category-item-icon" draggable="false" aria-hidden="true" />
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
			this.pclRef = React.createRef();
			return (
				<PaletteContentList
					ref={this.pclRef}
					key={this.props.category.id + "-nodes"}
					category={this.props.category}
					nodeTypeInfos={nodeTypeInfos}
					canvasController={this.props.canvasController}
					allowClickToAdd={this.props.allowClickToAdd}
					isPaletteWide={this.props.isPaletteWide}
					isEditingEnabled={this.props.isEditingEnabled}
				/>
			);
		}
		return null;
	}

	displayTip() {
		this.props.canvasController.closeTip();
		this.props.canvasController.openTip({
			id: "paletteTip_" + this.props.category.id,
			type: TIP_TYPE_PALETTE_CATEGORY,
			targetObj: this.catRef.current,
			category: this.props.category
		});

	}

	categoryClicked(evt) {
		// Stopping event propagation prevents an extra refresh of the node icons when
		// a category is opened.
		evt.stopPropagation();

		this.setPaletteCategory(this.props.category.is_open);
	}

	categoryKeyPressed(evt) {
		if (evt.target.className === "cds--accordion__heading") {
			if (KeyboardUtils.openCategory(evt)) {
				this.setPaletteCategory(this.props.category.is_open);
				CanvasUtils.stopPropagationAndPreventDefault(evt);

			} else if (this.props.category.is_open &&
						KeyboardUtils.fromCategoryToFirstNode(evt)) {
				this.pclRef.current.setFirstNode();
				CanvasUtils.stopPropagationAndPreventDefault(evt);
			}
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
	allowClickToAdd: PropTypes.bool,
	isPaletteWide: PropTypes.bool,
	isEditingEnabled: PropTypes.bool.isRequired,
};

export default PaletteFlyoutContentCategory;
