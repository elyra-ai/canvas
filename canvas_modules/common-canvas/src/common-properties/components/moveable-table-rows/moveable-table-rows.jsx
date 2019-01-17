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
import Icon from "./../../../icons/icon.jsx";
import classNames from "classnames";


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
		const selected = this.props.controller.getSelectedRows(this.props.propertyId).sort();
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		const topEnabled = (selected.length !== 0 && selected[0] !== 0) && !this.props.disabled;
		const bottomEnabled = (selected.length !== 0 && selected[selected.length - 1] !== controlValue.length - 1) && !this.props.disabled;
		const topImages = (
			<div key="topImages">
				<button type="button" className="table-row-move-button" onClick={this.topMoveRow} disabled={!topEnabled}>
					<Icon type="moveTop" disabled={!topEnabled} />
				</button>
				<button type="button" className="table-row-move-button" onClick={this.upMoveRow} disabled={!topEnabled}>
					<Icon type="moveUp" disabled={!topEnabled} />
				</button>
			</div>
		);
		const bottomImages = (
			<div key="bottomImages">
				<button type="button" className="table-row-move-button" onClick={this.downMoveRow} disabled={!bottomEnabled}>
					<Icon type="moveDown" disabled={!bottomEnabled} />
				</button>
				<button type="button" className="table-row-move-button" onClick={this.bottomMoveRow} disabled={!bottomEnabled}>
					<Icon type="moveBottom" disabled={!bottomEnabled} />
				</button>
			</div>
		);
		return [topImages, bottomImages];
	}

	topMoveRow(evt) {
		var selected = this.props.controller.getSelectedRows(this.props.propertyId).sort();
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
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
		const selected = this.props.controller.getSelectedRows(this.props.propertyId).sort();
		// only move up if not already at the top especially for multiple selected
		if (selected.length !== 0 && selected[0] !== 0) {
			const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
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
			if (selected.length > 1) {
				if (selected[0] === 0) {
					this.props.setScrollToRow(selected[0], true);
				} else {
					this.props.setScrollToRow(selected[0], { behavior: "smooth", block: "start", inline: "nearest" });
				}
			} else {
				this.props.setScrollToRow(selected[0], { behavior: "smooth", block: "center", inline: "center" });
			}
			this.props.setCurrentControlValueSelected(controlValue, selected);
		}
	}

	downMoveRow(evt) {
		const selected = this.props.controller.getSelectedRows(this.props.propertyId).sort();
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
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
			if (selected.length > 1) {
				if (selected[selected.length - 1] === controlValue.length - 1) {
					this.props.setScrollToRow(selected[selected.length - 1], false);
				} else {
					this.props.setScrollToRow(selected[selected.length - 1], { behavior: "smooth", block: "end", inline: "end" });
				}
			} else {
				this.props.setScrollToRow(selected[0], { behavior: "smooth", block: "center", inline: "center" });
			}
			this.props.setCurrentControlValueSelected(controlValue, selected);
		}
	}

	bottomMoveRow(evt) {
		var selected = this.props.controller.getSelectedRows(this.props.propertyId).sort();
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
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

		var moveCol = null;
		if (typeof this.props.control.moveableRows !== "undefined" && this.props.control.moveableRows) {
			const moveImages = this.getTableRowMoveImages();
			moveCol = (
				<div
					className="properties-mr-button-container"
				>
					{moveImages}
				</div>
			);
		}

		var content = (<table className="properties-mr-table-container">
			<tbody>
				<tr className={classNames("properties-mr-table-content", { "disabled": this.props.disabled })}>
					<td>
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
			<div>
				{content}
			</div>
		);
	}
}

MoveableTableRows.propTypes = {
	control: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	setCurrentControlValueSelected: PropTypes.func.isRequired,
	setScrollToRow: PropTypes.func.isRequired,
	tableContainer: PropTypes.object.isRequired,
	disabled: PropTypes.bool
};
