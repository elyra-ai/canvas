/*
 * Copyright 2023 Elyra Authors
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

const SPACE_KEY = 32;
const LEFT_ARROW_KEY = 37;
const RIGHT_ARROW_KEY = 39;


class AppTestColorPicker extends React.Component {
	constructor(props) {
		super(props);

		this.refss = [];
		for (let i = 0; i < 9; i++) {
			this.refss.push(React.createRef());
		}
		this.onClick = this.onClick.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
	}

	componentDidMount() {
		this.refss[0].current.focus();
		this.colorIndex = 0;
	}

	onClick(evt) {
		evt.stopPropagation();
		this.selectColor(evt);
	}

	onKeyDown(evt) {
		if (evt.keyCode === RIGHT_ARROW_KEY) {
			evt.stopPropagation();
			this.colorIndex++;
			if (this.colorIndex > 8) {
				this.colorIndex = 0;
			}

		} else if (evt.keyCode === LEFT_ARROW_KEY) {
			evt.stopPropagation();
			this.colorIndex--;
			if (this.colorIndex < 0) {
				this.colorIndex = 8;
			}
		} else if (evt.keyCode === SPACE_KEY) {
			this.selectColor(evt);
		}
		this.refss[this.colorIndex].current.focus();
	}

	selectColor(evt) {
		const color = evt.target.getAttribute("data-color");
		this.props.subPanelData.colorSelected(color);
		this.props.closeSubPanel();
	}

	render() {
		return (
			<div className="harness-color-picker"
				tabIndex={"0"}
				onClick={this.onClick}
				onKeyDown={this.onKeyDown}
			>
				<div ref={this.refss[0]} tabIndex={"-1"} data-color={"col-yellow-20"} className="harness-color-picker-item yellow-20" />
				<div ref={this.refss[1]} tabIndex={"-1"} data-color={"col-green-20"} className="harness-color-picker-item green-20" />
				<div ref={this.refss[2]} tabIndex={"-1"} data-color={"col-teal-20"} className="harness-color-picker-item teal-20" />
				<div ref={this.refss[3]} tabIndex={"-1"} data-color={"col-cyan-20"} className="harness-color-picker-item cyan-20" />
				<div ref={this.refss[4]} tabIndex={"-1"} data-color={"col-red-50"} className="harness-color-picker-item red-50" />
				<div ref={this.refss[5]} tabIndex={"-1"} data-color={"col-orange-40"} className="harness-color-picker-item orange-40" />
				<div ref={this.refss[6]} tabIndex={"-1"} data-color={"col-green-50"} className="harness-color-picker-item green-50" />
				<div ref={this.refss[7]} tabIndex={"-1"} data-color={"col-teal-50"} className="harness-color-picker-item teal-50" />
				<div ref={this.refss[8]} tabIndex={"-1"} data-color={"col-cyan-50"} className="harness-color-picker-item cyan-50" />
			</div>
		);
	}
}

AppTestColorPicker.propTypes = {
	closeSubPanel: PropTypes.func,
	subPanelData: PropTypes.object
};

export default AppTestColorPicker;
