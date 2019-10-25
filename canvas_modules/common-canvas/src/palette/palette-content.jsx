/*
 * Copyright 2017-2019 IBM Corporation
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
import PaletteContentCategories from "./palette-content-categories.jsx";
import PaletteContentGrid from "./palette-content-grid.jsx";
import PaletteContentList from "./palette-content-list.jsx";

class PaletteContent extends React.Component {
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
		this.getCategories = this.getCategories.bind(this);
		this.getSelectedCategory = this.getSelectedCategory.bind(this);
	}

	getCategories(categories) {
		var out = [];

		if (categories) {
			for (var idx = 0; idx < categories.length; idx++) {
				if (out.indexOf(categories[idx].label) === -1) {
					out.push(categories[idx].label);
				}
			}
		}
		return out;
	}

	getSelectedCategory(categories) {
		var out = null;

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
		const cats = this.getCategories(this.props.paletteJSON.categories);

		const category = this.getSelectedCategory(this.props.paletteJSON.categories);
		const nodeTypes = category ? category.node_types : [];

		return (
			<div className="palette-content" ref="palettecontent">
				<PaletteContentCategories categories={cats}
					selectedCategory={this.state.selectedCategory}
					categorySelectedMethod={this.categorySelected}
				/>
				<PaletteContentGrid show={this.props.showGrid}
					category={category}
					nodeTypes={nodeTypes}
					canvasController={this.props.canvasController}
				/>
				<PaletteContentList show={!this.props.showGrid}
					category={category}
					nodeTypes={nodeTypes}
					canvasController={this.props.canvasController}
					isPaletteOpen
				/>
			</div>
		);
	}
}

PaletteContent.propTypes = {
	paletteJSON: PropTypes.object.isRequired,
	showGrid: PropTypes.bool.isRequired,
	canvasController: PropTypes.object.isRequired
};

export default PaletteContent;
