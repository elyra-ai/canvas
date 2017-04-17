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
import {Grid, Row, Col, Panel, Button, ButtonGroup} from 'react-bootstrap'

var _ = require('underscore');

export default class SelectorPanel extends React.Component {
  constructor(props) {
    super(props);
    //console.log("SelectorPanel: constructor()");
    //console.log(props);
    this.state = {
      currentValue: ""
    };
  }

  componentDidMount() {
    //console.log("SelectorPanel.componentDidMount()");
    let control = this.props.controlAccessor(this.props.dependsOn);
    //console.log("Control=" + control);
    if (control) {
      control.setValueListener(this);
      this.setState({ currentValue: control.getControlValue() });
    }
  }

  componentWillUnmount() {
    //console.log("SelectorPanel.componentWillUnmount()");
    let control = this.props.controlAccessor(this.props.dependsOn);
    //console.log("Control=" + control);
    if (control) {
      control.clearValueListener();
    }
  }

  handleValueChanged(controlName, value) {
    //console.log("SelectorPanel.handleValueChanged(): value=" + value);
    this.setState({ currentValue: value });
  }

  render() {
    //console.log("SelectorPanel.render(): currentValue=" + this.state.currentValue);
    let panel = this.props.panels[this.state.currentValue];
    if (panel === undefined) {
      panel = <div className="control-panel"></div>;
    }

    return (
      panel
    );
  }
}


SelectorPanel.propTypes = {
  panels: React.PropTypes.object,
  dependsOn: React.PropTypes.string,
  controlAccessor: React.PropTypes.func
};
