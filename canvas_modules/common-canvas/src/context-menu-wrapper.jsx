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
import { ContextMenuLayer } from 'react-contextmenu';
import {Popover} from 'react-bootstrap';
import enhanceWithClickOutside from 'react-click-outside';


class ContextMenuWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    };

  }

  handleClickOutside(event) {
    if (this.props.handleClickOutside){
      this.props.handleClickOutside(event);
    }
  }

  render() {
    // Offset the context menu poisiton by 4 pixels. This moves the menu
    // underneat the pointer. On Firefox this stops the menu from immediately
    // disappearing becasue on FF the handleClickOutside is fired because the
    // mouse pointer is outside of the conetxt menu. On Chrome and Safari
    // (on the Mac) the system does not think the pointer is outside the menu.
    let s = {
      position:'absolute',
      left:this.props.positionLeft - 4 +'px',
      top:this.props.positionTop - 4 +'px',
      backgroundColor: '#1d3649',
      zIndex: '100'
    };


    return (
      <div className='context-menu-popover' style={s}>
          {this.props.contextMenu}
      </div>
    );
  }
}

ContextMenuWrapper.propTypes = {
  positionLeft:React.PropTypes.number.isRequired,
  positionTop:React.PropTypes.number.isRequired,
  contextMenu: React.PropTypes.array.isRequired,
  handleClickOutside:React.PropTypes.func
};

export default enhanceWithClickOutside(ContextMenuWrapper);
