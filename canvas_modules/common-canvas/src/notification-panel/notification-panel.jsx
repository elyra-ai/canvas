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
import CanvasIcon from "./../icons/icon.jsx";
import Icon from "carbon-components-react/lib/components/Icon";
import { SUCCESS, CARBON_SUCCESS } from "../common-canvas/constants/canvas-constants";

class NotificationPanel extends React.Component {
	constructor(props) {
		super(props);
		this.handleNotificationPanelClickOutside = this.handleNotificationPanelClickOutside.bind(this);
	}

	componentDidMount() {
		document.addEventListener("click", this.handleNotificationPanelClickOutside, true);
	}

	componentWillReceiveProps(nextProps) {
		this.setState({ messages: nextProps.messages });
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
			const iconType = message.type.startsWith(SUCCESS) ? CARBON_SUCCESS : message.type;

			const type = (<div className="notification-message-type">
				<Icon className={iconType}
					description=""
					name={iconType + "--glyph"}
				/>
			</div>);

			const timestamp = message.timestamp
				? (<div className="notification-message-timestamp">
					<div className="notification-message-timestamp-icon">
						<CanvasIcon type="time" />
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
			this.props.canvasController.closeNotificationPanel();
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
