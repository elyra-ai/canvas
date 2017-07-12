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

/* eslint "react/prop-types": [2, { ignore: ["children"] }] */

import logger from "../../../utils/logger";
import React from "react";
import {
	Grid,
	Row,
	Col
} from "react-bootstrap";
import ColumnSource from "./column-source.jsx";

import MoveLeftIcon from "../../../assets/images/move_left.svg";
import MoveRightIcon from "../../../assets/images/move_right.svg";

var _ = require("underscore");

export default class ColumnAllocationPanel extends React.Component {
	constructor(props) {
		super(props);
		logger.info("ColumnAllocationPanel: constructor()");
		logger.info(props);
		this.state = {
			allocatedColumns: []
		};
	}

	componentDidMount() {
		this.updateColumnSource();
	}

	updateColumnSource() {
		logger.info("updateColumnSource()");
		const that = this;
		setTimeout(() => {
			let allocatedFields = [];
			for (var i = 0; i < that.props.children.length; i++) {
				const child = that.props.children[i];
				// Child should be a ControlItem so access the control ref
				const controlName = child.props.control.ref;
				// logger.info("Allocator=" + controlName);
				const control = that.props.controlAccessor(controlName);
				// logger.info(control);
				const allocated = control.getAllocatedColumns();
				// logger.info(allocated);
				allocatedFields = _.union(allocatedFields, allocated);
			}
			// logger.info(allocatedFields);
			that.refs.columnSource.setAllocatedColumns(allocatedFields);
		}, 10);
	}

	allocate(targetControl) {
		// logger.info("allocate");
		// logger.info(targetControl);

		const control = this.props.controlAccessor(targetControl);
		// logger.info(control);

		// Add the columns selected in the column source to the target control.
		const selected = this.refs.columnSource.getSelectedColumns();
		control.addColumns(selected, this.updateColumnSource.bind(this));

		// this.updateColumnSource();
	}

	deallocate(targetControl) {
		// logger.info("deallocate");
		// logger.info(targetControl);

		const control = this.props.controlAccessor(targetControl);
		// logger.info(control);

		// Removed the columns selected target control from the target control
		// so they can be made available in the column source.
		const selected = control.getSelectedColumns();
		control.removeColumns(selected, this.updateColumnSource.bind(this));
		this.refs.columnSource.clearSelectedColumns();
		// this.updateColumnSource();
	}

	render() {
		// logger.info("ColumnAllocator.render()");

		const controlItems = [];
		for (var i = 0; i < this.props.children.length; i++) {
			// logger.info("ColumnAllocator:child");
			// logger.info(this.props.children[i]);
			const child = this.props.children[i];

			// Child should be a ControlItem so access the control ref
			const controlName = child.props.control.ref;

			controlItems.push(
				<Row key={i}>
					<Col md={1}
						id="field-allocator-button-container"
						style={{
							"marginTop": "18px",
							"top": "50%",
							"marginLeft": "40%"
						}}
					>
						<img className="field-allocator-button" src={MoveLeftIcon} onClick={this.deallocate.bind(this, controlName)}></img>
						<img className="field-allocator-button" src={MoveRightIcon} onClick={this.allocate.bind(this, controlName)}></img>
					</Col>
					<Col md={11}>
						{child}
					</Col>
				</Row>
			);
		}

		return (
			<Grid>
				<Row className="column-allocation-panel-row">
					<Col md={3} className="column-allocation-panel-column">
						<ColumnSource
							id={"column-source." + this.props.panel.id}
							ref="columnSource"
							name={this.props.panel.id}
							dataModel={this.props.dataModel}
							rows={this.props.children.length * 5}
						/>
					</Col>
					<Col md={9} className="column-allocation-panel-column">
						<Grid>
							{controlItems}
						</Grid>
					</Col>
				</Row>
			</Grid>
		);
	}
}

ColumnAllocationPanel.propTypes = {
	panel: React.PropTypes.object,
	dataModel: React.PropTypes.object,
	controlAccessor: React.PropTypes.func
};
