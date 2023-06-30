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
		return (<div />);
	}
}

ColorPicker.propTypes = {
	clickActionHandler: PropTypes.func.isRequired
};

export default ColorPicker;
