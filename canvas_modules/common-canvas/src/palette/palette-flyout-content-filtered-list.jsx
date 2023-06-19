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
import PropTypes from "prop-types";
import { injectIntl } from "react-intl";
import defaultMessages from "../../locales/palette/locales/en.json";
import PaletteContentListItem from "./palette-content-list-item.jsx";

class PaletteFlyoutContentFilteredList extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	getNoResultsDiv() {
		const noResultsFound = this.props.intl.formatMessage({ id: "palette.flyout.search.noresults", defaultMessage: defaultMessages["palette.flyout.search.noresults"] });
		const adjustSearch = this.props.intl.formatMessage({ id: "palette.flyout.search.adjustsearch", defaultMessage: defaultMessages["palette.flyout.search.adjustsearch"] });
		return (
			<div>
				<div className="palette-no-results-title">{noResultsFound}</div>
				<br />
				<div className="palette-no-results-desc">{adjustSearch}</div>
			</div>
		);
	}

	getContentListDiv() {
		const contentItems = [];

		for (var idx = 0; idx < this.props.nodeTypeInfos.length; idx++) {
			var itemKey = "item_" + idx;

			contentItems.push(
				<div key={itemKey}>
					<PaletteContentListItem
						nodeTypeInfo={this.props.nodeTypeInfos[idx]}
						isDisplaySearchResult
						isShowRanking={this.props.isShowRanking}
						canvasController={this.props.canvasController}
						isPaletteOpen={this.props.isPaletteOpen}
						isEditingEnabled={this.props.isEditingEnabled}
					/>
				</div>
			);
		}

		if (this.props.isNodeTypeInfosArrayTruncated) {
			const resultsRestricted =
				this.props.intl.formatMessage({ id: "palette.flyout.search.resultsrestricted", defaultMessage: defaultMessages["palette.flyout.search.resultsrestricted"] });
			contentItems.push(
				<div key="restrict-item" className="palette-flyout-restrict-item">{resultsRestricted}</div>
			);
		}

		return (
			<div width="100%" draggable="false" className="palette-scroll">
				{contentItems}
			</div>
		);
	}

	render() {
		return this.props.nodeTypeInfos.length === 0
			? this.getNoResultsDiv()
			: this.getContentListDiv();
	}
}

PaletteFlyoutContentFilteredList.propTypes = {
	intl: PropTypes.object.isRequired,
	nodeTypeInfos: PropTypes.array.isRequired,
	canvasController: PropTypes.object.isRequired,
	isPaletteOpen: PropTypes.bool.isRequired,
	isEditingEnabled: PropTypes.bool.isRequired,
	isNodeTypeInfosArrayTruncated: PropTypes.bool,
	isShowRanking: PropTypes.bool
};

export default injectIntl(PaletteFlyoutContentFilteredList);
