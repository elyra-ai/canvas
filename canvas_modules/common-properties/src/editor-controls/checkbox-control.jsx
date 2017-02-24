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
import {Checkbox} from 'ap-components-react/dist/ap-components-react'
import EditorControl from './editor-control.jsx'

export default class CheckboxControl extends EditorControl {
  constructor(props) {
    super(props);
    this.state = {
      controlValue: props.valueAccessor(props.control.name)[0]
    };
    this.getControlValue = this.getControlValue.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(evt) {
    var newValue;
    if (evt.target.checked) {
      newValue = "true";
    }
    else {
      newValue = "false";
    }

    this.setState({
      controlValue: newValue
    });
    this.notifyValueChanged(this.props.control.name, evt.target.checked ? "true" : "false");
  }

  getControlValue() {
    return [this.state.controlValue];
  }

  render() {
    var checked = this.state.controlValue == "true";

    var cb = (
      <Checkbox
        id={this.getControlID()}
        name={this.props.control.label.text}
        onChange={this.handleChange}
        checked={checked}/>
    );

    return (
      <div className="checkbox">
      {cb}
      </div>
    );
  }
}

CheckboxControl.propTypes = {
  control: React.PropTypes.object
};
