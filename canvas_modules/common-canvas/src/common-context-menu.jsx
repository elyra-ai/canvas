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
import {ContextMenu, MenuItem } from 'react-contextmenu';

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

  render() {
    const customDivider = {
      className: 'customDivider'
    };

    var menuItems = [];
    for (var i = 0; i < this.props.menuDefinition.length; ++i) {
      const divider = this.props.menuDefinition[i].divider;
      if (divider) {
        menuItems.push(<MenuItem attributes={customDivider} key={i+1} divider/>);
      }
      else {
        let data = {action: this.props.menuDefinition[i].action};
        menuItems.push(<MenuItem
          data={data}
          onClick={this.itemSelected.bind(null, data)}
          key={i+1}>
          {this.props.menuDefinition[i].label}
        </MenuItem>);
      }
    }

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
