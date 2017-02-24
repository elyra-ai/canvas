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
import EditorControl from './editor-control.jsx'

export default class RadiosetControl extends EditorControl {
  constructor(props) {
    super(props);
    this.state = {
      controlValue: props.valueAccessor(props.control.name)[0]
    };
    this.getControlValue = this.getControlValue.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(evt) {
    if (evt.target.checked) {
      this.setState({
        controlValue: evt.target.value
      });
    }
    this.notifyValueChanged(this.props.control.name, evt.target.value);
  }

  getControlValue() {
    return [this.state.controlValue];
  }

  render() {
    let cssClasses = `control control--radio`;
    var buttons = [];
    var cname = "radio";
    if (this.props.control.orientation == "horizontal") {
      cname = "radio-inline";
    }

    for (var i=0;i<this.props.control.values.length;i++) {
      /*
      buttons.push(<Input key={i}
        type="radio" name={this.props.control.name}
        value={this.props.control.values[i]}
        label={this.props.control.valueLabels[i]}/>);
      */
      var val = this.props.control.values[i];
      var checked = val == this.state.controlValue;

      /*
      let id = this.props.control.name + "-" + val;
      buttons.push(
        <div><input id={id} type="radio" name={this.props.control.name}
          value={val}
          onChange={this.handleChange}
          checked={checked}/><div></div><label for={id} className={cname}>{this.props.control.valueLabels[i]}</label></div>);
      */

      buttons.push(<label key={i} className={cssClasses}>
        <input type="radio" name={this.props.control.name}
          value={val}
          onChange={this.handleChange}
          checked={checked}/>{this.props.control.valueLabels[i]}
        <div className="control__indicator"></div>
        </label>);
    }

    return (
      <div id={this.getControlID()} className="radio">{buttons}</div>
    );
  }
}


RadiosetControl.propTypes = {
  control: React.PropTypes.object
};
