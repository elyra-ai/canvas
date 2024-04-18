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
import { Provider } from "react-redux";
import { injectIntl } from "react-intl";
import PropTypes from "prop-types";
import CommonCanvasCentralItems from "./cc-central-items.jsx";
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
		this.logger.log("componentDidUpdate");
		this.initializeController(this.props);
	}

	initializeController(props) {
		this.logger.logStartTimer("initializeController");
		props.canvasController.setCanvasConfig(props.config);
		props.canvasController.setContextMenuConfig(props.contextMenuConfig);
		props.canvasController.setKeyboardConfig(props.keyboardConfig);
		props.canvasController.setToolbarConfig(props.toolbarConfig);
		props.canvasController.setNotificationPanelConfig(props.notificationConfig);
		props.canvasController.setRightFlyoutConfig(
			{ content: props.rightFlyoutContent, isOpen: props.showRightFlyout });
		props.canvasController.setBottomPanelConfig(
			{ content: props.bottomPanelContent, isOpen: props.showBottomPanel });
		props.canvasController.setTopPanelConfig(
			{ content: props.topPanelContent, isOpen: props.showTopPanel });

		props.canvasController.setHandlers({
			contextMenuHandler: props.contextMenuHandler,
			beforeEditActionHandler: props.beforeEditActionHandler,
			editActionHandler: props.editActionHandler,
			clickActionHandler: props.clickActionHandler,
			decorationActionHandler: props.decorationActionHandler,
			tipHandler: props.tipHandler,
			layoutHandler: props.layoutHandler,
			idGeneratorHandler: props.idGeneratorHandler,
			selectionChangeHandler: props.selectionChangeHandler,
			actionLabelHandler: props.actionLabelHandler
		});
		this.logger.logEndTimer("initializeController");
	}

	render() {
		this.logger.log("render");

		return (
			<Provider store={this.props.canvasController.getStore()}>
				<CommonCanvasCentralItems canvasController={this.props.canvasController} containingDivId={this.containingDivId} />
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
	actionLabelHandler: PropTypes.func,
	rightFlyoutContent: PropTypes.object,
	showRightFlyout: PropTypes.bool,
	bottomPanelContent: PropTypes.object,
	showBottomPanel: PropTypes.bool,
	topPanelContent: PropTypes.object,
	showTopPanel: PropTypes.bool
};

export default injectIntl(CommonCanvas);
