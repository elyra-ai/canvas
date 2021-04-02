/*
 * Copyright 2017-2021 Elyra Authors
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
import { throttle } from "throttle-debounce";
import { getOccurances } from "./palette-utils.js";
import PaletteFlyoutContentCategory from "./palette-flyout-content-category.jsx";
import PaletteFlyoutContentSearch from "./palette-flyout-content-search.jsx";
import PaletteContentList from "./palette-content-list.jsx";
import PaletteFlyoutContentFilteredList from "./palette-flyout-content-filtered-list.jsx";
import Logger from "../logging/canvas-logger.js";

const logger = new Logger("PaletteFlyoutContent");

class PaletteFlyoutContent extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedCategoryIds: [],
			filterKeyword: "",
			filteredNodeTypeInfos: []
		};

		this.categories = [];

		this.categorySelected = this.categorySelected.bind(this);
		this.getUniqueCategories = this.getUniqueCategories.bind(this);
		this.handleFilterChange = this.handleFilterChange.bind(this);
		this.filterNodeTypeInfosThrottled = throttle(500, this.filterNodeTypeInfos);
	}

	/*
	* Returns a unique set of categories in case category labels
	* are duplicated in the categories list.
	*/
	getUniqueCategories(categories) {
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

	getContentDivs(categories) {
		const contentDivs = [];
		for (let idx = 0; idx < categories.length; idx++) {
			const category = categories[idx];
			const isLastCategory = idx === categories.length - 1;
			const nodeTypeInfos = category.node_types.map((nt) => ({ nodeType: nt, category: category }));
			const isCategorySelected = this.isCategorySelected(category.id);

			let content = null;
			if (isCategorySelected) {
				content = (
					<PaletteContentList
						key={category.label + "-nodes"}
						show
						category={category}
						nodeTypeInfos={nodeTypeInfos}
						canvasController={this.props.canvasController}
						isPaletteOpen={this.props.isPaletteOpen}
						isLastCategory={isLastCategory}
					/>);
			}

			contentDivs.push(
				<div key={category.label + "-container"}>
					<PaletteFlyoutContentCategory
						key={category.id}
						category={category}
						isCategorySelected={isCategorySelected}
						categorySelectedMethod={this.categorySelected}
						itemCount={nodeTypeInfos.length}
						canvasController={this.props.canvasController}
						isPaletteOpen={this.props.isPaletteOpen}
					/>
					{content}
				</div>
			);
		}
		return contentDivs;
	}

	getFilteredContentDivs(categories) {
		let isNodeTypeInfosArrayTruncated = false;
		let filteredNodeTypeInfos = this.state.filteredNodeTypeInfos;

		if (this.state.filteredNodeTypeInfos.length > 10) {
			filteredNodeTypeInfos = this.state.filteredNodeTypeInfos.slice(0, 10);
			isNodeTypeInfosArrayTruncated = true;
		}

		const content = (
			<PaletteFlyoutContentFilteredList
				key={"filtered-nodes"}
				nodeTypeInfos={filteredNodeTypeInfos}
				canvasController={this.props.canvasController}
				isPaletteOpen={this.props.isPaletteOpen}
				isNodeTypeInfosArrayTruncated={isNodeTypeInfosArrayTruncated}
			/>);

		return [content];
	}

	getFilteredNodeTypeInfosAllCategories(categories) {
		logger.logStartTimer("getFilteredNodeTypeInfosAllCategories");
		const filteredNodeTypeInfos = [];
		const lowercaseFilteredKeyword = this.state.filterKeyword.toLowerCase();
		const filterStrings = lowercaseFilteredKeyword.split(" ");
		for (let idx = 0; idx < categories.length; idx++) {
			filteredNodeTypeInfos.push(...this.getFilteredNodeTypeInfos(categories[idx], filterStrings));
		}
		const rankedFilteredNodeTypeInfos =
			filteredNodeTypeInfos.sort((e1, e2) => ((e1.occuranceInfo.ranking < e2.occuranceInfo.ranking) ? 1 : -1));

		logger.logEndTimer("getFilteredNodeTypeInfosAllCategories");
		return rankedFilteredNodeTypeInfos;
	}

	getFilteredNodeTypeInfos(category, filterStrings) {
		var filteredNodeTypeInfos = [];
		if (category.node_types) {
			for (const nodeType of category.node_types) {
				const occuranceInfo = getOccurances(nodeType, filterStrings);
				if (occuranceInfo) {
					filteredNodeTypeInfos.push({ nodeType, category, occuranceInfo });
				}
			}
		}
		return filteredNodeTypeInfos;
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

	handleFilterChange(evt) {
		const value = evt.target.value || "";

		this.setState({ filterKeyword: value }, () => {
			this.filterNodeTypeInfosThrottled(this.state.filterKeyword);
		});
	}

	filterNodeTypeInfos() {
		const filteredNodeTypeInfos = this.getFilteredNodeTypeInfosAllCategories(this.categories);
		this.setState({ filteredNodeTypeInfos: filteredNodeTypeInfos });
	}

	render() {
		this.categories = this.getUniqueCategories(this.props.paletteJSON.categories);
		const contentDivs = this.props.isPaletteOpen && this.state.filterKeyword
			? this.getFilteredContentDivs(this.categories)
			: this.getContentDivs(this.categories);

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
