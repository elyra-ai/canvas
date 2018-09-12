/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classNames from "classnames";
import Accordion from "carbon-components-react/lib/components/Accordion";
import AccordionItem from "carbon-components-react/lib/components/AccordionItem";
import ControlUtils from "./../../util/control-utils";
import { STATES } from "./../../constants/constants.js";


class TwistyPanel extends React.Component {

	render() {
		return (
			<div className={classNames("properties-twisty-panel", { "hide": this.props.panelState === STATES.HIDDEN })}
				disabled={this.props.panelState === STATES.DISABLED} data-id={ControlUtils.getDataId({ name: this.props.panel.id })}
			>
				<Accordion>
					<AccordionItem title={this.props.panel.label}>
						{this.props.children}
					</AccordionItem>
				</Accordion>
			</div>
		);
	}
}

TwistyPanel.propTypes = {
	panel: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	children: PropTypes.array,
	panelState: PropTypes.string // set by redux
};

const mapStateToProps = (state, ownProps) => ({
	panelState: ownProps.controller.getPanelState({ name: ownProps.panel.id })
});

export default connect(mapStateToProps, null)(TwistyPanel);
