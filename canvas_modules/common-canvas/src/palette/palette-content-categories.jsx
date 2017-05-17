/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2016
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/

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
