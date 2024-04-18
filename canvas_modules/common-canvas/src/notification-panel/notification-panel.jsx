/*
 * Copyright 2017-2023 Elyra Authors
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
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import Icon from "./../icons/icon.jsx";
import { Button } from "@carbon/react";
import { Close } from "@carbon/react/icons";
import Logger from "../logging/canvas-logger.js";
import { DEFAULT_NOTIFICATION_HEADER } from "./../common-canvas/constants/canvas-constants.js";
import defaultMessages from "../../locales/notification-panel/locales/en.json";

const TAB_KEY = 9;
const RETURN_KEY = 13;
const SPACE_KEY = 32;

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

		this.logger = new Logger("NotificationPanel");
		this.keyDownOnPanel = this.keyDownOnPanel.bind(this);
	}

	componentDidMount() {
		this.setFocusOnFirstItem();
	}

	setFocusOnFirstItem() {
		if (this.allRefs.length > 0) {
			this.allRefs[0].focus();
		}
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

			const title = message.title
				? (<div className="notification-message-title">
					{message.title}
				</div>)
				: null;

			const subtitle = message.subtitle
				? (<div className = "notification-message-subtitle">
					{message.subtitle}
					<hr />
				</div>)
				: null;

			const closeMessage = message.closeMessage
				? (
					<div tabIndex={0} ref={(ref) => (!ref || this.allRefs.push(ref))}
						className = "notification-message-close"
						onClick={this.clickOnCloseButton.bind(this, message)}
						onKeyDown={this.keyDownOnCloseButton.bind(this, message)}
					>
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
					tabIndex={0}
					ref={(ref) => (!ref || this.allRefs.push(ref))}
				>
					{type}
					<div className="notification-message-details">
						{title}
						{subtitle}
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

	notificationCallback(id, messageCallback) {
		if (messageCallback) {
			messageCallback(id);
		}
	}

	clickOnCloseButton(message) {
		this.deleteNotification(message.id);
	}

	keyDownOnCloseButton(message, evt) {
		if (evt.keyCode === SPACE_KEY || evt.keyCode === RETURN_KEY) {
			this.deleteNotification(message.id);
		}
	}

	deleteNotification(id) {
		this.props.subPanelData.canvasController.deleteNotificationMessages(id);
	}

	clearNotificationMessages() {
		this.props.subPanelData.canvasController.clearNotificationMessages();
		this.setFocusOnFirstItem();

		if (typeof this.props.notificationConfig.clearAllCallback === "function") {
			this.props.notificationConfig.clearAllCallback();
		}
	}

	keyDownOnPanel(evt) {
		if (evt.keyCode === TAB_KEY && !evt.shiftKey) {
			const lastElement = this.allRefs[this.allRefs.length - 1];
			if (evt.target === lastElement) {
				evt.stopPropagation();
				evt.preventDefault();
				this.allRefs[0].focus();
			}
		} else if (evt.keyCode === TAB_KEY && evt.shiftKey) {
			const lastElement = this.allRefs[this.allRefs.length - 1];
			if (evt.target === this.allRefs[0]) {
				evt.stopPropagation();
				evt.preventDefault();
				lastElement.focus();
			}
		}
	}

	render() {
		this.logger.log("render");
		this.allRefs = [];

		if (!this.props.notificationConfig) {
			return null;
		}

		const headerText = this.props.notificationConfig && this.props.notificationConfig.notificationHeader
			? this.props.notificationConfig.notificationHeader
			: DEFAULT_NOTIFICATION_HEADER;

		const notificationHeader = (<div className="notification-panel-header">{headerText}</div>);

		const notificationSubtitle = this.props.notificationConfig && this.props.notificationConfig.notificationSubtitle
			? (<div className="notification-panel-subtitle">
				{this.props.notificationConfig.notificationSubtitle}
			</div>)
			: null;

		const closeButton = (
			<div className="notification-panel-close-button">
				<Button
					ref={(ref) => (!ref || this.allRefs.push(ref))}
					size="sm"
					kind="ghost"
					renderIcon={Close}
					hasIconOnly
					iconDescription={this.props.intl.formatMessage({
						id: "notification.panel.close.button.description",
						defaultMessage: defaultMessages["notification.panel.close.button.description"]
					})}
					onClick={this.props.closeSubPanel}
					tooltipAlignment="end"
					tooltipPosition="bottom"
				/>
			</div>
		);

		const notificationPanelMessages = this.props.messages.length > 0
			? this.getNotifications()
			: (<div tabIndex={0} ref={(ref) => (!ref || this.allRefs.push(ref))} className="notification-panel-empty-message-container">
				<div className="notification-panel-empty-message">
					{this.props.notificationConfig && this.props.notificationConfig.emptyMessage ? this.props.notificationConfig.emptyMessage : null}
				</div>
			</div>);

		const clearAll = this.props.notificationConfig && this.props.notificationConfig.clearAllMessage
			? (<div className="notification-panel-clear-all-container">
				<Button
					ref={(ref) => (!ref || this.props.messages.length === 0 || this.allRefs.push(ref))}
					className="notification-panel-clear-all"
					onClick={this.clearNotificationMessages.bind(this)}
					kind="ghost"
					size="sm"
					disabled={this.props.messages.length === 0}
				>
					{this.props.notificationConfig.clearAllMessage}
				</Button>
			</div>)
			: null;

		const secondaryButton = this.props.notificationConfig &&
			this.props.notificationConfig.secondaryButtonLabel &&
			this.props.notificationConfig.secondaryButtonCallback
			? (<div className="notification-panel-secondary-button-container">
				<Button
					ref={(ref) => (!ref || this.props.secondaryButtonDisabled || this.allRefs.push(ref))}
					className="notification-panel-secondary-button"
					onClick={this.props.notificationConfig.secondaryButtonCallback.bind(this)}
					kind="ghost"
					size="sm"
					disabled={this.props.secondaryButtonDisabled}
				>
					{this.props.notificationConfig.secondaryButtonLabel}
				</Button>
			</div>)
			: null;

		return (
			<div className="notification-panel" onKeyDown={this.keyDownOnPanel}>
				<div className="notification-panel-header-container" tabIndex={0} ref={(ref) => (!ref || this.allRefs.push(ref))}>
					{notificationHeader}
					{notificationSubtitle}
				</div>
				{closeButton}
				<div className="notification-panel-messages">
					{notificationPanelMessages}
				</div>
				<div className="notification-panel-button-container">
					{clearAll}
					{secondaryButton}
				</div>
			</div>
		);
	}
}

NotificationPanel.propTypes = {
	// Provided by toolbar
	closeSubPanel: PropTypes.func,
	subPanelData: PropTypes.object,

	// Provided by Redux
	notificationConfig: PropTypes.shape({
		notificationHeader: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.object
		]),
		notificationSubtitle: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.object
		]),
		emptyMessage: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.object
		]),
		clearAllMessage: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.object
		]),
		clearAllCallback: PropTypes.func,
		keepOpen: PropTypes.bool,
		secondaryButtonLabel: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.object
		]),
		secondaryButtonCallback: PropTypes.func,
		secondaryButtonDisabled: PropTypes.bool
	}),
	secondaryButtonDisabled: PropTypes.bool,
	messages: PropTypes.array,
	intl: PropTypes.object.isRequired
};

const mapStateToProps = (state, ownProps) => ({
	notificationConfig: state.notificationpanel.config,
	secondaryButtonDisabled: state.notificationpanel.config ? state.notificationpanel.config.secondaryButtonDisabled : false,
	messages: state.notifications
});

export default connect(mapStateToProps)(injectIntl(NotificationPanel));
