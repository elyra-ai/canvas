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
import PaletteDialogTopbarThreeWayIcon from "./palette-dialog-topbar-three-way-icon.jsx";
import Close32Icon from "../../assets/images/palette/close_32.svg";
import PaletteGridSelectedIcon from "../../assets/images/palette/palette_grid_selected.svg";
import PaletteGridHoverIcon from "../../assets/images/palette/palette_grid_hover.svg";
import PaletteGridDeSelectedIcon from "../../assets/images/palette/palette_grid_deselected.svg";
import PaletteListSelectedIcon from "../../assets/images/palette/palette_list_selected.svg";
import PaletteListHoverIcon from "../../assets/images/palette/palette_list_hover.svg";
import PaletteListDeSelectedIcon from "../../assets/images/palette/palette_list_deselected.svg";

class PaletteDialogTopbar extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};

		this.mouseDown = this.mouseDown.bind(this);
		this.doubleClick = this.doubleClick.bind(this);
		this.close = this.close.bind(this);
		this.gridViewSelected = this.gridViewSelected.bind(this);
		this.listViewSelected = this.listViewSelected.bind(this);
	}

	mouseDown(mouseDownEvent) {
		this.props.mouseDownMethod(mouseDownEvent);
	}

	doubleClick(doubleClickEvent) {
		this.props.windowMaximizeMethod(doubleClickEvent);
	}

	close(closeEvent) {
		this.props.canvasController.closePalette(closeEvent);
	}

	gridViewSelected() {
		this.props.showGridMethod(true);
	}

	listViewSelected() {
		this.props.showGridMethod(false);
	}

	render() {
		return (
			<div className="palette-dialog-topbar" onMouseDown={this.mouseDown} onDoubleClick={this.doubleClick}>
				<span className="left-navbar">
					<PaletteDialogTopbarThreeWayIcon iconClickedMethod={this.gridViewSelected}
						isSelected={this.props.showGrid}
						selectedIconName={PaletteGridSelectedIcon}
						hoverIconName={PaletteGridHoverIcon}
						deselectedIconName={PaletteGridDeSelectedIcon}
					/>
					<PaletteDialogTopbarThreeWayIcon iconClickedMethod={this.listViewSelected}
						isSelected={!this.props.showGrid}
						selectedIconName={PaletteListSelectedIcon}
						hoverIconName={PaletteListHoverIcon}
						deselectedIconName={PaletteListDeSelectedIcon}
					/>
				</span>
				<span className="right-navbar">
					<a className="secondary-action" onClick={this.close}>
						<img src={Close32Icon} draggable="false" className="close-icon" />
					</a>
				</span>
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
