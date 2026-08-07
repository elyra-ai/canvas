/*
 * Copyright 2024 Elyra Authors
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

import { adjustSubAreaPosition, applySubAreaInitialStyle } from "./toolbar-sub-utils.js";
import KeyboardUtils from "../common-canvas/keyboard-utils.js";

class ToolbarSubPanel extends React.Component {
	constructor(props) {
		super(props);

		this.onKeyDown = this.onKeyDown.bind(this);
		this.onPageScroll = this.onPageScroll.bind(this);
		this.closeSubPanel = this.closeSubPanel.bind(this);
	}

	componentDidMount() {
		if (this.props.isCascadeMenu) {
			applySubAreaInitialStyle(this.areaRef, this.props.expandDirection, this.props.actionItemRect);
		}
		adjustSubAreaPosition(this.areaRef,
			this.props.containingDivId, this.props.expandDirection, this.props.actionItemRect);

		// A cascade sub-panel is position:fixed (so it can escape a scrollable
		// parent menu's overflow). Because fixed positioning is relative to the
		// viewport, we close the sub-panel if the page scrolls, otherwise it would
		// stay pinned to the viewport while the toolbar scrolls away.
		if (this.props.isCascadeMenu) {
			window.addEventListener("scroll", this.onPageScroll, true);
		}
	}

	componentDidUpdate() {
		if (this.props.isCascadeMenu) {
			applySubAreaInitialStyle(this.areaRef, this.props.expandDirection, this.props.actionItemRect);
		}
		adjustSubAreaPosition(this.areaRef,
			this.props.containingDivId, this.props.expandDirection, this.props.actionItemRect);
	}

	componentWillUnmount() {
		window.removeEventListener("scroll", this.onPageScroll, true);
	}

	// Closes this (cascade) sub-panel when the page scrolls. Scrolling within the
	// sub-panel itself is ignored.
	onPageScroll(evt) {
		if (this.areaRef && !this.areaRef.contains(evt.target)) {
			this.props.closeSubArea();
		}
	}

	onKeyDown(evt) {
		if (KeyboardUtils.closeSubArea(evt)) {
			this.props.closeSubArea();
			evt.stopPropagation();

		} else if (KeyboardUtils.openSubAreaFromMenu(evt) ||
					KeyboardUtils.closeSubAreaToMenu(evt)) {
			evt.stopPropagation();
		}
	}

	// If the user clicks the panel background, by default focus would go
	// through to the toolbar and focus would be lost from this sub-panel.
	// This method prevents any focus event going through to the toolbar.
	onFocus(evt) {
		evt.stopPropagation();
		evt.preventDefault();
	}

	closeSubPanel(evt) {
		this.props.closeSubArea(); // Don't pass a parameter otherwise it will check closeSubAreaOnClick.
	}

	render() {
		const cascadeClass = this.props.isCascadeMenu ? " subarea-cascade" : "";

		if (this.props.subPanel) {
			return (
				<div ref={(ref) => (this.areaRef = ref)} className={"toolbar-popover-list subpanel" + cascadeClass} tabIndex={-1}
					onKeyDown={this.onKeyDown} onFocus={this.onFocus}
				>
					<this.props.subPanel closeSubPanel={this.closeSubPanel} subPanelData={this.props.subPanelData} />
				</div>
			);
		}

		return null;
	}
}

ToolbarSubPanel.propTypes = {
	subPanel: PropTypes.any.isRequired,
	subPanelData: PropTypes.object,
	closeSubArea: PropTypes.func,
	setToolbarFocusAction: PropTypes.func,
	actionItemRect: PropTypes.object,
	isCascadeMenu: PropTypes.bool,
	expandDirection: PropTypes.string.isRequired,
	containingDivId: PropTypes.string
};

export default ToolbarSubPanel;
