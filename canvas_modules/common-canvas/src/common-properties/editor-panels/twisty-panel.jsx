/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint complexity: ["error", 30] */
/* eslint max-depth: ["error", 6] */
/* eslint no-return-assign: "off" */

import React from "react";
import PropTypes from "prop-types";
import EditorControl from "../editor-controls/editor-control.jsx";
import { injectIntl, intlShape } from "react-intl";
import TwistyClosed from "../../../assets/images/twisty_closed.svg";


class TwistyPanel extends EditorControl {
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
		const conditionState = this.getConditionMsgState(conditionProps);
		const errorMessage = conditionState.message;
		// const messageType = conditionState.messageType;
		const errorIcon = conditionState.icon;
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;
		const icon = TwistyClosed;
		const iconClassName = (this.state.showTwistyPanel) ? "twistypanel_icon rotate" : "twistypanel_icon";
		const link = (<div className="control-twisty-link-buttons">
			<img className={iconClassName} src={icon} onClick={this.handleLinkClicked} {...stateDisabled} style={stateStyle} />
			<span onClick={this.handleLinkClicked} className="twistypanel_text" {...stateDisabled} style={stateStyle}>
				{this.props.label}
			</span>
			{errorIcon}
		</div>);
		const panelStyle = this.state.panelHeight + "px";
		const twistyPanel = (
			<div ref={ (elem) => this.twistyPanelDiv = elem} className="twistypanel-panel" style= {{ height: panelStyle }}>
				<div ref={ (elem) => this.twistyContent = elem} className="twistypanel-content">
					{this.props.children}
				</div>
			</div>
		);

		return (
			<div className={"control-twisty twisty-control-panel"} style={stateStyle}>
				{link}
				{twistyPanel}
				{errorMessage}
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
