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

class PaletteDialogTopbarThreeWayIcon extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			hover: false
		};

		this.iconClicked = this.iconClicked.bind(this);
		this.mouseEnter = this.mouseEnter.bind(this);
		this.mouseLeave = this.mouseLeave.bind(this);
		this.mouseDown = this.mouseDown.bind(this);
	}

	iconClicked() {
		this.props.iconClickedMethod();
	}

	mouseEnter() {
		this.setState({ hover: true });
	}

	mouseLeave() {
		this.setState({ hover: false });
	}

	mouseDown(mouseDownEvent) {
		mouseDownEvent.stopPropagation();
	}

	render() {
		let icon = this.props.selectedIconName;

		if (!this.props.isSelected) {
			if (this.state.hover) {
				icon = this.props.hoverIconName;
			} else {
				icon = this.props.deselectedIconName;
			}
		}

		return (
			<div draggable= "false" className="palette-three-way-icon-div">
				<img src={icon} draggable="false"
					onClick={this.iconClicked}
					onMouseEnter={this.mouseEnter}
					onMouseLeave={this.mouseLeave}
					onMouseDown={this.mouseDown}
				/>
			</div>
		);
	}
}

PaletteDialogTopbarThreeWayIcon.propTypes = {
	iconClickedMethod: PropTypes.func.isRequired,
	isSelected: PropTypes.bool.isRequired,
	selectedIconName: PropTypes.string.isRequired,
	hoverIconName: PropTypes.string.isRequired,
	deselectedIconName: PropTypes.string.isRequired
};

export default PaletteDialogTopbarThreeWayIcon;
