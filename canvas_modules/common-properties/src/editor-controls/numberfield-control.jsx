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
import {TextField} from 'ap-components-react/dist/ap-components-react'
import EditorControl from './editor-control.jsx'
import {CHARACTER_LIMITS} from '../constants/constants.js'

export default class NumberfieldControl extends EditorControl {
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
    return(
      <TextField
        type="number"
        id={this.getControlID()}
        placeholder={this.props.control.additionalText}
        onChange={this.handleChange}
        value={this.state.controlValue}
        maxLength={CHARACTER_LIMITS.NODE_PROPERTIES_DIALOG_TEXT_FIELD}
        maxCount={CHARACTER_LIMITS.NODE_PROPERTIES_DIALOG_TEXT_FIELD}
        />
    );

    /*
    return (
      <Input
        type="number"
        id={this.getControlID()}
        name={this.props.control.name}
        help={this.props.control.additionalText}
        onChange={this.handleChange}
        value={this.state.controlValue}/>
    );
    */
  }
}


NumberfieldControl.propTypes = {
  control: React.PropTypes.object
};
