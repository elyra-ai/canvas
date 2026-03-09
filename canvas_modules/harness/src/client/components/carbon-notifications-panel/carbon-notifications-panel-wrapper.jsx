/*
 * Copyright 2026 Elyra Authors
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
import { NotificationsPanel } from "@carbon/ibm-products";

class NotificationsPanelWrapper extends React.Component {
	constructor(props) {
		super(props);

		this.wrapperRef = React.createRef();
		this.onKeyDown = this.onKeyDown.bind(this);
		this.handleFocusTrap = this.handleFocusTrap.bind(this);
	}

	componentDidMount() {
		// Focus the wrapper when mounted to enable focus trapping
		if (this.wrapperRef.current) {
			this.wrapperRef.current.focus();
		}
	}

	onKeyDown(evt) {
		if (evt.key === "Escape") {
			evt.stopPropagation();
			this.props.closeSubPanel();
		} else if (evt.key === "Tab") {
			this.handleFocusTrap(evt);
		}
	}

	handleFocusTrap(evt) {
		if (!this.wrapperRef.current) {
			return;
		}

		// Get all focusable elements within the panel
		const focusableElements = this.wrapperRef.current.querySelectorAll(
			"button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])"
		);

		if (focusableElements.length === 0) {
			return;
		}

		const firstElement = focusableElements[0];
		const lastElement = focusableElements[focusableElements.length - 1];

		// If shift+tab on first element, move to last
		if (evt.shiftKey && document.activeElement === firstElement) {
			evt.preventDefault();
			lastElement.focus();
		} else if (!evt.shiftKey && document.activeElement === lastElement) {
			// If tab on last element, move to first
			evt.preventDefault();
			firstElement.focus();
		}
	}

	render() {
		// eslint-disable-next-line no-unused-vars
		const { closeSubPanel, subPanelData, ...otherProps } = this.props;

		const notifications = subPanelData?.notifications || [];
		const onDismissSingleNotification = subPanelData?.onDismissSingleNotification;
		const onDismissAllNotifications = subPanelData?.onDismissAllNotifications;

		return (
			<div
				ref={this.wrapperRef}
				className="notifications-panel-wrapper"
				onKeyDown={this.onKeyDown}
				tabIndex={-1}
			>
				<NotificationsPanel
					open
					data={notifications}
					onDismissSingleNotification={onDismissSingleNotification}
					onDismissAllNotifications={onDismissAllNotifications}
					onKeyDown={this.onKeyDown}
					{...otherProps}
				/>
			</div>
		);
	}
}

NotificationsPanelWrapper.propTypes = {
	closeSubPanel: PropTypes.func,
	subPanelData: PropTypes.object
};

export default NotificationsPanelWrapper;

// Made with Bob
