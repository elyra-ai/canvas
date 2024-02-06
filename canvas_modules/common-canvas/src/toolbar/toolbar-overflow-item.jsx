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
import ToolbarOverflowMenu from "./toolbar-overflow-menu.jsx";

class ToolbarOverflowItem extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			showExtendedMenu: false
		};
		this.uuid = uuid4();
		this.toggleExtendedMenu = this.toggleExtendedMenu.bind(this);
		this.clickOutside = this.clickOutside.bind(this);
	}

	// We must remove the eventListener in case this class is unmounted due
	// to the toolbar getting redrawn.
	componentWillUnmount() {
		document.removeEventListener("click", this.clickOutside, false);
	}

	genOverflowButtonClass() {
		return "toolbar-spacer toolbar-index-" + this.props.index + " toolbar-uuid-" + this.uuid;
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

		this.setState({ showExtendedMenu: !this.state.showExtendedMenu });
	}

	clickOutside(evt) {
		if (this.state.showExtendedMenu) {
			const items = document.getElementsByClassName("toolbar-uuid-" + this.uuid);
			const isOver = items && items.length > 0 ? items[0].contains(evt.target) : false;

			if (!isOver) {
				this.setState({ showExtendedMenu: false });
			}
		}
	}

	render() {
		if (this.props.setResizeHandler && !this.state.showExtendedMenu) {
			this.props.setResizeHandler(null);
		}

		let overflowMenu = null;
		if (this.state.showExtendedMenu) {
			const menuItems = this.props.generateExtensionMenuItems(this.props.index);
			overflowMenu = (
				<ToolbarOverflowMenu
					menuItems={menuItems}
					containingDivId={this.props.containingDivId}
					buttonClass={"toolbar-uuid-" + this.uuid}
				/>
			);
		}

		return (
			<div className={this.genOverflowButtonClass()} >
				<div className={"toolbar-overflow-item"}>
					<Button kind="ghost"
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
	index: PropTypes.number.isRequired,
	generateExtensionMenuItems: PropTypes.func,
	setResizeHandler: PropTypes.func,
	containingDivId: PropTypes.string,
	onFocus: PropTypes.func,
	label: PropTypes.string,
	size: PropTypes.oneOf(["md", "sm"])
};

export default ToolbarOverflowItem;
