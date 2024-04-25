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
import { MESSAGE_KEYS } from "../../constants/constants";
import { formatMessage } from "../../util/property-utils";

class TableToolbar extends React.Component {
	constructor(props) {
		super(props);
		this.handleCancel = this.handleCancel.bind(this);
	}

	handleCancel() {
		// Clear row selection
		this.props.controller.updateSelectedRows(this.props.propertyId, []);
	}

	render() {
		if ((this.props.addRemoveRows || this.props.moveableRows || this.props.multiSelectEdit) && this.props.selectedRows.length > 0) {
			const rowsSelectedLabel = formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.MULTI_SELECTED_ROW_LABEL);
			const title = `${this.props.selectedRows.length} ${rowsSelectedLabel}`;
			const moveTopLabel = formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.TABLE_TOOLBAR_BUTTON_TOP);
			const moveUpLabel = formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.TABLE_TOOLBAR_BUTTON_UP);
			const moveDownLabel = formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.TABLE_TOOLBAR_BUTTON_DOWN);
			const moveBottomLabel = formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.TABLE_TOOLBAR_BUTTON_BOTTOM);
			const editLabel = formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.TABLE_TOOLBAR_BUTTON_EDIT);
			const deleteLabel = formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.TABLE_TOOLBAR_BUTTON_DELETE);
			const cancelLabel = formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.TABLE_TOOLBAR_BUTTON_CANCEL);

			return (
				<div className="properties-table-toolbar" >
					<div className="properties-batch-summary" >
						<span >{title}</span>
					</div>
					<div className="properties-action-list">
						<Button size="sm" renderIcon={UpToTop} hasIconOnly iconDescription={moveTopLabel} tooltipPosition="bottom"
							onClick={() => console.log("Move to top")}
						/>
						<Button size="sm" renderIcon={ChevronUp} hasIconOnly iconDescription={moveUpLabel} tooltipPosition="bottom"
							onClick={() => console.log("Move up one position") }
						/>
						<Button size="sm" renderIcon={ChevronDown} hasIconOnly iconDescription={moveDownLabel} tooltipPosition="bottom"
							onClick={() => console.log("Move down one position") }
						/>
						<Button size="sm" renderIcon={DownToBottom} hasIconOnly iconDescription={moveBottomLabel} tooltipPosition="bottom"
							onClick={() => console.log("Move to bottom") }
						/>
						{
							this.props.addRemoveRows
								? (<Button size="sm" renderIcon={TrashCan} hasIconOnly iconDescription={deleteLabel} tooltipPosition="bottom" onClick={this.removeSelected} />)
								: null
						}
						{
							this.props.multiSelectEdit && this.props.selectedRows.length > 1
								? (<Button size="sm" renderIcon={Edit} hasIconOnly iconDescription={editLabel} tooltipPosition="bottom" onClick={() => console.log("Edit")} />)
								: null
						}
						<Button size="sm" className="properties-action-cancel" onClick={this.handleCancel}>{cancelLabel}</Button>
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
	tableState: PropTypes.string,
	addRemoveRows: PropTypes.bool,
	moveableRows: PropTypes.bool,
	multiSelectEdit: PropTypes.bool,
	disableRowMoveButtons: PropTypes.bool, // set by redux
};

const mapStateToProps = (state, ownProps) => ({
	// check if row move buttons should be disabled for given propertyId
	disableRowMoveButtons: ownProps.controller.isDisableRowMoveButtons(ownProps.propertyId)
});

export default connect(mapStateToProps)(TableToolbar);


