/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";


export default class ImageAction extends React.Component {
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
		let height = {};
		let width = {};
		if (this.props.action.image.size) {
			height = this.props.action.image.size.height ? { "height": this.props.action.image.size.height } : {};
			width = this.props.action.image.size.width ? { "width": this.props.action.image.size.width } : {};
		}
		const className = classNames("properties-action-image", { "left": this.props.action.image.placement === "left" },
			{ "right": this.props.action.image.placement === "right" });
		return (
			<div className={className} data-id={this.props.action.name}>
				<img
					src={this.props.action.image.url}
					onClick={this.applyAction}
					{...height}
					{...width}
				/>
			</div>
		);
	}
}

ImageAction.propTypes = {
	action: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired
};
