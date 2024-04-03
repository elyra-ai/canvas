/*
 * Copyright 2023-2024 Elyra Authors
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

import { Button, Checkbox } from "carbon-components-react";

const TAB_KEY = 9;

class AppSettingsPanel extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			focusAction: "subarea",
			chk1: true,
			chk2: false,
			chk3: false
		};

		this.xButtonRef = React.createRef();
		this.okButtonRef = React.createRef();

		this.onChange = this.onChange.bind(this);
		this.onKeyDownCheckbox = this.onKeyDownCheckbox.bind(this);
		this.onKeyDownXIcon = this.onKeyDownXIcon.bind(this);
		this.saveAndClosePanel = this.saveAndClosePanel.bind(this);
	}

	componentDidMount() {
		this.xButtonRef.current.focus();
	}

	onClick(evt) {
		evt.stopPropagation();
	}

	onChange(value, field) {
		const obj = {};
		obj[field] = value;
		this.setState(obj);
	}

	onKeyDownCheckbox(evt) {
		if (evt.keyCode === TAB_KEY && !evt.shiftKey) {
			evt.stopPropagation();
			evt.preventDefault();
			this.xButtonRef.current.focus();
		}
	}

	onKeyDownXIcon(evt) {
		if (evt.keyCode === TAB_KEY && evt.shiftKey) {
			evt.stopPropagation();
			evt.preventDefault();
			this.okButtonRef.current.focus();
		}
	}

	saveAndClosePanel() {
		this.props.subPanelData.saveData(
			"Check one: " + this.state.chk1 + "\n" +
			"Check two: " + this.state.chk2 + "\n" +
			"Check three: " + this.state.chk3);
		this.props.closeSubPanel();
	}

	render() {
		return (
			<div style={{ padding: 10, width: 170 }} onClick={this.onClick} >
				<div style={{ display: "flex", paddingTop: 10, paddingBottom: 15, justifyContent: "space-between" }}>
					Test panel:
					<button
						ref={this.xButtonRef}
						onKeyDown={this.onKeyDownXIcon}
						onClick={this.props.closeSubPanel}
						style={{
							display: "inline-flex", cursor: "pointer", minHeight: 20, width: 25, border: 0, padding: "0 10px", height: "10px" }}
					>X</button>
				</div>
				<Checkbox id={"chk1"} labelText={"Check one"} onChange={this.onChange} checked={this.state.chk1} />
				<Checkbox id={"chk2"} labelText={"Check two"} onChange={this.onChange} checked={this.state.chk2} />
				<Checkbox id={"chk3"} labelText={"Check three"} onChange={this.onChange} checked={this.state.chk3} />
				<Button size="sm" kind="primary" onClick={this.saveAndClosePanel} ref={this.okButtonRef} onKeyDown={this.onKeyDownCheckbox}>OK</Button>
			</div>
		);
	}
}

AppSettingsPanel.propTypes = {
	closeSubPanel: PropTypes.func,
	subPanelData: PropTypes.object
};

export default AppSettingsPanel;
