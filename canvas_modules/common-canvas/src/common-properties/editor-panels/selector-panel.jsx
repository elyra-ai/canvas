/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint react/no-did-mount-set-state: 0 */

// import logger from "../../../utils/logger";
import React from "react";
import PropTypes from "prop-types";

export default class SelectorPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}

	render() {
		let panel = this.props.panels[this.props.controller.getPropertyValue({ name: this.props.dependsOn })];
		if (typeof panel === "undefined") {
			panel = <div className="control-panel" />;
		}

		return (panel);
	}
}

SelectorPanel.propTypes = {
	panels: PropTypes.object,
	dependsOn: PropTypes.string,
	controller: PropTypes.object.isRequired,
};
