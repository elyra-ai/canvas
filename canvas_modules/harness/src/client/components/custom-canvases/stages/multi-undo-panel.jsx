/*
 * Copyright 2024 Elyra Authors
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
import { Checkbox, Button } from "@carbon/react";

const TAB_KEY = 9;

class MultiUndoPanel extends React.Component {
	constructor(props) {
		super(props);

		this.allUndoCommands = this.props.subPanelData.canvasController.getAllUndoCommands();
		const checked = Array(this.allUndoCommands.length);
		checked.fill(false);
		this.state = {
			checked: checked
		};

		this.buttonRef = React.createRef();
		this.checkRef = React.createRef();

		this.onChange = this.onChange.bind(this);
		this.onKeyDownCheckbox = this.onKeyDownCheckbox.bind(this);
		this.onKeyDownXIcon = this.onKeyDownXIcon.bind(this);
		this.closePanel = this.closePanel.bind(this);
	}

	componentDidMount() {
		// this.buttonRef.current.focus();
	}

	onClick(evt) {
		evt.stopPropagation();
	}

	onChange(evt, setting) {
		const checked = [...this.state.checked];
		checked[setting.id] = setting.checked;

		this.setState({ checked });
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
		const current = this.state.checked.indexOf(true);
		if (current > -1) {
			const checkedPos = current;
			const count = this.allUndoCommands.length - checkedPos;
			this.props.subPanelData.canvasController.undoMulti(count);
		}
		this.props.closeSubPanel();

	}

	generateCheckboxes() {
		const checkBoxes = [];
		this.allUndoCommands.forEach((cmnd, i) => {
			const id = String(i);
			checkBoxes.push(
				<Checkbox id={id} key={id} labelText={cmnd.getLabel()} onChange={this.onChange} checked={this.state.checked[i]} />
			);
		});
		return checkBoxes;
	}

	render() {
		const checkBoxes = this.generateCheckboxes();

		return (
			<div style={{ padding: 10, width: 170 }} onClick={this.onClick} >
				{ checkBoxes }
				<Button kind="primary" size="sm" onClick={this.closePanel} >OK</Button>
			</div>
		);
	}
}

MultiUndoPanel.propTypes = {
	closeSubPanel: PropTypes.func,
	subPanelData: PropTypes.object
};

export default MultiUndoPanel;
