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
import PropTypes from "prop-types";
import { connect } from "react-redux";

import PaletteFlyout from "../palette/palette-flyout.jsx";
import Logger from "../logging/canvas-logger.js";

import { PALETTE_LAYOUT_FLYOUT, PALETTE_LAYOUT_NONE }
	from "../common-canvas/constants/canvas-constants";

class Palette extends React.Component {
	constructor(props) {
		super(props);
		this.logger = new Logger("Palette");

		this.createAutoNode = this.createAutoNode.bind(this);
	}

	// Process the createAutoNode action performed on a palette node. This
	// might be called if:
	// * the node is double-clicked
	// * the node is single-clicked with the allowClickToAdd property set to true
	// * the user performs a keyboard shortcut to activate the node
	// If the caller provided us with a createAutoNode function we call it but
	// otherwise we call the canvasController's createAutoNode function.
	createAutoNode(nodeType, addLink) {
		const nodeTemplate = this.props.canvasController.convertNodeTemplate(nodeType);

		if (this.props.createAutoNode) {
			this.props.createAutoNode(nodeTemplate, addLink);

		} else if (this.props.canvasController.createAutoNode) {
			this.props.canvasController.createAutoNode(nodeTemplate, addLink);
		}
	}

	render() {
		this.logger.log("render");

		return (
			<PaletteFlyout
				canvasController={this.props.canvasController}
				paletteJSON={this.props.paletteJSON}
				paletteHeader={this.props.paletteHeader}
				allowClickToAdd={this.props.allowClickToAdd}
				isEditingEnabled={this.props.isEditingEnabled}
				isPaletteWide={this.props.isPaletteWide}
				createAutoNode={this.createAutoNode}
			/>
		);
	}
}

Palette.propTypes = {
	// Provided by common-canvas
	canvasController: PropTypes.object.isRequired,
	createAutoNode: PropTypes.func, // Optional callback

	// Provided by redux
	paletteJSON: PropTypes.object,
	paletteHeader: PropTypes.object,
	allowClickToAdd: PropTypes.bool,
	isEditingEnabled: PropTypes.bool,
	isPaletteWide: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => ({
	paletteJSON: state.palette.content,
	isEditingEnabled: state.canvasconfig.enableEditingActions,
	paletteHeader: state.canvasconfig.enablePaletteHeader,
	allowClickToAdd: state.canvasconfig.enableSingleClickAddFromPalette,
	isPaletteWide: state.canvasconfig.enablePaletteLayout === PALETTE_LAYOUT_NONE ||
		(state.canvasconfig.enablePaletteLayout === PALETTE_LAYOUT_FLYOUT &&
			state.palette.isOpen)
});

export default connect(mapStateToProps)(Palette);
