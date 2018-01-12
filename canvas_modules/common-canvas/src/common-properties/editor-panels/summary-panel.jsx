/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint complexity: ["error", 30] */
/* eslint max-depth: ["error", 6] */

import React from "react";
import PropTypes from "prop-types";
import Button from "ap-components-react/dist/components/Button";
import WideFlyout from "../components/wide-flyout.jsx";
import EditorControl from "../editor-controls/editor-control.jsx";
import { injectIntl, intlShape } from "react-intl";
import PropertyUtils from "../util/property-utils";
import { MESSAGE_KEYS, MESSAGE_KEYS_DEFAULTS } from "../constants/constants";


class SummaryPanel extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {
			showWideFlyout: false
		};
		this.handleLinkClicked = this.handleLinkClicked.bind(this);
		this.hideWideFlyout = this.hideWideFlyout.bind(this);
		this.cancelWideFlyout = this.cancelWideFlyout.bind(this);
		this._getSummaryTables = this._getSummaryTables.bind(this);
	}

	hideWideFlyout() {
		this.setState({ showWideFlyout: false });
		// on close clear selected rows
		this.props.clearSelectedRows();
	}
	cancelWideFlyout() {
		// on cancel reset back to original value
		this.props.controller.setPropertyValues(this.initialControlValues);
		this.props.controller.setErrorMessages(this.initialMessages);
		this.props.controller.setControlStates(this.initialStates);
		this.hideWideFlyout();
	}

	handleLinkClicked() {
		if (this.props.children) {
			this.setState({ showWideFlyout: true });
		}
		// sets the current value for parameter.  Used on cancel
		this.initialControlValues = JSON.parse(JSON.stringify(this.props.controller.getPropertyValues()));
		this.initialMessages = this.props.controller.getErrorMessages();
		this.initialStates = this.props.controller.getControlStates();
	}

	/*
	* Returns summary tables to be displayed in summary panel
	*/
	_getSummaryTables(panelStateDisabled) {
		let disabled = false;
		if (panelStateDisabled) {
			disabled = panelStateDisabled.disabled;
		}
		const disableText = disabled ? "disabled" : "";
		const summaryTables = [];
		const summaryControls = this.props.controller.getSummaryPanelControls(this.props.panelId);
		// no controls in summary panel
		if (!summaryControls) {
			return summaryTables;
		}
		for (const summaryControlKey in summaryControls) {
			if (!summaryControls.hasOwnProperty(summaryControlKey)) {
				continue;
			}
			const propertyId = { name: summaryControlKey };
			const summaryControl = summaryControls[summaryControlKey];
			// get filtered controlValue (filters out hidden and disabled values)
			let controlValue = this.props.controller.getPropertyValue(propertyId, true);
			// let custom control set their own value to be displayed
			const customValue = this.props.controller.getCustPropSumPanelValue(propertyId);
			let showCustom = false;
			if (typeof customValue !== "undefined" && customValue !== null) {
				controlValue = customValue.value;
				summaryControl.summaryLabel = customValue.label;
				showCustom = true;
			}
			const summaryValues = [];
			if (Array.isArray(controlValue)) {
				for (let rowIdx = 0; rowIdx < controlValue.length; rowIdx++) {
					const rowValue = controlValue[rowIdx];
					const rowData = [];
					// table value
					if (Array.isArray(rowValue)) {
						for (let colIdx = 0; colIdx < rowValue.length; colIdx++) {
							const colPropertyId = {
								name: propertyId.name,
								col: colIdx
							};
							if (this.props.controller.isSummary(colPropertyId) || showCustom) {
								rowData.push(
									<td key={"control-summary-table-row-multi-data-" + colIdx} className={"control-summary-table-row-multi-data"}>
										{rowValue[colIdx]}
									</td>);
							}
						}
					} else if (this.props.controller.isSummary(propertyId) || showCustom) { // only push row data if control is in summary
						rowData.push(
							<td key={"control-summary-table-row-multi-data-" + rowIdx} className={"control-summary-table-row-multi-data"}>
								{rowValue}
							</td>);
					}
					if (rowData.length > 0) {
						summaryValues.push(
							<tr key={"control-summary-table-rows-" + rowIdx} className={"control-summary-list-rows"}>
								{rowData}
							</tr>);
					}
				}
			} else if (controlValue) {
				// assume simple parameter
				// if (typeof controlValue === "string" || typeof controlValue === "boolean" || typeof controlValue === "number") {
				if (this.props.controller.isSummary(propertyId) || showCustom) {
					summaryValues.push(
						<tr key={"control-summary-table-rows-" + summaryControlKey} className={"control-summary-list-rows"}>
							<td key={"control-summary-table-row-multi-data-" + summaryControlKey} className={"control-summary-table-row-multi-data"}>
								{ controlValue }
							</td>
						</tr>
					);
				}
				// } else if (showCustom) {
				//	summaryValues.push(controlValue); // allows for custom objects to be displayed in summaryPanel
				// }
			}
			if (summaryValues.length > 0) {
				let summaryBody = (<table key={"summary-table-" + summaryControlKey} className={"control-summary-table " + disableText}>
					<tbody key={"summary-body-" + summaryControlKey}>
						{summaryValues}
					</tbody>
				</table>);
				if (summaryValues.length > 10) {
					const largeTableLabel = PropertyUtils.formatMessage(this.props.intl,
						MESSAGE_KEYS.LONG_TABLE_SUMMARY_PLACEHOLDER,
						MESSAGE_KEYS_DEFAULTS.LONG_TABLE_SUMMARY_PLACEHOLDER);
					summaryBody = (<div className={"control-summary-table " + disableText}>{largeTableLabel}</div>);
				}
				summaryTables.push(
					<div key={"summary-container-" + summaryControlKey} className={"control-summary-configured-values"}>
						<span key={"summary-text-" + summaryControlKey} className={"summary-label"}>{summaryControl.summaryLabel}</span>
						{summaryBody}
					</div>
				);
			}
		}
		return summaryTables;
	}

	render() {
		const propertyId = { name: this.props.panelId };
		const conditionProps = {
			propertyId: propertyId,
			controlType: "panel"
		};
		const conditionState = this.getConditionMsgState(conditionProps);
		const errorMessage = conditionState.message;
		// const messageType = conditionState.messageType;
		const icon = conditionState.icon;
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;
		const link = (<div className={"control-summary-link-buttons"}>
			<Button
				{...stateDisabled}
				hyperlink
				icon="plus"
				onClick={this.handleLinkClicked}
			>
				{this.props.label}
			</Button>
			{icon}
		</div>);

		const applyLabel = PropertyUtils.formatMessage(this.props.intl, MESSAGE_KEYS.APPLYBUTTON_LABEL, MESSAGE_KEYS_DEFAULTS.APPLYBUTTON_LABEL);
		const rejectLabel = PropertyUtils.formatMessage(this.props.intl, MESSAGE_KEYS.REJECTBUTTON_LABEL, MESSAGE_KEYS_DEFAULTS.REJECTBUTTON_LABEL);
		const flyout = (<WideFlyout
			cancelHandler={this.cancelWideFlyout}
			okHandler={this.hideWideFlyout}
			show={this.state.showWideFlyout}
			applyLabel={applyLabel}
			rejectLabel={rejectLabel}
			title={this.props.label}
		>
			<div>
				{this.props.children}
			</div>
		</WideFlyout>);

		return (
			<div className={"control-summary control-panel"} style={stateStyle}>
				{flyout}
				{link}
				{this._getSummaryTables()}
				{errorMessage}
			</div>
		);
	}
}

SummaryPanel.propTypes = {
	label: PropTypes.string.isRequired,
	controller: PropTypes.object.isRequired,
	children: PropTypes.array,
	clearSelectedRows: PropTypes.func.isRequired,
	panelId: PropTypes.string.isRequired,
	intl: intlShape
};

export default injectIntl(SummaryPanel);
