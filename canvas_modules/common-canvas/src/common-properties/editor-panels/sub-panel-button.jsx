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

import SubPanelInvoker from "./sub-panel-invoker.jsx";

export default class SubPanelButton extends React.Component {
	constructor(props) {
		super(props);
		this.showSubPanel = this.showSubPanel.bind(this);
		this.onSubPanelHidden = this.onSubPanelHidden.bind(this);
	}


	onSubPanelHidden(applyChanges) {
		logger.info("onSubPanelHidden(): applyChanges=" + applyChanges);

		if (typeof this.props.notifyFinishedEditing !== "undefined") {
			this.props.notifyFinishedEditing(applyChanges);
		}
	}

	showSubPanel() {
		logger.info("Button.showSubPanel()");
		if (typeof this.props.notifyStartEditing !== "undefined") {
			this.props.notifyStartEditing();
		}

		this.refs.invoker.showSubDialog(this.props.title, this.props.panel, this.onSubPanelHidden);
	}

	render() {
		const button = (<Button
			style={{ "display": "inline" }}
			bsSize="xsmall"
			onClick={this.showSubPanel}
		>
			{this.props.label}
		</Button>);
		return (
			<SubPanelInvoker ref="invoker" rightFlyout={this.props.rightFlyout}>
				{button}
			</SubPanelInvoker>
		);
	}
}

SubPanelButton.propTypes = {
	label: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	panel: PropTypes.object.isRequired,
	notifyStartEditing: PropTypes.func,
	notifyFinishedEditing: PropTypes.func,
	rightFlyout: PropTypes.bool
};
