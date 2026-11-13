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

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { ActionableNotification, InlineNotification } from "@carbon/react";

// Delay before the notification content is shown so screen readers detect the
// change in the aria-live region. 100ms was too fast for VoiceOver on macOS.
const ARIA_LIVE_DELAY = 200;

/**
 * Displays the content of a notification bar using a two-phase render so
 * screen readers announce it:
 * 1. First render: an empty notification which establishes the aria-live region.
 * 2. Second render: the full content, so screen readers detect the change.
 *
 * Errors use role="alert" and are filled in immediately. All other kinds use
 * role="status" and are filled in after a short delay.
 *
 * The parent gives this component a key based on the title, subtitle and kind
 * so the two-phase render (and so the announcement) is repeated whenever one
 * of those values changes.
 */
function NotificationBarContent({ config }) {
	const kind = config.kind || "info";
	const [showContent, setShowContent] = useState(false);

	useEffect(() => {
		let timer = null;
		if (kind === "error") {
			setShowContent(true);
		} else {
			timer = setTimeout(() => setShowContent(true), ARIA_LIVE_DELAY);
		}
		return () => {
			if (timer) {
				clearTimeout(timer);
			}
		};
	}, [kind]);

	const hasCloseButton = typeof config.onCloseButtonClick === "function";
	const isActionable = Boolean(config.content || config.actionButtonLabel || config.onActionButtonClick);
	const role = kind === "error" ? "alert" : "status";

	const title = showContent ? config.title : "";
	const subtitle = showContent ? config.subtitle : null;

	const screenReaderText = showContent && config.screenReaderText
		? <div className="cds--visually-hidden">{config.screenReaderText}</div>
		: null;

	if (isActionable) {
		// ActionableNotification is used, with an overridden role, because
		// InlineNotification does not support actions or content.
		return (
			<ActionableNotification
				inline
				title={title}
				subtitle={subtitle}
				kind={kind}
				role={role}
				lowContrast
				hideCloseButton={!hasCloseButton}
				onCloseButtonClick={config.onCloseButtonClick}
				actionButtonLabel={showContent ? config.actionButtonLabel : ""}
				onActionButtonClick={config.onActionButtonClick}
			>
				{showContent ? config.content : null}
				{screenReaderText}
			</ActionableNotification>
		);
	}

	return (
		<InlineNotification
			title={title}
			subtitle={typeof subtitle === "string" ? subtitle : ""}
			kind={kind}
			role={role}
			lowContrast
			hideCloseButton={!hasCloseButton}
			onCloseButtonClick={config.onCloseButtonClick}
		>
			{screenReaderText}
		</InlineNotification>
	);
}

NotificationBarContent.propTypes = {
	config: PropTypes.object.isRequired
};

/**
 * Notification bar displayed at the top of the canvas. It is controlled by the
 * notificationBarConfig prop of <CommonCanvas>. When there is no config, nothing
 * is displayed.
 */
class NotificationBar extends React.Component {
	render() {
		const config = this.props.config;
		if (!config) {
			return null;
		}

		const subtitleKey = typeof config.subtitle === "string" ? config.subtitle : "";
		const key = [config.kind || "info", config.title, subtitleKey].join("|");

		return (
			<div className="common-canvas-notification-bar" data-testid="common-canvas-notification-bar">
				<NotificationBarContent key={key} config={config} />
			</div>
		);
	}
}

NotificationBar.propTypes = {
	// Provided by Redux
	config: PropTypes.shape({
		title: PropTypes.string,
		subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
		kind: PropTypes.oneOf(["error", "info", "info-square", "success", "warning", "warning-alt"]),
		actionButtonLabel: PropTypes.string,
		onActionButtonClick: PropTypes.func,
		onCloseButtonClick: PropTypes.func,
		content: PropTypes.node,
		screenReaderText: PropTypes.string
	})
};

const mapStateToProps = (state) => ({
	config: state.notificationbar.config
});

export default connect(mapStateToProps)(NotificationBar);
