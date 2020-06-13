/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classNames from "classnames";
import ControlUtils from "./../../util/control-utils";
import { STATES } from "./../../constants/constants.js";


class ColumnPanel extends React.Component {
	constructor(props) {
		super(props);
		let gridColumns = "";
		props.children.forEach((item, idx) => {
			if (idx === 0) {
				gridColumns = "auto";
			} else {
				gridColumns += " auto";
			}
		});
		this.style = {
			"gridTemplateColumns": gridColumns
		};
	}

	render() {
		// grid-template-columns
		return (
			<div className={classNames("properties-column-panel", { "hide": this.props.panelState === STATES.HIDDEN })}
				disabled={this.props.panelState === STATES.DISABLED} data-id={ControlUtils.getDataId({ name: this.props.panel.id })}
				style={this.style}
			>
				{this.props.children}
			</div>
		);
	}
}

ColumnPanel.propTypes = {
	panel: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	children: PropTypes.array.isRequired,
	panelState: PropTypes.string // set by redux
};

const mapStateToProps = (state, ownProps) => ({
	panelState: ownProps.controller.getPanelState({ name: ownProps.panel.id })
});

export default connect(mapStateToProps, null)(ColumnPanel);
