/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import Isvg from "react-inlinesvg";
import ThreeWayIcon from "./three-way-icon.jsx";
import Close32Icon from "../../assets/images/close_32.svg";
import PaletteGridSelectedIcon from "../../assets/images/palette_grid_selected.svg";
import PaletteGridHoverIcon from "../../assets/images/palette_grid_hover.svg";
import PaletteGridDeSelectedIcon from "../../assets/images/palette_grid_deselected.svg";
import PaletteListSelectedIcon from "../../assets/images/palette_list_selected.svg";
import PaletteListHoverIcon from "../../assets/images/palette_list_hover.svg";
import PaletteListDeSelectedIcon from "../../assets/images/palette_list_deselected.svg";

class PaletteTopbar extends React.Component {
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
		this.props.closeMethod(closeEvent);
	}

	gridViewSelected() {
		this.props.showGridMethod(true);
	}

	listViewSelected() {
		this.props.showGridMethod(false);
	}

	render() {
		return (
			<div className="palette-topbar" onMouseDown={this.mouseDown} onDoubleClick={this.doubleClick}>
				<span className="left-navbar">
					<ThreeWayIcon iconClickedMethod={this.gridViewSelected}
						isSelected={this.props.showGrid}
						selectedIconName={PaletteGridSelectedIcon}
						hoverIconName={PaletteGridHoverIcon}
						deselectedIconName={PaletteGridDeSelectedIcon}
					/>
					<ThreeWayIcon iconClickedMethod={this.listViewSelected}
						isSelected={!this.props.showGrid}
						selectedIconName={PaletteListSelectedIcon}
						hoverIconName={PaletteListHoverIcon}
						deselectedIconName={PaletteListDeSelectedIcon}
					/>
				</span>
				<span className="right-navbar">
					<a className="secondary-action" onClick={this.close}>
						<Isvg src={Close32Icon} className="close-icon" />
					</a>
				</span>
			</div>
		);
	}
}

PaletteTopbar.propTypes = {
	showGridMethod: React.PropTypes.func.isRequired,
	windowMaximizeMethod: React.PropTypes.func.isRequired,
	showGrid: React.PropTypes.bool.isRequired,
	mouseDownMethod: React.PropTypes.func.isRequired,
	closeMethod: React.PropTypes.func.isRequired
};

export default PaletteTopbar;
