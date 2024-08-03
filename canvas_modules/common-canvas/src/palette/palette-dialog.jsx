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

import React from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import PropTypes from "prop-types";
import defaultMessages from "../../locales/palette/locales/en.json";
import PaletteDialogTopbar from "./palette-dialog-topbar.jsx";
import PaletteDialogContent from "./palette-dialog-content.jsx";

class PaletteDialog extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			xPos: 100,
			yPos: 100,
			showGrid: true
		};

		this.showGrid = this.showGrid.bind(this);
		this.mouseDownOnTopBar = this.mouseDownOnTopBar.bind(this);
		this.mouseDownOnPalette = this.mouseDownOnPalette.bind(this);
		this.mouseMove = this.mouseMove.bind(this);
		this.mouseUp = this.mouseUp.bind(this);
		this.windowResize = this.windowResize.bind(this);
		this.windowMaximize = this.windowMaximize.bind(this);
		this.getPaletteDiv = this.getPaletteDiv.bind(this);
		this.resizePalette = this.resizePalette.bind(this);
		this.movePalette = this.movePalette.bind(this);
		this.setResizingCursors = this.setResizingCursors.bind(this);
		this.setSizingHoverEdge = this.setSizingHoverEdge.bind(this);
		this.snapToWidth = this.snapToWidth.bind(this);
		this.snapToHeight = this.snapToHeight.bind(this);
		this.removePx = this.removePx.bind(this);

		// These variables are used when dragging the palette.
		this.dragging = false;
		this.dragOffsetY = 0;
		this.dragOffsetX = 0;

		// verticalSizingAction and verticalSizingHover can be set to top or bottom
		this.verticalSizingAction = "";
		this.verticalSizingHover = "";

		// horizontalSizingAction and horizontalSizingHover can be set to left or right
		this.horizontalSizingAction = "";
		this.hoizontalSizingHover = "";

		// These variables store the palette dimensions
		this.savedWidth = 0;
		this.savedLeft = 0;
		this.savedHeight = 0;
		this.savedTop = 0;

		// hoverZoneSize is the number of pixels around the palette where the
		// sizing cursor will appear (which allows the user to size the window).
		this.hoverZoneSize = 3;
		this.totalHoverZoneSize = this.hoverZoneSize * 2;

		// Need to control resizing of palette with snap to grid.
		this.adjustedWidth = 137; // default width - (default content node grid width)
		this.adjustedHeight = 51; // default heigth - (default content node grid height) + padding to avoid scroll bar
		this.adjustedScrollBarWidth = 15;

		// Boolean to remember whether we are maximized or not. This gets set to
		// false when doing a manual resize of the palette.
		this.isMaximized = false;

		this.paletteNodes = [];

		// Correction for palette cursor position
		// Used in both hoverzone detection and mouseMove vertical resize at bottom of paletteDiv
		this.hackPaletteOffset = 46;
		this.hackPaletteTopOffset = this.hackPaletteOffset + 4;

		window.addEventListener("mousemove", this.mouseMove, false);
		window.addEventListener("mouseup", this.mouseUp, false);
		window.addEventListener("resize", this.windowResize, false);
	}

	componentDidUpdate() {
		// After the palette has rendered ensure the palette is visible in
		// whatever size the canvas happens to be. This can be done by doing
		// the same activity as we perform when the browser window is sized.
		this.windowResize();
	}

	componentWillUnmount() {
		window.removeEventListener("mousemove", this.mouseMove);
		window.removeEventListener("mouseup", this.mouseUp);
		window.removeEventListener("resize", this.windowResize);
	}

	// Adjusts the mouse position from the event so it is NOT outside the
	// canvas when doing a bottom sizing operation.
	getAdjustedMousePositionBottom(ev, canvasDiv) {
		let eventClientY = ev.clientY;

		if (eventClientY > canvasDiv.offsetTop + canvasDiv.offsetHeight - this.hoverZoneSize) {
			eventClientY = canvasDiv.offsetTop + canvasDiv.offsetHeight - this.hoverZoneSize;
		}
		return eventClientY;
	}

	// Adjusts the mouse position from the event so it is NOT outside the
	// canvas when doing a left sizing operation.
	getAdjustedMousePositionLeft(ev, canvasDiv) {
		let eventClientX = ev.clientX;

		if (eventClientX < canvasDiv.offsetLeft + this.hoverZoneSize) {
			eventClientX = canvasDiv.offsetLeft + this.hoverZoneSize;
		}
		return eventClientX;
	}

	// Adjusts the mouse position from the event so it is NOT outside the
	// canvas when doing a right sizing operation.
	getAdjustedMousePositionRight(ev, canvasDiv) {
		let eventClientX = ev.clientX;

		if (eventClientX > canvasDiv.offsetLeft + canvasDiv.offsetWidth - this.hoverZoneSize) {
			eventClientX = canvasDiv.offsetLeft + canvasDiv.offsetWidth - this.hoverZoneSize;
		}
		return eventClientX;
	}

	// Adjusts the mouse position from the event so it is NOT outside the
	// canvas when doing a top sizing operation.
	getAdjustedMousePositionTop(ev, canvasDiv) {
		let eventClientY = ev.clientY;

		if (eventClientY < canvasDiv.offsetTop + this.hoverZoneSize) {
			eventClientY = canvasDiv.offsetTop + this.hoverZoneSize;
		}
		return eventClientY;
	}

	getPaletteDiv() {
		return this.refs.palette;
	}

	getStyleProperty(classOrId, property) {
		const firstChar = classOrId.charAt(0);
		const remaining = classOrId.substring(1);
		const elem = (firstChar === "#") ? document.getElementById(remaining) : document.getElementsByClassName(remaining)[0];
		return window.getComputedStyle(elem, null).getPropertyValue(property);
	}

	setResizingCursors(ev) {
		const paletteDiv = this.getPaletteDiv();

		this.setSizingHoverEdge(ev, paletteDiv);

		if (this.verticalSizingHover === "top") {
			if (this.horizontalSizingHover === "left") {
				paletteDiv.style.cursor = "nwse-resize";
			} else if (this.horizontalSizingHover === "right") {
				paletteDiv.style.cursor = "nesw-resize";
			} else {
				paletteDiv.style.cursor = "ns-resize";
			}
		} else if (this.verticalSizingHover === "bottom") {
			if (this.horizontalSizingHover === "left") {
				paletteDiv.style.cursor = "nesw-resize";
			} else if (this.horizontalSizingHover === "right") {
				paletteDiv.style.cursor = "nwse-resize";
			} else {
				paletteDiv.style.cursor = "ns-resize";
			}
		} else if (this.horizontalSizingHover === "left" ||
							this.horizontalSizingHover === "right") {
			paletteDiv.style.cursor = "ew-resize";

		} else {
			paletteDiv.style.cursor = "default";
		}
	}

	// Sets the size of the content div, and the divs inside content div, so
	// they adopt the same height as the palette.
	setContentDivHeight(paletteDiv, newHeight) {
		const topbarHeight = this.removePx(this.getStyleProperty(".palette-dialog-topbar", "height"));
		const newContentHeight = (newHeight - topbarHeight - this.totalHoverZoneSize) + "px";
		const contentDiv = paletteDiv.childNodes[1];
		contentDiv.style.height = newContentHeight;
		contentDiv.childNodes[0].style.height = newContentHeight;
		contentDiv.childNodes[1].style.height = newContentHeight;
	}

	setSizingHoverEdge(ev, paletteDiv) {
		if (ev.clientX > paletteDiv.offsetLeft &&
				ev.clientX < paletteDiv.offsetLeft + (this.totalHoverZoneSize)) {
			this.horizontalSizingHover = "left";

		} else if (ev.clientX < paletteDiv.offsetLeft + paletteDiv.offsetWidth &&
					ev.clientX > paletteDiv.offsetLeft + paletteDiv.offsetWidth - this.totalHoverZoneSize) {
			this.horizontalSizingHover = "right";

		} else {
			this.horizontalSizingHover = "";
			this.horizontalSizingAction = "";
		}

		if (ev.clientY > paletteDiv.offsetTop + this.hackPaletteTopOffset &&
				ev.clientY < paletteDiv.offsetTop + this.hackPaletteTopOffset + this.totalHoverZoneSize) {
			this.verticalSizingHover = "top";

		} else if (ev.clientY < paletteDiv.offsetTop + paletteDiv.offsetHeight + this.hackPaletteOffset &&
				ev.clientY > paletteDiv.offsetTop + paletteDiv.offsetHeight +
													this.hackPaletteOffset - this.totalHoverZoneSize) {
			this.verticalSizingHover = "bottom";

		} else {
			this.verticalSizingHover = "";
			this.verticalSizingAction = "";
		}
	}

	mouseDownOnTopBar(ev) {
		this.dragging = true;
		const paletteDiv = this.getPaletteDiv();
		this.dragOffsetX = ev.clientX - paletteDiv.offsetLeft;
		this.dragOffsetY = ev.clientY - paletteDiv.offsetTop;
	}

	mouseDownOnPalette(ev) {
		const paletteDiv = this.getPaletteDiv();

		if (this.verticalSizingHover !== "" ||
				this.horizontalSizingHover !== "") {
			this.verticalSizingAction = this.verticalSizingHover;
			this.horizontalSizingAction = this.horizontalSizingHover;
			this.savedWidth = paletteDiv.offsetWidth;
			this.savedLeft = paletteDiv.offsetLeft;
			this.savedHeight = paletteDiv.offsetHeight;
			this.savedTop = paletteDiv.offsetTop;
		}
	}

	mouseMove(ev) {
		// First, see if we are doing a sizing action (i.e. the user has
		// done mouse down when in sizing hover zone) and take appropriate
		// sizing action.
		if (this.verticalSizingAction !== "" ||
				this.horizontalSizingAction !== "") {
			this.resizePalette(ev);

			// Now, if no sizing behavior is going on we handle topbar drag
			// behavior (after the sizing behaviors) so sizing takes
			// precedence over dragging the window.
		} else if (this.dragging === true) {
			this.movePalette(ev);

			// Finally, if no sizing or dragging is going on, we look to see if
			// the user is hovering the pointer near the palette edges so we can
			// display an appropriate sizing cursor.
		} else {
			this.setResizingCursors(ev);
		}
	}

	mouseUp() {
		const paletteDiv = this.getPaletteDiv();

		// snap to grid adjustment to width
		if (this.state.showGrid && this.horizontalSizingAction !== "") {
			let newWidth = this.removePx(paletteDiv.style.width);
			if (newWidth !== "") {
				newWidth = this.snapToWidth(newWidth);
			}
			paletteDiv.style.width = newWidth + "px";

			// adjust the width if the content enters a scrolling situation
			const scrollDiv = paletteDiv.childNodes[1].childNodes[1];
			if (scrollDiv.clientHeight < scrollDiv.scrollHeight) {
				paletteDiv.style.width = (newWidth + this.adjustedScrollBarWidth) + "px";
			}
		}

		// snap to grid adjustment to height
		if (this.verticalSizingAction !== "") {
			const oldHeight = this.removePx(paletteDiv.style.height);
			if (oldHeight !== "") {
				const newHeight = this.snapToHeight(oldHeight);
				paletteDiv.style.height = newHeight + "px";
				this.setContentDivHeight(paletteDiv, newHeight);
			}
		}

		this.dragging = false;
		this.verticalSizingAction = "";
		this.horizontalSizingAction = "";
		this.verticalSizingHover = "";
		this.horizontalSizingHover = "";
	}

	movePalette(ev) {
		const paletteDiv = this.getPaletteDiv();
		const canvasDiv = document.getElementById(this.props.containingDivId);

		let newLeft = ev.clientX - this.dragOffsetX;
		let newTop = ev.clientY - this.dragOffsetY;

		if (newLeft < canvasDiv.offsetLeft + this.hoverZoneSize) {
			newLeft = canvasDiv.offsetLeft + this.hoverZoneSize;
		}
		if (newTop < canvasDiv.offsetTop + this.hoverZoneSize) {
			newTop = canvasDiv.offsetTop + this.hoverZoneSize;
		}
		if (newLeft + paletteDiv.offsetWidth > canvasDiv.offsetLeft + canvasDiv.offsetWidth) {
			newLeft = canvasDiv.offsetLeft + canvasDiv.offsetWidth - paletteDiv.offsetWidth - this.hoverZoneSize;
		}
		if (newTop + paletteDiv.offsetHeight > canvasDiv.offsetTop + canvasDiv.offsetHeight) {
			newTop = canvasDiv.offsetTop + canvasDiv.offsetHeight - paletteDiv.offsetHeight - this.hoverZoneSize;
		}

		paletteDiv.style.left = newLeft + "px";
		paletteDiv.style.top = newTop + "px";
	}

	removePx(styleDimension) {
		return parseInt(styleDimension.substring(0, styleDimension.indexOf("px")), 10);
	}

	resizePalette(ev) {
		const paletteDiv = this.getPaletteDiv();
		const canvasDiv = document.getElementById(this.props.containingDivId);

		// When manually resizing, set isMaximized to false in case the user
		// is resizing a maximized window.
		this.isMaximized = false;

		const minWidth = this.removePx(this.getStyleProperty(".palette-dialog-grid-node-outer", "width")) +
											this.removePx(this.getStyleProperty(".palette-dialog-categories", "min-width")) +
											(2 * this.hoverZoneSize);
		const minHeight = this.removePx(this.getStyleProperty(".palette-dialog-grid-node-outer", "height")) +
											this.removePx(this.getStyleProperty(".palette-dialog-topbar", "height")) +
											(2 * this.hoverZoneSize);

		if (this.horizontalSizingAction === "left") {
			const eventClientX = this.getAdjustedMousePositionLeft(ev, canvasDiv);
			const newWidth = this.savedWidth - (eventClientX - this.savedLeft);

			if (newWidth <= minWidth) {
				paletteDiv.style.width = minWidth + "px";
			} else {
				paletteDiv.style.width = newWidth + "px";
				paletteDiv.style.left = eventClientX + "px";
			}
		}

		if (this.horizontalSizingAction === "right") {
			const eventClientX = this.getAdjustedMousePositionRight(ev, canvasDiv);
			let newWidth = (eventClientX - this.savedLeft);

			if (newWidth <= minWidth) {
				newWidth = minWidth;
			}
			paletteDiv.style.width = newWidth + "px";
		}

		if (this.verticalSizingAction === "top") {
			const eventClientY = this.getAdjustedMousePositionTop(ev, canvasDiv);
			const newHeight = this.savedHeight - (eventClientY - this.savedTop);

			if (newHeight <= minHeight) {
				paletteDiv.style.height = minHeight + "px";
				this.setContentDivHeight(paletteDiv, this.minHeight);
			} else {
				paletteDiv.style.height = newHeight + "px";
				paletteDiv.style.top = (eventClientY - this.dragOffsetY) + "px";
				this.setContentDivHeight(paletteDiv, newHeight);
			}
		}

		if (this.verticalSizingAction === "bottom") {
			const eventClientY = this.getAdjustedMousePositionBottom(ev, canvasDiv);
			let newHeight = eventClientY - this.savedTop - this.hackPaletteOffset;

			if (newHeight <= minHeight) {
				newHeight = minHeight;
			}
			paletteDiv.style.height = newHeight + "px";
			this.setContentDivHeight(paletteDiv, newHeight);
		}
	}

	// Calculate snap to grid width
	snapToWidth(newWidth) {
		const gridNodeWidth = this.removePx(this.getStyleProperty(".palette-dialog-grid-node-outer", "width"));
		const snapWidth = Math.round((newWidth - this.adjustedWidth) / gridNodeWidth) * gridNodeWidth;
		return (snapWidth + this.adjustedWidth);
	}

	// Calculate snap to grid height
	snapToHeight(newHeight) {
		const gridHeight = this.state.showGrid ? this.removePx(this.getStyleProperty(".palette-dialog-grid-node-outer", "height"))
			: this.removePx(this.getStyleProperty(".palette-list-item", "height"));
		const snapHeight = Math.round((newHeight - this.adjustedHeight) / gridHeight) * gridHeight;
		return (snapHeight + this.adjustedHeight);
	}

	// Called when the browser window is resized.We need to make sure the
	// palette stays inside the canvas and is a size that allows it to fit
	// into the canvas.
	windowResize() {
		const paletteDiv = this.getPaletteDiv();
		const canvasDiv = document.getElementById(this.props.containingDivId);

		if (canvasDiv) {
			if (this.isMaximized) {
				// Handle horizontal page sizing
				const newLeft = canvasDiv.offsetLeft + this.hoverZoneSize;
				paletteDiv.style.left = newLeft + "px";

				const newWidth = canvasDiv.offsetWidth - this.totalHoverZoneSize;
				paletteDiv.style.width = newWidth + "px";

				// Handle vertical page sizing
				const newTop = canvasDiv.offsetTop + this.hoverZoneSize;
				paletteDiv.style.top = newTop + "px";

				const newHeight = canvasDiv.offsetHeight - this.totalHoverZoneSize;
				paletteDiv.style.height = newHeight + "px";
				this.setContentDivHeight(paletteDiv, newHeight);

			} else {
				// Handle horizontal page sizing
				if (paletteDiv.offsetLeft + paletteDiv.offsetWidth + this.hoverZoneSize >
										canvasDiv.offsetLeft + canvasDiv.offsetWidth) {
					const newLeft = canvasDiv.offsetLeft + canvasDiv.offsetWidth -
														paletteDiv.offsetWidth - this.hoverZoneSize;
					paletteDiv.style.left = newLeft + "px";
				}

				const newWidth = canvasDiv.offsetWidth - this.totalHoverZoneSize;
				if (newWidth < paletteDiv.offsetWidth) {
					paletteDiv.style.width = newWidth + "px";
					paletteDiv.style.left = (canvasDiv.offsetLeft + canvasDiv.offsetWidth -
																	paletteDiv.offsetWidth - this.hoverZoneSize) + "px";
				}

				// Handle vertical page sizing
				if (paletteDiv.offsetTop + paletteDiv.offsetHeight + this.hoverZoneSize >
										canvasDiv.offsetTop + canvasDiv.offsetHeight) {
					const newTop = canvasDiv.offsetTop + canvasDiv.offsetHeight -
												paletteDiv.offsetHeight - this.hoverZoneSize;
					paletteDiv.style.top = newTop + "px";
				}

				const newHeight = canvasDiv.offsetHeight - this.totalHoverZoneSize;
				if (newHeight < paletteDiv.offsetHeight) {
					paletteDiv.style.height = newHeight + "px";
					paletteDiv.style.top = (canvasDiv.offsetTop + canvasDiv.offsetHeight -
																paletteDiv.offsetHeight - this.hoverZoneSize) + "px";
					this.setContentDivHeight(paletteDiv, newHeight);
				}
			}
		}
	}

	// Called when the user double clicks the title bar.
	windowMaximize() {
		const paletteDiv = this.getPaletteDiv();
		const canvasDiv = document.getElementById(this.props.containingDivId);

		if (canvasDiv) {
			if (this.isMaximized) {
				// Restore the previous window size and position
				paletteDiv.style.width = this.savedWidth + "px";
				paletteDiv.style.left = this.savedLeft + "px";
				paletteDiv.style.height = this.savedHeight + "px";
				paletteDiv.style.top = this.savedTop + "px";
				this.setContentDivHeight(paletteDiv, this.savedHeight);

				this.isMaximized = false;

				// After the palette has restored, ensure it is visible in
				// whatever size the canvas happens to be. This can be done by doing
				// the same activity as we perform when the browser window is sized.
				// Make sure to call this after setting the isMaximized flag because
				// windowResize() looks at that flag for its resize behavior.
				this.windowResize();

			} else {
				// Save the existing size and position and maximize the palette.
				this.savedWidth = paletteDiv.offsetWidth;
				this.savedLeft = paletteDiv.offsetLeft;
				this.savedHeight = paletteDiv.offsetHeight;
				this.savedTop = paletteDiv.offsetTop;

				// Handle horizontal palette sizing
				// A padding of 1 is needed to make it look better (I think) because of rounding errors
				const newWidth = canvasDiv.offsetWidth - this.totalHoverZoneSize + 1;
				paletteDiv.style.width = newWidth + "px";
				paletteDiv.style.left = (canvasDiv.offsetLeft + this.hoverZoneSize) + "px";

				// Handle vertical palette sizing
				// A padding of 1 is needed to make it look better (I think) because of rounding errors
				const newHeight = canvasDiv.offsetHeight - this.totalHoverZoneSize + 1;
				paletteDiv.style.height = newHeight + "px";
				paletteDiv.style.top = (canvasDiv.offsetTop + this.hoverZoneSize) + "px";
				this.setContentDivHeight(paletteDiv, newHeight);

				this.isMaximized = true;
			}
		}
	}

	showGrid(state) {
		this.setState({ showGrid: state });
	}

	render() {
		return (
			<nav aria-label={this.props.intl.formatMessage({ id: "palette.dialog.label", defaultMessage: defaultMessages["palette.dialog.label"] })} role="navigation">
				<div className="palette-dialog-div"
					ref="palette"
					onMouseDown={this.mouseDownOnPalette}
				>
					<PaletteDialogTopbar mouseDownMethod={this.mouseDownOnTopBar}
						showGridMethod={this.showGrid}
						windowMaximizeMethod={this.windowMaximize}
						showGrid={this.state.showGrid}
						canvasController={this.props.canvasController}
					/>
					<PaletteDialogContent paletteJSON={this.props.paletteJSON}
						showGrid={this.state.showGrid}
						canvasController={this.props.canvasController}
						isEditingEnabled={this.props.isEditingEnabled}
					/>
				</div>
			</nav>
		);
	}
}

PaletteDialog.propTypes = {
	// From injectIntl
	intl: PropTypes.object.isRequired,

	// Provided by common-canvas
	canvasController: PropTypes.object.isRequired,
	containingDivId: PropTypes.string.isRequired,

	// Provided by redux
	paletteJSON: PropTypes.object,
	isEditingEnabled: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => ({
	paletteJSON: state.palette.content,
	isEditingEnabled: state.canvasconfig.enableEditingActions
});

export default connect(mapStateToProps)(injectIntl(PaletteDialog));
