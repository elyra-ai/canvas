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
import {TextField} from 'ap-components-react/dist/ap-components-react'
import EditorControl from './editor-control.jsx'

export default class PasswordControl extends EditorControl {
  constructor(props) {
    super(props);
    this.state = {
      controlValue: props.valueAccessor(props.control.name)[0]
    };
    this.getControlValue = this.getControlValue.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(evt) {
    this.setState({
      controlValue: evt.target.value
    });
  }

  getControlValue() {
    return [this.state.controlValue];
  }

  render() {
    return (
      <TextField
        type="password"
        id={this.getControlID()}
        placeholder={this.props.control.additionalText}
        onChange={this.handleChange}
        value={this.state.controlValue}/>
    );
    /*
    return (
      <Input
        id={this.getControlID()}
        type="password" name={this.props.control.name}
        help={this.props.control.additionalText}
        onChange={this.handleChange}
        value={this.state.controlValue}/>
    );
    */
  }
}

PasswordControl.propTypes = {
  control: React.PropTypes.object
};
