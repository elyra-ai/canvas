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
import TopMoveIconEnable from "../../../assets/images/top_enabled.svg";
import UpMoveIconEnable from "../../../assets/images/up_enabled.svg";
import DownMoveIconEnable from "../../../assets/images/down_enabled.svg";
import BottomMoveIconEnable from "../../../assets/images/bottom_enabled.svg";
import TopMoveIconDisable from "../../../assets/images/top_disabled.svg";
import UpMoveIconDisable from "../../../assets/images/up_disabled.svg";
import DownMoveIconDisable from "../../../assets/images/down_disabled.svg";
import BottomMoveIconDisable from "../../../assets/images/bottom_disabled.svg";

const ARROW_HEIGHT = 14;
const ARROW_WIDTH = 14;

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
		const selected = this.props.getSelectedRows().sort();
		const controlValue = this.props.getCurrentControlValue();
		const topEnabled = (selected.length !== 0 && selected[0] !== 0) && !this.props.disabled;
		const bottomEnabled = (selected.length !== 0 && selected[selected.length - 1] !== controlValue.length - 1) && !this.props.disabled;
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

	topMoveRow(evt) {
		var selected = this.props.getSelectedRows().sort();
		const controlValue = this.props.getCurrentControlValue();
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
			this.props.setScrollToRow(selected[0], true);
		}
		this.props.setCurrentControlValueSelected(this.props.control.name, controlValue, this.props.updateControlValue, selected);
	}

	upMoveRow(evt) {
		const selected = this.props.getSelectedRows().sort();
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
				}
			}
			this.props.setScrollToRow(selected[0], true);
			this.props.setCurrentControlValueSelected(this.props.control.name, controlValue, this.props.updateControlValue, selected);
		}
	}

	downMoveRow(evt) {
		const selected = this.props.getSelectedRows().sort();
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
				}
			}
			this.props.setScrollToRow(selected[selected.length - 1], false);
			this.props.setCurrentControlValueSelected(this.props.control.name, controlValue, this.props.updateControlValue, selected);
		}
	}

	bottomMoveRow(evt) {
		var selected = this.props.getSelectedRows().sort();
		const controlValue = this.props.getCurrentControlValue();
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
			this.props.setScrollToRow(selected[selected.length - 1], false);
		}
		this.props.setCurrentControlValueSelected(this.props.control.name, controlValue, this.props.updateControlValue, selected);
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
	updateControlValue: PropTypes.func.isRequired,
	getSelectedRows: PropTypes.func.isRequired,
	getCurrentControlValue: PropTypes.func.isRequired,
	setCurrentControlValueSelected: PropTypes.func.isRequired,
	setScrollToRow: PropTypes.func.isRequired,
	tableContainer: PropTypes.object.isRequired,
	stateStyle: PropTypes.object,
	disabled: PropTypes.bool
};
