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
import PaletteContentListItem from "./palette-content-list-item.jsx";

class PaletteContentList extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		var contentItems = [];

		if (this.props.category && this.props.category.node_types &&
				this.props.category.node_types.length === 0 && this.props.category.empty_text) {
			contentItems.push(
				<div key={"item_empty"}>
					<PaletteContentListItem
						nodeTypeInfo={{ nodeType: {}, category: this.props.category }}
						isDisplaySearchResult={false}
						canvasController={this.props.canvasController}
						isPaletteOpen={this.props.isPaletteOpen}
					/>
				</div>
			);
		} else {
			for (var idx = 0; idx < this.props.nodeTypeInfos.length; idx++) {
				var itemKey = "item_" + idx;

				contentItems.push(
					<div key={itemKey}>
						<PaletteContentListItem
							nodeTypeInfo={this.props.nodeTypeInfos[idx]}
							isDisplaySearchResult={false}
							canvasController={this.props.canvasController}
							isPaletteOpen={this.props.isPaletteOpen}
						/>
					</div>
				);
			}
		}

		const style = {};
		style.borderBottom = this.props.isLastCategory ? "none" : null;
		style.display = this.props.show ? "block" : "none";

		return (
			<div width="100%" draggable="false" className="palette-content-list palette-scroll"
				style={ style }
			>
				{contentItems}
			</div>
		);
	}
}

PaletteContentList.propTypes = {
	category: PropTypes.object.isRequired,
	nodeTypeInfos: PropTypes.array.isRequired,
	show: PropTypes.bool.isRequired,
	canvasController: PropTypes.object.isRequired,
	isPaletteOpen: PropTypes.bool.isRequired,
	isLastCategory: PropTypes.bool.isRequired
};

export default PaletteContentList;
