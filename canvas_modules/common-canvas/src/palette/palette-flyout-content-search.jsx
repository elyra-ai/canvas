/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import { injectIntl } from "react-intl";
import PropTypes from "prop-types";
import defaultMessages from "../../locales/palette/locales/en.json";
import Search from "carbon-components-react/lib/components/Search";

class PaletteFlyoutContentSearch extends React.Component {

	constructor() {
		super();
		this.searchOnClick = this.searchOnClick.bind(this);
	}

	searchOnClick() {
		if (!this.props.isPaletteOpen) {
			this.props.canvasController.openPalette();
		}
	}

	render() {
		const placeHolder = this.props.intl.formatMessage({ id: "palette.flyout.search.placeholder", defaultMessage: defaultMessages["palette.flyout.search.placeholder"] });

		return (
			// palette-flyout-search id added for hopscotch tours
			<div className="palette-flyout-search-container" id="palette-flyout-search">
				<Search
					key="palette-flyout-search"
					className="palette-flyout-search"
					placeHolderText={placeHolder}
					onChange={this.props.handleFilterChange}
					size="sm"
					value={this.props.filterKeyword}
					labelText={placeHolder}
					onClick={this.searchOnClick}
				/>
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
