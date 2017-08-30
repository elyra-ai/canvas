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
		// logger.info("SelectorPanel: constructor()");
		// logger.info(props);
		this.state = {
			currentValue: ""
		};
	}

	componentDidMount() {
		// logger.info("SelectorPanel.componentDidMount()");
		const control = this.props.controlAccessor(this.props.dependsOn);
		// logger.info("Control=" + control);
		if (control) {
			control.setValueListener(this);
			this.setState({ currentValue: control.getControlValue() });
		}
	}

	componentWillUnmount() {
		// logger.info("SelectorPanel.componentWillUnmount()");
		const control = this.props.controlAccessor(this.props.dependsOn);
		// logger.info("Control=" + control);
		if (control) {
			control.clearValueListener();
		}
	}

	handleValueChanged(controlName, value) {
		// logger.info("SelectorPanel.handleValueChanged(): value=" + value);
		this.setState({ currentValue: value });
	}

	render() {
		// logger.info("SelectorPanel.render(): currentValue=" + this.state.currentValue);
		let panel = this.props.panels[this.state.currentValue];
		if (typeof panel === "undefined") {
			panel = <div className="control-panel" />;
		}

		return (panel);
	}
}

SelectorPanel.propTypes = {
	panels: PropTypes.object,
	dependsOn: PropTypes.string,
	controlAccessor: PropTypes.func
};
