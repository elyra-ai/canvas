/*
 * Copyright 2025 Elyra Authors
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

class PaletteContentListItemBtn extends React.Component {

	render() {
		const less =
			this.props.intl.formatMessage({ id: this.props.id, defaultMessage: defaultMessages[this.props.id] });
		return (
			<div key="l_btn" className = "palette-list-item-desc-button" onClick={this.props.onClick}>
				{less}
			</div>
		);
	}
}

PaletteContentListItemBtn.propTypes = {
	intl: PropTypes.object.isRequired,
	id: PropTypes.string.isRequired,
	onClick: PropTypes.func.isRequired
};

export default injectIntl(PaletteContentListItemBtn);
