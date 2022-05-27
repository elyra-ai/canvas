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
import PaletteDialogContentGridNode from "./palette-dialog-content-grid-node.jsx";


class PaletteDialogContentGrid extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		var gridNodes = [];

		if (this.props.category && this.props.category.node_types &&
				this.props.category.node_types.length === 0 && this.props.category.empty_text) {
			gridNodes.push(
				<PaletteDialogContentGridNode key={"pal_grid_node_empty"}
					category={this.props.category}
					nodeTemplate={ {} }
					canvasController={this.props.canvasController}
					isEditingEnabled={this.props.isEditingEnabled}
				/>
			);
		} else {
			for (var idx = 0; idx < this.props.nodeTypes.length; idx++) {
				gridNodes.push(
					<PaletteDialogContentGridNode key={"pal_grid_node_" + idx}
						category={this.props.category}
						nodeTemplate={this.props.nodeTypes[idx]}
						canvasController={this.props.canvasController}
						isEditingEnabled={this.props.isEditingEnabled}
					/>
				);
			}
		}

		return (
			<div width="100%" className="palette-scroll">
				{gridNodes}
			</div>
		);
	}
}

PaletteDialogContentGrid.propTypes = {
	category: PropTypes.object.isRequired,
	nodeTypes: PropTypes.array.isRequired,
	isEditingEnabled: PropTypes.bool.isRequired,
	canvasController: PropTypes.object.isRequired
};

export default PaletteDialogContentGrid;
