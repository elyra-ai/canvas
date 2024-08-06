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
import PaletteDialogContentCategories from "./palette-dialog-content-categories.jsx";
import PaletteDialogContentGrid from "./palette-dialog-content-grid.jsx";
import PaletteContentList from "./palette-content-list.jsx";

class PaletteDialogContent extends React.Component {
	static getDerivedStateFromProps(nextProps, prevState) {
		// We get the paletteJSON after the initial render so set the
		// default selected category when it is recieved.
		if (nextProps.paletteJSON &&
				nextProps.paletteJSON.categories &&
				nextProps.paletteJSON.categories.length > 0 &&
				prevState.selectedCategory === "") {
			return ({ selectedCategory: nextProps.paletteJSON.categories[0].label });
		}
		return ({});
	}

	constructor(props) {
		super(props);

		this.state = {
			selectedCategory: ""
		};

		this.categorySelected = this.categorySelected.bind(this);
		this.getUniqueCategories = this.getUniqueCategories.bind(this);
		this.getSelectedCategory = this.getSelectedCategory.bind(this);
	}

	getUniqueCategories(categories) {
		var out = [];

		if (categories) {
			for (var idx = 0; idx < categories.length; idx++) {
				if (out.indexOf(categories[idx].label) === -1) {
					out.push(categories[idx]);
				}
			}
		}
		return out;
	}

	getSelectedCategory(categories) {
		var out = {};

		if (categories) {
			for (var idx = 0; idx < categories.length; idx++) {
				if (categories[idx].label === this.state.selectedCategory) {
					out = categories[idx];
				}
			}
		}
		return out;
	}

	categorySelected(catSelEvent) {
		this.setState({ selectedCategory: catSelEvent.target.firstChild.data });
	}

	render() {
		const cats = this.getUniqueCategories(this.props.paletteJSON.categories);
		const category = this.getSelectedCategory(this.props.paletteJSON.categories);
		const nodeTypes = category && category.node_types ? category.node_types : [];
		const nodeTypeInfos = nodeTypes.map((nt) =>	({ nodeType: nt, category: category }));
		const content = this.props.showGrid
			? (
				<PaletteDialogContentGrid
					category={category}
					nodeTypes={nodeTypes}
					canvasController={this.props.canvasController}
					isEditingEnabled={this.props.isEditingEnabled}
				/>)
			: (
				<PaletteContentList
					category={category}
					nodeTypeInfos={nodeTypeInfos}
					canvasController={this.props.canvasController}
					isPaletteWide
					isEditingEnabled={this.props.isEditingEnabled}
				/>);
		return (
			<div className="palette-dialog-content" ref="palettecontent">
				<PaletteDialogContentCategories categories={cats}
					selectedCategory={this.state.selectedCategory}
					categorySelectedMethod={this.categorySelected}
				/>
				{content}
			</div>
		);
	}
}

PaletteDialogContent.propTypes = {
	paletteJSON: PropTypes.object.isRequired,
	showGrid: PropTypes.bool.isRequired,
	canvasController: PropTypes.object.isRequired,
	isEditingEnabled: PropTypes.bool.isRequired
};

export default PaletteDialogContent;
