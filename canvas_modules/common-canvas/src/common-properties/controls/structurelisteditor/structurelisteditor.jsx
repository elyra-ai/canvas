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
import ValidationMessage from "./../../components/validation-message";
import { MESSAGE_KEYS, MESSAGE_KEYS_DEFAULTS, STATES } from "./../../constants/constants";
import { injectIntl, intlShape } from "react-intl";
import ControlUtils from "./../../util/control-utils";

class StructurelisteditorControl extends AbstractTable {

	constructor(props) {
		super(props);
		this.addRow = this.addRow.bind(this);
	}

	addRow() {
		const newRow = this.getDefaultRow();
		const rows = this.props.controller.getPropertyValue(this.props.propertyId);
		rows.push(newRow);
		this.setCurrentControlValueSelected(rows);
	}

	render() {
		const tableState = this.props.controller.getControlState(this.props.propertyId);
		const messageInfo = this.props.controller.getErrorMessage(this.props.propertyId);

		const tableButtonConfig = {
			addButtonLabel: PropertyUtils.formatMessage(this.props.intl,
				MESSAGE_KEYS.STRUCTURELISTEDITOR_ADDBUTTON_LABEL, MESSAGE_KEYS_DEFAULTS.STRUCTURELISTEDITOR_ADDBUTTON_LABEL),
			removeButtonTooltip: PropertyUtils.formatMessage(this.props.intl,
				MESSAGE_KEYS.STRUCTURELISTEDITOR_REMOVEBUTTON_TOOLTIP, MESSAGE_KEYS_DEFAULTS.STRUCTURELISTEDITOR_REMOVEBUTTON_TOOLTIP),
			addButtonTooltip: PropertyUtils.formatMessage(this.props.intl,
				MESSAGE_KEYS.STRUCTURELISTEDITOR_ADDBUTTON_TOOLTIP, MESSAGE_KEYS_DEFAULTS.STRUCTURELISTEDITOR_ADDBUTTON_TOOLTIP),
			addButtonFunction: this.addRow
		};

		const table = this.createTable(tableState, tableButtonConfig);

		const tableContainer = (<div>
			<div className="properties-sle properties-sle-buttons">
				{table}
			</div>
			<ValidationMessage state={tableState} messageInfo={messageInfo} />
		</div>);

		const onPanelContainer = this.getOnPanelContainer(this.props.controller.getSelectedRows(this.props.control.name));
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
						disabled={tableState === STATES.DISABLED}
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
