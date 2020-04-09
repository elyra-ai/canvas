/*
 * Copyright 2017-2020 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react";
import PropTypes from "prop-types";
import { Button } from "carbon-components-react";
import PropertyUtils from "./../../util/property-utils";
import { ArrowUp24, ArrowDown24, BackToTop24, DownToBottom24 } from "@carbon/icons-react";
import classNames from "classnames";

import { MESSAGE_KEYS } from "./../../constants/constants";

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

		const topLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.MOVEABLE_TABLE_BUTTON_TOP_DESCRIPTION);
		const upLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.MOVEABLE_TABLE_BUTTON_UP_DESCRIPTION);
		const topImages = (
			<div key="topImages">
				<Button
					className="table-row-move-button"
					onClick={this.topMoveRow}
					disabled={!topEnabled}
					kind="ghost"
					renderIcon={BackToTop24}
					iconDescription={topLabel}
				/>
				<Button
					className="table-row-move-button"
					onClick={this.upMoveRow}
					disabled={!topEnabled}
					kind="ghost"
					renderIcon={ArrowUp24}
					iconDescription={upLabel}
				/>
			</div>
		);
		const bottomLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(),	MESSAGE_KEYS.MOVEABLE_TABLE_BUTTON_DOWN_DESCRIPTION);
		const downLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(),	MESSAGE_KEYS.MOVEABLE_TABLE_BUTTON_BOTTOM_DESCRIPTION);
		const bottomImages = (
			<div key="bottomImages">
				<Button
					className="table-row-move-button"
					onClick={this.downMoveRow}
					disabled={!bottomEnabled}
					kind="ghost"
					renderIcon={ArrowDown24}
					iconDescription={bottomLabel}
				/>
				<Button
					className="table-row-move-button"
					onClick={this.bottomMoveRow}
					disabled={!bottomEnabled}
					kind="ghost"
					renderIcon={DownToBottom24}
					iconDescription={downLabel}
				/>
			</div>
		);
		return [topImages, bottomImages];
	}

	topMoveRow(evt) {
		var selected = this.props.controller.getSelectedRows(this.props.propertyId).sort(function(a, b) {
			return a - b;
		});
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
			this.props.setScrollToRow(selected[0]);
		}
		this.props.setCurrentControlValueSelected(controlValue, selected);
	}

	upMoveRow(evt) {
		const selected = this.props.controller.getSelectedRows(this.props.propertyId).sort(function(a, b) {
			return a - b;
		});
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
			this.props.setScrollToRow(selected[0]);
			this.props.setCurrentControlValueSelected(controlValue, selected);
		}
	}

	downMoveRow(evt) {
		const selected = this.props.controller.getSelectedRows(this.props.propertyId).sort(function(a, b) {
			return a - b;
		});
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
				this.props.setScrollToRow(selected[selected.length - 1]);
			} else {
				this.props.setScrollToRow(selected[0]);
			}
			this.props.setCurrentControlValueSelected(controlValue, selected);
		}
	}

	bottomMoveRow(evt) {
		var selected = this.props.controller.getSelectedRows(this.props.propertyId).sort(function(a, b) {
			return a - b;
		});
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
			this.props.setScrollToRow(selected[selected.length - 1]);
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
