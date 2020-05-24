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
/* eslint max-depth: ["error", 6] */

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import WideFlyout from "./../../components/wide-flyout";
import Icon from "./../../../icons/icon.jsx";

import isEmpty from "lodash/isEmpty";
import PropertyUtils from "./../../util/property-utils";
import ControlUtils from "./../../util/control-utils";
import { MESSAGE_KEYS, CONDITION_MESSAGE_TYPE } from "./../../constants/constants";
import uuid4 from "uuid/v4";
import { STATES } from "./../../constants/constants.js";
import { Type, ParamRole } from "./../../constants/form-constants.js";
import classNames from "classnames";
import Link from "carbon-components-react/lib/components/Link";

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
		this.initialControlValues = this.props.controller.getPropertyValues();
		this.initialMessages = this.props.controller.getErrorMessages();
		this.initialStates = this.props.controller.getControlStates();
	}

	/*
	* Returns summary tables to be displayed in summary panel
	*/
	_getSummaryTables() {
		const summaryTables = [];
		const summaryControls = this.props.controller.getSummaryPanelControls(this.props.panel.id);
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
								const contentValue = typeof displayValue === "undefined" ? ""
									: JSON.stringify(displayValue).replace("\"", "")
										.replace(new RegExp("\"", "g"), "") + " ";
								rowData.push(
									<td key={"summary-table-data-" + colIdx}
										className={"properties-summary-row-data "}
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
							<td key={"summary-table-row-data-" + rowIdx} className={"properties-summary-row-data "}>
								<Tooltip id={uuid4()} tip={displayValue} mousePos={this.state.mousePos}>
									<span id={"span_" + uuid4()}>{displayValue}</span>
								</Tooltip>
							</td>);
					}
					if (rowData.length > 0) {
						summaryValues.push(
							<tr key={"summary-table-row-" + rowIdx} className={"properties-summary-row"}>
								{rowData}
							</tr>);
					}
				}
			} else if (controlValue) {
				// assume simple parameter
				if (this.props.controller.isSummary(propertyId) || showCustom) {
					summaryValues.push(
						<tr key={"summary-row-" + controlName} className="properties-summary-row">
							<td key={"summary-table-row-data-" + controlName} className={"properties-summary-rows-data"}>
								{ controlValue }
							</td>
						</tr>
					);
				}
			}
			if (summaryValues.length > 0) {
				let summaryBody = (<table key={"summary-table-" + controlName} className="properties-summary-table">
					<tbody key={"summary-body-" + controlName}>
						{summaryValues}
					</tbody>
				</table>);
				if (summaryValues.length > 10) {
					const largeTableLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(),
						MESSAGE_KEYS.LONG_TABLE_SUMMARY_PLACEHOLDER);
					summaryBody = (<div className={"properties-summary-table"}><span>{largeTableLabel}</span></div>);
				}
				summaryTables.push(
					<div key={"summary-container-" + controlName} className={"properties-summary-values"}>
						<span key={"summary-text-" + controlName} className={"properties-summary-label"}>{summaryControl.summaryLabel}</span>
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
			if (control.valueDef.propType === Type.STRUCTURE && control.role === ParamRole.COLUMN) {
				returnValue = PropertyUtils.stringifyFieldValue(displayValue, control);
			} else {
				// We don't know what this object is, but we know we can't display it as an object
				returnValue = JSON.stringify(displayValue);
			}
		}
		return returnValue;
	}

	_getSummaryIconState() {
		const controls = this.props.controller.getSummaryPanelControls(this.props.panel.id);
		let msg = {};
		let errorCount = 0;
		let warningCount = 0;
		if (Array.isArray(controls)) {
			controls.forEach((controlId) => {
				const controlMsg = this.props.controller.getErrorMessage({ name: controlId }, true);
				if (!isEmpty(controlMsg)) {
					if (controlMsg.type === CONDITION_MESSAGE_TYPE.WARNING) {
						warningCount += 1;
					}
					if (controlMsg.type === CONDITION_MESSAGE_TYPE.ERROR) {
						errorCount += 1;
					}
				}
				if (!isEmpty(controlMsg) && (!isEmpty(msg) || msg.type !== "error")) {
					msg = controlMsg;
				}
			});
		}
		if (!isEmpty(msg)) {
			let descriptionText = "";
			if (errorCount > 0 && warningCount === 0) {
				descriptionText = PropertyUtils.formatMessage(this.props.controller.getReactIntl(),
					MESSAGE_KEYS.CONTROL_SUMMARY_ERROR, { errorMsgCount: errorCount });
			} else if (errorCount > 0 && warningCount > 0) {
				descriptionText = PropertyUtils.formatMessage(this.props.controller.getReactIntl(),
					MESSAGE_KEYS.CONTROL_SUMMARY_ERROR_WARNING,
					{ errorMsgCount: errorCount, warningMsgCount: warningCount });
			} else if (errorCount === 0 && warningCount > 0) {
				descriptionText = PropertyUtils.formatMessage(this.props.controller.getReactIntl(),
					MESSAGE_KEYS.CONTROL_SUMMARY_WARNING, { warningMsgCount: warningCount });
			}

			return (
				<Tooltip
					id= {uuid4() + "summary-icon"}
					tip={descriptionText}
					className="properties-tooltips"
				>
					{<Icon type={msg.type} className={`properties-summary-link-icon ${msg.type}`} />}
				</Tooltip>
			);
		}
		return null;
	}

	render() {
		const icon = this._getSummaryIconState();
		const link = (<div className="properties-summary-link-container">
			<Link
				href="#"
				className="properties-summary-link"
				onClick={this.handleLinkClicked}
			>
				{this.props.panel.label}
			</Link>
			{icon}
		</div>);
		const applyLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.APPLYBUTTON_LABEL);
		const rejectLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.REJECTBUTTON_LABEL);
		const flyout = this.state.showWideFlyout ? (<WideFlyout
			cancelHandler={this.cancelWideFlyout}
			okHandler={this.hideWideFlyout}
			show
			applyLabel={applyLabel}
			rejectLabel={rejectLabel}
			title={this.props.panel.label}
		>
			<div>
				{this.props.children}
			</div>
		</WideFlyout>) : <div />;
		const className = classNames("properties-summary-panel", "properties-control-panel", { "hide": this.props.panelState === STATES.HIDDEN });
		return (
			<div className={className} disabled={this.props.panelState === STATES.DISABLED} data-id={ControlUtils.getDataId({ name: this.props.panel.id })}>
				{flyout}
				{link}
				{this._getSummaryTables()}
			</div>
		);
	}
}

SummaryPanel.propTypes = {
	controller: PropTypes.object.isRequired,
	children: PropTypes.array,
	panel: PropTypes.object.isRequired,
	panelState: PropTypes.string // set by redux
};

const mapStateToProps = (state, ownProps) => ({
	panelState: ownProps.controller.getPanelState({ name: ownProps.panel.id })
});

export default connect(mapStateToProps, null)(SummaryPanel);
