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
import PaletteFlyoutContent from "./palette-flyout-content.jsx";

class PaletteFlyout extends React.Component {
	constructor(props) {
		super(props);
		this.paletteNodes = [];
	}

	render() {
		let className = "palette-flyout-div";

		if (this.props.isPaletteWide) {
			className += " palette-flyout-div-open";
		} else {
			className += " palette-flyout-div-narrow";
		}

		return (
			<nav className="palette-nav"
				aria-label={this.props.intl.formatMessage({ id: "palette.flyout.label", defaultMessage: defaultMessages["palette.flyout.label"] })}
				role="navigation"
			>
				<div className={className}>
					<PaletteFlyoutContent
						canvasController={this.props.canvasController}
						paletteJSON={this.props.paletteJSON}
						paletteHeader={this.props.paletteHeader}
						isEditingEnabled={this.props.isEditingEnabled}
						isPaletteWide={this.props.isPaletteWide}
					/>
				</div>
			</nav>
		);
	}
}

PaletteFlyout.propTypes = {
	intl: PropTypes.object.isRequired,
	canvasController: PropTypes.object.isRequired,
	paletteJSON: PropTypes.object.isRequired,
	paletteHeader: PropTypes.object,
	isEditingEnabled: PropTypes.bool.isRequired,
	isPaletteWide: PropTypes.bool
};

export default injectIntl(PaletteFlyout);
