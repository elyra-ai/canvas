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
import Button from "ap-components-react/dist/components/Button";

export default class ButtonAction extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
		this.applyAction = this.applyAction.bind(this);
	}

	applyAction() {
		// fire event and let the application determine how to handle the action
		const actionHandler = this.props.controller.getHandlers().actionHandler;
		if (typeof actionHandler === "function") {
			actionHandler(this.props.action.name,
				this.props.controller.getAppData(), this.props.action.data);
		}
	}

	render() {
		return (
			<div className={"properties-action-button"}>
				<Button medium semantic onClick={this.applyAction}>
					{this.props.action.label.text}
				</Button>
			</div>
		);
	}
}

ButtonAction.propTypes = {
	action: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired
};
