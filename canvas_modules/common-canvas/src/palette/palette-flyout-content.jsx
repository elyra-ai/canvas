/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import PaletteFlyoutContentCategory from "./palette-flyout-content-category.jsx";
import PaletteContentList from "./palette-content-list.jsx";
import search32 from "../../assets/images/search_32.svg";
import { TextField } from "ap-components-react/dist/ap-components-react";

class PaletteFlyoutContent extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedCategory: "",
			filterKeyword: ""
		};

		this.categorySelected = this.categorySelected.bind(this);
		this.getCategories = this.getCategories.bind(this);
		this.getNodeTypesForCategory = this.getNodeTypesForCategory.bind(this);
		this.handleFilterChange = this.handleFilterChange.bind(this);
	}

	getCategories(categories) {
		var out = [];
		if (categories) {
			for (const category of categories) {
				if (out.indexOf(category.label) === -1) {
					out.push(category.label);
				}
			}
		}
		return out;
	}

	getNodeTypesForCategory(categories, catLabel) {
		var out = [];
		if (categories) {
			for (const category of categories) {
				if (category.label === catLabel) {
					out = category.nodetypes;
				}
			}
		}
		return out;
	}

	categorySelected(catSelEvent) {
		// Hide category if clicked again
		if (this.state.selectedCategory !== catSelEvent) {
			this.setState({ selectedCategory: catSelEvent });
		} else {
			this.setState({ selectedCategory: "" });
		}
	}
	filterNodeTypes(nodeTypes) {
		var filteredNodeTypes = [];
		if (nodeTypes) {
			for (const nodeType of nodeTypes) {
				if (nodeType.label.toLowerCase().indexOf(this.state.filterKeyword.toLowerCase()) > -1) {
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
			const nodeTypes = this.getNodeTypesForCategory(this.props.paletteJSON.categories, category);
			const filteredNodeTypes = this.filterNodeTypes(nodeTypes);
			if (this.state.selectedCategory === category && filteredNodeTypes.length > 0) {
				content = (
					<PaletteContentList
						style={style}
						show
						key={category + "-nodes"}
						categoryJSON={filteredNodeTypes}
					/>);
			}
			var itemsFiltered = false;
			if (this.state.filterKeyword) {
				itemsFiltered = true;
			}
			contentDivs.push(
				<div key={category + "-container"}>
					<PaletteFlyoutContentCategory
						key={category}
						categoryName={category}
						selectedCategory={this.state.selectedCategory}
						categorySelectedMethod={this.categorySelected}
						itemCount={filteredNodeTypes.length}
						itemsFiltered={itemsFiltered}
					/>
					{content}
				</div>
			);
		}
		const placeHolder = "Search Nodes";
		const value = this.state.filterKeyword;
		return (
			<div className="palette-flyout-content">
				<div id="palette-flyout-search">
					<div id="palette-flyout-search-bar">
						<TextField
							key="palette-flyout-search-text"
							type="search"
							id="palette-flyout-search-text"
							placeholder={placeHolder}
							disabledPlaceholderAnimation
							onChange={this.handleFilterChange}
							value={value}
						/>
					</div>
					<div id="palette-flyout-search-icon">
						<img id="palette-flyout-search-icon" src={search32} />
					</div>
				</div>
				{contentDivs}
			</div>
		);
	}
}

PaletteFlyoutContent.propTypes = {
	paletteJSON: PropTypes.object.isRequired
};

export default PaletteFlyoutContent;
