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
import Icon from "../icons/icon.jsx";

class PaletteFlyoutContentCategory extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			categoryName: this.props.categoryName
		};

		this.categorySelected = this.categorySelected.bind(this);
	}

	categorySelected() {
		this.props.categorySelectedMethod(this.state.categoryName);
	}

	render() {
		let icon = <Icon type="downCaret" />;
		if (this.props.selectedCategory === this.props.categoryName) {
			icon = <Icon type="upCaret" />;
		}
		var itemCount = <div />;
		if (this.props.itemsFiltered && this.props.itemCount > 0) {
			itemCount = (
				<span className="palette-flyout-category-count">
					{"(" + this.props.itemCount + ")"}
				</span>
			);
		}
		var content = (
			<div className="palette-flyout-category" onClick={this.categorySelected} value={this.props.categoryName}>
				<div className="palette-flyout-text-container">
					<span className="palette-flyout-category-text">
						{this.props.categoryName}
					</span>
					{itemCount}
				</div>
				{icon}
			</div>
		);
		return content;
	}
}

PaletteFlyoutContentCategory.propTypes = {
	categoryName: PropTypes.string.isRequired,
	selectedCategory: PropTypes.string.isRequired,
	categorySelectedMethod: PropTypes.func.isRequired,
	itemCount: PropTypes.number.isRequired,
	itemsFiltered: PropTypes.bool.isRequired
};

export default PaletteFlyoutContentCategory;
