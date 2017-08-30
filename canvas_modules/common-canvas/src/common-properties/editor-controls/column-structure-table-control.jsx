/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* eslint max-depth: ["error", 5] */

// import logger from "../../../utils/logger";
import React from "react";
import PropTypes from "prop-types";
import ColumnStructureTableEditor from "./column-structure-table-editor.jsx";
import TopMoveIconEnable from "../../../assets/images/top_enabled.svg";
import UpMoveIconEnable from "../../../assets/images/up_enabled.svg";
import DownMoveIconEnable from "../../../assets/images/down_enabled.svg";
import BottomMoveIconEnable from "../../../assets/images/bottom_enabled.svg";
import TopMoveIconDisable from "../../../assets/images/top_disabled.svg";
import UpMoveIconDisable from "../../../assets/images/up_disabled.svg";
import DownMoveIconDisable from "../../../assets/images/down_disabled.svg";
import BottomMoveIconDisable from "../../../assets/images/bottom_disabled.svg";
import { EDITOR_CONTROL } from "../constants/constants.js";

var _ = require("underscore");

const ARROW_HEIGHT = 14;
const ARROW_WIDTH = 14;

export default class ColumnStructureTableControl extends ColumnStructureTableEditor {
	constructor(props) {
		super(props);

		this._update_callback = null;

		this.getSelectedColumns = this.getSelectedColumns.bind(this);
		this.getAllocatedColumns = this.getAllocatedColumns.bind(this);
		this.addColumns = this.addColumns.bind(this);
		this.removeColumns = this.removeColumns.bind(this);
		this.removeSelected = this.removeSelected.bind(this);
		this.stopEditingRow = this.stopEditingRow.bind(this);

		this.indexOfRow = this.indexOfRow.bind(this);

		this.mouseEnterRemoveButton = this.mouseEnterRemoveButton.bind(this);
		this.mouseLeaveRemoveButton = this.mouseLeaveRemoveButton.bind(this);

		this.getTableRowMoveImages = this.getTableRowMoveImages.bind(this);
		this.topMoveRow = this.topMoveRow.bind(this);
		this.upMoveRow = this.upMoveRow.bind(this);
		this.downMoveRow = this.downMoveRow.bind(this);
		this.bottomMoveRow = this.bottomMoveRow.bind(this);
		this.hasFilter = this.hasFilter.bind(this);
	}

	stopEditingRow(rowIndex, applyChanges) {
		// logger.info("stopEditingRow: row=" + rowIndex + ", applyChanges=" + applyChanges);

		if (applyChanges) {
			const subControlId = this.getSubControlId();
			const allValues = this.getCurrentControlValue();
			for (var i = 0; i < this.props.control.subControls.length; i++) {
				if (i !== this.props.control.keyIndex) {
					const columnControl = this.props.control.subControls[i];
					const lookupKey = subControlId + columnControl.name;
					// logger.info("Accessing sub-control " + lookupKey);
					const control = this.refs[lookupKey];
					// logger.info(control);
					if (typeof control !== "undefined") {
						const controlValue = control.getControlValue();
						// logger.info("Control value=" + controlValue);
						allValues[rowIndex][i] = controlValue;
					}
				}
			}
			this.setCurrentControlValue(this.props.control.name, allValues, this.props.updateControlValue);
		}
	}

	indexOfRow(columnName) {
		const keyIndex = this.props.control.keyIndex;
		return _.findIndex(this.getCurrentControlValue(), function(row) {
			return row[keyIndex] === columnName;
		});
	}

	// Selected columns are those that are referenced by values in the control that have
	// been selected by the user.
	getSelectedColumns() {
		// logger.info("getSelectedColumns");
		const selected = this.getSelectedRows();
		const controlValue = this.getCurrentControlValue();
		const columns = [];

		for (var i = 0; i < selected.length; i++) {
			const rowIndex = selected[i];
			columns.push(controlValue[rowIndex][this.props.control.keyIndex]);
		}
		// logger.info(columns);
		return columns;
	}

	// Allocated columns are columns that are referenced by the current control value.
	getAllocatedColumns() {
		// logger.info("getAllocatedColumns");
		const controlValue = this.getCurrentControlValue();
		const columns = [];
		for (var i = 0; i < controlValue.length; i++) {
			const value = controlValue[i];
			columns.push(value[this.props.control.keyIndex]);
		}
		// logger.info(columns);
		return columns;
	}

	addColumns(columnNames, callback) {
		// logger.info("addColumns");
		// logger.info(columnNames);
		// logger.info(this.props.control.defaultRow);

		const newRows = [];
		const isMap = this.props.control.valueDef.isMap;
		for (var i = 0; i < columnNames.length; i++) {
			const columnName = columnNames[i];

			// Sometimes the source list selection hasn"t changed so do an
			// explicit check for whether an entry for this column exists
			if (this.indexOfRow(columnName) < 0) {
				// Must be a better way of cloning the array but this will do for now
				const newRow = JSON.parse(JSON.stringify(this.props.control.defaultRow));

				// Set the column name.
				if (isMap) {
					// For maps, this means adding the column name to the start of the cloned list.
					newRow.unshift(columnName);
				} else {
					// For lists, this means assigning the column name to the correct location in the cloned list.
					newRow[this.props.control.keyIndex] = columnName;
				}
				newRows.push(newRow);
			}
		}

		const rows = this.getCurrentControlValue().concat(newRows);

		this._update_callback = callback;

		this.setCurrentControlValue(this.props.control.name, rows, this.props.updateControlValue);
	}

	removeColumns(columnNames, callback) {
		// logger.info("removeColumns");
		// logger.info(columnNames);

		const rows = this.getCurrentControlValue();
		const keyIndex = this.props.control.keyIndex;

		const newRows = _.reject(rows, function(val) {
			// logger.info("_reject: " + val[keyIndex]);
			// logger.info("_reject: " + (columnNames.indexOf(val[keyIndex]) >= 0));
			return columnNames.indexOf(val[keyIndex]) >= 0;
		});

		// logger.info(rows);
		// logger.info(newRows);

		this._update_callback = callback;

		this.setCurrentControlValue(this.props.control.name, newRows, this.props.updateControlValue);
	}

	removeSelected() {
		const rows = this.getCurrentControlValue();
		const newRows = [];
		const selected = this.getSelectedRows();
		for (var i = 0; i < rows.length; i++) {
			if (selected.indexOf(i) < 0) {
				newRows.push(rows[i]);
			}
		}
		this.setCurrentControlValue(this.props.control.name, newRows, this.props.updateControlValue);
	}

	selectionChanged(selection) {
		ColumnStructureTableEditor.prototype.selectionChanged.call(this, selection);
		this.setState({ enableRemoveIcon: (selection.length !== 0) });
	}

	mouseEnterRemoveButton() {
		this.setState({ hoverRemoveIcon: true });
	}

	mouseLeaveRemoveButton() {
		this.setState({ hoverRemoveIcon: false });
	}

	topMoveRow(evt) {
		var selected = this.getSelectedRows().sort();
		const controlValue = this.getCurrentControlValue();
		for (var firstRow = selected[0]; firstRow > 0; firstRow--) {
			for (var i = 0; i <= selected.length - 1; i++) {
				const selectedRow = selected.shift();
				const tmpRow = controlValue[selectedRow - 1];
				controlValue[selectedRow - 1] = controlValue[selectedRow];
				controlValue[selectedRow] = tmpRow;
				selected.push(selectedRow - 1);
			}
		}
		if (selected.length > 0) {
			this.setScrollToRow(selected[0], true);
		}
		this.setCurrentControlValueSelected(this.props.control.name, controlValue, this.props.updateControlValue, selected);
	}

	upMoveRow(evt) {
		const selected = this.getSelectedRows().sort();
		// only move up if not already at the top especially for multiple selected
		if (selected.length !== 0 && selected[0] !== 0) {
			const controlValue = this.getCurrentControlValue();
			for (var i = 0; i <= selected.length - 1; i++) {
				const selectedRow = selected.shift();
				if (selectedRow !== 0) {
					const tmpRow = controlValue[selectedRow - 1];
					controlValue[selectedRow - 1] = controlValue[selectedRow];
					controlValue[selectedRow] = tmpRow;
					selected.push(selectedRow - 1);
				}
			}
			this.setScrollToRow(selected[0], true);
			this.setCurrentControlValueSelected(this.props.control.name, controlValue, this.props.updateControlValue, selected);
		}
	}

	downMoveRow(evt) {
		const selected = this.getSelectedRows().sort();
		const controlValue = this.getCurrentControlValue();
		// only move down if not already at the end especially for multiple selected
		if (selected.length !== 0 && selected[selected.length - 1] !== controlValue.length - 1) {
			for (var i = selected.length - 1; i >= 0; i--) {
				const selectedRow = selected.pop();
				if (selectedRow !== controlValue.length - 1) {
					const tmpRow = controlValue[selectedRow + 1];
					controlValue[selectedRow + 1] = controlValue[selectedRow];
					controlValue[selectedRow] = tmpRow;
					selected.unshift(selectedRow + 1);
				}
			}
			this.setScrollToRow(selected[selected.length - 1], false);
			this.setCurrentControlValueSelected(this.props.control.name, controlValue, this.props.updateControlValue, selected);
		}
	}

	bottomMoveRow(evt) {
		var selected = this.getSelectedRows().sort();
		const controlValue = this.getCurrentControlValue();
		for (var lastRow = selected[selected.length - 1]; lastRow < controlValue.length - 1; lastRow++) {
			for (var i = selected.length - 1; i >= 0; i--) {
				const selectedRow = selected.pop();
				const tmpRow = controlValue[selectedRow + 1];
				controlValue[selectedRow + 1] = controlValue[selectedRow];
				controlValue[selectedRow] = tmpRow;
				selected.unshift(selectedRow + 1);
			}
		}
		if (selected.length > 0) {
			this.setScrollToRow(selected[selected.length - 1], false);
		}
		this.setCurrentControlValueSelected(this.props.control.name, controlValue, this.props.updateControlValue, selected);
	}

	// enabled the move up and down arrows based on which row is selected
	getTableRowMoveImages() {
		const selected = this.getSelectedRows().sort();
		const controlValue = this.getCurrentControlValue();
		const topEnabled = (selected.length !== 0 && selected[0] !== 0);
		const bottomEnabled = (selected.length !== 0 && selected[selected.length - 1] !== controlValue.length - 1);
		const topImages = topEnabled ? (
			<div key="topImages">
				<div onClick={this.topMoveRow}>
					<img className="table-row-move-button" src={TopMoveIconEnable} height={ARROW_HEIGHT} width={ARROW_WIDTH} />
				</div>
				<div onClick={this.upMoveRow}>
					<img className="table-row-move-button" src={UpMoveIconEnable} height={ARROW_HEIGHT} width={ARROW_WIDTH} />
				</div>
			</div>
		)
			: (
				<div key="topImages">
					<img className="table-row-move-button-disable" height={ARROW_HEIGHT} width={ARROW_WIDTH} src={TopMoveIconDisable} />
					<img className="table-row-move-button-disable" height={ARROW_HEIGHT} width={ARROW_WIDTH} src={UpMoveIconDisable} />
				</div>
			);
		const bottomImages = bottomEnabled ? (
			<div key="bottomImages">
				<div onClick={this.downMoveRow}>
					<img className="table-row-move-button" src={DownMoveIconEnable} height={ARROW_HEIGHT} width={ARROW_WIDTH} />
				</div>
				<div onClick={this.bottomMoveRow}>
					<img className="table-row-move-button" src={BottomMoveIconEnable} height={ARROW_HEIGHT} width={ARROW_WIDTH} />
				</div>
			</div>
		)
			: (
				<div key="bottomImages">
					<img className="table-row-move-button-disable" height={ARROW_HEIGHT} width={ARROW_WIDTH} src={DownMoveIconDisable} />
					<img className="table-row-move-button-disable" height={ARROW_HEIGHT} width={ARROW_WIDTH} src={BottomMoveIconDisable} />
				</div>
			);
		return [topImages, bottomImages];
	}

	hasFilter() {
		let hasFilter = false;
		for (const subControl of this.props.control.subControls) {
			if (subControl.filterable) {
				hasFilter = true;
				break;
			}
		}
		return hasFilter;
	}

	render() {
		if (this._update_callback !== null) {
			this._update_callback();
			this._update_callback = null;
		}

		const controlName = this.getControlID().replace(EDITOR_CONTROL, "");
		const conditionProps = {
			controlName: controlName,
			controlType: "table"
		};
		const conditionState = this.getConditionMsgState(conditionProps);

		const errorMessage = conditionState.message;
		const messageType = conditionState.messageType;
		const icon = conditionState.icon;
		// const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;

		let controlIconContainerClass = "control-icon-container";
		if (messageType !== "info") {
			controlIconContainerClass = "control-icon-container-enabled";
		}

		var moveCol = <tc />;
		if (typeof this.props.control.moveableRows !== "undefined" && this.props.control.moveableRows) {
			const moveImages = this.getTableRowMoveImages();
			moveCol = (
				<div
					id="table-row-move-button-container"
				>
					{moveImages}
				</div>
			);
		}

		const table = this.createTable(stateStyle);
		let label;
		if (this.props.control.label && this.props.control.separateLabel) {
			if (!(this.props.control.description && this.props.control.description.placement === "on_panel")) {
				let requiredIndicator;
				if (this.props.control.required) {
					requiredIndicator = <span className="required-control-indicator">*</span>;
				}
				label = (<div className={"label-container"}>
					<label className="control-label">{this.props.control.label.text}</label>
					{requiredIndicator}
				</div>);
			}
		}
		var content = (<table id="structure-table">
			<colgroup>
				<col className="structure-table-first-column" />
				<col className="structure-table-second-column" />
			</colgroup>
			<tbody>
				<tr className="structure-table-content-row" style={stateStyle}>
					<td>
						<div id={controlIconContainerClass}>
							{table}
							{icon}
						</div>
						{errorMessage}
					</td>
					<td>
						{moveCol}
					</td>
				</tr>
			</tbody>
		</table>
		);

		return (
			<div>
				{content}
			</div>
		);
	}
}

ColumnStructureTableControl.propTypes = {
	buildUIItem: PropTypes.func,
	dataModel: PropTypes.object.isRequired,
	control: PropTypes.object.isRequired,
	controlStates: PropTypes.object,
	validationDefinitions: PropTypes.array,
	updateValidationErrorMessage: PropTypes.func,
	retrieveValidationErrorMessage: PropTypes.func,
	updateControlValue: PropTypes.func
};
