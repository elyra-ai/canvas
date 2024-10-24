/*
 * Copyright 2017-2024 Elyra Authors
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

/* eslint no-lonely-if: "off" */

import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Palette from "../palette/palette.jsx";
import PaletteDialog from "../palette/palette-dialog.jsx";
import CommonCanvasTooltip from "./cc-tooltip.jsx";
import CanvasContents from "./cc-contents.jsx";
import CommonCanvasToolbar from "./cc-toolbar.jsx";
import CommonCanvasLeftFlyout from "./cc-left-flyout.jsx";
import CommonCanvasRightFlyout from "./cc-right-flyout.jsx";
import CanvasBottomPanel from "./cc-bottom-panel.jsx";
import CanvasTopPanel from "./cc-top-panel.jsx";
import Logger from "../logging/canvas-logger.js";
import { PALETTE_LAYOUT_FLYOUT, PALETTE_LAYOUT_DIALOG, PALETTE_LAYOUT_NONE }
	from "../common-canvas/constants/canvas-constants";


class CommonCanvasPanels extends React.Component {
	constructor(props) {
		super(props);
		this.logger = new Logger("CC-Panels");
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

	// Returns a JSX <div> for the top, canvas contents and bottom panels that are always
	// on top of each other.
	generateTopCenterBottom() {
		const canvasContents = (<CanvasContents canvasController={this.props.canvasController} />);
		const bottomPanel = (<CanvasBottomPanel canvasController={this.props.canvasController} containingDivId={this.props.containingDivId} />);
		const topPanel = (<CanvasTopPanel canvasController={this.props.canvasController} containingDivId={this.props.containingDivId} />);

		let templateRows = this.props.topPanelIsOpen ? "auto 1fr" : "1fr";
		templateRows += this.props.bottomPanelIsOpen ? " auto" : "";

		return (
			<div className="common-canvas-grid-vertical" style={{ gridTemplateRows: templateRows }}>
				{topPanel}
				{canvasContents}
				{bottomPanel}
			</div>
		);
	}

	// Returns true if the left flyout should be displayed. The application
	// can choose to:
	// * Use the in-built <Palette> behavior indicated by setting the
	//   config field enablePaletteLayout to "Flyout"
	// * To put its own contents in the left flyout panel. This is
	//   indicated by setting the config field enablePaletteLayout to
	//   "None" and providing some JSX in the leftFlyoutContent field
	//   of <CommonCanvas>.
	isLeftPanelOpen() {
		if (this.props.enablePaletteLayout === PALETTE_LAYOUT_DIALOG) {
			return false;
		}

		if (this.props.enablePaletteLayout === PALETTE_LAYOUT_NONE &&
			this.props.leftFlyoutIsOpen) {
			return true;
		}

		if (this.props.enablePaletteLayout === PALETTE_LAYOUT_FLYOUT &&
			(this.props.paletteIsOpen || this.props.enableNarrowPalette)) {
			return true;
		}
		return false;
	}

	// Returns a JSX object for the contents of the left panel. If the application
	// sets enablePaletteLayout to None this indicates the app wamts its own content
	// to go into the left panel provided by leftFlyoutContent provided to <CommonCanvas>
	// otherwise if enablePaletteLayout is "Flyout" the app wants Common Canvas to
	// provide the regular <Palette>.
	generateLeftFlyout() {
		if (this.props.enablePaletteLayout === PALETTE_LAYOUT_NONE && this.props.leftFlyoutIsOpen) {
			return (<CommonCanvasLeftFlyout />);

		} else if (this.props.enablePaletteLayout === PALETTE_LAYOUT_FLYOUT) {
			return (<Palette canvasController={this.props.canvasController} />);
		}
		return null;
	}

	render() {
		this.logger.log("render");

		const tip = (<CommonCanvasTooltip canvasController={this.props.canvasController} />);
		const canvasToolbar = (
			<CommonCanvasToolbar canvasController={this.props.canvasController}
				containingDivId={this.props.containingDivId}
			/>
		);
		const rightFlyout = (<CommonCanvasRightFlyout containingDivId={this.props.containingDivId} />);
		const leftFlyoutIsOpen = this.isLeftPanelOpen();
		const leftFlyout = leftFlyoutIsOpen ? this.generateLeftFlyout() : null;

		const topCenterBottom = this.generateTopCenterBottom();

		let panels = null;

		if (this.props.enableLeftFlyoutUnderToolbar) {
			if (this.props.enableRightFlyoutUnderToolbar) {
				let templateCols = leftFlyoutIsOpen && leftFlyout ? "auto " : "";
				templateCols += "1fr"; // For topCenterBottom
				templateCols += this.props.rightFlyoutIsOpen ? " auto" : "";

				const templateRows = this.props.toolbarIsOpen ? "auto 1fr" : "1fr";

				const lowerPanels = (
					<div id={this.props.containingDivId} className="common-canvas-grid-horizontal"
						style={{ gridTemplateColumns: templateCols }}
					>
						{leftFlyout}
						{topCenterBottom}
						{rightFlyout}
					</div>
				);
				panels = (
					<div className="common-canvas-grid-vertical" style={{ gridTemplateRows: templateRows }}>
						{canvasToolbar}
						{lowerPanels}
					</div>
				);

			} else {
				const templateRows = this.props.toolbarIsOpen ? "auto 1fr" : "1fr";
				const templateCols = leftFlyoutIsOpen ? "auto 1fr" : "1fr";

				const leftSideItems = (
					<div className="common-canvas-grid-vertical" style={{ gridTemplateRows: templateRows }}>
						{canvasToolbar}
						<div id={this.props.containingDivId} className="common-canvas-grid-horizontal"
							style={{ gridTemplateColumns: templateCols }}
						>
							{leftFlyout}
							{topCenterBottom}
						</div>
					</div>
				);
				panels = (
					<>
						{leftSideItems}
						{rightFlyout}
					</>
				);
			}

		} else {
			if (this.props.enableRightFlyoutUnderToolbar) {
				const templateRows = this.props.toolbarIsOpen ? "auto 1fr" : "1fr";
				const templateCols = this.props.rightFlyoutIsOpen ? "1fr auto" : "1fr";

				const rightSideItems = (
					<div className="common-canvas-grid-vertical" style={{ gridTemplateRows: templateRows }}>
						{canvasToolbar}
						<div id={this.props.containingDivId} className="common-canvas-grid-horizontal"
							style={{ gridTemplateColumns: templateCols }}
						>
							{topCenterBottom}
							{rightFlyout}
						</div>
					</div>
				);
				panels = (
					<>
						{leftFlyout}
						{rightSideItems}
					</>
				);

			} else {
				let templateRows = "";
				templateRows += this.props.toolbarIsOpen ? "auto" : "";
				templateRows += " 1fr"; // For topCenterBottom panels <div>

				let templateCols = leftFlyoutIsOpen && leftFlyout ? "auto " : "";
				templateCols += "1fr"; // For topCenterBottom
				templateCols += this.props.rightFlyoutIsOpen ? " auto" : "";

				const centerItems = (
					<div id={this.props.containingDivId} className="common-canvas-grid-vertical"
						style={{ gridTemplateRows: templateRows }}
					>
						{canvasToolbar}
						{topCenterBottom}
					</div>
				);
				panels = (
					<div className="common-canvas-grid-horizontal"
						style={{ gridTemplateColumns: templateCols }}
					>
						{leftFlyout}
						{centerItems}
						{rightFlyout}
					</div>
				);
			}
		}

		const dialogPalette = this.props.enablePaletteLayout === PALETTE_LAYOUT_DIALOG && this.props.paletteIsOpen
			? (<PaletteDialog canvasController={this.props.canvasController} containingDivId={this.props.containingDivId} />)
			: null;

		const divClassName = this.generateClass();

		return (
			<div className={divClassName} onDragOver={this.onDragOver} onDrop={this.onDrop}>
				{panels}
				{dialogPalette}
				{tip}
			</div>
		);
	}
}

CommonCanvasPanels.propTypes = {
	// Provided by CommonCanvas
	canvasController: PropTypes.object.isRequired,
	containingDivId: PropTypes.string.isRequired,

	// Provided by Redux
	enableParentClass: PropTypes.string,
	enableEditingActions: PropTypes.bool,
	enablePaletteLayout: PropTypes.string,
	enableNarrowPalette: PropTypes.bool,
	enableLeftFlyoutUnderToolbar: PropTypes.bool,
	enableRightFlyoutUnderToolbar: PropTypes.bool,
	toolbarIsOpen: PropTypes.bool,
	paletteIsOpen: PropTypes.bool,
	topPanelIsOpen: PropTypes.bool,
	bottomPanelIsOpen: PropTypes.bool,
	leftFlyoutIsOpen: PropTypes.bool,
	rightFlyoutIsOpen: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => ({
	enableParentClass: state.canvasconfig.enableParentClass,
	enableEditingActions: state.canvasconfig.enableEditingActions,
	enablePaletteLayout: state.canvasconfig.enablePaletteLayout,
	enableNarrowPalette: state.canvasconfig.enableNarrowPalette,
	enableLeftFlyoutUnderToolbar: state.canvasconfig.enableLeftFlyoutUnderToolbar,
	enableRightFlyoutUnderToolbar: state.canvasconfig.enableRightFlyoutUnderToolbar,
	toolbarIsOpen: (state.canvasconfig.enableToolbarLayout !== PALETTE_LAYOUT_NONE),
	paletteIsOpen: state.palette.isOpen,
	topPanelIsOpen: state.toppanel.isOpen,
	bottomPanelIsOpen: state.bottompanel.isOpen,
	leftFlyoutIsOpen: state.leftflyout.isOpen,
	rightFlyoutIsOpen: state.rightflyout.isOpen
});

export default connect(mapStateToProps)(CommonCanvasPanels);
