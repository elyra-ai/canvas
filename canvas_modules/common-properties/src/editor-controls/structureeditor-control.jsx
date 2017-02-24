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
import SubPanelButton from '../editor-panels/sub-panel-button.jsx'

var _ = require('underscore');

export default class StructureeditorControl extends EditorControl {
  constructor(props) {
    super(props);
    this.state = {
      controlValue: JSON.parse(props.valueAccessor(props.control.name)[0]),
      subControlId: "___" + props.control.name + "_"
    };

    this.getControlValue = this.getControlValue.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getEditingValue = this.getEditingValue.bind(this);
    this.stopEditing = this.stopEditing.bind(this);
  }

  handleChange(evt) {
    this.setState({
      controlValue: evt.target.value
    });
    this.notifyValueChanged(this.props.control.name, evt.target.value);
  }

  getControlValue() {
    return [JSON.stringify(this.state.controlValue)];
  }

  indexOfColumn(controlId) {
    return _.findIndex(this.props.control.subControls,
      function(columnControl) { return columnControl.name == controlId; });
  }

  getEditingValue(controlId) {
    //console.log("***** getEditingValue: controlId=" + controlId);
    //console.log("Main control value");
    //console.log(this.state.controlValue);

    let col = this.indexOfColumn(controlId);
    let columnControl = this.props.control.subControls[col];
    // List are represented as JSON format strings so need to convert those
    // to an array of strings
    let value = this.state.controlValue[col];
    //console.log(value);
    if (columnControl.valueDef.isList === true) {
      return JSON.parse(value);
    }
    else {
      return [value];
    }
  }

  stopEditing(applyChanges) {
    //console.log("stopEditing: applyChanges=" + applyChanges);

    if (applyChanges) {
      let allValues = this.state.controlValue;
      //console.log("oldValue");
      //console.log(allValues);

      for (var i=0;i < this.props.control.subControls.length;i++) {
        if (i !== this.props.control.keyIndex) {
          let columnControl = this.props.control.subControls[i];
          let lookupKey = this.state.subControlId + columnControl.name;
          // console.log("Accessing sub-control " + lookupKey);
          let control = this.refs[lookupKey];
          // console.log(control);
          if (control !== undefined) {
            // Assume the control is
            let controlValue = columnControl.valueDef.isList
                ? JSON.stringify(control.getControlValue()) : control.getControlValue()[0];
            //console.log("Control value=" + controlValue);
            allValues[i] = controlValue;
          }
        }
      }

      //console.log("newValue");
      //console.log(allValues);
      this.setState({controlValue: allValues});
    }
  }

  render() {
    let subItemButton = this.props.buildUIItem(this.state.subControlId, this.props.control.childItem,
          this.state.subControlId, this.getEditingValue, this.props.dataModel);

    // Hack to attach our own editing notifiers which involves decomposing
    // the original button into our own button.
    let newButton = <SubPanelButton
              label={subItemButton.props.label} title={subItemButton.props.title} panel={subItemButton.props.panel}
              notifyFinishedEditing={this.stopEditing}/>;

    return (
      <span>
        <TextField readOnly
          type="text"
          id={this.getControlID()}
          placeholder={this.props.control.additionalText}
          onChange={this.handleChange}
          value={this.state.controlValue}/>
        {newButton}
      </span>
    );
  }
}

StructureeditorControl.propTypes = {
  control: React.PropTypes.object
};
