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
import {FormControl} from 'react-bootstrap'
import EditorControl from './editor-control.jsx'
import ReactDOM from 'react-dom'

var _ = require('underscore');

export default class ColumnAllocatorControl extends EditorControl {
  constructor(props) {
    super(props);
    this.state = {
      controlValue: props.valueAccessor(props.control.name),
      selectedValues: []
    };

    this._update_callback = null;

    this.getControlValue = this.getControlValue.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getSelectedColumns = this.getSelectedColumns.bind(this);
    this.getAllocatedColumns = this.getAllocatedColumns.bind(this);
    this.addColumns = this.addColumns.bind(this);
    this.removeColumns = this.removeColumns.bind(this);
    this.handleChangeMultiColumn= this.handleChangeMultiColumn.bind(this);
  }

  handleChangeMultiColumn(evt) {
    let select = ReactDOM.findDOMNode(this.refs.input);
    let values = [].filter.call(select.options, function (o) {
      return o.selected;
    }).map(function (o) {
      return o.value;
    });
    //console.log('values ----------> '+JSON.stringify(values));
    this.setState({
      selectedValues: values
    });
  }

  handleChange(evt) {
    this.setState({
      selectedValues: evt.target.value
    });
  }

  // Selected columns are those that are referenced by values in the control that have
  // been selected by the user.
  getSelectedColumns() {
    //console.log("getSelectedColumns");
    //console.log(this.state.selectedValues);
    return this.state.selectedValues;
  }

  // Allocated columns are columns that are referenced by the current control value.
  getAllocatedColumns() {
    //console.log("getAllocatedColumns");
    return this.getControlValue();
  }

  addColumns(columnNames, callback) {
    //console.log("addColumns");
    var currentColumns = this.state.controlValue;
    //console.log(currentColumns);
    if (this.props.multiColumn) {
      currentColumns = _.union(currentColumns, columnNames);
    }
    else {
      if (columnNames.length == 1) {
        currentColumns = columnNames;
      }
    }
    //console.log(currentColumns);

    this._update_callback = callback;

    this.setState({
      controlValue: currentColumns,
      selectedValues: []
    }, function() {
      this.validateInput();
    });
  }

  removeColumns(columnNames, callback) {
    //console.log("removeColumns");
    var currentColumns = this.state.controlValue;
    //console.log(currentColumns);
    if (this.props.multiColumn) {
      currentColumns = _.difference(currentColumns, columnNames);
    }
    else {
      // Always remove the current value
      currentColumns = [""];
    }
    //console.log(currentColumns);

    this._update_callback = callback;

    this.setState({
      controlValue: currentColumns,
      selectedValues: []
    }, function() {
      this.validateInput();
    });
  }

  getControlValue() {
    //console.log("getControlValue");
    //console.log(this.state.controlValue);
    return this.state.controlValue;
  }

  render() {
    console.log("AllocationControl.render");
    //console.log(this.state);
    var options = EditorControl.genStringSelectOptions(this.state.controlValue, this.state.selectedValues);
    //console.log(options);

    if (this._update_callback !== null) {
      this._update_callback();
      this._update_callback = null;
    }

    var errorMessage = <div className="validation-error-message"></div>
    if (this.state.validateErrorMessage && this.state.validateErrorMessage.text !== "") {
      errorMessage = (<div className="validation-error-message">
        <p className="form__validation" style={{ "display": "block", "margin": "0px" }}>
          <span className="form__validation--invalid">{this.state.validateErrorMessage.text}</span>
        </p>
      </div>);
    }

    var controlName = this.getControlID().split(".")[1];
    var stateDisabled = {};
    var stateStyle = {};
    if(typeof this.props.controlStates[controlName] !== "undefined") {
      if(this.props.controlStates[controlName] === "disabled") {
        stateDisabled["disabled"] = true;
        stateStyle = { color: "#D8D8D8", borderColor: "#D8D8D8" };
      } else if (this.props.controlStates[controlName] === "hidden") {
        stateStyle["visibility"] = "hidden";
      }
    }

    if (this.props.multiColumn) {
      return (
        <div className="editor_control_area" style={stateStyle}>
          <FormControl {...stateDisabled}
            id={this.getControlID()} className="column-allocator"
            componentClass="select"  multiple rows={4} name={this.props.control.name}
            style={stateStyle}
            help={this.props.control.additionalText}
            onChange={this.handleChangeMultiColumn}
            value={this.state.selectedValues}
            ref="input">
            {options}
          </FormControl>
          {errorMessage}
        </div>
      )
    }
    else {
      return (
        <div className="editor_control_area" style={stateStyle}>
          <FormControl {...stateDisabled}
            id={this.getControlID()} className="column-allocator"
            componentClass="select"  rows={1} name={this.props.control.name}
            style={stateStyle}
            help={this.props.control.additionalText}
            onChange={this.handleChange}
            value={this.state.selectedValues}
            ref="input">
            {options}
          </FormControl>
          {errorMessage}
        </div>
      )
    }
  }
}


ColumnAllocatorControl.propTypes = {
  multiColumn: React.PropTypes.bool.isRequired,
  dataModel: React.PropTypes.object.isRequired,
  control: React.PropTypes.object.isRequired,
  controlStates: React.PropTypes.object
};
