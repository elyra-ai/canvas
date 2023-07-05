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

// import { v4 as uuid4 } from "uuid";
// import { Button } from "carbon-components-react";
// import { OverflowMenuVertical16 } from "@carbon/icons-react";
import { genElementByClass, genRectByClass } from "./toolbar-utils.js";

class ToolbarOverflowMenu extends React.Component {

	componentDidMount() {
		if (this.props.containingDivId) {
			this.setSubAreaStyle();
		}
	}

	setSubAreaStyle() {
		const containingDiv = document.getElementById(this.props.containingDivId);
		const containingDivRect = containingDiv.getBoundingClientRect();

		const mainMenu = genElementByClass("toolbar-popover-list", containingDiv);
		const mainMenuRect = genRectByClass("toolbar-popover-list", containingDiv);

		if (mainMenuRect) {
			const overflowButtonRect = genRectByClass(this.props.buttonClass, containingDiv);

			if (overflowButtonRect) {
				const contextToolbaRect = genRectByClass("context-toolbar", containingDiv);

				if (contextToolbaRect) {
					const outsideRight = mainMenuRect.right - containingDivRect.right;
					if (outsideRight > 0) {
						const overflowIconOffsetX = overflowButtonRect.left - contextToolbaRect.left;
						mainMenu.style.left = (overflowIconOffsetX - outsideRight - 2) + "px";
					}

					const outsideBottom = mainMenuRect.bottom - containingDivRect.bottom;
					if (outsideBottom > 0) {
						mainMenu.style.top = -mainMenuRect.height + "px";
					}
				}
			}
		}
	}

	render() {
		let overflowMenu = null;
		if (this.props.menuItems.length > 0) {
			overflowMenu = (
				<div className={"toolbar-popover-list"}>
					{this.props.menuItems}
				</div>
			);
		}
		return overflowMenu;
	}
}

ToolbarOverflowMenu.propTypes = {
	menuItems: PropTypes.array.isRequired,
	containingDivId: PropTypes.string,
	buttonClass: PropTypes.string
};

export default ToolbarOverflowMenu;
