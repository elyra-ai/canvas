/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

// import logger from "../../../utils/logger";
import React from "react";
import ReactTooltip from "react-tooltip";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";
import StructureTableEditor from "./structure-table-editor.jsx";
import { EDITOR_CONTROL, TOOL_TIP_DELAY } from "../constants/constants.js";

export default class StructurelisteditorControl extends StructureTableEditor {
	constructor(props) {
		super(props);

		this.addRow = this.addRow.bind(this);
		this.removeSelectedRows = this.removeSelectedRows.bind(this);

		this.stopEditingRow = this.stopEditingRow.bind(this);
	}

	stopEditingRow(rowIndex, applyChanges) {
		if (applyChanges) {
			const subControlId = this.getSubControlId();
			const allValues = this.getCurrentControlValue();
			for (var i = 0; i < this.props.control.subControls.length; i++) {
				const columnControl = this.props.control.subControls[i];
				const lookupKey = subControlId + columnControl.name;
				// logger.info("Accessing sub-control " + lookupKey);
				const control = this.refs[lookupKey];
				if (typeof control !== "undefined") {
					const controlValue = control.getControlValue();
					// logger.info("Control value=" + controlValue);
					allValues[rowIndex][i] = controlValue;
				}
			}
			this.setCurrentControlValue(this.props.control.name, allValues, this.props.updateControlValue);
		}
	}

	addRow() {
		const newRow = JSON.parse(JSON.stringify(this.props.control.defaultRow));
		// logger.info(newRow);
		const rows = this.getCurrentControlValue();
		rows.push(newRow);

		this.setCurrentControlValue(this.props.control.name, rows, this.props.updateControlValue);
	}

	removeSelectedRows() {
		const rows = this.getCurrentControlValue();

		// Sort descending to ensure lower indices don"t get
		// changed when values are deleted
		const selected = this.getSelectedRows().sort(function(a, b) {
			return b - a;
		});

		for (let i = 0; i < selected.length; i++) {
			rows.splice(selected[i], 1);
		}

		this.setCurrentControlValue(this.props.control.name, rows, this.props.updateControlValue);
	}

	render() {
		const controlName = this.getControlID().replace(EDITOR_CONTROL, "");
		const conditionProps = {
			controlName: controlName,
			controlType: "structure-list-editor"
		};
		const conditionState = this.getConditionMsgState(conditionProps);

		const errorMessage = conditionState.message;
		const messageType = conditionState.messageType;
		const icon = conditionState.icon;
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;

		let controlIconContainerClass = "control-icon-container";
		if (messageType !== "info") {
			controlIconContainerClass = "control-icon-container-enabled";
		}

		const table = this.createTable();
		const tooltipId = "tooltip-list-editor-btn";
		const add = <Button data-tip="Add new row" data-for={tooltipId} bsSize="small" onClick={this.addRow} {...stateDisabled}>+</Button>;
		const remove = <Button data-tip="Delete selected rows" data-for={tooltipId} bsSize="small" onClick={this.removeSelectedRows} {...stateDisabled}>-</Button>;
		return (<div id={this.getControlID()} style={stateStyle}>
			<div id={controlIconContainerClass}>
				<div id="structure-list-editor-table-buttons" className="structure-list-editor" style={stateStyle}>
					{table}
					<div id="structure-list-editor-buttons-container">
						<span >{add} {remove}</span>
						<ReactTooltip
							id={tooltipId}
							place="top"
							type="light"
							effect="solid"
							border
							className="properties-tooltips"
							delayShow={TOOL_TIP_DELAY}
						/>
					</div>
				</div>
				{icon}
			</div>
			{errorMessage}
		</div>);
	}
}

StructurelisteditorControl.propTypes = {
	buildUIItem: PropTypes.func,
	dataModel: PropTypes.object.isRequired,
	control: PropTypes.object.isRequired,
	controlStates: PropTypes.object,
	validationDefinitions: PropTypes.object,
	requiredParameters: PropTypes.array,
	updateValidationErrorMessage: PropTypes.func,
	retrieveValidationErrorMessage: PropTypes.func,
	updateControlValue: PropTypes.func
};
