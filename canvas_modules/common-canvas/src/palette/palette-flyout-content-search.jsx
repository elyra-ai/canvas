/*
 * Copyright 2017-2019 IBM Corporation
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
import PropTypes from "prop-types";
import Icon from "../icons/icon.jsx";
import TextInput from "carbon-components-react/lib/components/TextInput";

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
	handleFilterChange: PropTypes.func.isRequired,
	filterKeyword: PropTypes.string.isRequired,
	isPaletteOpen: PropTypes.bool.isRequired,
	canvasController: PropTypes.object.isRequired
};

export default PaletteFlyoutContentSearch;
