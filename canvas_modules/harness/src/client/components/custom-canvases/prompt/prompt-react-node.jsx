/*
 * Copyright 2025 Elyra Authors
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
import { IntlProvider } from "react-intl";
import { Button } from "@carbon/react";
import { Close } from "@carbon/react/icons";
import PromptSubPalette from "./prompt-sub-palette.jsx";

const TAB_KEY = "Tab";
const ENTER_KEY = "Enter";
const SPACE_KEY = " ";
const ESCAPE_KEY = "Escape";

export default class PromptReactNode extends React.Component {
	constructor(props) {
		super(props);

		// Register our focus function for the node, so the caller can send focus to us.
		if (this.props.nodeData) {
			this.props.canvasController.setSubObjectFocusFunction(this.props.nodeData.id, this.focus.bind(this));
		}

		this.divRef = React.createRef();
		this.buttonRef = React.createRef();
		this.subPaletteRef = React.createRef();

		this.onBlurDiv = this.onBlurDiv.bind(this);
		this.onFocusDiv = this.onFocusDiv.bind(this);
		this.onKeyDownDiv = this.onKeyDownDiv.bind(this);
		this.onKeyDownCloseButton = this.onKeyDownCloseButton.bind(this);
		this.createAutoNode = this.createAutoNode.bind(this);
		this.closePromptPanel = this.closePromptPanel.bind(this);
		this.tabOutOfOfPalette = this.tabOutOfOfPalette.bind(this);
	}

	componentDidMount() {
		this.makeUntabbable();
	}

	onKeyDownCloseButton(evt) {
		if (!evt.shiftKey && evt.key === TAB_KEY) {
			evt.stopPropagation();
			evt.preventDefault();

			if (this.subPaletteRef?.current) {
				this.subPaletteRef?.current.focus();
			}

		} else if (evt.shiftKey && evt.key === TAB_KEY) {
			evt.stopPropagation();
			evt.preventDefault();
			this.props.canvasController.setFocusPreviousSubObject(this.props.nodeData, evt);

		} else if (evt.key === SPACE_KEY || evt.key === ENTER_KEY) {
			this.closePromptPanel();
		}
	}

	onKeyDownDiv(evt) {
		if (evt.key === ESCAPE_KEY) {
			this.makeUntabbable();
		}
	}

	onBlurDiv(evt) {
		// If focus is leaving this prompt react object.
		if (!this.divRef.current.contains(evt.relatedTarget)) {
			this.makeUntabbable();
		}
	}

	onFocusDiv(evt) {
		this.makeTabbable();
	}

	// Returns the palette object to be used. This is constructed from the
	// palette in the application's canvas controller with the first
	// category reoved since the first category has binding entry nodes.
	getPalette() {
		const palette = this.props.canvasController.getPaletteData();

		// Remove the inputs category from the palette data.
		palette.categories.shift();

		return palette;
	}

	createAutoNode(nodeTemplate) {
		this.props.nodeData.app_data.prompt_data
			.addNodeHandler(nodeTemplate, this.props.nodeData.id);
	}

	closePromptPanel() {
		this.props.nodeData.app_data.prompt_data
			.closePromptNode(this.props.nodeData.id);
	}

	// This is called from Common Canvas to move focus into this object.
	focus(evt) {
		this.makeTabbable();
		if (evt.shiftKey && evt.key === TAB_KEY) {
			// To do - make focus go to first tab in palette instead of to the button
			this.buttonRef.current.focus();
		} else {
			this.buttonRef.current.focus();
		}
	}

	tabOutOfOfPalette(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		this.props.canvasController.setFocusNextSubObject(this.props.nodeData, evt);
	}

	// Sets a tabindex of -1 to objects that, by default, are given a tabindex of 0
	// by the browser. This prevents tab key presses moving the focus to these objects.
	makeUntabbable() {
		this.changeTabIndex(-1);
	}

	// Sets a tabindex of 0 on objects that may have had their tabindex set to -1 by
	// the makeUntabbable() function. This sets the tabindex explicitely on these
	// objects to be the same as the tabindex that would normally be set by the browser.
	makeTabbable() {
		this.changeTabIndex(0);
	}

	// Changes the tab index of those components that, by default, have a tabindex of 0
	// to the index value passed in.
	changeTabIndex(index) {
		const tabbableElements = document.querySelectorAll("foreignObject button, foreignObject input");

		for (const value of tabbableElements.values()) {
			value.setAttribute("tabindex", index);
		}
	}

	render() {
		const palette = this.getPalette();
		const intl = this.props.canvasController.getIntl();

		return (
			<div ref={this.divRef} className={"prompt-react"} onKeyDown={this.onKeyDownDiv} onFocus={this.onFocusDiv} onBlur={this.onBlurDiv}>
				<div className={"prompt-react-header"}>
					<span className={"prompt-react-header-title"}>Node Suggestion</span>
					<div className={"prompt-react-close-button"}>
						<Button
							ref={this.buttonRef}
							size="sm"
							kind="ghost"
							renderIcon={Close}
							hasIconOnly
							iconDescription={"Close prompt"}
							onClick={this.closePromptPanel}
							onKeyDown={this.onKeyDownCloseButton}
							tooltipAlignment="end"
							tooltipPosition="bottom"
						/>
					</div>
				</div>

				<IntlProvider locale={intl.locale} defaultLocale="en" messages={intl.messages}>
					<PromptSubPalette
						ref={this.subPaletteRef}
						palette={palette}
						createAutoNode={this.createAutoNode}
						tabOutOfOfPalette={this.tabOutOfOfPalette}
					/>
				</IntlProvider>
			</div>
		);
	}
}

PromptReactNode.propTypes = {
	canvasController: PropTypes.object.isRequired,
	nodeData: PropTypes.object,
	externalUtils: PropTypes.object
};
