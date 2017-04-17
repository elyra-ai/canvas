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
import {IntlProvider, FormattedMessage} from 'react-intl'
import {Button} from 'react-bootstrap'

import PropertiesDialog from '../properties-dialog.jsx'

export default class SubPanelInvoker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      panel: null,
      title: null,
      hideHandler: null,
      subPanelVisible: false
    };
    this.showSubDialog = this.showSubDialog.bind(this);
    this.hideSubDialog = this.hideSubDialog.bind(this);
  }

  showSubDialog(title, panel, hideHandler) {
    //console.log("showSubDialog()");
    this.setState({
      panel: panel,
      title: title,
      hideHandler: hideHandler,
      subPanelVisible: true
    });
  }

  hideSubDialog(applyChanges) {
    //console.log("hideSubDialog(): " + applyChanges);
    this.state.hideHandler(applyChanges);
    this.setState({
      panel: null,
      title: null,
      hideHandler: null,
      subPanelVisible: false
    });
  }

  render() {
    var propertiesDialog = [];

    if (this.state.subPanelVisible) {
      propertiesDialog = <PropertiesDialog
            onHide={this.hideSubDialog.bind(this, false)}
            title={this.state.title}
            okHandler={this.hideSubDialog.bind(this, true)}
            cancelHandler={this.hideSubDialog.bind(this, false)}>{this.state.panel}</PropertiesDialog>;
    }

    return (
      <div>
      {propertiesDialog}
      {this.props.children}
      </div>
    );
  }
}

SubPanelInvoker.propTypes = {
};
