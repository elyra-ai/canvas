/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classNames from "classnames";
import ControlUtils from "./../../util/control-utils";
import { STATES } from "./../../constants/constants";

class ActionPanel extends Component {
	render() {
		return (
			<div className={classNames("properties-action-panel", { "hide": this.props.panelState === STATES.HIDDEN })}
				data-id={ControlUtils.getDataId({ name: this.props.panel.id })}
				disabled={this.props.panelState === STATES.DISABLED}
			>
				{this.props.children}
			</div>);
	}
}

ActionPanel.propTypes = {
	panel: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	children: PropTypes.oneOfType([
		PropTypes.element,
		PropTypes.array
	]),
	panelState: PropTypes.string // set by redux
};

const mapStateToProps = (state, ownProps) => ({
	panelState: ownProps.controller.getPanelState({ name: ownProps.panel.id })
});

export default connect(mapStateToProps, null)(ActionPanel);
