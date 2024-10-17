/*
 * Copyright 2017-2023 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react";
import { injectIntl } from "react-intl";
import PropTypes from "prop-types";
import defaultMessages from "../../locales/palette/locales/en.json";
import { Search } from "@carbon/react";

class PaletteFlyoutContentSearch extends React.Component {

	constructor() {
		super();

		this.state = {
			searchString: ""
		};
		this.searchOnClick = this.searchOnClick.bind(this);
		this.handleSearchStringChange = this.handleSearchStringChange.bind(this);
	}

	handleSearchStringChange(evt) {
		const value = evt.target.value || "";
		this.setState({ searchString: value },
			() => this.props.handleSearchStringChange(value)
		);
	}

	searchOnClick() {
		if (!this.props.isPaletteWide) {
			this.props.canvasController.openPalette();
		}
	}

	render() {
		const placeHolder = this.props.intl.formatMessage({ id: "palette.flyout.search.placeholder", defaultMessage: defaultMessages["palette.flyout.search.placeholder"] });

		return (
			// palette-flyout-search id added for hopscotch tours
			<div className="palette-flyout-search-container" id="palette-flyout-search-container">
				<Search
					id="palette-flyout-search"
					className="palette-flyout-search"
					placeholder={placeHolder}
					onChange={this.handleSearchStringChange}
					size="sm"
					value={this.state.searchString}
					labelText={placeHolder}
					onClick={this.searchOnClick}
				/>
			</div>
		);
	}
}

PaletteFlyoutContentSearch.propTypes = {
	intl: PropTypes.object.isRequired,
	handleSearchStringChange: PropTypes.func.isRequired,
	isPaletteWide: PropTypes.bool,
	canvasController: PropTypes.object.isRequired
};

export default injectIntl(PaletteFlyoutContentSearch);
