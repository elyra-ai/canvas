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

/* eslint max-depth: ["error", 5] */

import logger from "../../../utils/logger";
import React from "react";
import ColumnStructureTableEditor from "./column-structure-table-editor.jsx";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Button } from "ap-components-react/dist/ap-components-react";
import Isvg from "react-inlinesvg";
import remove32 from "../../../assets/images/remove_32.svg";
import TopMoveIconEnable from "../../../assets/images/top_enabled.svg";
import UpMoveIconEnable from "../../../assets/images/up_enabled.svg";
import DownMoveIconEnable from "../../../assets/images/down_enabled.svg";
import BottomMoveIconEnable from "../../../assets/images/bottom_enabled.svg";
import TopMoveIconDisable from "../../../assets/images/top_disabled.svg";
import UpMoveIconDisable from "../../../assets/images/up_disabled.svg";
import DownMoveIconDisable from "../../../assets/images/down_disabled.svg";
import BottomMoveIconDisable from "../../../assets/images/bottom_disabled.svg";

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

		this.getTableRowMoveImages = this.getTableRowMoveImages.bind(this);
		this.topMoveRow = this.topMoveRow.bind(this);
		this.upMoveRow = this.upMoveRow.bind(this);
		this.downMoveRow = this.downMoveRow.bind(this);
		this.bottomMoveRow = this.bottomMoveRow.bind(this);
	}

	stopEditingRow(rowIndex, applyChanges) {
		logger.info("stopEditingRow: row=" + rowIndex + ", applyChanges=" + applyChanges);

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
						logger.info("Control value=" + controlValue);
						if (columnControl.valueDef.isList === true) {
							allValues[rowIndex][i] = JSON.stringify(controlValue);
						} else {
							allValues[rowIndex][i] = controlValue[0];
						}
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
		const opacity = "opacity:" + (selection.length > 0 ? 1.0 : 0.4);
		document.getElementById("remove-fields-button").style.cssText = opacity;
		document.getElementById("remove-fields-button").setAttribute("disabled", selection.length === 0);
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
		this.setCurrentControlValueSelected(this.props.control.name, controlValue, this.props.updateControlValue, selected);
	}

  // enabled the move up and down arrows based on which row is selected
	getTableRowMoveImages() {
		const selected = this.getSelectedRows();
		const controlValue = this.getCurrentControlValue();
		let topEnabled = false;
		let bottomEnabled = false;
		if (selected.length !== 0 && selected.length !== controlValue.length) {
			for (var selectedRow of selected) {
				if (selectedRow !== 0) {
					topEnabled = true;
				}
				if (selectedRow !== controlValue.length - 1) {
					bottomEnabled = true;
				}
			}
		}
		const topImages = topEnabled ? (
			<div>
				<img className="table-row-move-button" src={TopMoveIconEnable} height={ARROW_HEIGHT} width={ARROW_WIDTH} onClick={this.topMoveRow} />
				<img className="table-row-move-button" src={UpMoveIconEnable} height={ARROW_HEIGHT} width={ARROW_WIDTH} onClick={this.upMoveRow} />
			</div>
		)
		: (
			<div>
				<img className="table-row-move-button-disable" height={ARROW_HEIGHT} width={ARROW_WIDTH} src={TopMoveIconDisable} />
				<img className="table-row-move-button-disable" height={ARROW_HEIGHT} width={ARROW_WIDTH} src={UpMoveIconDisable} />
			</div>
		);
		const bottomImages = bottomEnabled ? (
			<div>
				<img className="table-row-move-button" src={DownMoveIconEnable} height={ARROW_HEIGHT} width={ARROW_WIDTH} onClick={this.downMoveRow} />
				<img className="table-row-move-button" src={BottomMoveIconEnable} height={ARROW_HEIGHT} width={ARROW_WIDTH} onClick={this.bottomMoveRow} />
			</div>
		)
		: (
			<div>
				<img className="table-row-move-button-disable" height={ARROW_HEIGHT} width={ARROW_WIDTH} src={DownMoveIconDisable} />
				<img className="table-row-move-button-disable" height={ARROW_HEIGHT} width={ARROW_WIDTH} src={BottomMoveIconDisable} />
			</div>
		);
		return [topImages, bottomImages];
	}

	render() {
		if (this._update_callback !== null) {
			this._update_callback();
			this._update_callback = null;
		}

		let className = "structure-table-content-row";
		var errorMessage = <div className="validation-error-message"></div>;
		if (this.state.validateErrorMessage && this.state.validateErrorMessage.text !== "") {
			// stateStyle.borderColor = "#FF0000 !important";
			className += " error-border";
			errorMessage = (
				<div className="validation-error-message">
					<p className="form__validation" style={{ "display": "block", "margin": "0px" }} >
						<span className="form__validation--invalid">{this.state.validateErrorMessage.text}</span>
					</p>
				</div>
			);
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

		const addTooltip = <Tooltip id="addFieldTip">Select columns to add</Tooltip>;
		const removeTooltip = <Tooltip id="removeFieldTip">Remove selected columns</Tooltip>;
		const table = this.createTable();
		var content = (<table id="structure-table">
			<colgroup>
				<col className="structure-table-first-column" />
				<col className="structure-table-second-column" />
			</colgroup>
			<tbody>
				<tr className="structure-table-button-row">
					<td>
						<OverlayTrigger placement="top" overlay={addTooltip}>
							<Button
								id="add-fields-button"
								icon="plus"
								onClick={this.props.openFieldPicker}
								data-control={JSON.stringify(this.props.control)}
							>
								Add Columns
							</Button>
						</OverlayTrigger>
						<OverlayTrigger placement="top" overlay={removeTooltip}>
							<div id="remove-fields-button" className="button" onClick={this.removeSelected}>
								<Isvg id="remove-fields-button" src={remove32} />
							</div>
						</OverlayTrigger>
					</td>
				</tr>
				<tr className="structure-table-content-row">
					<td>
						{table}
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
	buildUIItem: React.PropTypes.func,
	dataModel: React.PropTypes.object.isRequired,
	control: React.PropTypes.object.isRequired,
	updateControlValue: React.PropTypes.func
};
