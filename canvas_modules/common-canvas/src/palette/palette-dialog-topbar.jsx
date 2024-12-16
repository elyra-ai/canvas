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

import { CloseOutline, Grid, List } from "@carbon/react/icons";

import Toolbar from "../toolbar";

class PaletteDialogTopbar extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};

		this.mouseDown = this.mouseDown.bind(this);
		this.doubleClick = this.doubleClick.bind(this);
		this.toolbarActionHandler = this.toolbarActionHandler.bind(this);
	}

	mouseDown(mouseDownEvent) {
		this.props.mouseDownMethod(mouseDownEvent);
	}

	doubleClick(doubleClickEvent) {
		this.props.windowMaximizeMethod(doubleClickEvent);
	}

	toolbarActionHandler(action) {
		if (action === "close") {
			this.props.canvasController.closePalette();

		} else if (action === "grid") {
			this.props.showGridMethod(true);

		} else if (action === "list") {
			this.props.showGridMethod(false);
		}
	}

	render() {
		const config = {
			leftBar: [
				{ action: "grid", iconEnabled: (<Grid />), enable: true, isSelected: this.props.showGrid },
				{ action: "list", iconEnabled: (<List />), enable: true, isSelected: !this.props.showGrid },
				{ divider: true }
			],
			rightBar: [
				{ divider: true },
				{ action: "close", iconEnabled: (<CloseOutline />), enable: true }
			]
		};


		return (
			<div className="palette-dialog-topbar" onMouseDown={this.mouseDown} onDoubleClick={this.doubleClick}>
				<Toolbar instanceId = {0} config={config} toolbarActionHandler={this.toolbarActionHandler} />
			</div>
		);
	}
}

PaletteDialogTopbar.propTypes = {
	showGridMethod: PropTypes.func.isRequired,
	windowMaximizeMethod: PropTypes.func.isRequired,
	showGrid: PropTypes.bool.isRequired,
	mouseDownMethod: PropTypes.func.isRequired,
	canvasController: PropTypes.object.isRequired
};

export default PaletteDialogTopbar;
