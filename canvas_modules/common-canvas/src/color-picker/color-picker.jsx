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
import Logger from "../logging/canvas-logger.js";


class ColorPicker extends React.Component {
	constructor(props) {
		super(props);
		this.logger = new Logger("CC-Color-Picker");

		this.onClick = this.onClick.bind(this);
	}

	onClick(evt) {
		const color = evt.target.dataset.color;
		this.props.clickActionHandler(color);
	}

	render() {
		this.logger.log("render");
		return (
			<div className="color-picker" onClick={this.onClick} onFocus={this.onFocus}>
				<div tabIndex={"0"} data-color={"bkg-col-white-0"} className="color-picker-item white-0" />
				<div tabIndex={"0"} data-color={"bkg-col-yellow-20"} className="color-picker-item yellow-20" />
				<div tabIndex={"0"} data-color={"bkg-col-gray-20"} className="color-picker-item gray-20" />
				<div tabIndex={"0"} data-color={"bkg-col-green-20"} className="color-picker-item green-20" />
				<div tabIndex={"0"} data-color={"bkg-col-teal-20"} className="color-picker-item teal-20" />
				<div tabIndex={"0"} data-color={"bkg-col-cyan-20"} className="color-picker-item cyan-20" />

				<div tabIndex={"0"} data-color={"bkg-col-red-50"} className="color-picker-item red-50" />
				<div tabIndex={"0"} data-color={"bkg-col-orange-40"} className="color-picker-item orange-40" />
				<div tabIndex={"0"} data-color={"bkg-col-gray-50"} className="color-picker-item gray-50" />
				<div tabIndex={"0"} data-color={"bkg-col-green-50"} className="color-picker-item green-50" />
				<div tabIndex={"0"} data-color={"bkg-col-teal-50"} className="color-picker-item teal-50" />
				<div tabIndex={"0"} data-color={"bkg-col-cyan-50"} className="color-picker-item cyan-50" />
			</div>);
	}
}

ColorPicker.propTypes = {
	clickActionHandler: PropTypes.func.isRequired
};

export default ColorPicker;
