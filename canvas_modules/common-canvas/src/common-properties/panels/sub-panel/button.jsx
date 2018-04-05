/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import logger from "./../../../../utils/logger";
import React from "react";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap/lib/Button";
import PropertyUtils from "./../../util/property-utils";
import { MESSAGE_KEYS, MESSAGE_KEYS_DEFAULTS } from "./../../constants/constants";

import { injectIntl, intlShape } from "react-intl";


import SubPanelInvoker from "./invoker.jsx";

class SubPanelButton extends React.Component {
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
		const applyLabel = PropertyUtils.formatMessage(this.props.intl, MESSAGE_KEYS.APPLYBUTTON_LABEL, MESSAGE_KEYS_DEFAULTS.APPLYBUTTON_LABEL);
		const rejectLabel = PropertyUtils.formatMessage(this.props.intl, MESSAGE_KEYS.REJECTBUTTON_LABEL, MESSAGE_KEYS_DEFAULTS.REJECTBUTTON_LABEL);

		const button = (<Button
			style={{ "display": "inline" }}
			bsSize="xsmall"
			onClick={this.showSubPanel}
		>
			{this.props.label}
		</Button>);
		return (
			<SubPanelInvoker ref="invoker"
				rightFlyout={this.props.rightFlyout}
				applyLabel={applyLabel}
				rejectLabel={rejectLabel}
				controller={this.props.controller}
			>
				{button}
			</SubPanelInvoker>
		);
	}
}

SubPanelButton.propTypes = {
	label: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	panel: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	notifyStartEditing: PropTypes.func,
	notifyFinishedEditing: PropTypes.func,
	rightFlyout: PropTypes.bool,
	intl: intlShape
};

export default injectIntl(SubPanelButton);
