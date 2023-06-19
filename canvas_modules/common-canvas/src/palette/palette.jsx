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
import PropTypes from "prop-types";
import { connect } from "react-redux";

import PaletteDialog from "../palette/palette-dialog.jsx";
import PaletteFlyout from "../palette/palette-flyout.jsx";
import Logger from "../logging/canvas-logger.js";

import { PALETTE_LAYOUT_FLYOUT, PALETTE_LAYOUT_MODAL }
	from "../common-canvas/constants/canvas-constants";

class Palette extends React.Component {
	constructor(props) {
		super(props);
		this.logger = new Logger("Palette");
	}

	render() {
		this.logger.log("render");

		let palette = null;

		if (this.props.enablePaletteLayout === PALETTE_LAYOUT_FLYOUT) {
			palette = (<PaletteFlyout
				enableNarrowPalette={this.props.enableNarrowPalette}
				paletteJSON={this.props.paletteJSON}
				showPalette={this.props.showPalette}
				canvasController={this.props.canvasController}
				isEditingEnabled={this.props.isEditingEnabled}
			/>);
		} else if (this.props.enablePaletteLayout === PALETTE_LAYOUT_MODAL) {
			palette = (<PaletteDialog
				paletteJSON={this.props.paletteJSON}
				showPalette={this.props.showPalette}
				parentDivId={this.props.containingDivId}
				canvasController={this.props.canvasController}
				isEditingEnabled={this.props.isEditingEnabled}
			/>);
		}

		return palette;
	}
}

Palette.propTypes = {
	// Provided by common-canvas
	canvasController: PropTypes.object.isRequired,
	containingDivId: PropTypes.string.isRequired,

	// Provided by redux
	enablePaletteLayout: PropTypes.string,
	enableNarrowPalette: PropTypes.bool,
	paletteJSON: PropTypes.object,
	showPalette: PropTypes.bool,
	isEditingEnabled: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => ({
	enablePaletteLayout: state.canvasconfig.enablePaletteLayout,
	enableNarrowPalette: state.canvasconfig.enableNarrowPalette,
	isEditingEnabled: state.canvasconfig.enableEditingActions,
	paletteJSON: state.palette.content,
	// TODO - No need to do this when paletteInitialState is removed
	showPalette: typeof state.palette.isOpen === "undefined" ? false : state.palette.isOpen
});

export default connect(mapStateToProps)(Palette);
