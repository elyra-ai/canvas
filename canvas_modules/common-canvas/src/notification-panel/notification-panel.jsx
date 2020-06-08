/*
 * Copyright 2017-2020 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react";
import PropTypes from "prop-types";
import Icon from "./../icons/icon.jsx";
import Button from "carbon-components-react/lib/components/Button";
import { Close16 } from "@carbon/icons-react";
import { DEFAULT_NOTIFICATION_HEADER } from "./../common-canvas/constants/canvas-constants.js";


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
		this.closeNotificationPanel = this.closeNotificationPanel.bind(this);
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

			const closeMessage = message.closeMessage
				? (<div className = "notification-message-close" onClick={this.deleteNotification.bind(this, message.id)}>
					{message.closeMessage}
				</div>)
				: null;

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
						{closeMessage}
					</div>
				</div>
			</div>);
		}

		return notifications;
	}

	handleNotificationPanelClickOutside(e) {
		if (!this.props.notificationConfig.keepOpen) {
			const notificationIcon = document.getElementsByClassName("notificationCounterIcon")[0];
			const notificationHeader = document.getElementsByClassName("notification-panel-header")[0];
			const notificationMessages = document.getElementsByClassName("notification-panel-messages-container")[0];

			if (this.props.isNotificationOpen &&
					notificationIcon && !notificationIcon.contains(e.target) &&
					notificationHeader && !notificationHeader.contains(e.target) &&
					notificationMessages && !notificationMessages.contains(e.target)) {
				this.props.canvasController.toolbarActionHandler("closeNotificationPanel");
				e.stopPropagation(); // Prevent D3 canvas code from clearing the selections.
			}
		}
	}

	notificationCallback(id, messageCallback) {
		if (messageCallback) {
			messageCallback(id);
		}
	}

	deleteNotification(id) {
		this.props.canvasController.deleteNotificationMessages(id);
	}

	clearNotificationMessages() {
		this.props.canvasController.clearNotificationMessages();
	}

	closeNotificationPanel() {
		this.props.canvasController.toolbarActionHandler("closeNotificationPanel");
	}

	render() {
		const notificationPanelClassName = this.props.isNotificationOpen ? "" : "panel-hidden";
		const notificationHeader = this.props.notificationConfig && this.props.notificationConfig.notificationHeader
			? this.props.notificationConfig.notificationHeader
			: DEFAULT_NOTIFICATION_HEADER;
		const notificationSubtitle = this.props.notificationConfig && this.props.notificationConfig.notificationSubtitle
			? (<div className="notification-panel-subtitle">
				{this.props.notificationConfig.notificationSubtitle}
			</div>)
			: null;
		const notificationPanelMessages = this.props.messages.length > 0
			? this.getNotifications()
			: (<div className="notification-panel-empty-message-container">
				<div className="notification-panel-empty-message">
					{this.props.notificationConfig && this.props.notificationConfig.emptyMessage ? this.props.notificationConfig.emptyMessage : null}
				</div>
			</div>);
		const clearAll = this.props.notificationConfig && this.props.notificationConfig.clearAllMessage
			? (<div className="notification-panel-clear-all-container">
				<Button
					className="notification-panel-clear-all"
					onClick={this.clearNotificationMessages.bind(this)}
					kind="ghost"
					size="small"
					disabled={this.props.messages.length === 0}
				>
					{this.props.notificationConfig.clearAllMessage}
				</Button>
			</div>)
			: null;

		return (<div className={"notification-panel-container " + notificationPanelClassName} >
			<div className="notification-panel">
				<div className="notification-panel-header">
					{notificationHeader}
					{notificationSubtitle}
					<Close16 className="notification-panel-close-icon" onClick={this.closeNotificationPanel} />
				</div>
				<div className="notification-panel-messages-container">
					<div className="notification-panel-messages">
						{notificationPanelMessages}
					</div>
					{clearAll}
				</div>
				<svg className="notification-popup-arrow" x="0px" y="0px" viewBox="0 0 16 9">
					<polyline points="0,9 8,0 16,9" />
				</svg>
			</div>
		</div>);
	}
}

NotificationPanel.propTypes = {
	notificationConfig: PropTypes.shape({
		notificationHeader: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.object
		]),
		notificationSubtitle: PropTypes.string,
		emptyMessage: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.object
		]),
		clearAllMessage: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.object
		]),
		keepOpen: PropTypes.bool
	}),
	isNotificationOpen: PropTypes.bool,
	messages: PropTypes.array,
	canvasController: PropTypes.object
};

export default NotificationPanel;
