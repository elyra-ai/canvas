/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2016
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/
/* eslint no-empty-function: ["error", { "allow": ["arrowFunctions"] }] */
/* eslint no-shadow: ["error", { "allow": ["event"] }] */

import React from "react";
import { MenuItem, SubMenu } from "react-contextmenu";

class CommonContextMenu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.itemSelected = this.itemSelected.bind(this);
	}

	itemSelected(data, event) {
		this.props.contextHandler(data);
		// This stops the canvasClicked function from being fired which would
		// clear any current selections.
		if (event) {
			event.stopPropagation();
			event.nativeEvent.stopImmediatePropagation();
		}
	}

	buildMenu(menuDefinition) {
		const customDivider = {
			className: "customDivider"
		};

		const menuItems = [];
		for (let i = 0; i < menuDefinition.length; ++i) {
			const divider = menuDefinition[i].divider;
			const submenu = menuDefinition[i].submenu;
			if (divider) {
				menuItems.push(<MenuItem attributes={customDivider} key={i + 1} onClick={() => {}} divider />);
			} else if (submenu) {
				const submenuItems = this.buildMenu(menuDefinition[i].menu);
				menuItems.push(
					<SubMenu title={menuDefinition[i].label} key={i + 1}>
						{submenuItems}
					</SubMenu>
				);
			} else {
				menuItems.push(
					<MenuItem onClick={this.itemSelected.bind(null, menuDefinition[i].action)} key={i + 1}>
						{menuDefinition[i].label}
					</MenuItem>
				);
			}
		}
		return menuItems;
	}

	render() {
		const menuItems = this.buildMenu(this.props.menuDefinition);

		return (
			<div>
				{menuItems}
			</div>
		);
	}
}

CommonContextMenu.propTypes = {
	contextHandler: React.PropTypes.func,
	menuDefinition: React.PropTypes.array
};

export default CommonContextMenu;
