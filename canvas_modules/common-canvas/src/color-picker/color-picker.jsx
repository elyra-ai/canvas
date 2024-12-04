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
import PropTypes from "prop-types";
import KeyboardUtils from "../common-canvas/keyboard-utils.js";
import Logger from "../logging/canvas-logger.js";
import colorSetArray from "./color-set.js";
import { WYSIWYG } from "../common-canvas/constants/canvas-constants.js";

// These dimensions should match the values in color-picker.scss
const COLOR_DIMENSION = 20;
const COLOR_PADDING = 5;
const COLOR_DIM_PLUS_PAD = COLOR_DIMENSION + COLOR_PADDING;


// These values must reflect the layout of the color picker panel
// decribed by the SCSS/CSS.

class ColorPicker extends React.Component {
	constructor(props) {
		super(props);
		this.logger = new Logger("CC-Color-Picker");

		this.colorIndex = 0;

		this.colorsPerRow = props.subPanelData.type === WYSIWYG ? 8 : 6;
		this.totalColors = props.subPanelData.type === WYSIWYG ? colorSetArray.length : 12;

		this.refss = [];
		for (let i = 0; i < this.totalColors; i++) {
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
		if (KeyboardUtils.nextColor(evt)) {
			evt.stopPropagation();
			this.colorIndex++;
			if (this.colorIndex > this.totalColors - 1) {
				this.colorIndex = 0;
			}
			this.setFocus(this.colorIndex);

		} else if (KeyboardUtils.previousColor(evt)) {
			evt.stopPropagation();
			this.colorIndex--;
			if (this.colorIndex < 0) {
				this.props.closeSubPanel();
				return;
			}
			this.setFocus(this.colorIndex);

		} else if (KeyboardUtils.aboveColor(evt)) {
			evt.stopPropagation();
			this.colorIndex -= this.colorsPerRow;
			if (this.colorIndex < 0) {
				this.colorIndex += this.colorsPerRow;
			}
			this.setFocus(this.colorIndex);

		} else if (KeyboardUtils.belowColor(evt)) {
			evt.stopPropagation();
			this.colorIndex += this.colorsPerRow;
			if (this.colorIndex > this.totalColors - 1) {
				this.colorIndex -= this.colorsPerRow;
			}
			this.setFocus(this.colorIndex);

		} else if (KeyboardUtils.selectColor(evt)) {
			evt.stopPropagation();
			evt.preventDefault();
			this.selectColor(evt);

		} else if (KeyboardUtils.tabKey(evt)) {
			evt.stopPropagation();
			evt.preventDefault();
			return;
		}
	}

	setFocus(index) {
		this.refss[index].current.focus();
	}

	selectColor(evt) {
		const color = evt.target.dataset.color;
		this.props.subPanelData.clickActionHandler(color, evt);
		this.props.closeSubPanel();
	}


	render() {
		this.logger.log("render");
		if (this.props.subPanelData.type === WYSIWYG) {

			const colorDivs = colorSetArray.map((c, i) => {
				let className = "color-picker-item" + (c === "transparent" ? " color-transparent" : "");
				className += this.props.subPanelData.selectedColor === c ? " selected" : "";

				return (<div key={"key" + i} ref={this.refss[i]} tabIndex={"-1"}
					data-color={c}
					style={{ backgroundColor: c }}
					className={className}
				/>);
			});

			const rowCount = Math.ceil(this.totalColors / this.colorsPerRow);

			const style = {
				width: (this.colorsPerRow * COLOR_DIM_PLUS_PAD) + COLOR_PADDING,
				height: (rowCount * COLOR_DIM_PLUS_PAD) + COLOR_PADDING,
				paddingBottom: "4px"
			};

			return (
				<div className="color-picker" style={style} tabIndex={"-1"} onClick={this.onClick} onKeyDown={this.onKeyDown}>
					{colorDivs}
				</div>
			);
		}

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
			</div>
		);
	}
}

ColorPicker.propTypes = {
	closeSubPanel: PropTypes.func,
	subPanelData: PropTypes.object
};

export default ColorPicker;
