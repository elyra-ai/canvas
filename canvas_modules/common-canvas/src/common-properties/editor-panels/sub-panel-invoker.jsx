/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* eslint "react/prop-types": [2, { ignore: ["children"] }] */

import React from "react";

import PropertiesDialog from "../properties-dialog.jsx";

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
		if (this.state.subPanelVisible) {
			propertiesDialog = (<PropertiesDialog
				onHide={this.hideSubDialog.bind(this, false)}
				title={this.state.title}
				okHandler={this.hideSubDialog.bind(this, true)}
				cancelHandler={this.hideSubDialog.bind(this, false)}
			>
				{this.state.panel}
			</PropertiesDialog>);
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
};
