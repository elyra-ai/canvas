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

const TAB_KEY = 9;
const SPACE_KEY = 32;
const LEFT_ARROW_KEY = 37;
const UP_ARROW_KEY = 38;
const RIGHT_ARROW_KEY = 39;
const DOWN_ARROW_KEY = 40;

// These values must reflect the layout of the color picker panel
// decribed by the SCSS/CSS.
const COLORS_IN_ROW = 6;
const TOTAL_COLORS = 12;

class ColorPicker extends React.Component {
	constructor(props) {
		super(props);
		this.logger = new Logger("CC-Color-Picker");

		this.colorIndex = 0;

		this.refss = [];
		for (let i = 0; i < TOTAL_COLORS; i++) {
			this.refss.push(React.createRef());
		}
		this.onClick = this.onClick.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
	}

	componentDidMount() {
		this.setFocus(this.colorIndex);
	}

	onClick(evt) {
		evt.stopPropagation();
		this.selectColor(evt);
	}

	onKeyDown(evt) {
		if (evt.keyCode === RIGHT_ARROW_KEY) {
			evt.stopPropagation();
			this.colorIndex++;
			if (this.colorIndex > TOTAL_COLORS - 1) {
				this.colorIndex = 0;
			}

		} else if (evt.keyCode === LEFT_ARROW_KEY) {
			evt.stopPropagation();
			this.colorIndex--;
			if (this.colorIndex < 0) {
				this.colorIndex = TOTAL_COLORS - 1;
			}

		} else if (evt.keyCode === UP_ARROW_KEY) {
			evt.stopPropagation();
			this.colorIndex -= COLORS_IN_ROW;
			if (this.colorIndex < 0) {
				this.colorIndex += COLORS_IN_ROW;
			}

		} else if (evt.keyCode === DOWN_ARROW_KEY) {
			evt.stopPropagation();
			this.colorIndex += COLORS_IN_ROW;
			if (this.colorIndex > 11) {
				this.colorIndex -= COLORS_IN_ROW;
			}

		} else if (evt.keyCode === SPACE_KEY) {
			this.selectColor(evt);

		} else if (evt.keyCode === TAB_KEY) {
			evt.stopPropagation();
			evt.preventDefault();
			return;
		}

		this.setFocus(this.colorIndex);
	}

	setFocus(index) {
		this.refss[index].current.focus();
	}

	selectColor(evt) {
		const color = evt.target.dataset.color;
		this.props.subPanelData.clickActionHandler(color);
		this.props.closeSubPanel();
	}

	render() {
		this.logger.log("render");
		return (
			<div className="color-picker" tabIndex={"-1"} onClick={this.onClick} onKeyDown={this.onKeyDown}>
				<div ref={this.refss[0]} tabIndex={"-1"} data-color={"bkg-col-white-0"} className="color-picker-item white-0" />
				<div ref={this.refss[1]} tabIndex={"-1"} data-color={"bkg-col-yellow-20"} className="color-picker-item yellow-20" />
				<div ref={this.refss[2]} tabIndex={"-1"} data-color={"bkg-col-gray-20"} className="color-picker-item gray-20" />
				<div ref={this.refss[3]} tabIndex={"-1"} data-color={"bkg-col-green-20"} className="color-picker-item green-20" />
				<div ref={this.refss[4]} tabIndex={"-1"} data-color={"bkg-col-teal-20"} className="color-picker-item teal-20" />
				<div ref={this.refss[5]} tabIndex={"-1"} data-color={"bkg-col-cyan-20"} className="color-picker-item cyan-20" />

				<div ref={this.refss[6]} tabIndex={"-1"} data-color={"bkg-col-red-50"} className="color-picker-item red-50" />
				<div ref={this.refss[7]} tabIndex={"-1"} data-color={"bkg-col-orange-40"} className="color-picker-item orange-40" />
				<div ref={this.refss[8]} tabIndex={"-1"} data-color={"bkg-col-gray-50"} className="color-picker-item gray-50" />
				<div ref={this.refss[9]} tabIndex={"-1"} data-color={"bkg-col-green-50"} className="color-picker-item green-50" />
				<div ref={this.refss[10]} tabIndex={"-1"} data-color={"bkg-col-teal-50"} className="color-picker-item teal-50" />
				<div ref={this.refss[11]} tabIndex={"-1"} data-color={"bkg-col-cyan-50"} className="color-picker-item cyan-50" />
			</div>);
	}
}

ColorPicker.propTypes = {
	closeSubPanel: PropTypes.func,
	subPanelData: PropTypes.object
};

export default ColorPicker;
