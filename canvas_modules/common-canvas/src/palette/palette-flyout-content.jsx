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
import PaletteFlyoutContentCategory from "./palette-flyout-content-category.jsx";
import PaletteFlyoutContentSearch from "./palette-flyout-content-search.jsx";
import PaletteContentList from "./palette-content-list.jsx";

class PaletteFlyoutContent extends React.Component {
	static getDerivedStateFromProps(nextProps, prevState) {
		if (!nextProps.isPaletteOpen) {
			return ({ filterKeyword: "" });
		}
		return ({});
	}
	constructor(props) {
		super(props);

		this.state = {
			selectedCategoryIds: [],
			filterKeyword: ""
		};

		this.categorySelected = this.categorySelected.bind(this);
		this.getCategories = this.getCategories.bind(this);
		this.getNodeTypesForCategory = this.getNodeTypesForCategory.bind(this);
		this.handleFilterChange = this.handleFilterChange.bind(this);
	}

	/*
	* Returns a unique set of categories in case category labels
	* are duplicated in the categories list.
	*/
	getCategories(categories) {
		var out = [];
		if (categories) {
			for (const category of categories) {
				if (out.indexOf(category.label) === -1) {
					out.push(category);
				}
			}
		}
		return out;
	}

	getNodeTypesForCategory(categories, id) {
		var out = [];
		if (categories) {
			for (const category of categories) {
				if (category.id === id) {
					out = category.node_types;
				}
			}
		}
		return out;
	}

	categorySelected(catSelId) {
		const selCatIds = this.isCategorySelected(catSelId)
			? this.state.selectedCategoryIds.filter((catId) => catId !== catSelId)
			: this.state.selectedCategoryIds.concat(catSelId);

		this.setState({ selectedCategoryIds: selCatIds });
	}

	isCategorySelected(categoryId) {
		return this.state.selectedCategoryIds.some((cId) => cId === categoryId);
	}

	filterNodeTypes(nodeTypes) {
		var filteredNodeTypes = [];
		if (nodeTypes) {
			const lowercaseFilteredKeyword = this.state.filterKeyword.toLowerCase();
			for (const nodeType of nodeTypes) {
				if (has(nodeType, "app_data.ui_data.label") &&
						nodeType.app_data.ui_data.label.toLowerCase().indexOf(lowercaseFilteredKeyword) > -1) {
					filteredNodeTypes.push(nodeType);
				}
			}
		}
		return filteredNodeTypes;
	}

	handleFilterChange(evt) {
		this.setState({ filterKeyword: evt.target.value || "" });
	}

	render() {
		var categories = this.getCategories(this.props.paletteJSON.categories);
		var contentDivs = [];
		for (var idx = 0; idx < categories.length; idx++) {
			const category = categories[idx];
			var style = {};
			if (idx === categories.length - 1) {
				style = { "borderBottom": "none" };
			}

			let filteredNodeTypes = null;

			const nodeTypes = this.getNodeTypesForCategory(this.props.paletteJSON.categories, category.id);
			filteredNodeTypes = this.filterNodeTypes(nodeTypes);

			const isCategorySelected = this.isCategorySelected(category.id);

			let content = null;
			if (isCategorySelected) {
				content = (
					<PaletteContentList
						style={style}
						show
						key={category.label + "-nodes"}
						category={category}
						nodeTypes={filteredNodeTypes}
						canvasController={this.props.canvasController}
						isPaletteOpen={this.props.isPaletteOpen}
					/>);
			}

			var itemsFiltered = false;
			if (this.state.filterKeyword) {
				itemsFiltered = true;
			}

			contentDivs.push(
				<div key={category.label + "-container"}>
					<PaletteFlyoutContentCategory
						key={category.id}
						category={category}
						isCategorySelected={isCategorySelected}
						categorySelectedMethod={this.categorySelected}
						itemCount={filteredNodeTypes.length}
						itemsFiltered={itemsFiltered}
						canvasController={this.props.canvasController}
						isPaletteOpen={this.props.isPaletteOpen}
					/>
					{content}
				</div>
			);
		}

		const contentCategories = (
			<div className="palette-flyout-content-categories">
				{contentDivs}
			</div>
		);

		const contentSearch = (
			<PaletteFlyoutContentSearch
				handleFilterChange={this.handleFilterChange}
				filterKeyword={this.state.filterKeyword}
				isPaletteOpen={this.props.isPaletteOpen}
				canvasController={this.props.canvasController}
			/>
		);

		return (
			<div className="palette-flyout-content">
				{contentSearch}
				{contentCategories}
			</div>
		);
	}
}

PaletteFlyoutContent.propTypes = {
	paletteJSON: PropTypes.object.isRequired,
	canvasController: PropTypes.object.isRequired,
	isPaletteOpen: PropTypes.bool.isRequired
};

export default PaletteFlyoutContent;
