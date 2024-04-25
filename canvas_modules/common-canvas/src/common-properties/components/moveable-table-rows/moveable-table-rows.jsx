/*
 * Copyright 2017-2023 Elyra Authors
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
import { connect } from "react-redux";
import { Button } from "@carbon/react";
import { formatMessage } from "./../../util/property-utils";
import { ArrowUp, ArrowDown, UpToTop, DownToBottom } from "@carbon/react/icons";
import classNames from "classnames";
import EmptyTable from "./../empty-table";
import { MESSAGE_KEYS } from "./../../constants/constants";

class MoveableTableRows extends React.Component {
	constructor(props) {
		super(props);

		this.getTableRowMoveImages = this.getTableRowMoveImages.bind(this);
		this.topMoveRow = this.topMoveRow.bind(this);
		this.upMoveRow = this.upMoveRow.bind(this);
		this.downMoveRow = this.downMoveRow.bind(this);
		this.bottomMoveRow = this.bottomMoveRow.bind(this);
		this.getMoveableTableRows = this.getMoveableTableRows.bind(this);
		this.getLeastValue = this.getLeastValue.bind(this);
		this.getMaxValue = this.getMaxValue.bind(this);
	}

	getMoveableTableRows() {
		let moveCol = null;
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

		// Added role presentation to fix a11y violation - no headers in the table
		const content = (<table role="presentation" className="properties-mr-table-container">
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

	// enabled the move up and down arrows based on which row is selected
	getTableRowMoveImages() {
		const selected = this.props.controller.getSelectedRows(this.props.propertyId).sort();
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		let topEnabled = (
			!this.props.disableRowMoveButtons &&
			(selected.length !== 0 && selected[0] !== 0) &&
			!this.props.disabled
		);
		let bottomEnabled = (
			!this.props.disableRowMoveButtons &&
			(selected.length !== 0 && selected[selected.length - 1] !== controlValue.length - 1) &&
			!this.props.disabled
		);
		const staticRows = this.props.controller.getStaticRows(this.props.propertyId).sort();
		if (selected.length > 0 && staticRows.length > 0 && staticRows.includes(selected[0])) {
			topEnabled = false;
			bottomEnabled = false;
		} else if (selected[0] === staticRows[staticRows.length - 1] + 1) {
			topEnabled = false;
			bottomEnabled = (
				!this.props.disableRowMoveButtons &&
				(selected.length !== 0 && selected[selected.length - 1] !== controlValue.length - 1) &&
				!this.props.disabled
			);
		} else if (selected[0] === staticRows[0] - 1) {
			bottomEnabled = false;
		}


		const topLabel = formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.TABLE_TOOLBAR_BUTTON_TOP);
		const upLabel = formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.TABLE_TOOLBAR_BUTTON_UP);
		const UpToTop24 = React.forwardRef((props, ref) => <UpToTop ref={ref} size={24} {...props} />);
		const ArrowUp24 = React.forwardRef((props, ref) => <ArrowUp ref={ref} size={24} {...props} />);
		const topImages = (
			<div key="topImages">
				<Button
					className="table-row-move-button"
					onClick={this.topMoveRow}
					disabled={!topEnabled}
					kind="ghost"
					renderIcon={UpToTop24}
					iconDescription={topLabel}
					tooltipPosition="left"
					size="sm"
					hasIconOnly
				/>
				<Button
					className="table-row-move-button"
					onClick={this.upMoveRow}
					disabled={!topEnabled}
					kind="ghost"
					renderIcon={ArrowUp24}
					iconDescription={upLabel}
					tooltipPosition="left"
					size="sm"
					hasIconOnly
				/>
			</div>
		);
		const bottomLabel = formatMessage(this.props.controller.getReactIntl(),	MESSAGE_KEYS.TABLE_TOOLBAR_BUTTON_BOTTOM);
		const downLabel = formatMessage(this.props.controller.getReactIntl(),	MESSAGE_KEYS.TABLE_TOOLBAR_BUTTON_DOWN);
		const ArrowDown24 = React.forwardRef((props, ref) => <ArrowDown ref={ref} size={24} {...props} />);
		const DownToBottom24 = React.forwardRef((props, ref) => <DownToBottom ref={ref} size={24} {...props} />);
		const bottomImages = (
			<div key="bottomImages">
				<Button
					className="table-row-move-button"
					onClick={this.downMoveRow}
					disabled={!bottomEnabled}
					kind="ghost"
					renderIcon={ArrowDown24}
					iconDescription={bottomLabel}
					tooltipPosition="left"
					size="sm"
					hasIconOnly
				/>
				<Button
					className="table-row-move-button"
					onClick={this.bottomMoveRow}
					disabled={!bottomEnabled}
					kind="ghost"
					renderIcon={DownToBottom24}
					iconDescription={downLabel}
					tooltipPosition="left"
					size="sm"
					hasIconOnly
				/>
			</div>
		);
		return [topImages, bottomImages];
	}

	getLeastValue() {
		let leastValue = 0;
		const staticRows = this.props.controller.getStaticRows(this.props.propertyId).sort();
		if (staticRows && staticRows.length > 0 && staticRows.includes(0)) {
			leastValue = staticRows[staticRows.length - 1];
		}
		return leastValue;
	}

	getMaxValue() {
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		let maxValue = controlValue.length - 1;
		const staticRows = this.props.controller.getStaticRows(this.props.propertyId).sort();
		if (staticRows && staticRows.length > 0 && staticRows.includes(controlValue.length - 1)) {
			maxValue = staticRows[0] - 1;
		}
		return maxValue;
	}

	topMoveRow(evt) {
		var selected = this.props.controller.getSelectedRows(this.props.propertyId).sort(function(a, b) {
			return a - b;
		});
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		const leastValue = this.getLeastValue();
		const staticRows = this.props.controller.getStaticRows(this.props.propertyId).sort();
		for (var firstRow = selected[0]; firstRow > leastValue; firstRow--) {
			for (var i = 0; i <= selected.length - 1; i++) {
				if ((staticRows.length > 0 && selected[0] > leastValue + 1) || staticRows.length === 0) {
					const selectedRow = selected.shift();
					const tmpRow = controlValue[selectedRow - 1];
					controlValue[selectedRow - 1] = controlValue[selectedRow];
					controlValue[selectedRow] = tmpRow;
					selected.push(selectedRow - 1);
					this.props.controller.moveErrorMessageRows(this.props.propertyId.name, selectedRow, selectedRow - 1);
				}
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
		const leastValue = this.getLeastValue();
		const staticRows = this.props.controller.getStaticRows(this.props.propertyId).sort();
		// only move up if not already at the top especially for multiple selected
		// Move up only till the static rows index
		if (selected.length !== 0 && selected[0] > leastValue) {
			const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
			for (var i = 0; i <= selected.length - 1; i++) {
				if (staticRows.length > 0 && selected[0] > leastValue + 1) {
					const selectedRow = selected.shift();
					const tmpRow = controlValue[selectedRow - 1];
					controlValue[selectedRow - 1] = controlValue[selectedRow];
					controlValue[selectedRow] = tmpRow;
					selected.push(selectedRow - 1);
					this.props.controller.moveErrorMessageRows(this.props.propertyId.name, selectedRow, selectedRow - 1);
				} else if (staticRows.length === 0) {
					const selectedRow = selected.shift();
					if (selectedRow !== 0) {
						const tmpRow = controlValue[selectedRow - 1];
						controlValue[selectedRow - 1] = controlValue[selectedRow];
						controlValue[selectedRow] = tmpRow;
						selected.push(selectedRow - 1);
						this.props.controller.moveErrorMessageRows(this.props.propertyId.name, selectedRow, selectedRow - 1);
					}
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
		const maxValue = this.getMaxValue();
		// only move down if not already at the end especially for multiple selected
		if (selected.length !== 0 && selected[selected.length - 1] !== controlValue.length - 1) {
			for (var i = selected.length - 1; i >= 0; i--) {
				const selectedRow = selected.pop();
				if (selectedRow !== maxValue) {
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
		const maxValue = this.getMaxValue();
		for (var lastRow = selected[selected.length - 1]; lastRow < maxValue; lastRow++) {
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
		return (
			this.props.isEmptyTable && this.props.addRemoveRows
				? <EmptyTable
					control={this.props.control}
					controller={this.props.controller}
					emptyTableButtonLabel={this.props.emptyTableButtonLabel}
					emptyTableButtonClickHandler={this.props.emptyTableButtonClickHandler}
					disabled={this.props.disabled}
				/>
				: this.getMoveableTableRows()
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
	disabled: PropTypes.bool,
	isEmptyTable: PropTypes.bool.isRequired,
	emptyTableButtonLabel: PropTypes.string,
	emptyTableButtonClickHandler: PropTypes.func,
	disableRowMoveButtons: PropTypes.bool, // set by redux
	addRemoveRows: PropTypes.bool, // set by redux
	tableButtons: PropTypes.object // set in by redux
};

MoveableTableRows.defaultProps = {
	addRemoveRows: true
};

const mapStateToProps = (state, ownProps) => ({
	// check if row move buttons should be disabled for given propertyId
	disableRowMoveButtons: ownProps.controller.isDisableRowMoveButtons(ownProps.propertyId),
	addRemoveRows: ownProps.controller.getAddRemoveRows(ownProps.propertyId),
	tableButtons: ownProps.controller.getTableButtons(ownProps.propertyId)
});

export default connect(mapStateToProps)(MoveableTableRows);
