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
import ReactDOM from 'react-dom'

import EditorControl from './../editor-controls/editor-control.jsx'

var _ = require('underscore');

export default class ColumnSource extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedColumns: [],
      allocatedColumns: []
    };
    this.handleChange = this.handleChange.bind(this);
    this.getSelectedColumns = this.getSelectedColumns.bind(this);
    this.setAllocatedColumns = this.setAllocatedColumns.bind(this);
  }

  handleChange(evt) {
    let select = ReactDOM.findDOMNode(this.refs.input);
    let values = [].filter.call(select.options, function (o) {
      return o.selected;
    }).map(function (o) {
      return o.value;
    });
    //console.log('values ----------> '+JSON.stringify(values));
    this.setState({
      selectedColumns: values
    });
  }

  getSelectedColumns() {
    return this.state.selectedColumns;
  }

  setAllocatedColumns(columnNames) {
    console.log("ColumnSource.setAllocatedColumns()");
    console.log(columnNames);
    this.setState({
      allocatedColumns: columnNames
    });
  }

  render() {
    //console.log("ColumnSource.render");
    //console.log(this.props.dataModel.columns);

    var allocatedColumns = this.state.allocatedColumns;
    var availableColumns = this.props.dataModel.columns.filter( function( column ) {
      return allocatedColumns.indexOf(column.name) < 0;
    });
    //console.log(availableColumns);

    var options = EditorControl.genColumnSelectOptions(availableColumns, this.state.selectedColumns, false);

    //console.log("ColumnSource.render: options");
    //console.log(options);

    return (
      <FormControl
        className="column-source"
        componentClass="select"
        multiple
        name={this.props.name}
        rows={this.props.rows}
        onChange={this.handleChange}
        value={this.state.selectedColumns}
        ref="input">
        {options}
      </FormControl>
    );
  }
}

ColumnSource.propTypes = {
  name: React.PropTypes.string,
  rows: React.PropTypes.number,
  dataModel: React.PropTypes.object
};
