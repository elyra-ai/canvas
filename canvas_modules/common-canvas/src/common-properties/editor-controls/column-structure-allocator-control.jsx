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
import {Input} from 'react-bootstrap'
import {Table, Column, Cell} from 'fixed-data-table'
import EditorControl from './editor-control.jsx'
import StructureTableEditor from './structure-table-editor.jsx'

import SubPanelCell from '../editor-panels/sub-panel-cell.jsx'
import TextRenderer from '../renderers/text-renderer.jsx'
import EnumRenderer from '../renderers/enum-renderer.jsx'

var _ = require('underscore');

export default class ColumnStructureAllocatorControl extends StructureTableEditor {
  constructor(props) {
    super(props);

    this._update_callback = null;

    this.getSelectedColumns = this.getSelectedColumns.bind(this);
    this.getAllocatedColumns = this.getAllocatedColumns.bind(this);
    this.addColumns = this.addColumns.bind(this);
    this.removeColumns = this.removeColumns.bind(this);

    this.stopEditingRow = this.stopEditingRow.bind(this);

    this.indexOfRow = this.indexOfRow.bind(this);
  }

  stopEditingRow(rowIndex, applyChanges) {
    console.log("stopEditingRow: row=" + rowIndex + ", applyChanges=" + applyChanges);

    if (applyChanges) {
      let subControlId = this.getSubControlId();
      let allValues = this.getCurrentControlValue();
      for (var i=0;i < this.props.control.subControls.length;i++) {
        if (i !== this.props.control.keyIndex) {
          let columnControl = this.props.control.subControls[i];
          let lookupKey = subControlId + columnControl.name;
          // console.log("Accessing sub-control " + lookupKey);
          let control = this.refs[lookupKey];
          // console.log(control);
          if (control !== undefined) {
            let controlValue = control.getControlValue();
            console.log("Control value=" + controlValue);
            if (columnControl.valueDef.isList === true) {
              allValues[rowIndex][i] = JSON.stringify(controlValue);
            }
            else {
              allValues[rowIndex][i] = controlValue[0];
            }
          }
        }
      }
      this.setCurrentControlValue(this.props.control.name, allValues, this.props.updateControlValue);
    }
  }

  indexOfRow(columnName) {
    let keyIndex = this.props.control.keyIndex;
    return _.findIndex(this.getCurrentControlValue(),
      function(row) { return row[keyIndex] == columnName; });
  }

  // Selected columns are those that are referenced by values in the control that have
  // been selected by the user.
  getSelectedColumns() {
    //console.log("getSelectedColumns");
    let selected = this.getSelectedRows();
    let controlValue = this.getCurrentControlValue();
    let columns = [];

    for (var i=0;i < selected.length;i++) {
      let rowIndex = selected[i];
      columns.push(controlValue[rowIndex][this.props.control.keyIndex]);
    }
    //console.log(columns);
    return columns;
  }

  // Allocated columns are columns that are referenced by the current control value.
  getAllocatedColumns() {
    //console.log("getAllocatedColumns");
    let controlValue = this.getCurrentControlValue();
    let columns = [];
    for (var i=0;i < controlValue.length;i++) {
      let value = controlValue[i];
      columns.push(value[this.props.control.keyIndex]);
    }
    //console.log(columns);
    return columns;
  }

  addColumns(columnNames, callback) {
    //console.log("addColumns");
    //console.log(columnNames);
    //console.log(this.props.control.defaultRow);

    let newRows = [];
    let isMap = this.props.control.valueDef.isMap;
    for (var i=0;i < columnNames.length;i++) {
      let columnName = columnNames[i];

      // Sometimes the source list selection hasn't changed so do an
      // explicit check for whether an entry for this column exists
      if (this.indexOfRow(columnName) < 0) {
        // Must be a better way of cloning the array but this will do for now
        let newRow = JSON.parse(JSON.stringify(this.props.control.defaultRow));

        // Set the column name.
        if (isMap) {
          // For maps, this means adding the column name to the start of the cloned list.
          newRow.unshift(columnName);
        }
        else {
          // For lists, this means assigning the column name to the correct location in the cloned list.
          newRow[this.props.control.keyIndex] = columnName;
        }
        newRows.push(newRow);
      }
    }

    let rows = this.getCurrentControlValue().concat(newRows);

    this._update_callback = callback;

    this.setCurrentControlValue(this.props.control.name, rows, this.props.updateControlValue);
  }

  removeColumns(columnNames, callback) {
    //console.log("removeColumns");
    //console.log(columnNames);

    let rows = this.getCurrentControlValue();
    let keyIndex = this.props.control.keyIndex;

    let newRows = _.reject(rows, function(val) {
      //console.log("_reject: " + val[keyIndex]);
      //console.log("_reject: " + (columnNames.indexOf(val[keyIndex]) >= 0));
      return columnNames.indexOf(val[keyIndex]) >= 0;
    });

    //console.log(rows);
    //console.log(newRows);

    this._update_callback = callback;

    this.setCurrentControlValue(this.props.control.name, newRows, this.props.updateControlValue);
  }

  render() {
    if (this._update_callback !== null) {
      this._update_callback();
      this._update_callback = null;
    }

    return this.createTable();
  }
}

ColumnStructureAllocatorControl.propTypes = {
  buildUIItem: React.PropTypes.func,
  dataModel: React.PropTypes.object.isRequired,
  control: React.PropTypes.object.isRequired,
  updateControlValue: React.PropTypes.func
};
