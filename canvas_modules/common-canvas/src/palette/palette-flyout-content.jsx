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
import { debounce } from "lodash";
import { getFilteredNodeTypeInfos } from "./palette-flyout-utils.js";
import PaletteFlyoutContentCategory from "./palette-flyout-content-category.jsx";
import PaletteFlyoutContentSearch from "./palette-flyout-content-search.jsx";
import PaletteFlyoutContentFilteredList from "./palette-flyout-content-filtered-list.jsx";
import Logger from "../logging/canvas-logger.js";
import { Accordion } from "@carbon/react";


const logger = new Logger("PaletteFlyoutContent");

class PaletteFlyoutContent extends React.Component {
	constructor(props) {
		super(props);

		// Note: searchString below is a copy of searchString in
		// palette-flyout-content-search this duplication is necessaery to allow
		// the debounce function to work. When a key is pressed, the searchString in
		// palette-flyout-content-search is updated causing its text to be rendered.
		// The handleSearchStringChange() in this class is then called that handles
		// debounce and after the debounce unwinds it sets searchString in this
		// class which causes the filtered result set to be calculated and displayed.
		this.state = {
			searchString: ""
		};

		this.categories = [];

		this.getUniqueCategories = this.getUniqueCategories.bind(this);
		this.setSearchString = this.setSearchString.bind(this);
		this.handleSearchStringChange = this.handleSearchStringChange.bind(this);
		this.setSearchStringThrottled = debounce(this.setSearchString, 200);
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

			contentDivs.push(
				<div key={category.label + "-container"}>
					<PaletteFlyoutContentCategory
						key={category.id}
						category={category}
						canvasController={this.props.canvasController}
						isPaletteWide={this.props.isPaletteWide}
						isEditingEnabled={this.props.isEditingEnabled}
					/>
				</div>
			);
		}
		return <Accordion>{contentDivs}</Accordion>;
	}

	getFilteredContentDivs(categories) {
		logger.logStartTimer("getFilteredNodeTypeInfos");
		let filteredNodeTypeInfos = getFilteredNodeTypeInfos(this.categories, this.state.searchString);
		logger.logEndTimer("getFilteredNodeTypeInfos");

		let isNodeTypeInfosArrayTruncated = false;

		if (filteredNodeTypeInfos.length > 10) {
			filteredNodeTypeInfos = filteredNodeTypeInfos.slice(0, 10);
			isNodeTypeInfosArrayTruncated = true;
		}

		const content = (
			<PaletteFlyoutContentFilteredList
				key={"filtered-nodes"}
				nodeTypeInfos={filteredNodeTypeInfos}
				canvasController={this.props.canvasController}
				isPaletteWide={this.props.isPaletteWide}
				isEditingEnabled={this.props.isEditingEnabled}
				// isShowRanking // Uncomment this to show ranking for debuggig ranking algorithm
				isNodeTypeInfosArrayTruncated={isNodeTypeInfosArrayTruncated}
			/>);

		return [content];
	}

	setSearchString() {
		this.setState({ searchString: this.ss });
	}

	handleSearchStringChange(s) {
		this.ss = s;
		this.setSearchStringThrottled();
	}

	render() {
		this.categories = this.getUniqueCategories(this.props.paletteJSON.categories);
		const contentDivs = this.props.isPaletteWide && this.state.searchString
			? this.getFilteredContentDivs(this.categories)
			: this.getContentDivs(this.categories);

		const contentCategories = (
			<div className="palette-flyout-categories">
				{contentDivs}
			</div>
		);

		const contentSearch = (
			<PaletteFlyoutContentSearch
				canvasController={this.props.canvasController}
				handleSearchStringChange={this.handleSearchStringChange}
				isPaletteWide={this.props.isPaletteWide}
			/>
		);

		const paletteHeader = this.props.paletteHeader && !this.state.searchString && this.props.isPaletteWide
			? this.props.paletteHeader
			: null;

		return (
			<div className="palette-flyout-content">
				{contentSearch}
				{paletteHeader}
				{contentCategories}
			</div>
		);
	}
}

PaletteFlyoutContent.propTypes = {
	canvasController: PropTypes.object.isRequired,
	paletteJSON: PropTypes.object.isRequired,
	paletteHeader: PropTypes.object,
	isEditingEnabled: PropTypes.bool.isRequired,
	isPaletteWide: PropTypes.bool
};

export default PaletteFlyoutContent;
