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

export default class ControlItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.getControl = this.getControl.bind(this);
    this.getLabel = this.getLabel.bind(this);
  }

  getControl() {
    return this.props.control;
  }

  getLabel() {
    return this.props.label;
  }

  render() {
    return (
      <div>
      {this.props.label}
      {this.props.control}
      </div>
    );
  }
}


ControlItem.propTypes = {
  control: React.PropTypes.object,
  label: React.PropTypes.object
};
