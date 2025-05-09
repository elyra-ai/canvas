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

// CONTROL readonlytable
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import AbstractTable from "./../abstract-table.jsx";
import EmptyTable from "../../components/empty-table/empty-table.jsx";
import { formatMessage } from "./../../util/property-utils";
import { STATES, MESSAGE_KEYS } from "./../../constants/constants";
import classNames from "classnames";
import ValidationMessage from "./../../components/validation-message";
import * as ControlUtils from "./../../util/control-utils";
import { isEmpty } from "lodash";

class ReadonlyTableControl extends AbstractTable {
	constructor(props) {
		super(props);
		this.reactIntl = props.controller.getReactIntl();
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
		const hidden = this.props.state === STATES.HIDDEN;
		if (hidden) {
			return null; // Do not render hidden controls
		}
		const overrideLabelKey = `${this.props.control.name}.edit.button.label`;
		const defaultEditLabel = formatMessage(this.reactIntl, MESSAGE_KEYS.READONLYTABLE_EDIT_BUTTON_LABEL);
		const buttonLabel = this.props.controller.getResource(overrideLabelKey, defaultEditLabel);

		const tableButtonConfig = this.buttonHandler ? {
			editCallback: this.editCallback,
			label: buttonLabel
		} : null;

		const customButtons = this.props.control && this.props.control.buttons;
		const table = this.createTable(this.props.state, tableButtonConfig, customButtons);
		const tableClassName = classNames("properties-rt properties-rt-buttons", { "disabled": this.props.state === STATES.DISABLED });
		const content = (
			<div>
				<div className={tableClassName}>
					{table}
				</div>
				<ValidationMessage state={this.props.state} messageInfo={this.props.messageInfo} />
			</div>);

		return (
			<div data-id={ControlUtils.getDataId(this.props.control, this.props.propertyId)}
				className="properties-readonly-table-wrapper"
			>
				{this.props.controlItem}
				<div className="properties-readonly-table">
					{
						isEmpty(this.props.value) && this.props.addRemoveRows
							? <EmptyTable
								control={this.props.control}
								controller={this.props.controller}
								emptyTableButtonLabel={buttonLabel}
								emptyTableButtonClickHandler={this.editCallback}
								disabled={this.props.state === STATES.DISABLED}
							/>
							: content
					}
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
	controlItem: PropTypes.element,
	rightFlyout: PropTypes.bool,
	selectedRows: PropTypes.array, // set by redux
	state: PropTypes.string, // pass in by redux
	value: PropTypes.array, // pass in by redux
	messageInfo: PropTypes.object, // pass in by redux
	addRemoveRows: PropTypes.bool, // set by redux
	tableButtons: PropTypes.object, // set in by redux
	hideEditButton: PropTypes.bool // set by redux
};


const mapStateToProps = (state, ownProps) => ({
	value: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId),
	selectedRows: ownProps.controller.getSelectedRows(ownProps.propertyId),
	addRemoveRows: ownProps.controller.getAddRemoveRows(ownProps.propertyId),
	tableButtons: ownProps.controller.getTableButtons(ownProps.propertyId),
	hideEditButton: ownProps.controller.getHideEditButton(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(ReadonlyTableControl);
