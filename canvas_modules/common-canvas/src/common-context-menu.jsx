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

import React from 'react';
import ReactDOM from 'react-dom';
import { MenuItem, SubMenu } from 'react-contextmenu';

class CommonContextMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.itemSelected = this.itemSelected.bind(this);
  }

  itemSelected(data) {
    console.log("CanvasContextMenu.itemSelected");
    console.log(data);
    this.props.contextHandler(data.action);
  }

  buildMenu(menuDefinition) {
    const customDivider = {
      className: 'customDivider'
    };

    let menuItems = [];
    for (let i = 0; i < menuDefinition.length; ++i) {
      const divider = menuDefinition[i].divider;
      const submenu = menuDefinition[i].submenu;
      if (divider) {
        menuItems.push(<MenuItem attributes={customDivider} key={i+1} divider/>);
      }
      else if (submenu) {
        let submenuItems = this.buildMenu(menuDefinition[i].menu);
        menuItems.push(<SubMenu title={menuDefinition[i].label}>
            {submenuItems}
          </SubMenu>);
      }
      else {
        let data = {action: menuDefinition[i].action};
        menuItems.push(<MenuItem
          data={data}
          onClick={this.itemSelected.bind(null, data)}
          key={i+1}>
          {menuDefinition[i].label}
        </MenuItem>);
      }
    }
    return menuItems;
  }

  render() {
    let menuItems = this.buildMenu(this.props.menuDefinition);

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
