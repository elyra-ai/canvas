/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";

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
	categoryName: React.PropTypes.string.isRequired,
	selectedCategory: React.PropTypes.string.isRequired,
	categorySelectedMethod: React.PropTypes.func.isRequired
};

export default PaletteContentCategory;
