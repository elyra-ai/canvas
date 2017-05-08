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
import {Button} from 'react-bootstrap'
import {Table, Column, Cell} from 'fixed-data-table'
import EditorControl from './editor-control.jsx'
import StructureTableEditor from './structure-table-editor.jsx'

import SubPanelCell from '../editor-panels/sub-panel-cell.jsx'
import TextRenderer from '../renderers/text-renderer.jsx'
import EnumRenderer from '../renderers/enum-renderer.jsx'

var _ = require('underscore');

export default class StructurelisteditorControl extends StructureTableEditor {
  constructor(props) {
    super(props);

    this.addRow = this.addRow.bind(this);
    this.removeSelectedRows = this.removeSelectedRows.bind(this);

    this.stopEditingRow = this.stopEditingRow.bind(this);
  }

  stopEditingRow(rowIndex, applyChanges) {
    console.log("stopEditingRow: row=" + rowIndex + ", applyChanges=" + applyChanges);

    if (applyChanges) {
      let subControlId = this.getSubControlId();
      let allValues = this.getCurrentControlValue();
      for (var i=0;i < this.props.control.subControls.length;i++) {
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
      this.setCurrentControlValue(allValues);
    }
  }

  addRow() {
    console.log("addRow");

    let newRow = JSON.parse(JSON.stringify(this.props.control.defaultRow));
    console.log(newRow);
    console.log(this.getCurrentControlValue());
    let rows = this.getCurrentControlValue();
    rows.push(newRow);
    console.log(rows);

    this.setCurrentControlValue(rows);
  }

  removeSelectedRows() {
    console.log("removeSelectedRows");

    let rows = this.getCurrentControlValue();

    // Sort descending to ensure lower indices don't get
    // changed when values are deleted
    let selected = this.getSelectedRows().sort(function(a, b) {return b-a});

    console.log(selected);

    for (let i=0;i < selected.length;i++) {
      rows.splice(selected[i], 1);
    }

    this.setCurrentControlValue(rows);
  }

  render() {
    console.log("StructurelisteditorControl.render()");
    console.log(this.getCurrentControlValue());

    let table = this.createTable();
    let add = <Button bsSize="small" onClick={this.addRow}>+</Button>;
    let remove = <Button bsSize="small" onClick={this.removeSelectedRows}>-</Button>;

    return <div id={this.getControlID()}>
      <div id="structure-list-editor-table-buttons">
        {table}
        <div id="structure-list-editor-buttons-container"><span>{add} {remove}</span></div>
      </div>
    </div>;
  }
}

StructurelisteditorControl.propTypes = {
  buildUIItem: React.PropTypes.func,
  dataModel: React.PropTypes.array.isRequired,
  control: React.PropTypes.object.isRequired
};
