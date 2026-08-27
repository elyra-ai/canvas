/*
 * Copyright 2024 Elyra Authors
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
import KeyboardUtils from "../common-canvas/keyboard-utils.js";
import defaultMessages from "../../locales/palette/locales/en.json";

class PaletteContentListItemBtn extends React.Component {
	constructor(props) {
		super(props);

		this.onClick = this.onClick.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
	}

	onClick(evt) {
		// Stop the click reaching the parent palette list item which would
		// otherwise add a node to the canvas.
		evt.stopPropagation();
		this.props.onClick(evt);
	}

	onKeyDown(evt) {
		// Enter and Space activate the button (which generates a click event) so
		// stop those keys reaching the parent palette list item which would
		// otherwise add a node to the canvas.
		if (KeyboardUtils.createAutoNode(evt) || KeyboardUtils.createAutoNodeNoLink(evt)) {
			evt.stopPropagation();
		}
	}

	render() {
		const less =
			this.props.intl.formatMessage({ id: this.props.id, defaultMessage: defaultMessages[this.props.id] });
		return (
			<button key="l_btn" type="button" className="palette-list-item-desc-button"
				onClick={this.onClick} onKeyDown={this.onKeyDown}
			>
				{less}
			</button>
		);
	}
}

PaletteContentListItemBtn.propTypes = {
	intl: PropTypes.object.isRequired,
	id: PropTypes.string.isRequired,
	onClick: PropTypes.func.isRequired
};

export default injectIntl(PaletteContentListItemBtn);
