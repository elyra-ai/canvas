/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2016
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/

import logger from "../../../utils/logger";
import React from "react";
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
		logger.info("SubPanelCell.render()");
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
	data: React.PropTypes.array.isRequired,
	rowIndex: React.PropTypes.number,
	col: React.PropTypes.number,
	label: React.PropTypes.string.isRequired,
	title: React.PropTypes.string.isRequired,
	panel: React.PropTypes.object.isRequired,
	notifyStartEditing: React.PropTypes.func.isRequired,
	notifyFinishedEditing: React.PropTypes.func.isRequired
};
