/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import Icon from "../icons/icon.jsx";
import { ERROR, WARNING } from "../common-canvas/constants/canvas-constants";

class NotificationPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			messages: this.props.messages
		};

		this.handleNotificationPanelClickOutside = this.handleNotificationPanelClickOutside.bind(this);
	}

	componentDidMount() {
		document.addEventListener("mousedown", this.handleNotificationPanelClickOutside, true);
	}

	componentWillReceiveProps(nextProps) {
		this.setState({ messages: nextProps.messages });
	}

	componentWillUnmount() {
		document.removeEventListener("mousedown", this.handleNotificationPanelClickOutside, true);
	}

	getNotifications() {
		const notifications = [];
		if (!this.state.messages) {
			return notifications;
		}
		for (let index = 0; index < this.state.messages.length; index++) {
			const message = this.state.messages[index];
			const className = message.callback ? " clickable " : "";
			const type = message.type === ERROR || message.type === WARNING
				? (<div className="notification-message-type">
					<Icon type={message.type} />
				</div>)
				: null;

			notifications.push(<div className="notifications-button-container" key={index} >
				<button
					className={"notifications " + className + message.type}
					onClick={this.notificationCallback.bind(this, index, message.callback)}
				>
					{type}
					<div className="notification-message-details">
						{message.message}
					</div>
				</button>
			</div>);
		}

		return notifications;
	}

	handleNotificationPanelClickOutside(e) {
		const domNode = document.getElementsByClassName("notification-panel-messages")[0];
		const bellIcon = document.getElementsByClassName("notificationBellIcon")[0];

		if (this.props.isNotificationOpen && bellIcon && !bellIcon.contains(e.target) && domNode && !domNode.contains(e.target)) {
			this.props.canvasController.closeNotificationPanel();
		}
	}

	notificationCallback(index, messageCallback) {
		if (messageCallback) {
			messageCallback(index);
		}
	}

	render() {
		const notificationPanelClassName = this.props.isNotificationOpen ? "" : "panel-hidden";
		const notificationPanel = this.state.messages.length > 0
			? (<div>
				<div className="notification-panel-messages">
					{this.getNotifications()}
				</div>
				<svg className="notification-popup-arrow" x="0px" y="0px" viewBox="0 0 16 9">
					<polyline points="0,9 8,0 16,9" />
				</svg>
			</div>)
			: <div />;

		return (<div className={"notification-panel-container " + notificationPanelClassName} >
			{notificationPanel}
		</div>);
	}
}

NotificationPanel.propTypes = {
	isNotificationOpen: PropTypes.bool,
	messages: PropTypes.array,
	canvasController: PropTypes.object
};

export default NotificationPanel;
