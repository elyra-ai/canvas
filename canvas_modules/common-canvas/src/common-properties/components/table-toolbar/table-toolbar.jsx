/*
 * Copyright 2024 Elyra Authors
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
import { TrashCan, Edit, UpToTop, ChevronUp, ChevronDown, DownToBottom } from "@carbon/react/icons";
import { MESSAGE_KEYS, STATES } from "../../constants/constants";
import { formatMessage } from "../../util/property-utils";
import SubPanelInvoker from "./../../panels/sub-panel/invoker";
import { cloneDeep } from "lodash";

class TableToolbar extends React.Component {
	constructor(props) {
		super(props);
		this.reactIntl = this.props.controller.getReactIntl();
		this.handleCancel = this.handleCancel.bind(this);
		this.showSubPanel = this.showSubPanel.bind(this);
		this.onSubPanelHidden = this.onSubPanelHidden.bind(this);
		this.getTableRowMoveButtons = this.getTableRowMoveButtons.bind(this);
		this.topMoveRow = this.topMoveRow.bind(this);
		this.upMoveRow = this.upMoveRow.bind(this);
		this.downMoveRow = this.downMoveRow.bind(this);
		this.bottomMoveRow = this.bottomMoveRow.bind(this);
		this.getLeastValue = this.getLeastValue.bind(this);
		this.getMaxValue = this.getMaxValue.bind(this);
	}

	onSubPanelHidden(applyChanges) {
		// on cancel reset back to original value
		if (!applyChanges) {
			this.props.controller.updatePropertyValue(this.props?.multiSelectEditRowPropertyId, this.initialMultiSelectEditRowValue);
			this.props.controller.updatePropertyValue(this.props.propertyId, this.initialControlValue);
			this.props.controller.setErrorMessages(this.initialMessages);
			this.props.controller.setControlStates(this.initialStates);
		}
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

	// enabled the move up and down arrows based on which row is selected
	getTableRowMoveButtons() {
		const selected = this.props.controller.getSelectedRows(this.props.propertyId).sort();
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		const tableDisabled = this.props.tableState === STATES.DISABLED;
		let topEnabled = (
			!this.props.disableRowMoveButtons &&
			(selected.length !== 0 && selected[0] !== 0) &&
			!tableDisabled
		);
		let bottomEnabled = (
			!this.props.disableRowMoveButtons &&
			(selected.length !== 0 && selected[selected.length - 1] !== controlValue.length - 1) &&
			!tableDisabled
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
				!tableDisabled
			);
		} else if (selected[0] === staticRows[0] - 1) {
			bottomEnabled = false;
		}


		const moveTopLabel = formatMessage(this.reactIntl, MESSAGE_KEYS.TABLE_TOOLBAR_BUTTON_TOP);
		const moveUpLabel = formatMessage(this.reactIntl, MESSAGE_KEYS.TABLE_TOOLBAR_BUTTON_UP);
		const moveDownLabel = formatMessage(this.reactIntl, MESSAGE_KEYS.TABLE_TOOLBAR_BUTTON_DOWN);
		const moveBottomLabel = formatMessage(this.reactIntl, MESSAGE_KEYS.TABLE_TOOLBAR_BUTTON_BOTTOM);

		return (
			<>
				<Button
					className="table-row-move-top-button"
					onClick={this.topMoveRow}
					disabled={!topEnabled}
					renderIcon={UpToTop}
					iconDescription={moveTopLabel}
					tooltipPosition="bottom"
					size="sm"
					hasIconOnly
				/>
				<Button
					className="table-row-move-up-button"
					onClick={this.upMoveRow}
					disabled={!topEnabled}
					renderIcon={ChevronUp}
					iconDescription={moveUpLabel}
					tooltipPosition="bottom"
					size="sm"
					hasIconOnly
				/>
				<Button
					className="table-row-move-down-button"
					onClick={this.downMoveRow}
					disabled={!bottomEnabled}
					renderIcon={ChevronDown}
					iconDescription={moveDownLabel}
					tooltipPosition="bottom"
					size="sm"
					hasIconOnly
				/>
				<Button
					className="table-row-move-bottom-button"
					onClick={this.bottomMoveRow}
					disabled={!bottomEnabled}
					renderIcon={DownToBottom}
					iconDescription={moveBottomLabel}
					tooltipPosition="bottom"
					size="sm"
					hasIconOnly
				/>
			</>
		);
	}

	topMoveRow() {
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

	upMoveRow() {
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

	downMoveRow() {
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

	bottomMoveRow() {
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

	handleCancel() {
		// Clear row selection
		this.props.controller.updateSelectedRows(this.props.propertyId, []);
	}

	showSubPanel() {
		// sets the current value for parameter.  Used on cancel
		this.initialMultiSelectEditRowValue = cloneDeep(this.props.controller.getPropertyValue(this.props?.multiSelectEditRowPropertyId));
		this.initialControlValue = cloneDeep(this.props.controller.getPropertyValue(this.props.propertyId));
		this.initialMessages = this.props.controller.getAllErrorMessages();
		this.initialStates = this.props.controller.getControlStates();
		const multiSelectEditSubPanelTitle = formatMessage(this.reactIntl, MESSAGE_KEYS.MULTI_SELECT_EDIT_SUBPANEL_TITLE);
		this.subPanelInvoker.showSubDialog(multiSelectEditSubPanelTitle, this.props?.multiSelectEditSubPanel, this.onSubPanelHidden);
	}

	render() {
		if ((this.props.addRemoveRows || this.props.moveableRows || this.props.multiSelectEdit) && this.props.selectedRows.length > 0) {
			const singleRowSelectedLabel = (this.props.smallFlyout)
				? formatMessage(this.reactIntl, MESSAGE_KEYS.SINGLE_SELECTED_ROW_LABEL_SMALL_FLYOUT) // item
				: formatMessage(this.reactIntl, MESSAGE_KEYS.SINGLE_SELECTED_ROW_LABEL); // item selected
			const multiRowsSelectedLabel = (this.props.smallFlyout)
				? formatMessage(this.reactIntl, MESSAGE_KEYS.MULTI_SELECTED_ROW_LABEL_SMALL_FLYOUT) // items
				: formatMessage(this.reactIntl, MESSAGE_KEYS.MULTI_SELECTED_ROW_LABEL); // items selected
			const title = (this.props.selectedRows.length === 1)
				? `${this.props.selectedRows.length} ${singleRowSelectedLabel}`
				: `${this.props.selectedRows.length} ${multiRowsSelectedLabel}`;
			const editLabel = formatMessage(this.reactIntl, MESSAGE_KEYS.TABLE_TOOLBAR_BUTTON_EDIT);
			const deleteLabel = formatMessage(this.reactIntl, MESSAGE_KEYS.TABLE_TOOLBAR_BUTTON_DELETE);
			const cancelLabel = formatMessage(this.reactIntl, MESSAGE_KEYS.TABLE_TOOLBAR_BUTTON_CANCEL);
			const applyLabel = formatMessage(this.reactIntl, MESSAGE_KEYS.APPLYBUTTON_LABEL);
			const rejectLabel = formatMessage(this.reactIntl, MESSAGE_KEYS.REJECTBUTTON_LABEL);

			return (
				<div className="properties-table-toolbar" >
					<div className="properties-batch-summary" >
						<span >{title}</span>
					</div>
					<div className="properties-action-list">
						{
							this.props.moveableRows
								? (this.getTableRowMoveButtons())
								: null
						}
						{
							(this.props.addRemoveRows && !this.props.isReadonlyTable && !this.props.isSingleSelectTable)
								? (<Button
									size="sm"
									renderIcon={TrashCan}
									hasIconOnly
									iconDescription={deleteLabel}
									tooltipPosition="bottom"
									onClick={this.props.removeSelectedRows}
									className="properties-action-delete"
								/>)
								: null
						}
						{
							this.props.multiSelectEdit
								? (
									<SubPanelInvoker ref={ (ref) => (this.subPanelInvoker = ref) }
										rightFlyout={this.props.rightFlyout}
										applyLabel={applyLabel}
										rejectLabel={rejectLabel}
										controller={this.props.controller}
									>
										<Button
											className="properties-action-multi-select-edit"
											size="sm"
											renderIcon={Edit}
											hasIconOnly
											iconDescription={editLabel}
											tooltipPosition="bottom"
											onClick={this.showSubPanel}
										/>
									</SubPanelInvoker>
								)
								: null
						}
						<Button size="sm" className="properties-action-cancel" onClick={this.handleCancel}>
							{cancelLabel}
						</Button>
					</div>
				</div>
			);
		}
		return null;
	}

}

TableToolbar.propTypes = {
	controller: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	selectedRows: PropTypes.array.isRequired,
	removeSelectedRows: PropTypes.func.isRequired,
	setScrollToRow: PropTypes.func.isRequired,
	setCurrentControlValueSelected: PropTypes.func.isRequired,
	rightFlyout: PropTypes.bool,
	smallFlyout: PropTypes.bool, // list control in right flyout having editor size small
	tableState: PropTypes.string,
	isReadonlyTable: PropTypes.bool,
	isSingleSelectTable: PropTypes.bool,
	addRemoveRows: PropTypes.bool,
	moveableRows: PropTypes.bool,
	multiSelectEdit: PropTypes.bool,
	multiSelectEditSubPanel: PropTypes.element,
	multiSelectEditRowPropertyId: PropTypes.object,
	disableRowMoveButtons: PropTypes.bool // set by redux,
};

const mapStateToProps = (state, ownProps) => ({
	// check if row move buttons should be disabled for given propertyId
	disableRowMoveButtons: ownProps.controller.isDisableRowMoveButtons(ownProps.propertyId)
});

export default connect(mapStateToProps)(TableToolbar);


