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
import { Button } from "react-bootstrap";
import ReactTooltip from "react-tooltip";
import { Cell } from "fixed-data-table";
import { TOOL_TIP_DELAY } from "../constants/constants.js";

import SubPanelInvoker from "./sub-panel-invoker.jsx";

export default class SubPanelCell extends React.Component {
	constructor(props) {
		super(props);
		this.showSubPanel = this.showSubPanel.bind(this);
		this.onSubPanelHidden = this.onSubPanelHidden.bind(this);
	}

	onSubPanelHidden(applyChanges) {
		// on cancel reset back to original value
		if (!applyChanges) {
			this.props.controller.updatePropertyValue(this.props.propertyId, this.initialControlValue);
		}
	}


	showSubPanel() {
		// sets the current value for parameter.  Used on cancel
		this.initialControlValue = JSON.parse(JSON.stringify(this.props.controller.getPropertyValue(this.props.propertyId)));
		this.refs.invoker.showSubDialog(this.props.title, this.props.panel, this.onSubPanelHidden);
	}

	render() {
		const tooltipId = "tooltip-subpanel-cell";
		const disabled = typeof this.props.disabled !== "undefined" ? this.props.disabled : false;
		return (
			<SubPanelInvoker ref="invoker" customContainer={this.props.customContainer}>
				<Cell>
					<div className="properties-tooltips-container" data-tip="Edit" data-for="tooltip-subpanel-cell">
						<Button
							style={{ "display": "inline" }}
							bsSize="xsmall"
							onClick={this.showSubPanel}
							disabled={disabled}
						>
							{this.props.label}
						</Button>
					</div>
					<ReactTooltip
						id={tooltipId}
						place="right"
						type="light"
						effect="solid"
						border
						className="properties-tooltips"
						delayShow={TOOL_TIP_DELAY}
					/>
				</Cell>
			</SubPanelInvoker>
		);
	}
}

SubPanelCell.propTypes = {
	label: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	panel: PropTypes.object.isRequired,
	disabled: PropTypes.bool,
	controller: PropTypes.object,
	propertyId: PropTypes.object,
	customContainer: PropTypes.bool
};
