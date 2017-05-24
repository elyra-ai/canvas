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

import logger from "../../../utils/logger";
import React from "react";
import { FormControl } from "react-bootstrap";
import ReactDOM from "react-dom";

import EditorControl from "./../editor-controls/editor-control.jsx";

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

	getSelectedColumns() {
		return this.state.selectedColumns;
	}

	setAllocatedColumns(columnNames) {
		logger.info("ColumnSource.setAllocatedColumns()");
		logger.info(columnNames);
		this.setState({ allocatedColumns: columnNames });
	}

	handleChange(evt) {
		const select = ReactDOM.findDOMNode(this.refs.input);
		const values = [].filter.call(select.options, function(o) {
			return o.selected;
		}).map(function(o) {
			return o.value;
		});
		// logger.info("values ----------> "+JSON.stringify(values));
		this.setState({ selectedColumns: values });
	}

	clearSelectedColumns() {
		this.setState({ selectedColumns: [] });
	}


	render() {
		// logger.info("ColumnSource.render");
		// logger.info(this.props.dataModel.columns);

		var allocatedColumns = this.state.allocatedColumns;
		var availableColumns = this.props.dataModel.columns.filter(function(column) {
			return allocatedColumns.indexOf(column.name) < 0;
		});
		// logger.info(availableColumns);

		var options = EditorControl.genColumnSelectOptions(availableColumns, this.state.selectedColumns, false);

		// logger.info("ColumnSource.render: options");
		// logger.info(options);

		return (
			<FormControl
				className="column-source"
				componentClass="select"
				multiple name={this.props.name}
				rows={this.props.rows}
				onChange={this.handleChange}
				value={this.state.selectedColumns}
				ref="input"
			>
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
