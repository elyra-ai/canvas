/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import AbstractTable from "./../abstract-table.jsx";
import MoveableTableRows from "./../../components/moveable-table-rows";
import PropertyUtils from "./../../util/property-utils";
import { MESSAGE_KEYS, MESSAGE_KEYS_DEFAULTS } from "./../../constants/constants";
import { injectIntl, intlShape } from "react-intl";
import ControlUtils from "./../../util/control-utils";

class StructurelisteditorControl extends AbstractTable {

	constructor(props) {
		super(props);
		this.addRow = this.addRow.bind(this);
	}

	addRow() {
		const newRow = this._getDefaultRow();
		const rows = this.props.controller.getPropertyValue(this.props.propertyId);
		rows.push(newRow);
		this.setCurrentControlValueSelected(rows);
	}

	_getDefaultRow() {
		const row = [];
		for (const colValue of this.props.control.defaultRow) {
			if (typeof colValue !== "undefined" && colValue !== null && colValue.parameterRef) {
				row.push(this.props.controller.getPropertyValue({ name: colValue.parameterRef }));
			} else {
				row.push(colValue);
			}
		}
		return row;
	}

	render() {
		const conditionProps = {
			propertyId: this.props.propertyId,
			controlType: "structure-list-editor"
		};
		const conditionState = ControlUtils.getConditionMsgState(this.props.controller, conditionProps);

		const errorMessage = conditionState.message;
		const messageType = conditionState.messageType;
		const icon = conditionState.icon;
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;

		let controlIconContainerClass = "control-icon-container";
		if (messageType !== "info") {
			controlIconContainerClass = "control-icon-container-enabled";
		}

		const tableButtonConfig = {
			addButtonLabel: PropertyUtils.formatMessage(this.props.intl,
				MESSAGE_KEYS.STRUCTURELISTEDITOR_ADDBUTTON_LABEL, MESSAGE_KEYS_DEFAULTS.STRUCTURELISTEDITOR_ADDBUTTON_LABEL),
			removeButtonTooltip: PropertyUtils.formatMessage(this.props.intl,
				MESSAGE_KEYS.STRUCTURELISTEDITOR_REMOVEBUTTON_TOOLTIP, MESSAGE_KEYS_DEFAULTS.STRUCTURELISTEDITOR_REMOVEBUTTON_TOOLTIP),
			addButtonTooltip: PropertyUtils.formatMessage(this.props.intl,
				MESSAGE_KEYS.STRUCTURELISTEDITOR_ADDBUTTON_TOOLTIP, MESSAGE_KEYS_DEFAULTS.STRUCTURELISTEDITOR_ADDBUTTON_TOOLTIP),
			addButtonFunction: this.addRow
		};

		const table = this.createTable(stateStyle, stateDisabled, tableButtonConfig);

		const disabled = typeof stateDisabled.disabled !== "undefined" || Object.keys(stateDisabled) > 0;
		const tableContainer = (<div id={ControlUtils.getControlID(this.props.control, this.props.propertyId)}>
			<div id={controlIconContainerClass}>
				<div id="structure-list-editor-table-buttons" className="structure-list-editor">
					{table}
				</div>
				{icon}
			</div>
			{errorMessage}
		</div>);
		// stateStyle={stateStyle}

		const onPanelContainer = this.getOnPanelContainer(this.props.controller.getSelectedRows(this.props.control.name));
		return (
			<div>
				<div className="properties-structure-list-editor">
					<MoveableTableRows
						tableContainer={tableContainer}
						control={this.props.control}
						controller={this.props.controller}
						propertyId={this.props.propertyId}
						setScrollToRow={this.setScrollToRow}
						setCurrentControlValueSelected={this.setCurrentControlValueSelected}
						stateStyle={stateStyle}
						disabled={disabled}
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
	intl: intlShape,
	rightFlyout: PropTypes.bool
};

export default injectIntl(StructurelisteditorControl);
