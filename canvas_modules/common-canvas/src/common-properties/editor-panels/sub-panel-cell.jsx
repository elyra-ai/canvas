/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import logger from "../../../utils/logger";
import React from "react";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";
import { Cell } from "fixed-data-table";

import SubPanelInvoker from "./sub-panel-invoker.jsx";

export default class SubPanelCell extends React.Component {
	constructor(props) {
		super(props);
		this.showSubPanel = this.showSubPanel.bind(this);
		this.onSubPanelHidden = this.onSubPanelHidden.bind(this);
		this.getRowIndex = this.getRowIndex.bind(this);
	}

	onSubPanelHidden(applyChanges) {
		logger.info("Cell.onSubPanelHidden(): applyChanges=" + applyChanges);
		this.props.notifyFinishedEditing(this.props.rowIndex, applyChanges);
	}

	getRowIndex() {
		return this.props.rowIndex;
	}

	showSubPanel() {
		logger.info("Cell.showSubPanel(): row=" + this.props.rowIndex + ", col=" + this.props.col);
		// this.props.data[this.props.rowIndex][this.props.col]

		// Have to tell the owner table which row is about to be edited so it
		// can return the correct values when the controls request their values.
		this.props.notifyStartEditing(this.props.rowIndex);

		this.refs.invoker.showSubDialog(this.props.title, this.props.panel, this.onSubPanelHidden);
	}

	render() {
		// logger.info("SubPanelCell.render()");
		return (
			<SubPanelInvoker ref="invoker">
				<Cell>
					<Button
						style={{ "display": "inline" }}
						bsSize="xsmall"
						onClick={this.showSubPanel}
					>
						{this.props.label}
					</Button>
				</Cell>
			</SubPanelInvoker>
		);
	}
}

SubPanelCell.propTypes = {
	data: PropTypes.array.isRequired,
	rowIndex: PropTypes.number,
	col: PropTypes.number,
	label: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	panel: PropTypes.object.isRequired,
	notifyStartEditing: PropTypes.func.isRequired,
	notifyFinishedEditing: PropTypes.func.isRequired
};
