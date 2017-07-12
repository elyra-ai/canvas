/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PaletteContentCategory from "./palette-content-category.jsx";

class PaletteContentCategories extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		var catDivs = [];

		for (var idx = 0; idx < this.props.categories.length; idx++) {
			catDivs.push(
				<PaletteContentCategory
					key={this.props.categories[idx]}
					categoryName={this.props.categories[idx]}
					selectedCategory={this.props.selectedCategory}
					categorySelectedMethod={this.props.categorySelectedMethod}
				/>
			);
		}

		return (
			<div className="palette-categories palette-scroll">
				{catDivs}
			</div>
		);
	}
}

PaletteContentCategories.propTypes = {
	categories: React.PropTypes.array.isRequired,
	selectedCategory: React.PropTypes.string.isRequired,
	categorySelectedMethod: React.PropTypes.func.isRequired
};

export default PaletteContentCategories;
