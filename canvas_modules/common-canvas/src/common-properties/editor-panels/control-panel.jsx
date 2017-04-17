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
import {FormattedMessage} from 'react-intl'
import {Panel} from 'react-bootstrap'

export default class ControlPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.getControlValue = this.getControlValue.bind(this);
  }

  getControlValue() {
    return this.props.control.getControlValue();
  }

  render() {
    return (
      <div className="well">
        <form>
        <label className="control-label"><FormattedMessage id={this.props.labelId}/></label>
        {this.props.control}
        </form>
      </div>
    );
  }
}

ControlPanel.propTypes = {
  labelId: React.PropTypes.string,
  control: React.PropTypes.object
};
