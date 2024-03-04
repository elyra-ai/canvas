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

import { v4 as uuid4 } from "uuid";
import { Button } from "@carbon/react";
import { OverflowMenuVertical } from "@carbon/react/icons";
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
		if (this.props.toolbarFocusAction === this.props.action && this.props.isFocusInToolbar && !this.state.showExtendedMenu) {
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

	openSubMenu() {
		this.setState({ showExtendedMenu: true });
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

	// When the overflow item is clicked to open the overflow menu we must set the
	// index of the overflow items so the overflow menu can be correctly constructed.
	// The overflow index values are used to split out the overflow menu action items
	// from the left bar and right bar.
	// When the overflow menu is closed we set the overflow index values to null.
	toggleExtendedMenu() {
		if (this.state.showExtendedMenu) {
			document.removeEventListener("click", this.clickOutside, false);
			this.props.setOverflowIndex(null); // Clear the indexes
			this.closeSubMenu();
			this.props.setToolbarFocusAction(this.props.action); // This will not set focus on this item

		} else {
			document.addEventListener("click", this.clickOutside, false);
			this.props.closeAnyOpenSubArea();
			this.props.setOverflowIndex(this.props.index);
			this.openSubMenu();
			this.props.setToolbarFocusAction(this.props.action);
		}
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
					subMenuActions={this.props.subMenuActions}
					instanceId={this.props.instanceId}
					toolbarActionHandler={this.props.toolbarActionHandler}
					closeSubArea={this.closeSubMenu}
					setToolbarFocusAction={this.props.setToolbarFocusAction}
					actionItemRect={actionItemRect}
					expandDirection={"vertical"}
					containingDivId={this.props.containingDivId}
					parentSelector={".toolbar-overflow-container"}
					isOverflowMenu
					isCascadeMenu={false}
					size={this.props.size}
				/>
			);
		}

		const tabIndex = this.props.toolbarFocusAction === this.props.action ? 0 : -1;

		return (
			<div className={this.genOverflowButtonClassName()} data-toolbar-action={this.props.action}>
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
								<OverflowMenuVertical />
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
	toolbarActionHandler: PropTypes.func,
	instanceId: PropTypes.number.isRequired,
	containingDivId: PropTypes.string,
	toolbarFocusAction: PropTypes.string,
	setToolbarFocusAction: PropTypes.func,
	isFocusInToolbar: PropTypes.bool,
	closeAnyOpenSubArea: PropTypes.func
};

export default ToolbarOverflowItem;
