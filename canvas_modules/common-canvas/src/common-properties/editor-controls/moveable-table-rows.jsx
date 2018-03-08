/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import Icon from "../../icons/Icon.jsx";

export default class MoveableTableRows extends React.Component {
	constructor(props) {
		super(props);

		this.getTableRowMoveImages = this.getTableRowMoveImages.bind(this);
		this.topMoveRow = this.topMoveRow.bind(this);
		this.upMoveRow = this.upMoveRow.bind(this);
		this.downMoveRow = this.downMoveRow.bind(this);
		this.bottomMoveRow = this.bottomMoveRow.bind(this);
	}

	// enabled the move up and down arrows based on which row is selected
	getTableRowMoveImages() {
		const selected = this.props.controller.getSelectedRows(this.props.control.name).sort();
		const controlValue = this.props.getCurrentControlValue();
		const topEnabled = (selected.length !== 0 && selected[0] !== 0) && !this.props.disabled;
		const bottomEnabled = (selected.length !== 0 && selected[selected.length - 1] !== controlValue.length - 1) && !this.props.disabled;
		const topImages = (
			<div key="topImages">
				<div className="table-row-move-button" onClick={this.topMoveRow} disabled={!topEnabled}>
					<Icon type="moveTop" disabled={!topEnabled} />
				</div>
				<div className="table-row-move-button" onClick={this.upMoveRow} disabled={!topEnabled}>
					<Icon type="moveUp" disabled={!topEnabled} />
				</div>
			</div>
		);
		const bottomImages = (
			<div key="bottomImages">
				<div className="table-row-move-button" onClick={this.downMoveRow} disabled={!bottomEnabled}>
					<Icon type="moveDown" disabled={!bottomEnabled} />
				</div>
				<div className="table-row-move-button" onClick={this.bottomMoveRow} disabled={!bottomEnabled}>
					<Icon type="moveBottom" disabled={!bottomEnabled} />
				</div>
			</div>
		);
		return [topImages, bottomImages];
	}

	topMoveRow(evt) {
		var selected = this.props.controller.getSelectedRows(this.props.control.name).sort();
		const controlValue = this.props.getCurrentControlValue();
		for (var firstRow = selected[0]; firstRow > 0; firstRow--) {
			for (var i = 0; i <= selected.length - 1; i++) {
				const selectedRow = selected.shift();
				const tmpRow = controlValue[selectedRow - 1];
				controlValue[selectedRow - 1] = controlValue[selectedRow];
				controlValue[selectedRow] = tmpRow;
				selected.push(selectedRow - 1);
				this.props.controller.moveErrorMessageRows(this.props.propertyId.name, selectedRow, selectedRow - 1);
			}
		}
		if (selected.length > 0) {
			this.props.setScrollToRow(selected[0], true);
		}
		this.props.setCurrentControlValueSelected(controlValue, selected);
	}

	upMoveRow(evt) {
		const selected = this.props.controller.getSelectedRows(this.props.control.name).sort();
		// only move up if not already at the top especially for multiple selected
		if (selected.length !== 0 && selected[0] !== 0) {
			const controlValue = this.props.getCurrentControlValue();
			for (var i = 0; i <= selected.length - 1; i++) {
				const selectedRow = selected.shift();
				if (selectedRow !== 0) {
					const tmpRow = controlValue[selectedRow - 1];
					controlValue[selectedRow - 1] = controlValue[selectedRow];
					controlValue[selectedRow] = tmpRow;
					selected.push(selectedRow - 1);
					this.props.controller.moveErrorMessageRows(this.props.propertyId.name, selectedRow, selectedRow - 1);
				}
			}
			this.props.setScrollToRow(selected[0], true);
			this.props.setCurrentControlValueSelected(controlValue, selected);
		}
	}

	downMoveRow(evt) {
		const selected = this.props.controller.getSelectedRows(this.props.control.name).sort();
		const controlValue = this.props.getCurrentControlValue();
		// only move down if not already at the end especially for multiple selected
		if (selected.length !== 0 && selected[selected.length - 1] !== controlValue.length - 1) {
			for (var i = selected.length - 1; i >= 0; i--) {
				const selectedRow = selected.pop();
				if (selectedRow !== controlValue.length - 1) {
					const tmpRow = controlValue[selectedRow + 1];
					controlValue[selectedRow + 1] = controlValue[selectedRow];
					controlValue[selectedRow] = tmpRow;
					selected.unshift(selectedRow + 1);
					this.props.controller.moveErrorMessageRows(this.props.propertyId.name, selectedRow, selectedRow + 1);
				}
			}
			this.props.setScrollToRow(selected[selected.length - 1], false);
			this.props.setCurrentControlValueSelected(controlValue, selected);
		}
	}

	bottomMoveRow(evt) {
		var selected = this.props.controller.getSelectedRows(this.props.control.name).sort();
		const controlValue = this.props.getCurrentControlValue();
		for (var lastRow = selected[selected.length - 1]; lastRow < controlValue.length - 1; lastRow++) {
			for (var i = selected.length - 1; i >= 0; i--) {
				const selectedRow = selected.pop();
				const tmpRow = controlValue[selectedRow + 1];
				controlValue[selectedRow + 1] = controlValue[selectedRow];
				controlValue[selectedRow] = tmpRow;
				selected.unshift(selectedRow + 1);
				this.props.controller.moveErrorMessageRows(this.props.propertyId.name, selectedRow, selectedRow + 1);
			}
		}
		if (selected.length > 0) {
			this.props.setScrollToRow(selected[selected.length - 1], false);
		}
		this.props.setCurrentControlValueSelected(controlValue, selected);
	}

	render() {

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

		const tableKey = "moveablerow-table-" + this.props.control.name;
		var content = (<table id="structure-table">
			<colgroup>
				<col className="structure-table-first-column" />
				<col className="structure-table-second-column" />
			</colgroup>
			<tbody>
				<tr className="structure-table-content-row" style={this.props.stateStyle}>
					<td className="structure-table-content-row-first-column">
						{this.props.tableContainer}
					</td>
					<td>
						{moveCol}
					</td>
				</tr>
			</tbody>
		</table>
		);

		return (
			<div id= {tableKey}>
				{content}
			</div>
		);
	}
}

MoveableTableRows.propTypes = {
	control: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	getCurrentControlValue: PropTypes.func.isRequired,
	setCurrentControlValueSelected: PropTypes.func.isRequired,
	setScrollToRow: PropTypes.func.isRequired,
	tableContainer: PropTypes.object.isRequired,
	stateStyle: PropTypes.object,
	disabled: PropTypes.bool
};
