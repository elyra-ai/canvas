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

import { v4 as uuid4 } from "uuid";
import { Button } from "carbon-components-react";
import { OverflowMenuVertical16 } from "@carbon/icons-react";
import ToolbarSubMenu from "./toolbar-sub-menu.jsx";

class ToolbarOverflowItem extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			showExtendedMenu: false
		};

		this.buttonRef = React.createRef();

		this.uuid = uuid4();
		this.toggleExtendedMenu = this.toggleExtendedMenu.bind(this);
		this.clickOutside = this.clickOutside.bind(this);
		this.closeSubMenu = this.closeSubMenu.bind(this);
	}

	componentDidUpdate() {
		if (this.props.toolbarFocusAction === this.props.action && this.props.isFocusInToolbar) {
			this.buttonRef.current.focus();
		}
	}

	// We must remove the eventListener in case this class is unmounted due
	// to the toolbar getting redrawn.
	componentWillUnmount() {
		document.removeEventListener("click", this.clickOutside, false);
	}

	// Called by toolbar.jsx
	getAction() {
		return this.props.action;
	}

	closeSubMenu() {
		this.setState({ showExtendedMenu: false });
	}

	genOverflowButtonClassName() {
		return "toolbar-overflow-container " + this.genIndexClassName() + " " + this.genUuidClassName();
	}

	genIndexClassName() {
		return "toolbar-index-" + this.props.index;
	}

	genUuidClassName() {
		return "toolbar-uuid-" + this.uuid;
	}

	toggleExtendedMenu() {
		if (this.state.showExtendedMenu) {
			document.removeEventListener("click", this.clickOutside, false);
		} else {
			document.addEventListener("click", this.clickOutside, false);
		}

		if (this.props.setResizeHandler) {
			if (this.state.showExtendedMenu) {
				this.props.setResizeHandler(null);
			} else {
				this.props.setResizeHandler(() => {
					this.setState({ showExtendedMenu: false });
				});
			}
		}

		// When the overflow item is clicked to open the overflow menu we must set the
		// index of the overflow items so the overflow menu can be correctly constructed.
		// The overflow index values are used to split out the overflow menu action items
		// from the left bar and right bar.
		// When the overflow menu is closed we set the overflow index values to null.
		if (!this.state.showExtendedMenu) {
			this.subMenu = this.props.setOverflowIndex(this.props.index);
		} else {
			this.subMenu = this.props.setOverflowIndex(null); // Clear the indexes
		}

		this.props.setFocusAction(this.props.action);
		this.setState({ showExtendedMenu: !this.state.showExtendedMenu });
	}

	clickOutside(evt) {
		if (this.state.showExtendedMenu) {
			// Selector for the overflow-container that contains the overflow icon
			// and submenu (if submenu is open).
			const selector = "." + this.genIndexClassName();
			const isClickInOverflowContainer = evt.target.closest(selector);
			if (!isClickInOverflowContainer) {
				this.setState({ showExtendedMenu: false });
			}
		}
	}

	render() {
		let overflowMenu = null;
		if (this.state.showExtendedMenu) {
			const actionItemRect = this.buttonRef.current.getBoundingClientRect();
			overflowMenu = (
				<ToolbarSubMenu
					ref={this.subMenuRef}
					subMenu={this.props.subMenuActions}
					generateSubMenuItems={this.props.generateSubMenuItems}
					closeSubArea={this.closeSubMenu}
					closeSubAreaOnClick={false}
					actionItemRect={actionItemRect}
					expandDirection={"vertical"}
					containingDivId={this.props.containingDivId}
					parentSelector={".toolbar-overflow-container"}
					isCascadeMenu={false}
				/>
			);
		}

		const tabIndex = this.props.toolbarFocusAction === this.props.action ? 0 : -1;

		return (
			<div className={this.genOverflowButtonClassName()} data-toolbar-action={this.props.action} onKeyDown={this.props.onKeyDown}>
				<div className={"toolbar-overflow-item"}>
					<Button
						ref={this.buttonRef}
						kind="ghost"
						tabIndex={tabIndex}
						onClick={this.toggleExtendedMenu}
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
	index: PropTypes.number.isRequired,
	action: PropTypes.string,
	label: PropTypes.string,
	size: PropTypes.oneOf(["md", "sm"]),
	subMenuActions: PropTypes.array,
	setOverflowIndex: PropTypes.func,
	generateSubMenuItems: PropTypes.func,
	setResizeHandler: PropTypes.func,
	containingDivId: PropTypes.string,
	onKeyDown: PropTypes.func,
	toolbarFocusAction: PropTypes.string,
	setFocusAction: PropTypes.func,
	isFocusInToolbar: PropTypes.bool
};

export default ToolbarOverflowItem;
