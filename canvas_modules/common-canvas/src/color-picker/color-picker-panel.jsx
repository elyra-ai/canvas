/*
 * Copyright 2022 Elyra Authors
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
import Logger from "../logging/canvas-logger.js";


class ColorPickerPanel extends React.Component {
	constructor(props) {
		super(props);
		this.logger = new Logger("CC-ContextMenu");

		this.onClick = this.onClick.bind(this);
	}

	onClick(evt) {
		const color = evt.target.dataset.color;
		this.props.clickActionHandler(color);
	}

	render() {
		this.logger.log("render");
		return (
			<div className="color-picker-panel" onClick={this.onClick}>
				<div tabIndex="0" data-color={"white0"} className="color-picker-item white-0" />
				<div tabIndex="0" data-color={"yellow20"} className="color-picker-item yellow-20" />
				<div tabIndex="0" data-color={"gray20"} className="color-picker-item gray-20" />
				<div tabIndex="0" data-color={"green20"} className="color-picker-item green-20" />
				<div tabIndex="0" data-color={"teal20"} className="color-picker-item teal-20" />
				<div tabIndex="0" data-color={"cyan20"} className="color-picker-item cyan-20" />

				<div tabIndex="0" data-color={"red50"} className="color-picker-item red-50" />
				<div tabIndex="0" data-color={"orange40"} className="color-picker-item orange-40" />
				<div tabIndex="0" data-color={"gray50"} className="color-picker-item gray-50" />
				<div tabIndex="0" data-color={"green50"} className="color-picker-item green-50" />
				<div tabIndex="0" data-color={"teal50"} className="color-picker-item teal-50" />
				<div tabIndex="0" data-color={"cyan50"} className="color-picker-item cyan-50" />
			</div>);
	}
}

ColorPickerPanel.propTypes = {
	clickActionHandler: PropTypes.func.isRequired,
	closeMenu: PropTypes.func
};

export default ColorPickerPanel;
