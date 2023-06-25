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

import { Button } from "carbon-components-react";
import { OverflowMenuVertical16 } from "@carbon/icons-react";
import { genElementByClass, genRectByClass } from "./toolbar-utils.js";

class ToolbarOverflowItem extends React.Component {
	constructor(props) {
		super(props);
		this.toggleExtendedMenu = this.toggleExtendedMenu.bind(this);
	}

	componentDidUpdate(prevProps) {
		if (prevProps.containingDivId && this.props.showExtendedMenu) {
			this.setSubAreaStyle(prevProps);
		}
	}

	setSubAreaStyle(prevProps) {
		const containingDiv = document.getElementById(this.props.containingDivId);
		const containingDivRect = containingDiv.getBoundingClientRect();

		const mainMenu = genElementByClass("toolbar-popover-list", containingDiv);
		const mainMenuRect = genRectByClass("toolbar-popover-list", containingDiv);

		if (mainMenuRect) {
			const overflowButtonRect = genRectByClass(this.genOverflowButtonsClass(), containingDiv);

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

	genOverflowButtonsClass() {
		return "toolbar-spacer toolbar-index-" + this.props.index;
	}

	toggleExtendedMenu() {
		this.props.toggleExtendedMenu(this.props.index);
	}

	render() {
		let overflowMenu = null;
		if (this.props.showExtendedMenu) {
			const menuItems = this.props.generateExtensionMenuItems(this.props.index);
			if (menuItems.length > 0) {
				overflowMenu = (
					<div className={"toolbar-popover-list"}>
						{menuItems}
					</div>
				);
			}
		}

		return (
			<div className={this.genOverflowButtonsClass()} >
				<div className={"toolbar-overflow-item"}>
					<Button kind="ghost"
						tabIndex={-1}
						onClick={this.toggleExtendedMenu}
						onFocus={this.props.onFocus}
						aria-label={this.props.label}
						size={this.props.size}
					>
						<div className="toolbar-item-content default">
							<div className="toolbar-icon">
								<OverflowMenuVertical16 />
							</div>
						</div>
					</Button>
				</div>
				{overflowMenu}
			</div>
		);
	}
}

ToolbarOverflowItem.propTypes = {
	showExtendedMenu: PropTypes.bool.isRequired,
	toggleExtendedMenu: PropTypes.func.isRequired,
	index: PropTypes.number.isRequired,
	generateExtensionMenuItems: PropTypes.func,
	containingDivId: PropTypes.string,
	onFocus: PropTypes.func,
	label: PropTypes.string,
	size: PropTypes.oneOf(["md", "sm"])
};

export default ToolbarOverflowItem;
