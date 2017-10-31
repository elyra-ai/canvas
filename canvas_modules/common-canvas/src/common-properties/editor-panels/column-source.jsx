/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import logger from "../../../utils/logger";
import React from "react";
import PropTypes from "prop-types";
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
		// logger.info(this.props.dataModel.fields);

		var allocatedColumns = this.state.allocatedColumns;
		var availableColumns = this.props.dataModel.fields.filter(function(field) {
			return allocatedColumns.indexOf(field.name) < 0;
		});
		// logger.info(availableColumns);

		var options = EditorControl.genColumnSelectOptions(availableColumns, this.state.selectedColumns, false);

		// logger.info("ColumnSource.render: options");
		// logger.info(options);

		return (
			<FormControl
				className={"column-source " + this.props.propertiesClassname}
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
	name: PropTypes.string,
	rows: PropTypes.number,
	dataModel: PropTypes.object,
	propertiesClassname: PropTypes.string
};
