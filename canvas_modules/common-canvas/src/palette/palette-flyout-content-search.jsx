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
import Icon from "../icons/icon.jsx";
import TextField from "ap-components-react/dist/components/TextField";

class PaletteFlyoutContentSearch extends React.Component {

	constructor() {
		super();
		this.iconClicked = this.iconClicked.bind(this);
	}

	iconClicked() {
		if (this.props.isPaletteOpen) {
			this.props.canvasController.closePalette();
		} else {
			this.props.canvasController.openPalette();
		}
	}

	render() {
		const placeHolder = "Search Palette";

		let searchField = null;

		if (this.props.isPaletteOpen) {
			searchField = (
				<div className="palette-flyout-search-bar">
					<TextField
						key="palette-flyout-search-text"
						type="search"
						className="palette-flyout-search-text"
						placeholder={placeHolder}
						disabledPlaceholderAnimation
						onChange={this.props.handleFilterChange}
						value={this.props.filterKeyword}
					/>
				</div>
			);
		}

		const searchIcon = (
			<div className="palette-flyout-search-icon" onClick={this.iconClicked}>
				<Icon type="search" size="20px" />
			</div>
		);

		return (
			<div className="palette-flyout-search">
				{searchField}
				{searchIcon}
			</div>
		);
	}
}

PaletteFlyoutContentSearch.propTypes = {
	handleFilterChange: PropTypes.func.isRequired,
	filterKeyword: PropTypes.string.isRequired,
	isPaletteOpen: PropTypes.bool.isRequired,
	canvasController: PropTypes.object.isRequired
};

export default PaletteFlyoutContentSearch;
