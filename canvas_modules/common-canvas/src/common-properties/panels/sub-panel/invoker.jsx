/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";

import PropertiesModal from "./../../components/properties-modal";
import WideFlyout from "./../../components/wide-flyout";

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
		this.props.controller.increaseVisibleSubPanelCounter();
		this.setState({
			panel: panel,
			title: title,
			hideHandler: hideHandler,
			subPanelVisible: true
		});
	}

	hideSubDialog(applyChanges) {
		this.props.controller.decreaseVisibleSubPanelCounter();
		this.state.hideHandler(applyChanges);
		this.setState({
			panel: null,
			title: null,
			hideHandler: null,
			subPanelVisible: false
		});
	}

	render() {
		let propertiesDialog = [];
		if (this.state.subPanelVisible && !this.props.rightFlyout) {
			propertiesDialog = (<PropertiesModal
				title={this.state.title}
				okHandler={this.hideSubDialog.bind(this, true)}
				cancelHandler={this.hideSubDialog.bind(this, false)}
				applyLabel={this.props.applyLabel}
				rejectLabel={this.props.rejectLabel}
			>
				{this.state.panel}
			</PropertiesModal>);
		} else if (this.props.rightFlyout) {
			propertiesDialog = (<WideFlyout
				cancelHandler={this.hideSubDialog.bind(this, false)}
				okHandler={this.hideSubDialog.bind(this, true)}
				show={this.state.subPanelVisible}
				applyLabel={this.props.applyLabel}
				rejectLabel={this.props.rejectLabel}
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
	applyLabel: PropTypes.string,
	rejectLabel: PropTypes.string,
	rightFlyout: PropTypes.bool,
	controller: PropTypes.object
};

SubPanelInvoker.defaultProps = {
	rightFlyout: false
};
