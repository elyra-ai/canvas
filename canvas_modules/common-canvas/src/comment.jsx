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
import {DND_DATA_TEXT} from '../constants/common-constants.js';

class Comment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      context: false
    };
    this.dragStart = this.dragStart.bind(this);
    //this.drag = this.drag.bind(this);
    this.dragEnd = this.dragEnd.bind(this);

    this.drop = this.drop.bind(this);

    this.commentClicked = this.commentClicked.bind(this);
    this.commentDblClicked = this.commentDblClicked.bind(this);
    this.showContext = this.showContext.bind(this);
  }

  dragStart(ev) {
    // ev.preventDefault();
    ev.dataTransfer.effectAllowed = 'move';
    //console.log("Comment.dragStart(): x=" + ev.clientX + ",y=" + ev.clientY + ", comment.id=" + this.props.comment.id );
    //var invImg = document.getElementById("invisibleDiv"); // defined in canvas.jsx
    //ev.dataTransfer.setDragImage(invImg, 0, 0);
    ev.dataTransfer.setData(DND_DATA_TEXT,
      JSON.stringify({
        operation: 'move',
        id: this.props.comment.id,
        label: this.props.comment.text
       }));
  }

  dragEnd(ev) {
    //console.log("Comment.dragEnd(): x=" + ev.clientX + ",y=" + ev.clientY);
    //console.log(ev);
  }

  drop(ev) {
    //console.log("Comment.drop()");
    //console.log(ev);
    //console.log(ev.dataTransfer.getData(DND_DATA_TEXT));
    this.props.commentActionHandler('dropOnComment', ev);
  }

  commentClicked(ev) {
    // console.log("Comment.commentClicked()");
    ev.stopPropagation();
    // comment is already bound
    this.props.commentActionHandler('selected', ev);
  }

  commentDblClicked(ev) {
    //console.log("Comment.commentDblClicked()");
    //console.log(ev)
    ev.stopPropagation();
    this.props.commentActionHandler('editComment', ev);
  }

  showContext(ev) {
    this.setState({ context: true });
  }

  render() {
    // console.log("Comment.render()");
    // console.log(this.props.comment);
    let zoom = this.props.zoom;

    var commentStyle = {
      position: 'absolute',
      top: Math.round(this.props.comment.yPos * zoom),
      left: Math.round(this.props.comment.xPos * zoom),
      width: Math.round(this.props.comment.width * zoom),
      height: Math.round(this.props.comment.height * zoom),
      fontSize: this.props.fontSize,
      background: this.props.comment.background,
      color: this.props.comment.foreground,
      lineHeight: 1.0,
      overflow: 'hidden'
    };

    var className = "canvas-comment";
    if (this.props.selected) {
      className += " selected";
    }

    return (
      <div className={className}
          style={commentStyle}
          draggable="true"
          onDragStart={this.dragStart}
          onDragEnd={this.dragEnd}
          onDrop={this.drop}
          onClick={this.commentClicked}
          onDoubleClick={this.commentDblClicked}
          onContextMenu={this.props.onContextMenu}
          >{this.props.comment.text}
      </div>
    );
  }
}

Comment.propTypes = {
  comment: React.PropTypes.object,
  commentActionHandler: React.PropTypes.func,
  onContextMenu: React.PropTypes.func,
  fontSize: React.PropTypes.number,
  zoom: React.PropTypes.number,
  selected: React.PropTypes.bool
};

export default Comment;
