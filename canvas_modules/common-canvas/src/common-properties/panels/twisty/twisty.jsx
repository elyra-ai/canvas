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
import ControlUtils from "./../../util/control-utils";
import { injectIntl, intlShape } from "react-intl";
import Icon from "./../../../icons/icon.jsx";

class TwistyPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showTwistyPanel: false,
			panelHeight: 0
		};
		this.handleLinkClicked = this.handleLinkClicked.bind(this);
	}

	handleLinkClicked() {
		if (this.props.children) {
			if (this.twistyPanelDiv.clientHeight !== 0) {
				this.setState({ showTwistyPanel: false, panelHeight: 0 });
			} else {
				this.setState({ showTwistyPanel: true, panelHeight: this.twistyContent.clientHeight });
			}
		}
	}

	render() {
		const propertyId = { name: this.props.panelId };
		const conditionProps = {
			propertyId: propertyId,
			controlType: "panel"
		};
		const conditionState = ControlUtils.getConditionMsgState(this.props.controller, conditionProps);
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;
		const iconClassName = (this.state.showTwistyPanel) ? "twistypanel_icon rotate" : "twistypanel_icon";
		const link = (<div onClick={this.handleLinkClicked} className="control-twisty-link-buttons">
			<div className={iconClassName} >
				<Icon type="rightArrow" {...stateDisabled} />
			</div>
			<span className="twistypanel_text" {...stateDisabled} style={stateStyle}>
				{this.props.label}
			</span>
		</div>);
		const panelStyle = this.state.panelHeight + "px";
		const twistyPanel = (
			<div ref={ (elem) => (this.twistyPanelDiv = elem)} className="twistypanel-panel" style= {{ height: panelStyle }}>
				<div ref={ (elem) => (this.twistyContent = elem)} className="twistypanel-content">
					{this.props.children}
				</div>
			</div>
		);

		return (
			<div className={"control-twisty twisty-control-panel"} style={stateStyle}>
				{link}
				{twistyPanel}
			</div>
		);
	}
}

TwistyPanel.propTypes = {
	label: PropTypes.string.isRequired,
	controller: PropTypes.object.isRequired,
	children: PropTypes.array,
	panelId: PropTypes.string.isRequired,
	intl: intlShape
};

export default injectIntl(TwistyPanel);
