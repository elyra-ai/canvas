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
import {Grid, Row, Col, Well, ListGroupItem, Table, tr, th, Button} from 'react-bootstrap'

export default class EditorControl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.getControlID = this.getControlID.bind(this);
    this.setValueListener = this.setValueListener.bind(this);
    this.clearValueListener = this.clearValueListener.bind(this);
    this.notifyValueChanged = this.notifyValueChanged.bind(this);

    this._valueListener = null;
  }

  getControlID() {
    return "editor-control." + this.props.control.name;
  }

  setValueListener(listener) {
    // Listener is expected to define handleValueChanged(controlName, value);
    this._valueListener = listener;
  }

  clearValueListener() {
    this._valueListener = null;
  }

  notifyValueChanged(controlName, value) {
    //console.log("notifyValueChanged(): control=" + controlName);
    //console.log(value);
    if (this._valueListener !== null) {
      //console.log("notifyValueChanged(): notifying value listener");
      this._valueListener.handleValueChanged(controlName, value);
    }
    else {
      //console.log("notifyValueChanged(): no listener");
    }
  }

  /*
   * Sub-classes must override this function to return the value of the control as an array of strings.
   */
  getControlValue() {
    return [];
  }

  static splitNewlines(text) {
    return text.split("\n");
  }

  static joinNewlines(list) {
    return list.join("\n");
  }

  static genSelectOptions(control, selectedValues) {
    var options = [];
    for (var i=0;i<control.values.length;i++) {
      options.push(<option key={i}
        value={control.values[i]}>{control.valueLabels[i]}</option>);
    }
    return options;
  }

  static genColumnSelectOptions(columns, selectedValues, includeEmpty) {
    var options = [];
    if (includeEmpty) {
      options.push(<option key={-1} value={""}>...</option>);
    }

    for (var i=0;i<columns.length;i++) {
      options.push(<option key={i} value={columns[i].name}>{columns[i].name}</option>);
    }
    return options;
  }

  static genStringSelectOptions(values, selectedValues) {
    var options = [];
    for (var i=0;i<values.length;i++) {
      options.push(<option key={i} value={values[i]}>{values[i]}</option>);
    }
    return options;
  }

  // Structures are supplied to the UI as an array of strings where each string represents
  // an array of values within the structure. This parses those sub-strings into individual arrays.
  static parseStructureStrings(values) {
    var structures = [];
    for (var i=0;i<values.length;i++) {
      structures.push(JSON.parse(values[i]));
    }
    return structures;
  }

  // Structures are returned from the UI as an array of strings where each string represents
  // an array of values within the structure. This converts each array of row values into a JSON string.
  static stringifyStructureStrings(values) {
    var structures = [];
    for (var i=0;i<values.length;i++) {
      structures.push(JSON.stringify(values[i]));
    }
    return structures;
  }

  static handleTableRowClick(evt, rowIndex, selection) {
    //console.log(selection);
    let index = selection.indexOf(rowIndex);

    if (evt.shiftKey === true) {
      // If already selected then remove otherwise add
      if (index >= 0) {
        selection.splice(index, 1);
      }
      else {
        selection = selection.concat(rowIndex);
      };
    }
    else {
      selection = [rowIndex];
    }

    return selection;
  }

  render() {
    return (
      <div>
      </div>
    );
  }
}

EditorControl.propTypes = {
  control: React.PropTypes.object.isRequired,
  valueAccessor: React.PropTypes.func.isRequired
};
