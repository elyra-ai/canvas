/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018, 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import Icon from "./../icons/icon.jsx";

class NotificationPanel extends React.Component {
	static getDerivedStateFromProps(nextProps, prevState) {
		if (nextProps.messages !== prevState.messages) {
			return ({ messages: nextProps.messages });
		}
		return ({});
	}

	constructor(props) {
		super(props);
		this.state = {};
		this.handleNotificationPanelClickOutside = this.handleNotificationPanelClickOutside.bind(this);
	}

	componentDidMount() {
		document.addEventListener("click", this.handleNotificationPanelClickOutside, true);
	}

	componentWillUnmount() {
		document.removeEventListener("click", this.handleNotificationPanelClickOutside, true);
	}

	getNotifications() {
		const notifications = [];
		if (!this.props.messages) {
			return notifications;
		}
		for (let index = 0; index < this.props.messages.length; index++) {
			const message = this.props.messages[index];
			const className = message.callback ? " clickable " : "";
			const iconType = message.type;
			const type = (<div className="notification-message-type">
				<Icon type={iconType} className={`notification-message-icon-${iconType}`} />
			</div>);

			const timestamp = message.timestamp
				? (<div className="notification-message-timestamp">
					<div className="notification-message-timestamp-icon">
						<Icon type="time" />
					</div>
					<div className="notification-message-string">
						{message.timestamp}
					</div>
				</div>)
				: null;

			notifications.push(<div className="notifications-button-container" key={index + "-" + message.id} >
				<div
					className={"notifications " + className + message.type}
					onClick={this.notificationCallback.bind(this, message.id, message.callback)}
				>
					{type}
					<div className="notification-message-details">
						<div className="notification-message-title">
							{message.title}
						</div>
						<div className="notification-message-content">
							{message.content}
						</div>
						{timestamp}
					</div>
				</div>
			</div>);
		}

		return notifications;
	}

	handleNotificationPanelClickOutside(e) {
		const notificationIcon = document.getElementsByClassName("notificationCounterIcon")[0];
		const notificationHeader = document.getElementsByClassName("notification-panel-header")[0];
		const notificationMessages = document.getElementsByClassName("notification-panel-messages")[0];

		if (this.props.isNotificationOpen &&
				notificationIcon && !notificationIcon.contains(e.target) &&
				notificationHeader && !notificationHeader.contains(e.target) &&
				notificationMessages && !notificationMessages.contains(e.target)) {
			this.props.canvasController.toolbarActionHandler("closeNotificationPanel");
			e.stopPropagation(); // Prevent D3 canvas code from clearing the selections.
		}
	}

	notificationCallback(id, messageCallback) {
		if (messageCallback) {
			messageCallback(id);
		}
	}

	render() {
		const notificationPanelClassName = this.props.isNotificationOpen ? "" : "panel-hidden";
		const notificationPanel = this.props.messages.length > 0
			? (<div className="notification-panel">
				<div className="notification-panel-header">{this.props.notificationHeader}</div>
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
	notificationHeader: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.object
	]),
	isNotificationOpen: PropTypes.bool,
	messages: PropTypes.array,
	canvasController: PropTypes.object
};

export default NotificationPanel;
