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

class PaletteContentCategory extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};

		this.categorySelected = this.categorySelected.bind(this);
	}


	categorySelected(catSelEvent) {
		this.props.categorySelectedMethod(catSelEvent);
	}

	render() {
		var style = "palette-category";

		if (this.props.selectedCategory === this.props.categoryName) {
			style = "palette-category-selected";
		}

		return (
			<div className={style} onClick={this.categorySelected}>
				{this.props.categoryName}
			</div>
		);
	}
}

PaletteContentCategory.propTypes = {
	categoryName: PropTypes.string.isRequired,
	selectedCategory: PropTypes.string.isRequired,
	categorySelectedMethod: PropTypes.func.isRequired
};

export default PaletteContentCategory;
