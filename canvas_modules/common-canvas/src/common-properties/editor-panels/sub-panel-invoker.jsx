/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";

import PropertiesDialog from "../properties-dialog.jsx";
import WideFlyout from "../components/wide-flyout.jsx";

export default class SubPanelInvoker extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			panel: null,
			title: null,
			hideHandler: null,
			subPanelVisible: false
		};
		this.showSubDialog = this.showSubDialog.bind(this);
		this.hideSubDialog = this.hideSubDialog.bind(this);
	}

	showSubDialog(title, panel, hideHandler) {
		this.setState({
			panel: panel,
			title: title,
			hideHandler: hideHandler,
			subPanelVisible: true
		});
	}

	hideSubDialog(applyChanges) {
		this.state.hideHandler(applyChanges);
		this.setState({
			panel: null,
			title: null,
			hideHandler: null,
			subPanelVisible: false
		});
	}

	render() {
		var propertiesDialog = [];
		if (this.state.subPanelVisible && !this.props.rightFlyout) {
			propertiesDialog = (<PropertiesDialog
				title={this.state.title}
				okHandler={this.hideSubDialog.bind(this, true)}
				cancelHandler={this.hideSubDialog.bind(this, false)}
			>
				{this.state.panel}
			</PropertiesDialog>);
		} else if (this.props.rightFlyout) {
			propertiesDialog = (<WideFlyout
				cancelHandler={this.hideSubDialog.bind(this, false)}
				okHandler={this.hideSubDialog.bind(this, true)}
				show={this.state.subPanelVisible}
				title={this.state.title}
			>
				<div>
					{this.state.panel}
				</div>
			</WideFlyout>);
		}

		return (
			<div>
				{propertiesDialog}
				{this.props.children}
			</div>
		);
	}
}

SubPanelInvoker.propTypes = {
	children: PropTypes.element,
	rightFlyout: PropTypes.bool
};


SubPanelInvoker.defaultProps = {
	rightFlyout: false
};
