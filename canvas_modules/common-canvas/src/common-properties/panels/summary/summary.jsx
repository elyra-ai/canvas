/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
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
import WideFlyout from "./../../components/wide-flyout";
import ControlUtils from "./../../util/control-utils";
import ValidationIcon from "./../../components/validation-icon";
import { injectIntl, intlShape } from "react-intl";
import isEmpty from "lodash/isEmpty";
import PropertyUtils from "./../../util/property-utils";
import { MESSAGE_KEYS, MESSAGE_KEYS_DEFAULTS, CONTROL_TYPE } from "./../../constants/constants";
import uuid4 from "uuid/v4";

import Tooltip from "./../../../tooltip/tooltip.jsx";

class SummaryPanel extends React.Component {
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

	_onMouseMove(evt) {
		this.setState({ mousePos: { x: evt.clientX, y: evt.clientY } });
	}

	hideWideFlyout() {
		this.props.controller.setIsSummaryPanelShowing(false);
		this.setState({ showWideFlyout: false });
		// on close clear *all* selected rows
		this.props.controller.clearSelectedRows();
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
			this.props.controller.setIsSummaryPanelShowing(true);
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
	_getSummaryTables(stateStyle) {
		const summaryTables = [];
		const summaryControls = this.props.controller.getSummaryPanelControls(this.props.panelId);
		// no controls in summary panel
		if (!Array.isArray(summaryControls)) {
			return summaryTables;
		}
		for (const controlName of summaryControls) {
			const propertyId = { name: controlName };
			const summaryControl = this.props.controller.getControl(propertyId);
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
				let summaryColumns = 0;
				if (summaryControl.subControls) {
					for (let idx = 0; idx < summaryControl.subControls.length; idx++) {
						const colPropertyId = {
							name: propertyId.name,
							col: idx
						};
						if (this.props.controller.isSummary(colPropertyId) || showCustom) {
							summaryColumns++;
						}
					}
				} else if (summaryControl.summary) {
					summaryColumns = 1;
				}
				// subtract 2 px for some buffer between columns
				const colWidth = summaryColumns !== 0 ? "calc((100% / " + summaryColumns + ") - 2px)" : "100%";

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
								// This allows array cell content to look acceptable
								const displayValue = this._getSummaryDisplayValue(rowValue[colIdx], colPropertyId);
								const contentValue = JSON.stringify(displayValue).replace("\"", "")
									.replace(new RegExp("\"", "g"), "") + " ";
								rowData.push(
									<td key={"control-summary-table-row-multi-data-" + colIdx}
										className={"control-summary-table-row-multi-data"}
										style={{ width: colWidth }}
										onMouseMove={this._onMouseMove.bind(this)}
									>
										<Tooltip id={uuid4()} tip={contentValue} mousePos={this.state.mousePos}>
											<span id={"span_" + uuid4()}>{contentValue}</span>
										</Tooltip>
									</td>);
							}
						}
					} else if (this.props.controller.isSummary(propertyId) || showCustom) { // only push row data if control is in summary
						const displayValue = this._getSummaryDisplayValue(rowValue, propertyId);
						rowData.push(
							<td key={"control-summary-table-row-multi-data-" + rowIdx} className={"control-summary-table-row-multi-data"}>
								<Tooltip id={uuid4()} tip={displayValue} mousePos={this.state.mousePos}>
									<span id={"span_" + uuid4()}>{displayValue}</span>
								</Tooltip>
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
						<tr key={"control-summary-table-rows-" + controlName} className={"control-summary-list-rows"}>
							<td key={"control-summary-table-row-multi-data-" + controlName} className={"control-summary-table-row-multi-data"}>
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
				let summaryBody = (<table key={"summary-table-" + controlName} className={"control-summary-table"}>
					<tbody key={"summary-body-" + controlName}>
						{summaryValues}
					</tbody>
				</table>);
				if (summaryValues.length > 10) {
					const largeTableLabel = PropertyUtils.formatMessage(this.props.intl,
						MESSAGE_KEYS.LONG_TABLE_SUMMARY_PLACEHOLDER,
						MESSAGE_KEYS_DEFAULTS.LONG_TABLE_SUMMARY_PLACEHOLDER);
					summaryBody = (<div className={"control-summary-table"}>{largeTableLabel}</div>);
				}
				summaryTables.push(
					<div key={"summary-container-" + controlName} className={"control-summary-configured-values"}>
						<span key={"summary-text-" + controlName} className={"summary-label"} style={stateStyle}>{summaryControl.summaryLabel}</span>
						{summaryBody}
					</div>
				);
			}
		}
		return summaryTables;
	}

	/**
	 * Retrieves a properly formatted summary display value.
	 *
	 * @param displayValue The default value to display
	 * @param propertyId The id of the property to display
	 * @return A formatted display value
	 */
	_getSummaryDisplayValue(displayValue, propertyId) {
		let returnValue = displayValue;
		const control = this.props.controller.getControl(propertyId);
		if (PropertyUtils.toType(displayValue) === "object") {
			if (control.valueDef.propType === "structure" && control.role === "column") {
				returnValue = PropertyUtils.stringifyFieldValue(displayValue, control);
			} else {
				// We don't know what this object is, but we know we can't display it as an object
				returnValue = JSON.stringify(displayValue);
			}
		}
		return returnValue;
	}

	_getSummaryIconState() {
		const controls = this.props.controller.getSummaryPanelControls(this.props.panelId);
		let msg = {};
		controls.forEach((controlId) => {
			const controlMsg = this.props.controller.getErrorMessage({ name: controlId });
			if (!isEmpty(controlMsg) && (!isEmpty(msg) || msg.type !== "error")) {
				msg = controlMsg;
			}
		});
		if (!isEmpty(msg)) {
			return (<ValidationIcon
				validateErrorMessage={msg}
			/>);
		}
		return null;
	}

	render() {
		const propertyId = { name: this.props.panelId };
		const conditionProps = {
			propertyId: propertyId,
			controlType: CONTROL_TYPE.PANEL
		};
		const conditionState = ControlUtils.getConditionMsgState(this.props.controller, conditionProps);
		const errorMessage = conditionState.message;
		// const messageType = conditionState.messageType;
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;
		const icon = this._getSummaryIconState();
		const link = (<div className={"control-summary-link-buttons"}>
			<Button
				{...stateDisabled}
				hyperlink
				icon="plus"
				onClick={this.handleLinkClicked}
			>
				{this.props.label}
			</Button> {icon}
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
				{this._getSummaryTables(stateStyle)}
				{errorMessage}
			</div>
		);
	}
}

SummaryPanel.propTypes = {
	label: PropTypes.string.isRequired,
	controller: PropTypes.object.isRequired,
	children: PropTypes.array,
	panelId: PropTypes.string.isRequired,
	intl: intlShape
};

export default injectIntl(SummaryPanel);
