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
import { Button } from "react-bootstrap";
import StructureTableEditor from "./structure-table-editor.jsx";

export default class StructurelisteditorControl extends StructureTableEditor {
	constructor(props) {
		super(props);

		this.addRow = this.addRow.bind(this);
		this.removeSelectedRows = this.removeSelectedRows.bind(this);

		this.stopEditingRow = this.stopEditingRow.bind(this);
	}

	stopEditingRow(rowIndex, applyChanges) {
		logger.info("stopEditingRow: row=" + rowIndex + ", applyChanges=" + applyChanges);

		if (applyChanges) {
			const subControlId = this.getSubControlId();
			const allValues = this.getCurrentControlValue();
			for (var i = 0; i < this.props.control.subControls.length; i++) {
				const columnControl = this.props.control.subControls[i];
				const lookupKey = subControlId + columnControl.name;
				// logger.info("Accessing sub-control " + lookupKey);
				const control = this.refs[lookupKey];
				// logger.info(control);
				if (typeof control !== "undefined") {
					const controlValue = control.getControlValue();
					logger.info("Control value=" + controlValue);
					if (columnControl.valueDef.isList === true) {
						allValues[rowIndex][i] = JSON.stringify(controlValue);
					} else {
						allValues[rowIndex][i] = controlValue[0];
					}
				}
			}
			this.setCurrentControlValue(this.props.control.name, allValues, this.props.updateControlValue);
		}
	}

	addRow() {
		logger.info("addRow");

		const newRow = JSON.parse(JSON.stringify(this.props.control.defaultRow));
		logger.info(newRow);
		logger.info(this.getCurrentControlValue());
		const rows = this.getCurrentControlValue();
		rows.push(newRow);
		logger.info(rows);

		this.setCurrentControlValue(this.props.control.name, rows, this.props.updateControlValue);
	}

	removeSelectedRows() {
		logger.info("removeSelectedRows");

		const rows = this.getCurrentControlValue();

		// Sort descending to ensure lower indices don"t get
		// changed when values are deleted
		const selected = this.getSelectedRows().sort(function(a, b) {
			return b - a;
		});

		logger.info(selected);

		for (let i = 0; i < selected.length; i++) {
			rows.splice(selected[i], 1);
		}

		this.setCurrentControlValue(this.props.control.name, rows, this.props.updateControlValue);
	}

	render() {
		logger.info("StructurelisteditorControl.render()");
		logger.info(this.getCurrentControlValue());

		const controlName = this.getControlID().split("-")[2];
		const conditionProps = {
			controlName: controlName,
			controlType: "table"
		};
		const conditionState = this.getConditionMsgState(conditionProps);

		const errorMessage = conditionState.message;
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;

		const table = this.createTable();
		const add = <Button bsSize="small" onClick={this.addRow} {...stateDisabled}>+</Button>;
		const remove = <Button bsSize="small" onClick={this.removeSelectedRows} {...stateDisabled}>-</Button>;

		return (<div id={this.getControlID()} style={stateStyle}>
			<div id="structure-list-editor-table-buttons" style={stateStyle}>
				{table}
				<div id="structure-list-editor-buttons-container">
					<span>{add} {remove}</span>
				</div>
			</div>
			{errorMessage}
		</div>);
	}
}

StructurelisteditorControl.propTypes = {
	buildUIItem: React.PropTypes.func,
	dataModel: React.PropTypes.object.isRequired,
	control: React.PropTypes.object.isRequired,
	controlStates: React.PropTypes.object,
	validationDefinitions: React.PropTypes.array,
	updateValidationErrorMessage: React.PropTypes.func,
	retrieveValidationErrorMessage: React.PropTypes.func,
	updateControlValue: React.PropTypes.func
};
