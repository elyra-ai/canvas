/*
 * Copyright 2017-2024 Elyra Authors
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

class ToolbarDividerItem extends React.Component {
	render() {
		const dividerClassName = this.props.isInMenu ? "toolbar-divider-overflow" : "toolbar-divider";

		// Add a space as content. When using display: inline-block the div needs
		// some content so it is displayed inline with the other elements of the
		// toolbar. With no content it is displayed above (!) the other elements.
		return (
			<div className={dividerClassName} tabIndex={-1} aria-hidden >&nbsp;</div>
		);
	}
}

ToolbarDividerItem.propTypes = {
	isInMenu: PropTypes.bool
};

export default ToolbarDividerItem;
