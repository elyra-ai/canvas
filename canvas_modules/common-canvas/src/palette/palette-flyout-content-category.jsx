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
import { InlineLoading } from "carbon-components-react";
import Icon from "../icons/icon.jsx";
import SVG from "react-inlinesvg";
import { TIP_TYPE_PALETTE_CATEGORY, CANVAS_CARBON_ICONS } from "../common-canvas/constants/canvas-constants.js";

class PaletteFlyoutContentCategory extends React.Component {
	constructor(props) {
		super(props);

		this.onMouseOver = this.onMouseOver.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
		this.categorySelected = this.categorySelected.bind(this);
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
		let description = "";
		if (this.props.isPaletteOpen) {
			description = this.props.category.loading_text;
		}

		const content = (
			<div className="palette-flyout-category">
				<div className="palette-flyout-category-item-loading">
					<InlineLoading
						description={ description }
						iconDescription={ description }
						onSuccess={function noRefCheck() {
							return null;
						}}
						status="active"
						successDelay={1500}
					/>
				</div>
			</div>
		);
		return content;
	}

	getRenderCategory() {
		let caretClassName = "palette-flyout-category-caret";
		if (!this.props.isPaletteOpen) {
			caretClassName += " palette-flyout-category-caret-closed"; // When palette is closed extra style
		}

		let caretImage = null;
		if (this.props.itemCount > 0 || this.props.category.empty_text) {
			caretImage = <Icon type={CANVAS_CARBON_ICONS.CHEVRONARROWS.DOWN} className={caretClassName} />;
			if (this.props.selectedCategoryId === this.props.category.id) {
				caretImage = <Icon type={CANVAS_CARBON_ICONS.CHEVRONARROWS.UP} className={caretClassName} />;
			}
		}

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
						<img src={this.props.category.image} className="palette-flyout-category-item-icon" draggable="false" />
					</div>
				);
			}
		}

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

		var itemCount = null;
		if (this.props.isPaletteOpen && this.props.itemsFiltered && this.props.itemCount > 0) {
			itemCount = (
				<span className="palette-flyout-category-count">
					{"(" + this.props.itemCount + ")"}
				</span>
			);
		}

		const content = (
			<div className="palette-flyout-category"
				onClick={this.categorySelected}
				value={this.props.category.label}
				onMouseOver={this.onMouseOver}
				onMouseLeave={this.onMouseLeave}
			>
				<div className="palette-flyout-category-item">
					{itemImage}
					{itemText}
					{itemCount}
				</div>
				{caretImage}
			</div>
		);
		return content;
	}

	categorySelected() {
		this.props.categorySelectedMethod(this.props.category.id);
	}

	render() {
		let content = null;
		if (this.props.category.loading_text) {
			content = this.getInlineLoadingRenderCategory();
		} else {
			content = this.getRenderCategory();
		}

		return content;
	}
}

PaletteFlyoutContentCategory.propTypes = {
	category: PropTypes.object.isRequired,
	selectedCategoryId: PropTypes.string.isRequired,
	categorySelectedMethod: PropTypes.func.isRequired,
	itemCount: PropTypes.number.isRequired,
	itemsFiltered: PropTypes.bool.isRequired,
	canvasController: PropTypes.object.isRequired,
	isPaletteOpen: PropTypes.bool.isRequired
};

export default PaletteFlyoutContentCategory;
