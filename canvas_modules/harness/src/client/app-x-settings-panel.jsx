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
import { Checkbox } from "carbon-components-react";

const TAB_KEY = 9;
const LEFT_ARROW_KEY = 37;
const RIGHT_ARROW_KEY = 39;


class AppSettingsPanel extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			focusAction: "subarea",
			chk1: true,
			chk2: false,
			chk3: false
		};

		this.buttonRef = React.createRef();
		this.checkRef = React.createRef();

		this.onChange = this.onChange.bind(this);
		this.onKeyDownPanel = this.onKeyDownPanel.bind(this);
		this.onKeyDownCheckbox = this.onKeyDownCheckbox.bind(this);
		this.onKeyDownXIcon = this.onKeyDownXIcon.bind(this);
		this.closePanel = this.closePanel.bind(this);
	}

	componentDidMount() {
		this.buttonRef.current.focus();
	}

	onClick(evt) {
		evt.stopPropagation();
	}

	onChange(value, field) {
		const obj = {};
		obj[field] = value;
		this.setState(obj);
	}

	onKeyDownPanel(evt) {
		if (evt.keyCode === LEFT_ARROW_KEY || evt.keyCode === RIGHT_ARROW_KEY) {
			evt.stopPropagation();
		}
	}

	onKeyDownCheckbox(evt) {
		if (evt.keyCode === TAB_KEY && !evt.shiftKey) {
			evt.stopPropagation();
			evt.preventDefault();
			this.buttonRef.current.focus();
		}
	}

	onKeyDownXIcon(evt) {
		if (evt.keyCode === TAB_KEY && evt.shiftKey) {
			evt.stopPropagation();
			evt.preventDefault();
			this.checkRef.current.focus();
		}
	}

	closePanel() {
		this.props.subPanelData.saveData(
			"Check one: " + this.state.chk1 + "\n" +
			"Check two: " + this.state.chk2 + "\n" +
			"Check three: " + this.state.chk3);
		this.props.closeSubPanel();
	}

	render() {
		return (
			<div style={{ padding: 10, width: 170 }} onClick={this.onClick} onKeyDown={this.onKeyDownPanel} >
				<div style={{ display: "flex", paddingTop: 10, paddingBottom: 15, justifyContent: "space-between" }}>
					Test panel:
					<button
						ref={this.buttonRef}
						onKeyDown={this.onKeyDownXIcon}
						onClick={this.closePanel}
						style={{
							display: "inline-flex", cursor: "pointer", minHeight: 20, width: 25, border: 0, padding: "0 10px" }}
					>X</button>
				</div>
				<Checkbox id={"chk1"} labelText={"Check one"} onChange={this.onChange} checked={this.state.chk1} />
				<Checkbox id={"chk2"} labelText={"Check two"} onChange={this.onChange} checked={this.state.chk2} />
				<Checkbox id={"chk3"} labelText={"Check three"} onChange={this.onChange} checked={this.state.chk3}
					ref={this.checkRef} onKeyDown={this.onKeyDownCheckbox}
				/>
			</div>
		);
	}
}

AppSettingsPanel.propTypes = {
	closeSubPanel: PropTypes.func,
	subPanelData: PropTypes.object
};

export default AppSettingsPanel;
