/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

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
