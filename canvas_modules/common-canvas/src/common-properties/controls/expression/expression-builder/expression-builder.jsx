/*
 * Copyright 2017-2022 Elyra Authors
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
import ExpressionControl from "./../expression";
import ExpressionSelectionPanel from "./expression-selection-panel";
import { MESSAGE_KEYS } from "./../../../constants/constants";
import { formatMessage } from "./../../../util/property-utils";
import { isEqual } from "lodash";

export default class ExpressionBuilder extends React.Component {
	constructor(props) {
		super(props);
		this.selection = [];
		this.expressionInfo = props.controller.getExpressionInfo();
		this.editorDidMount = this.editorDidMount.bind(this);
		this.onChange = this.onChange.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.onSelectionChange = this.onSelectionChange.bind(this);
		this.lastCursorPos = null;

	}

	onChange(newValue) {
		const value = (typeof newValue === "string") ? newValue : newValue.toString();
		let cursor = this.editor.getCursor();
		let selectionOffset = 1;
		if (this.editor.somethingSelected()) {
			selectionOffset = 0;
			this.editor.replaceSelection(value);
		} else {
			let buffer = " ";
			if (this.lastCursorPos) {
				this.editor.setCursor(this.lastCursorPos);
				cursor = this.lastCursorPos;
			}
			// if adding to a parenth/bracket/brace expression, no need for space
			const charBefore = this.editor.getLine(cursor.line)[cursor.ch - 1];
			// edge case of cursor being at line 0, char 0 is still handled here
			if (["(", "[", "{"].indexOf(charBefore) !== -1) {
				buffer = "";
			}
			this.editor.replaceSelection(buffer + value);
		}
		this._setSelection(value, cursor, selectionOffset);
		// This is needed to generate a render so that the selection will appear.
		const exprValue = this.editor.getValue();
		this.props.controller.updatePropertyValue(this.props.propertyId, exprValue, true);
		this.lastCursorPos = this.editor.getCursor();
	}

	onSelectionChange(selection) {
		this.selection = selection;
	}

	onBlur(editor, evt) {
		this.lastCursorPos = editor.getCursor();
		const currentValue = this.props.controller.getPropertyValue(this.props.propertyId);
		const newValue = this.editor.getValue();
		const skipValidate = this.expressionSelectionPanel && evt && this.expressionSelectionPanel.contains(evt.relatedTarget);
		// update property value when value is updated OR value is to be validated
		if (!isEqual(currentValue, newValue) || !skipValidate) {
			this.props.controller.updatePropertyValue(this.props.propertyId, newValue, skipValidate);
		}
	}

	editorDidMount(editor, next) {
		this.editor = editor;
	}


	_setSelection(value, cursor, selectionOffset) {
		// first set the selection to the first param holder of new value
		if (typeof value === "string") {
			const firstParam = value.indexOf("?");
			if (firstParam !== -1) {
				const selection = { anchor: { line: cursor.line, ch: cursor.ch + firstParam + selectionOffset + 1 },
					head: { line: cursor.line, ch: cursor.ch + firstParam + selectionOffset } };
				this.onSelectionChange([selection]);
				return;
			}
		}
		// if the newValue doesn't have a param holder
		// set it to the first param holder found in the expression
		const lineCount = this.editor.lineCount();
		for (let index = 0; index < lineCount; index++) {
			const line = this.editor.getLine(index);
			const paramOffset = line.indexOf("?");
			if (paramOffset !== -1) {
				const selection = { anchor: { line: index, ch: paramOffset + 1 },
					head: { line: index, ch: paramOffset } };
				this.onSelectionChange([selection]);
				return;
			}
		}
		// if no parameter holders found then set it to end of insert string
		const insertSelection = { anchor: { line: cursor.line, ch: cursor.ch + value.length + selectionOffset },
			head: { line: cursor.line, ch: cursor.ch + value.length + selectionOffset } };
		this.onSelectionChange([insertSelection]);
		return;
	}

	render() {
		const expressionLabel = formatMessage(this.props.controller.getReactIntl(),
			MESSAGE_KEYS.EXPRESSION_BUILDER_LABEL);

		return (
			<div className="properties-expression-builder">
				<ExpressionControl
					control={this.props.control}
					propertyId={this.props.propertyId}
					controller={this.props.controller}
					builder={false}
					editorDidMount={this.editorDidMount}
					selectionRange={this.selection}
					onSelectionChange={this.onSelectionChange}
					onBlur={this.onBlur}
					height={96}
					expressionLabel={expressionLabel}
				/>
				<div ref={ (ref) => (this.expressionSelectionPanel = ref) }>
					<ExpressionSelectionPanel
						controller={this.props.controller}
						onChange={this.onChange}
						functionList={this.expressionInfo.functionCategories}
						operatorList={this.expressionInfo.operators}
						language={this.props.control.language}
					/>
				</div>
			</div>
		);
	}
}

ExpressionBuilder.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired
};
