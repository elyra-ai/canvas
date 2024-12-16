/*
 * Copyright 2017-2025 Elyra Authors
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
import ContextMenuWrapper from "../context-menu/context-menu-wrapper.jsx";
import Logger from "../logging/canvas-logger.js";

class CommonCanvasContextMenu extends React.Component {
	constructor(props) {
		super(props);
		this.logger = new Logger("CC-Context-Menu");
	}

	render() {
		this.logger.log("render");

		let contextMenu = null;
		if (this.props.showContextMenu) {
			contextMenu = (
				<ContextMenuWrapper
					containingDivId={this.props.containingDivId}
					contextMenuDef={this.props.contextMenuDef}
					contextMenuActionHandler={this.props.canvasController.contextMenuActionHandler}
					contextMenuPos={this.props.contextMenuPos}
					closeContextMenu={this.props.canvasController.closeContextMenu}
					stopPropagation
				/>
			);
		}
		return contextMenu;
	}
}

CommonCanvasContextMenu.propTypes = {
	// Provided by CommonCanvas
	canvasController: PropTypes.object.isRequired,
	containingDivId: PropTypes.string.isRequired,

	// Provided by redux
	contextMenuDef: PropTypes.array.isRequired,
	contextMenuPos: PropTypes.object.isRequired,
	showContextMenu: PropTypes.bool.isRequired
};

const mapStateToProps = (state, ownProps) => ({
	contextMenuDef: state.contextmenu.menuDef,
	contextMenuPos: state.contextmenu.source.cmPos || { x: 0, y: 0 },
	showContextMenu: state.contextmenu.isOpen
});

export default connect(mapStateToProps)(CommonCanvasContextMenu);
