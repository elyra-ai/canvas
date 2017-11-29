/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint complexity: ["error", 18] */
/* eslint max-depth: ["error", 6] */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button } from "ap-components-react/dist/ap-components-react";
import WideFlyout from "../components/wide-flyout.jsx";

export default class SummaryPanel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showWideFlyout: false
		};
		this.handleLinkClicked = this.handleLinkClicked.bind(this);
		this.hideWideFlyout = this.hideWideFlyout.bind(this);
		this.cancelWideFlyout = this.cancelWideFlyout.bind(this);
		this.getControls = this.getControls.bind(this);
	}
	// used to get all controls contained in summary panel
	getControls() {
		var controlIds = [];
		var controls = [];
		for (const child of this.props.children) {
			this._getControlsFromPanel(child, controlIds, controls);
		}
		return { controlIds: controlIds, controls: controls };
	}
	getSummaryInfo() {
		const controls = this.getControls().controls;
		var summaryValues = [];
		for (const control of controls) {
			var summaryFieldIndexes = [];
			if (Array.isArray(control.subControls)) {
				for (let i = 0; i < control.subControls.length; i++) {
					const subControl = control.subControls[i];
					let subControlName = subControl.name;
					if (subControl.label && subControl.label.text) {
						subControlName = subControl.label.text;
					}
					if (subControl.summary) {
						summaryFieldIndexes.push({ "title": subControlName, "index": i });
					}
				}
			} else if (control.summary) {
				summaryFieldIndexes.push({ "title": control.name, "index": 0 });
			}
			if (summaryFieldIndexes.length > 0) {
				summaryValues.push({ name: control.name, label: control.label.text, summaryFields: summaryFieldIndexes });
			}
		}
		return summaryValues;
	}
	_getControlsFromPanel(panel, controlIds, controls) {
		if (panel.props && panel.props.children) {
			for (const child of panel.props.children) {
				if (child.props.control) {
					controlIds.push(child.props.control.key);
					if (controls) {
						controls.push(child.props.control.props.control);
					}
				} else {
					this._getControlsFromPanel(child, controlIds, controls);
				}
			}
		} else if (panel.key) { // for custom panels
			controlIds.push(panel.key); //
		}
	}

	hideWideFlyout() {
		this.setState({ showWideFlyout: false });
		// on close clear selected rows
		this.props.clearSelectedRows();
	}
	cancelWideFlyout() {
		// on cancel reset back to original value
		this.props.updateControlValues(this.initialControlValues);
		this.hideWideFlyout();
	}

	handleLinkClicked() {
		if (this.props.children) {
			this.setState({ showWideFlyout: true });
		}
		// sets the current value for parameter.  Used on cancel
		this.initialControlValues = JSON.parse(JSON.stringify(this.props.getControlValuesTable()));
	}

	render() {
		// TODO need to figure out panel conditions
		// const controlName = "summary";
		// const conditionProps = {
		//	controlName: controlName,
		//  controlType: "summary"
		// };
		// const conditionState = this.getConditionMsgState(conditionProps);

		// const errorMessage = conditionState.message;
		const errorMessage = <div />;
		// const messageType = conditionState.messageType;
		// const icon = conditionState.icon;
		const icon = <div />;
		const stateDisabled = false;
		// if (conditionState.disabled && typeof conditionState.disabled.disabled !== "undefined") {
		//	stateDisabled = conditionState.disabled.disabled;
		// }
		// const stateStyle = conditionState.style;
		const stateStyle = {};
		const disableText = stateDisabled ? "disabled" : "";
		const link = (<div className={"control-summary-link-buttons"}>
			<Button
				hyperlink
				icon="plus"
				onClick={this.handleLinkClicked}
				disabled={stateDisabled}
			>
				{this.props.label}
			</Button>
			{icon}
		</div>);
		const that = this;
		const configuredValues = [];
		const summary = this.getSummaryInfo();
		if (summary.length > 0) {
			for (const summaryControl of summary) {
				if (typeof that.props.controlStates[summaryControl.name] === "undefined") {
					const controlValue = this.props.valueAccessor(summaryControl.name);
					const keys = Object.keys(that.props.controlStates);
					let values = null;
					if (Array.isArray(controlValue) && controlValue.length > 0) {
						values = controlValue.map(function(value, ind) {
							const rowData = summaryControl.summaryFields.map(function(fieldObject, idx) {
								let row = (
									<td key={"control-summary-table-row-multi-data-" + idx}
										className={"control-summary-table-row-multi-data"}
									>
										{value[fieldObject.index]}
									</td>
								);

								const additionalColDisabledHidden = keys.filter(function(key) {
									return key.startsWith(summaryControl.name + "[" + ind + "]") ||
										key === (summaryControl.name + "[" + ind + "][" + fieldObject.index + "]");
								});

								if (summaryControl.summaryFields.length > 1 && additionalColDisabledHidden.length >= summaryControl.summaryFields.length - 1) {
									row = [];
								}
								for (let idx2 = 0; idx2 < keys.length; idx2++) {
									if (keys[idx2] === (summaryControl.name + "[" + ind + "][" + fieldObject.index + "]")) {
										row = [];
										break;
									}
								}
								return row;
							});

							return (
								<tr key={"control-summary-table-rows-" + ind} className={"control-summary-list-rows"}>
									{rowData}
								</tr>
							);
						});
					} else if (controlValue) {
						// assume simple parameter
						values = (
							<tr key={"control-summary-table-rows-" + summaryControl.name} className={"control-summary-list-rows"}>
								<td key={"control-summary-table-row-multi-data-" + summaryControl.name}
									className={"control-summary-table-row-multi-data"}
								>
									{ controlValue }
								</td>
							</tr>
						);
					}
					if (values) {
						configuredValues.push(
							<div key={"summary-container-" + summaryControl.name} className={"control-summary-configured-values"}>
								<span key={"summary-text-" + summaryControl.name} className={"summary-label"}>{summaryControl.label}</span>
								<table key={"summary-table-" + summaryControl.name} className={"control-summary-table " + disableText}>
									<tbody>
										{values}
									</tbody>
								</table>
							</div>
						);
					}
				}
			}
		}

		const flyout = (<WideFlyout
			cancelHandler={this.cancelWideFlyout}
			okHandler={this.hideWideFlyout}
			show={this.state.showWideFlyout}
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
				{configuredValues}
				{errorMessage}
			</div>
		);
	}
}

SummaryPanel.propTypes = {
	label: PropTypes.string.isRequired,
	controlStates: PropTypes.object,
	valueAccessor: PropTypes.func,
	children: PropTypes.array,
	getControlValuesTable: PropTypes.func.isRequired,
	updateControlValues: PropTypes.func.isRequired,
	clearSelectedRows: PropTypes.func.isRequired,
};
