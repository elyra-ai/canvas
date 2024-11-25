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
import PaletteContentListItem from "./palette-content-list-item.jsx";
import CanvasUtils from "../common-canvas/common-canvas-utils.js";

class PaletteContentList extends React.Component {
	constructor(props) {
		super(props);

		this.currentFocusIndex = 0;
		this.contentItemRefs = [];

		this.nextNodeInCategory = this.nextNodeInCategory.bind(this);
		this.previousNodeInCategory = this.previousNodeInCategory.bind(this);
	}

	// Sets focus on the fist ndoe in the list. This is called using a ref
	// from the parent category.
	setFirstNode() {
		this.currentFocusIndex = 0;
		this.contentItemRefs[this.currentFocusIndex].current.focus();
	}

	nextNodeInCategory(evt) {
		this.currentFocusIndex++;
		if (this.currentFocusIndex > this.contentItemRefs.length - 1) {
			this.currentFocusIndex = 0;
		}
		this.contentItemRefs[this.currentFocusIndex].current.focus();
		CanvasUtils.stopPropagationAndPreventDefault(evt);
	}

	previousNodeInCategory(evt) {
		this.currentFocusIndex--;
		if (this.currentFocusIndex < 0) {
			this.currentFocusIndex = this.contentItemRefs.length - 1;
		}
		this.contentItemRefs[this.currentFocusIndex].current.focus();
		CanvasUtils.stopPropagationAndPreventDefault(evt);
	}

	render() {
		const contentItems = [];
		this.contentItemRefs = [];

		if (this.props.category && this.props.category.node_types &&
				this.props.category.node_types.length === 0 && this.props.category.empty_text) {
			contentItems.push(
				<div key={"item_empty"}>
					<PaletteContentListItem
						nodeTypeInfo={{ nodeType: {}, category: this.props.category }}
						isDisplaySearchResult={false}
						canvasController={this.props.canvasController}
						isPaletteWide={this.props.isPaletteWide}
						isEditingEnabled={this.props.isEditingEnabled}
					/>
				</div>
			);
		} else {
			for (var idx = 0; idx < this.props.nodeTypeInfos.length; idx++) {
				var itemKey = "item_" + idx;

				const ref = React.createRef();
				this.contentItemRefs.push(ref);

				contentItems.push(
					<PaletteContentListItem
						ref={ref}
						key={itemKey}
						nodeTypeInfo={this.props.nodeTypeInfos[idx]}
						isDisplaySearchResult={false}
						canvasController={this.props.canvasController}
						isPaletteWide={this.props.isPaletteWide}
						isEditingEnabled={this.props.isEditingEnabled}
						nextNodeInCategory={this.nextNodeInCategory}
						previousNodeInCategory={this.previousNodeInCategory}
					/>
				);
			}
		}

		return (
			<div width="100%" draggable="false" className="palette-content-list palette-scroll">
				{contentItems}
			</div>
		);
	}
}

PaletteContentList.propTypes = {
	category: PropTypes.object.isRequired,
	nodeTypeInfos: PropTypes.array.isRequired,
	canvasController: PropTypes.object.isRequired,
	isPaletteWide: PropTypes.bool,
	isEditingEnabled: PropTypes.bool.isRequired,
};

export default PaletteContentList;
