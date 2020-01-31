/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import { injectIntl } from "react-intl";
import PropTypes from "prop-types";
import Icon from "../icons/icon.jsx";
import TextInput from "carbon-components-react/lib/components/TextInput";
import defaultMessages from "../../locales/palette/locales/en.json";


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
		const placeHolder = this.props.intl.formatMessage({ id: "palette.flyout.search.placeholder", defaultMessage: defaultMessages["palette.flyout.search.placeholder"] });

		let searchField = null;

		if (this.props.isPaletteOpen) {
			searchField = (
				<TextInput
					key="palette-flyout-search-text"
					id="palette-flyout-search-text"
					placeholder={placeHolder}
					onChange={this.props.handleFilterChange}
					value={this.props.filterKeyword}
					labelText={placeHolder}
					hideLabel
				/>
			);
		}

		const searchIcon = (
			<div className="palette-flyout-search-icon" onClick={this.iconClicked}>
				<Icon type="search" size="20px" />
			</div>
		);

		return (
			// palette-flyout-search id added for hopscotch tours
			<div className="palette-flyout-search" id="palette-flyout-search">
				{searchField}
				{searchIcon}
			</div>
		);
	}
}

PaletteFlyoutContentSearch.propTypes = {
	intl: PropTypes.object.isRequired,
	handleFilterChange: PropTypes.func.isRequired,
	filterKeyword: PropTypes.string.isRequired,
	isPaletteOpen: PropTypes.bool.isRequired,
	canvasController: PropTypes.object.isRequired
};

export default injectIntl(PaletteFlyoutContentSearch);
