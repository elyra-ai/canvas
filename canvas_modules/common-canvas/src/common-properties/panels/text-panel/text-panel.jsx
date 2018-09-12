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
import PropertyUtil from "./../../util/property-utils.js";
import classNames from "classnames";
import { STATES } from "./../../constants/constants";

class TextPanel extends Component {
	render() {
		const label = this.props.panel.label ? (<div className="panel-label">{this.props.panel.label.text}</div>) : null;
		const description = this.props.panel.description
			? (<div className="panel-description">{PropertyUtil.evaluateText(this.props.panel.description.text, this.props.controller)}</div>)
			: null;
		return (
			<div className={classNames("properties-text-panel", { "hide": this.props.panelState === STATES.HIDDEN })}
				disabled={this.props.panelState === STATES.DISABLED}
			>
				{label}
				{description}
			</div>);
	}
}

TextPanel.propTypes = {
	panel: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	panelState: PropTypes.string // set by redux
};

const mapStateToProps = (state, ownProps) => ({
	panelState: ownProps.controller.getPanelState({ name: ownProps.panel.id }),
	propertyValues: ownProps.controller.getPropertyValues() // not used locally but needed to cause a rerender to evaluate text with a property value
});

export default connect(mapStateToProps, null)(TextPanel);
