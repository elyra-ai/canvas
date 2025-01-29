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
import PaletteDialogUnder from "../palette/palette-dialog-under.jsx";
import Logger from "../logging/canvas-logger.js";

class PaletteDialog extends React.Component {
	constructor(props) {
		super(props);

		this.logger = new Logger("PaletteDialog");
	}

	render() {
		this.logger.log("render");

		return (
			<PaletteDialogUnder
				canvasController={this.props.canvasController}
				paletteJSON={this.props.paletteJSON}
				containingDivId={this.props.containingDivId}
				allowClickToAdd={this.props.allowClickToAdd}
				isEditingEnabled={this.props.isEditingEnabled}
			/>);
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
	allowClickToAdd: PropTypes.bool,
	isEditingEnabled: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => ({
	paletteJSON: state.palette.content,
	allowClickToAdd: state.canvasconfig.enableSingleClickAddFromPalette,
	isEditingEnabled: state.canvasconfig.enableEditingActions
});

export default connect(mapStateToProps)(injectIntl(PaletteDialog));
