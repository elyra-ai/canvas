/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import DownIcon from "../../assets/images/down_enabled.svg";
import UpIcon from "../../assets/images/up_enabled.svg";

const ARROW_HEIGHT = 14;
const ARROW_WIDTH = 14;

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
		var style = "palette-flyout-category";
		var image = <img className="palette-flyout-category-arrow" src={DownIcon} height={ARROW_HEIGHT} width={ARROW_WIDTH} />;
		if (this.props.selectedCategory === this.props.categoryName) {
			style = "palette-flyout-category-selected";
			image = <img className="palette-flyout-category-arrow" src={UpIcon} height={ARROW_HEIGHT} width={ARROW_WIDTH} />;
		}
		const id = "palette-flyout-category-" + this.props.categoryName.replace(/\s/g, "-");
		var content = (
			<div className={style} id={id} onClick={this.categorySelected} value={this.props.categoryName}>
					{this.props.categoryName + " (" + this.props.itemCount + ")"} {image}
			</div>
		);
		return content;
	}
}

PaletteFlyoutContentCategory.propTypes = {
	categoryName: React.PropTypes.string.isRequired,
	selectedCategory: React.PropTypes.string.isRequired,
	categorySelectedMethod: React.PropTypes.func.isRequired,
	itemCount: React.PropTypes.number.isRequired
};

export default PaletteFlyoutContentCategory;
