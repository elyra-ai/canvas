/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import has from "lodash/has";
import PaletteFlyoutContentCategory from "./palette-flyout-content-category.jsx";
import PaletteFlyoutContentSearch from "./palette-flyout-content-search.jsx";
import PaletteContentList from "./palette-content-list.jsx";

class PaletteFlyoutContent extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedCategoryId: "",
			filterKeyword: ""
		};

		this.categorySelected = this.categorySelected.bind(this);
		this.getCategories = this.getCategories.bind(this);
		this.getNodeTypesForCategory = this.getNodeTypesForCategory.bind(this);
		this.handleFilterChange = this.handleFilterChange.bind(this);
	}

	componentWillReceiveProps(newProps) {
		if (!newProps.isPaletteOpen) {
			this.setState({ filterKeyword: "" });
		}
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
		// Hide category if clicked again
		if (this.state.selectedCategoryId !== catSelId) {
			this.setState({ selectedCategoryId: catSelId });
		} else {
			this.setState({ selectedCategoryId: "" });
		}
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
		this.setState({ filterKeyword: evt.target.value });
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
			var content = null;
			const nodeTypes = this.getNodeTypesForCategory(this.props.paletteJSON.categories, category.id);
			const filteredNodeTypes = this.filterNodeTypes(nodeTypes);
			if (this.state.selectedCategoryId === category.id && filteredNodeTypes.length > 0) {
				content = (
					<PaletteContentList
						style={style}
						show
						key={category.label + "-nodes"}
						categoryJSON={filteredNodeTypes}
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
						selectedCategoryId={this.state.selectedCategoryId}
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
