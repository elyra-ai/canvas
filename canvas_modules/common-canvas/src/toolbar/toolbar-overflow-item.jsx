/*
 * Copyright 2017-2022 Elyra Authors
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

class ToolbarOverflowItem extends React.Component {
	constructor(props) {
		super(props);
		this.toggleExtendedMenu = this.toggleExtendedMenu.bind(this);
	}

	toggleExtendedMenu() {
		this.props.toggleExtendedMenu(this.props.index);
	}

	render() {
		const menuItems = this.props.showExtendedMenu ? this.props.generateExtensionMenuItems(this.props.index) : [];
		const subMenuClassName = this.props.showExtendedMenu ? "" : "toolbar-popover-list-hide";

		let overflowMenu = null;
		if (menuItems.length > 0) {
			overflowMenu = (
				<div className={"toolbar-popover-list " + subMenuClassName}>
					{menuItems}
				</div>
			);
		}

		const className = "toolbar-spacer toolbar-index-" + this.props.index;
		return (
			<div className={className} >
				<div className={"toolbar-overflow-item"}>
					<Button kind="ghost"
						tabIndex={-1}
						onClick={this.toggleExtendedMenu}
						onFocus={this.props.onFocus}
						aria-label={this.props.label}
						size={this.props.size}
						hasIconOnly
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
	onFocus: PropTypes.func,
	label: PropTypes.string,
	size: PropTypes.oneOf(["md", "sm"])
};

export default ToolbarOverflowItem;
