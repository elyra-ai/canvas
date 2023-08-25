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
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Palette from "../palette/palette.jsx";
import CommonCanvasTooltip from "./cc-tooltip.jsx";
import CanvasContents from "./cc-contents.jsx";
import CommonCanvasToolbar from "./cc-toolbar.jsx";
import CommonCanvasRightFlyout from "./cc-right-flyout.jsx";
import CanvasBottomPanel from "./cc-bottom-panel.jsx";
import CanvasTopPanel from "./cc-top-panel.jsx";
import NotificationPanel from "../notification-panel/notification-panel.jsx";
import Logger from "../logging/canvas-logger.js";

class CommonCanvasCentralItems extends React.Component {
	constructor(props) {
		super(props);
		this.logger = new Logger("CC-CentralItems");
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

	generateClass() {
		let className = "common-canvas";

		className += (
			!this.props.enableEditingActions
				? " config-editing-actions-false"
				: "");

		className += (
			this.props.enableParentClass
				? " " + this.props.enableParentClass
				: "");

		return className;
	}

	render() {
		this.logger.log("render");

		const tip = (<CommonCanvasTooltip canvasController={this.props.canvasController} />);
		const palette = (<Palette canvasController={this.props.canvasController} containingDivId={this.props.containingDivId} />);
		const rightFlyout = (<CommonCanvasRightFlyout />);
		const canvasToolbar = (<CommonCanvasToolbar canvasController={this.props.canvasController} />);
		const canvasContents = (<CanvasContents canvasController={this.props.canvasController} />);
		const bottomPanel = (<CanvasBottomPanel canvasController={this.props.canvasController} containingDivId={this.props.containingDivId} />);
		const topPanel = (<CanvasTopPanel canvasController={this.props.canvasController} containingDivId={this.props.containingDivId} />);
		const notificationPanel = (<NotificationPanel canvasController={this.props.canvasController} />);

		let rightSideItems = null;
		if (this.props.enableRightFlyoutUnderToolbar) {
			const templateRows = this.props.toolbarIsOpen ? "auto 1fr" : "1fr";
			const templateCols = this.props.rightFlyoutIsOpen ? "1fr auto" : "1fr";
			let templateRows2 = this.props.topPanelIsOpen ? "auto 1fr" : "1fr";
			templateRows2 += this.props.bottomPanelIsOpen ? " auto" : "";

			rightSideItems = (
				<div className="common-canvas-right-side-items-under-toolbar" style={{ gridTemplateRows: templateRows }}>
					{canvasToolbar}
					<div id={this.props.containingDivId} className="common-canvas-items-container-under-toolbar" style={{ gridTemplateColumns: templateCols }}>
						<div className="common-canvas-with-top-and-bottom-panel" style={{ gridTemplateRows: templateRows2 }}>
							{topPanel}
							{canvasContents}
							{bottomPanel}
						</div>
						{rightFlyout}
					</div>
					{notificationPanel}
				</div>
			);

		} else {
			let templateRows = "";
			templateRows += this.props.toolbarIsOpen ? "auto" : "";
			templateRows += this.props.topPanelIsOpen ? " auto" : "";
			templateRows += " 1fr"; // For canvas contents
			templateRows += this.props.bottomPanelIsOpen ? " auto" : "";

			rightSideItems = (
				<div className="common-canvas-right-side-items">
					<div id={this.props.containingDivId} className="common-canvas-items-container" style={{ gridTemplateRows: templateRows }}>
						{canvasToolbar}
						{topPanel}
						{canvasContents}
						{bottomPanel}
						{notificationPanel}
					</div>
					{rightFlyout}
				</div>
			);
		}

		const divClassName = this.generateClass();

		return (
			<div className={divClassName} onDragOver={this.onDragOver} onDrop={this.onDrop}>
				{palette}
				{rightSideItems}
				{tip}
			</div>
		);
	}
}

CommonCanvasCentralItems.propTypes = {
	// Provided by CommonCanvas
	canvasController: PropTypes.object.isRequired,
	containingDivId: PropTypes.string.isRequired,

	// Provided by Redux
	enableParentClass: PropTypes.string,
	enableEditingActions: PropTypes.bool,
	enableRightFlyoutUnderToolbar: PropTypes.bool,
	toolbarIsOpen: PropTypes.bool,
	topPanelIsOpen: PropTypes.bool,
	bottomPanelIsOpen: PropTypes.bool,
	rightFlyoutIsOpen: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => ({
	enableParentClass: state.canvasconfig.enableParentClass,
	enableEditingActions: state.canvasconfig.enableEditingActions,
	enableRightFlyoutUnderToolbar: state.canvasconfig.enableRightFlyoutUnderToolbar,
	toolbarIsOpen: (state.canvasconfig.enableToolbarLayout !== "None"),
	topPanelIsOpen: state.toppanel.isOpen,
	bottomPanelIsOpen: state.bottompanel.isOpen,
	rightFlyoutIsOpen: state.rightflyout.isOpen
});

export default connect(mapStateToProps)(CommonCanvasCentralItems);
