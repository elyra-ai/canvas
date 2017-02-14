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

import React from 'react'
import ReactDOM from 'react-dom'
import { ContextMenuLayer } from 'react-contextmenu'
import {DND_DATA_TEXT} from '../constants/common-constants.js';
import {Tooltip, OverlayTrigger} from 'react-bootstrap'

// export default class Link extends React.Component {
class Link extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      context: false
    };
    this.dragStart = this.dragStart.bind(this);
    //this.drag = this.drag.bind(this);
    this.dragEnd = this.dragEnd.bind(this);

    this.drop = this.drop.bind(this);

    this.showContext = this.showContext.bind(this);
  }

  dragStart(ev) {
    // ev.preventDefault();
    ev.dataTransfer.effectAllowed = 'move';
    //console.log("Link.dragStart(): x=" + ev.clientX + ",y=" + ev.clientY + ", node.id=" + this.props.link.id );
    //var invImg = document.getElementById("invisibleDiv"); // defined in canvas.jsx
    //ev.dataTransfer.setDragImage(invImg, 0, 0);
    ev.dataTransfer.setData(DND_DATA_TEXT,
      JSON.stringify({
        operation: 'moveLink',
        id: this.props.link.id,
       }));
  }

  dragEnd(ev) {
    //console.log("Link.dragEnd(): x=" + ev.clientX + ",y=" + ev.clientY);
    //console.log(ev);
  }

  drop(ev) {
    //console.log("Link.drop()");
    //console.log(ev);
    //console.log(ev.dataTransfer.getData(DND_DATA_TEXT));
    this.props.linkActionHandler('dropOnLink', ev);
  }

  showContext(ev) {
    console.log("showContext()");
    console.log(ev);
    this.setState({ context: true });
  }

  render() {
    console.log("Link.render(): x=" + this.props.xPos + ", y=" + this.props.yPos);
    console.log(this.props.link);
    let zoom = this.props.uiconf.zoom;

    var linkStyle = {
      position: 'absolute',
      top: this.props.yPos,
      left: this.props.xPos,
      width: this.props.uiconf.connSize,
      height: this.props.uiconf.connSize
    };

    var linkIconStyle = {
      //position: 'absolute',
      width: this.props.uiconf.connSize,
      height: this.props.uiconf.connSize,
      top: 0,
      left: 0
      //top: this.props.uiconf.connOffsets.top,
      //left: this.props.uiconf.connOffsets.inLeft,
    };

    let connectorImage = "/canvas/images/carat-breadcrumb.svg";

    var linkIcon = <img
        className="canvas-link-icon"
        src={connectorImage}
        style={linkIconStyle}
        draggable="true"
        onDragStart={this.dragStart.bind(null, 'link')}
        onDragEnd={this.dragEnd.bind(null, 'link')}
        onClick={this.props.linkActionHandler.bind(null, 'link')}
        />;

    var className = "canvas-link";

    return (
      <div className={className} style={linkStyle}>
        {linkIcon}
      </div>
    );
  }
}

Link.propTypes = {
  link: React.PropTypes.object,
  xPos: React.PropTypes.number,
  yPos: React.PropTypes.number,
  linkActionHandler: React.PropTypes.func,
  uiconf: React.PropTypes.object
};

export default ContextMenuLayer("linkContextMenu", (props) => props)(Link);
