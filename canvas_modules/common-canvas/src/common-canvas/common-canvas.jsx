/*
 * Copyright 2017-2021 Elyra Authors
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
import { Provider } from "react-redux";
import { injectIntl } from "react-intl";
import PropTypes from "prop-types";
import CanvasContents from "./cc-contents.jsx";
import Palette from "../palette/palette.jsx";
import CommonCanvasToolbar from "./cc-toolbar.jsx";
import CommonCanvasTooltip from "./cc-tooltip.jsx";
import CommonCanvasRightFlyout from "./cc-right-flyout.jsx";
import NotificationPanel from "../notification-panel/notification-panel.jsx";
import Logger from "../logging/canvas-logger.js";


class CommonCanvas extends React.Component {
	constructor(props) {
		super(props);

		this.logger = new Logger(["CommonCanvas"]);
		this.logger.log("constructor");

		this.initializeController = this.initializeController.bind(this);
		this.containingDivId = "common-canvas-items-container-" + props.canvasController.getInstanceId();

		props.canvasController.setIntl(props.intl);
		this.initializeController(props);
	}

	componentDidUpdate() {
		this.initializeController(this.props);
	}

	// Prevent the default behavior (which is to show a plus-sign pointer) as
	// an object is being dragged over the common canvas components.
	// Note: this is overriden by the canvas area itself to allow external objects
	// to be dragged over it.
	onDragOver(evt) {
		evt.preventDefault();
	}

	// Prevent an object being dropped on the common canvas causing a file
	// download event (which is the default!). Note: this is overriden by the
	// canvas area itself to allow external objects to be dropped on it.
	onDrop(evt) {
		evt.preventDefault();
	}

	initializeController(props) {
		// window.console.log("initializeController");

		props.canvasController.setCanvasConfig(props.config);
		props.canvasController.setContextMenuConfig(props.contextMenuConfig);
		props.canvasController.setKeyboardConfig(props.keyboardConfig);
		props.canvasController.setToolbarConfig(props.toolbarConfig);
		props.canvasController.setNotificationPanelConfig(props.notificationConfig);
		props.canvasController.setRightFlyoutConfig(
			{ content: props.rightFlyoutContent, isOpen: props.showRightFlyout });

		props.canvasController.setHandlers({
			contextMenuHandler: props.contextMenuHandler,
			beforeEditActionHandler: props.beforeEditActionHandler,
			editActionHandler: props.editActionHandler,
			clickActionHandler: props.clickActionHandler,
			decorationActionHandler: props.decorationActionHandler,
			tipHandler: props.tipHandler,
			layoutHandler: props.layoutHandler,
			idGeneratorHandler: props.idGeneratorHandler,
			selectionChangeHandler: props.selectionChangeHandler
		});
	}

	render() {
		// window.console.log("Common Canvas render");

		const tip = (<CommonCanvasTooltip canvasController={this.props.canvasController} />);
		const palette = (<Palette canvasController={this.props.canvasController} containingDivId={this.containingDivId} />);
		const rightFlyout = (<CommonCanvasRightFlyout />);
		const canvasToolbar = (<CommonCanvasToolbar canvasController={this.props.canvasController} />);
		const notificationPanel = (<NotificationPanel canvasController={this.props.canvasController} />);
		const canvasContents = (<CanvasContents canvasController={this.props.canvasController} containingDivId={this.containingDivId} />);

		// TODO -- Currently, enableRightFlyoutUnderToolbar is not supported, which
		// is OK because no host app is currently using that option. If any dev team
		//  wants to use it the code below will need to be moved in an intermediate
		// React object so the Provider can be passed into it. This intermediate
		// object will then be able to implement mapStateToProps to so when
		// enableRightFlyoutUnderToolbar it causes a render to occur within that
		// object.
		let rightSideItems = null;
		if (this.props.enableRightFlyoutUnderToolbar) {
			rightSideItems = (
				<div className="common-canvas-right-side-items-under-toolbar">
					{canvasToolbar}
					<div id={this.containingDivId} className="common-canvas-items-container-under-toolbar">
						{canvasContents}
						{rightFlyout}
						{notificationPanel}
					</div>
				</div>
			);

		} else {
			rightSideItems = (
				<div className="common-canvas-right-side-items">
					<div id={this.containingDivId} className="common-canvas-items-container">
						{canvasToolbar}
						{canvasContents}
						{notificationPanel}
					</div>
					{rightFlyout}
				</div>
			);
		}

		const className = "common-canvas" + (
			this.props.config && this.props.config.enableParentClass
				? " " + this.props.config.enableParentClass
				: "");

		return (
			<Provider store={this.props.canvasController.getStore()}>
				<div className={className} onDragOver={this.onDragOver} onDrop={this.onDrop}>
					{palette}
					{rightSideItems}
					{tip}
				</div>
			</Provider>
		);
	}
}

CommonCanvas.propTypes = {
	intl: PropTypes.object.isRequired,
	canvasController: PropTypes.object.isRequired,
	config: PropTypes.object,
	toolbarConfig: PropTypes.oneOfType([
		PropTypes.array,
		PropTypes.object
	]),
	notificationConfig: PropTypes.object,
	contextMenuConfig: PropTypes.object,
	keyboardConfig: PropTypes.object,
	contextMenuHandler: PropTypes.func,
	beforeEditActionHandler: PropTypes.func,
	editActionHandler: PropTypes.func,
	clickActionHandler: PropTypes.func,
	decorationActionHandler: PropTypes.func,
	tipHandler: PropTypes.func,
	layoutHandler: PropTypes.func,
	idGeneratorHandler: PropTypes.func,
	selectionChangeHandler: PropTypes.func,
	rightFlyoutContent: PropTypes.object,
	showRightFlyout: PropTypes.bool,

	// Provided by Redux
	// See comment above in render() above the support for this.
	enableRightFlyoutUnderToolbar: PropTypes.bool
};

export default injectIntl(CommonCanvas);
