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
import { connect } from "react-redux";
import AbstractTable from "./../abstract-table.jsx";
import MoveableTableRows from "./../../components/moveable-table-rows";
import PropertyUtils from "./../../util/property-utils";
import ValidationMessage from "./../../components/validation-message";
import { MESSAGE_KEYS, STATES } from "./../../constants/constants";
import ControlUtils from "./../../util/control-utils";

class StructurelisteditorControl extends AbstractTable {

	constructor(props) {
		super(props);
		this.addRow = this.addRow.bind(this);
		this.allowColumnControls = true;
	}

	addRow() {
		const newRow = this.getDefaultRow();
		const rows = this.props.controller.getPropertyValue(this.props.propertyId);
		rows.push(newRow);
		this.setCurrentControlValueSelected(rows);
	}

	render() {
		const tableButtonConfig = {
			addButtonLabel: PropertyUtils.formatMessage(this.props.controller.getReactIntl(),
				MESSAGE_KEYS.STRUCTURELISTEDITOR_ADDBUTTON_LABEL),
			removeButtonTooltip: PropertyUtils.formatMessage(this.props.controller.getReactIntl(),
				MESSAGE_KEYS.STRUCTURELISTEDITOR_REMOVEBUTTON_TOOLTIP),
			addButtonTooltip: PropertyUtils.formatMessage(this.props.controller.getReactIntl(),
				MESSAGE_KEYS.STRUCTURELISTEDITOR_ADDBUTTON_TOOLTIP),
			addButtonFunction: this.addRow
		};

		const table = this.createTable(this.props.state, tableButtonConfig);

		const tableContainer = (<div>
			<div className="properties-sle properties-sle-buttons">
				{table}
			</div>
			<ValidationMessage state={this.props.state} messageInfo={this.props.messageInfo} />
		</div>);

		const onPanelContainer = this.getOnPanelContainer(this.props.selectedRows);
		return (
			<div data-id={ControlUtils.getDataId(this.props.control, this.props.propertyId)}
				className="properties-sle-wrapper"
			>
				<div data-id={ControlUtils.getDataId(this.props.control, this.props.propertyId)}
					className="properties-sle-container"
				>
					<MoveableTableRows
						tableContainer={tableContainer}
						control={this.props.control}
						controller={this.props.controller}
						propertyId={this.props.propertyId}
						setScrollToRow={this.setScrollToRow}
						setCurrentControlValueSelected={this.setCurrentControlValueSelected}
						disabled={this.props.state === STATES.DISABLED}
					/>
				</div>
				<div>
					{onPanelContainer}
				</div>
			</div>
		);
	}
}

StructurelisteditorControl.propTypes = {
	buildUIItem: PropTypes.func,
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	rightFlyout: PropTypes.bool,
	selectedRows: PropTypes.array, // set by redux
	state: PropTypes.string, // pass in by redux
	value: PropTypes.array, // pass in by redux
	messageInfo: PropTypes.object // pass in by redux
};

const mapStateToProps = (state, ownProps) => ({
	value: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId),
	selectedRows: ownProps.controller.getSelectedRows(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(StructurelisteditorControl);
