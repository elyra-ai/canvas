/*
 * Copyright 2020 IBM Corporation
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

import Icon from "../icons/icon.jsx";
import { Button } from "carbon-components-react";
import { CANVAS_CARBON_ICONS } from "../common-canvas/constants/canvas-constants";

class ToolbarExtensionItem extends React.Component {
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

		return (
			<div className="toolbar-spacer" tabIndex={-1} >
				<div className={"toolbar-overflow-item"} tabIndex={1} >
					<Button kind="ghost"
						onClick={this.toggleExtendedMenu}
					>
						<div className="toolbar-item-content default">
							<div className="toolbar-icon">
								<Icon type={CANVAS_CARBON_ICONS.OVERFLOWMENU} noAddedClasses />
							</div>
						</div>
					</Button>
				</div>
				{overflowMenu}
			</div>
		);
	}
}

ToolbarExtensionItem.propTypes = {
	showExtendedMenu: PropTypes.bool.isRequired,
	toggleExtendedMenu: PropTypes.func.isRequired,
	index: PropTypes.number.isRequired,
	generateExtensionMenuItems: PropTypes.func
};

export default ToolbarExtensionItem;
