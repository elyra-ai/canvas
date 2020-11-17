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

// CONTROL readonlytable
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import AbstractTable from "./../abstract-table.jsx";
import MoveableTableRows from "./../../components/moveable-table-rows";
import { formatMessageWithDifferentDefaultKey } from "./../../util/property-utils";
import { STATES, MESSAGE_KEYS } from "./../../constants/constants";

import ValidationMessage from "./../../components/validation-message";
import * as ControlUtils from "./../../util/control-utils";

class ReadonlyTableControl extends AbstractTable {
	constructor(props) {
		super(props);
		this.editCallback = this.editCallback.bind(this);
		this.buttonHandler = this.props.controller.getHandlers().buttonHandler;
	}

	editCallback() {
		if (this.buttonHandler) {
			this.buttonHandler({
				type: "edit",
				propertyId: this.props.propertyId
			});
		}
	}

	render() {
		const overrideLabelKey = `${this.props.control.name}.readonlytable.edit.button.label`;
		const buttonLabel = formatMessageWithDifferentDefaultKey(this.props.controller.getReactIntl(), overrideLabelKey, MESSAGE_KEYS.READONLYTABLE_EDIT_BUTTON_LABEL);

		const tableButtonConfig = this.buttonHandler ? {
			editCallback: this.editCallback,
			label: buttonLabel
		} : null;

		const table = this.createTable(this.props.state, tableButtonConfig);
		const content = (
			<div>
				<div className="properties-st properties-st-buttons">
					{table}
				</div>
				<ValidationMessage state={this.props.state} messageInfo={this.props.messageInfo} />
			</div>);

		const onPanelContainer = this.getOnPanelContainer(this.props.selectedRows);
		return (
			<div data-id={ControlUtils.getDataId(this.props.control, this.props.propertyId)}
				className="properties-column-structure-wrapper"
			>
				<div className="properties-column-structure">
					<MoveableTableRows
						tableContainer={content}
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

ReadonlyTableControl.propTypes = {
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

export default connect(mapStateToProps, null)(ReadonlyTableControl);
