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
/* eslint react/no-did-mount-set-state: 0 */

// import logger from "../../../utils/logger";
import React from "react";

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
			panel = <div className="control-panel"></div>;
		}

		return (panel);
	}
}

SelectorPanel.propTypes = {
	panels: React.PropTypes.object,
	dependsOn: React.PropTypes.string,
	controlAccessor: React.PropTypes.func
};
