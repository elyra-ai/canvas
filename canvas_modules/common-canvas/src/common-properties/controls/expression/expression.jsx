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

/* eslint global-require: 0 */

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { UnControlled as CodeMirror } from "react-codemirror2";
import Icon from "./../../../icons/icon.jsx";
import { Button } from "carbon-components-react";
import classNames from "classnames";
import { isEqual } from "lodash";
import ValidationMessage from "./../../components/validation-message";
import WideFlyout from "./../../components/wide-flyout";
import { formatMessage } from "./../../util/property-utils";
import ExpressionBuilder from "./expression-builder/expression-builder";
import { MESSAGE_KEYS, CONDITION_MESSAGE_TYPE, DEFAULT_VALIDATION_MESSAGE } from "./../../constants/constants";
import { Calculator24 } from "@carbon/icons-react";
import * as ControlUtils from "./../../util/control-utils";
import { STATES } from "./../../constants/constants";
import { get } from "lodash";
import ExpressionToggle from "./expression-toggle/expression-toggle";

import { register as registerPython } from "./languages/python-hint";
import { register as registerR } from "./languages/r-hint";
import { register as registerClem } from "./languages/CLEM-hint";

// required for server side rendering.
let cm = null;
if (typeof window !== "undefined" && typeof window.navigator !== "undefined") {
	cm = require("codemirror");
	require("codemirror/addon/hint/show-hint");
	require("codemirror/addon/display/placeholder");
	require("codemirror/addon/display/autorefresh");
	require("codemirror/mode/javascript/javascript");
	require("codemirror/addon/hint/javascript-hint");
	require("codemirror/addon/hint/sql-hint");
	require("codemirror/mode/sql/sql");
	require("codemirror/mode/python/python");
	require("codemirror/mode/r/r");
	registerPython(cm);
	registerR(cm);
	registerClem(cm);
}


const pxPerChar = 8.5;
const pxPerLine = 26;
const defaultCharPerLine = 30;
const maxLineHeight = 15 * pxPerLine; // 20 lines
const minLineHeight = 4 * pxPerLine; // 4 lines

class ExpressionControl extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showExpressionBuilder: false,
			validationInProgress: false
		};

		this.origHint = "";
		this.expressionInfo = this.props.controller.getExpressionInfo();
		this.handleValidate = this.handleValidate.bind(this);
		this.hasValidate = this.hasValidate.bind(this);
		this.cancelExpressionBuilder = this.cancelExpressionBuilder.bind(this);
		this.hideExpressionBuilder = this.hideExpressionBuilder.bind(this);
		this.showExpressionBuilder = this.showExpressionBuilder.bind(this);
		this.editorDidMount = this.editorDidMount.bind(this);
		this.addonHints = this.addonHints.bind(this);
		this.getDatasetFields = this.getDatasetFields.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
		this.handleKeyDown = this.handleKeyDown.bind(this);

		this.handleChange = (editor, data, newValue) => {
			// this is needed when characters are added into the expression builder because
			// entering chars does not go through onChange() in expression builder.
			// This is needed to adjust the selection position in code mirror.
			if (Array.isArray(data.text) && data.text.length === 1 && data.text[0].length === 1 && this.props.onSelectionChange) {
				// if a string was replaced, need to calc newPos from the 'data.from' otherwise use 'data.to'
				const newPos = (data.removed[0].length > 0) ? { line: data.from.line, ch: data.from.ch + 1 } : { line: data.to.line, ch: data.to.ch + 1 };
				this.props.onSelectionChange([{ anchor: newPos, head: newPos }]);
			}
			if (this.state.validateIcon) {
				this.setState({
					validateIcon: null
				});
				this.props.controller.updateErrorMessage(this.props.propertyId, DEFAULT_VALIDATION_MESSAGE);
			}
		};
	}

	// this is needed to ensure expression builder selection works.
	componentDidUpdate(prevProps) {
		if (
			this.props.selectionRange &&
			this.props.selectionRange.length > 0 &&
			!isEqual(prevProps.selectionRange, this.props.selectionRange) &&
			this.editor
		) {
			this.props.selectionRange.forEach((selected) => {
				this.editor.setSelection(selected.anchor, selected.head);
			});
			this.editor.focus();
		}
	}

	// reset to the original autocomplete handler
	componentWillUnmount() {
		if (this.origHint && cm) {
			cm.registerHelper("hint", this.props.control.language, this.origHint);
		}
	}

	// get the set of dataset field names
	getDatasetFields() {
		const results = [];
		const fields = this.props.controller.getDatasetMetadataFields();
		for (const field of fields) {
			results.push(field.name);
		}
		return results;
	}

	// Add the dataset field names to the autocomplete list
	addonHints(editor, options) {
		var results = {};
		var cur = editor.getCursor();
		var token = editor.getTokenAt(cur);
		if (this.origHint) {
			// get the list of autocomplete names from the language autocomplete handler
			results = this.origHint(editor, options);

			// add to the start of the autocomplete list the set of dataset field names that complete the
			// string that has been entered.
			var parameters = this.getDatasetFields();
			for (var i = 0; i < parameters.length; ++i) {
				const parameter = parameters[i];
				if (parameter.lastIndexOf(token.string, 0) === 0 && results.list.indexOf(parameter) === -1) {
					results.list.unshift(parameter);
				} else if (token.string === " " && token.type === null) {
					results.list.unshift(parameter);
				}
			}
		}
		return results;
	}

	// Save original autocomplete handler and then register our custom handler
	// that will add data set filed names to autocomplete list.
	editorDidMount(editor, next) {
		this.editor = editor;
		// set the default height, should be between 4 and 20 lines
		const controlWidth = (this.expressionEditorDiv) ? this.expressionEditorDiv.clientWidth : 0;
		const charPerLine = (controlWidth > 0) ? controlWidth / pxPerChar : defaultCharPerLine;
		// charlimit in the control sets the height within a min and max
		let height = (this.props.control.charLimit)
			? Math.min((this.props.control.charLimit / charPerLine) * pxPerLine, maxLineHeight) : minLineHeight;
		// let an explicit prop override the calculated height
		height = this.props.control.rows ? pxPerLine * this.props.control.rows : height;
		height = this.props.height ? this.props.height : height;
		this.editor.setSize(null, Math.max(Math.floor(height), minLineHeight));

		this.origHint = editor.getHelper({ line: 0, ch: 0 }, "hint");
		// this next line is a hack to overcome a Codemirror problem.  To support SparkSQL, a subset of SQL,
		// we need to register with Codemirror the language as the value of "text/x-hive". When Codemirror
		// registers the autocomplete addon it registers is as "sql" not the subset "text/x-hive"
		// This hack allows use to capture the "sql" autocomplete handler and subsitute our custom handler
		// Same has been done for Python and R
		let language = this.props.control.language;
		switch (this.props.control.language) {
		case "text/x-hive":
			language = "sql";
			break;
		case "text/x-python":
			language = "python";
			break;
		case "text/x-rsrc":
			language = "r";
			break;
		default:
		}
		if (cm) {
			cm.registerHelper("hint", language, this.addonHints);
		}

		if (this.props.editorDidMount) {
			this.props.editorDidMount(editor, next);
		}
	}

	showExpressionBuilder() {
		// save the state from the expression builder so if enter and cancel again it will revert
		this.initialControlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		this.initialMessage = this.props.controller.getErrorMessage(this.props.propertyId);
		this.initialState = this.props.controller.getControlState(this.props.propertyId);
		this.setState({ showExpressionBuilder: true });
	}
	hideExpressionBuilder() {
		this.setState({ showExpressionBuilder: false });
	}
	cancelExpressionBuilder() {
		// on cancel reset back to original value
		this.props.controller.updatePropertyValue(this.props.propertyId, this.initialControlValue);
		this.props.controller.updateErrorMessage(this.props.propertyId, this.initialMessage);
		this.props.controller.updateControlState(this.props.propertyId, this.initialState);
		this.hideExpressionBuilder();
	}

	handleValidate() {
		this.setState({
			validateIcon: null,
			validationInProgress: true
		});
		const appData = this.props.controller.getAppData();
		this.props.controller.getHandlers().validationHandler(this.props.controller, this.props.propertyId, this.props.value, appData, (response) => {
			this.props.controller.updateErrorMessage(this.props.propertyId, response); // expects "text" and "type" in response
			this.setState({
				validateIcon: response.type,
				validationInProgress: false
			});
			this.editor.display.input.blur();
		});
	}

	hasValidate() {
		return typeof this.props.controller.getHandlers().validationHandler === "function";
	}

	handleKeyDown(editor, evt) {
		// this is needed to move the cursor to the new line if selection is being used in the expression builder.
		if (evt.code === "Enter") {
			if (this.props.selectionRange && this.props.selectionRange.length > 0 && this.props.onSelectionChange) {
				const newPos = { line: this.props.selectionRange[0].anchor.line + 1, ch: 0 };
				this.props.onSelectionChange([{ anchor: newPos, head: newPos }]);
			}
		}
	}

	handleBlur(editor, evt) {
		if (this.props.onBlur) {
			// this will ensure the expression builder can save values onBlur
			this.props.onBlur(editor, evt);
		} else {
			const newValue = this.editor.getValue();
			// don't validate when opening the expression builder
			const skipValidate = evt && evt.relatedTarget && evt.relatedTarget.classList.contains("properties-expression-button");
			this.props.controller.updatePropertyValue(this.props.propertyId, newValue, skipValidate);
		}
	}

	_showBuilderButton() {
		// only show the button if there are function lists available and
		// not explicitly told not to by the this.props.builder
		// TODO: Design: how to display builder outside of right flyout?
		return this.props.builder && this.props.rightFlyout && this.expressionInfo.functionCategories && Object.keys(this.expressionInfo.functionCategories).length > 0;
	}

	render() {
		let messageInfo = this.props.messageInfo;
		const messageType = (messageInfo) ? messageInfo.type : CONDITION_MESSAGE_TYPE.INFO;
		if (messageType === CONDITION_MESSAGE_TYPE.SUCCESS) {
			messageInfo = null;
		}

		const theme = (this.props.state === STATES.DISABLED) ? "disabled" : messageType;
		const reactIntl = this.props.controller.getReactIntl();

		const button = this._showBuilderButton() ? (
			<Button kind="ghost" size="small"
				className="properties-expression-button"
				disabled={this.props.state === STATES.DISABLED}
				onClick={this.showExpressionBuilder}
				renderIcon={Calculator24}
				iconDescription={formatMessage(reactIntl, MESSAGE_KEYS.EXPRESSION_BUILDER_ICON_DESCRIPTION)}
				tooltipPosition="right"
				hasIconOnly
			/>)
			: null;

		let validateIcon = null;
		if (this.state.validateIcon) {
			validateIcon = (
				<div className="icon validateIcon">
					<Icon type={this.state.validateIcon} className={`properties-validation-icon-${this.state.validateIcon}`} />
				</div>);
		}

		const validateLabel = this.state.validationInProgress ? formatMessage(reactIntl, MESSAGE_KEYS.EXPRESSION_VALIDATING_LABEL)
			: formatMessage(reactIntl, MESSAGE_KEYS.EXPRESSION_VALIDATE_LABEL);
		const validateLink = this.hasValidate() && this.props.validateLink ? (
			<div className="properties-expression-validate" disabled={this.props.state === STATES.DISABLED}>
				<Button className="validateLink" kind="ghost" onClick={this.handleValidate} disabled={this.props.state === STATES.DISABLED || this.state.validationInProgress}>
					{validateLabel}
				</Button>
				{validateIcon}
			</div>)
			: null;
		const mirrorOptions = {
			mode: this.props.control.language,
			placeholder: this.props.control.additionalText,
			theme: theme + " custom",
			readOnly: (this.props.state === STATES.DISABLED) ? "nocursor" : false,
			extraKeys: { "Ctrl-Space": "autocomplete" },
			autoRefresh: true,
			lineNumbers: true
		};
		const applyLabel = formatMessage(reactIntl, MESSAGE_KEYS.APPLYBUTTON_LABEL);
		const rejectLabel = formatMessage(reactIntl, MESSAGE_KEYS.REJECTBUTTON_LABEL);
		const expressonTitle = formatMessage(reactIntl, MESSAGE_KEYS.EXPRESSION_BUILDER_TITLE);

		const flyout = this.state.showExpressionBuilder ? (<WideFlyout
			cancelHandler={this.cancelExpressionBuilder}
			okHandler={this.hideExpressionBuilder}
			show={this.state.showExpressionBuilder}
			applyLabel={applyLabel}
			rejectLabel={rejectLabel}
			title={expressonTitle}
			light={this.props.controller.getLight() && this.props.control.light}
		>
			<div>
				<ExpressionBuilder
					control={this.props.control}
					controller={this.props.controller}
					propertyId={this.props.propertyId}
				/>
			</div>
		</WideFlyout>) : null;

		const className = classNames(`properties-expression-editor ${messageType}`,
			{ "properties-light-disabled": !this.props.control.light || !this.props.controller.getLight() });

		const expressionLink = (<div className="properties-expression-link-container" >
			{button}
			{validateLink}
		</div>);

		let header = expressionLink;

		if (this.props.expressionLabel) {
			header = (<div className="properties-expression-header">
				<div className="properties-expression-title">{this.props.expressionLabel}</div>
				{expressionLink}
			</div>);
		}

		let toggleMaxMin = null;
		if (this.props.control.enableMaximize) {
			const isTearsheetOpen = this.props.controller.getActiveTearsheet() === get(this, "props.control.data.tearsheet_ref");
			toggleMaxMin = (<ExpressionToggle
				control={this.props.control}
				controller={this.props.controller}
				enableMaximize={!isTearsheetOpen}
			/>);
		}

		return (
			<div className="properties-expression-editor-wrapper" >
				{this.props.controlItem}
				{flyout}
				<div className="properties-editor-container">
					{header}
					{toggleMaxMin}
					<div ref={ (ref) => (this.expressionEditorDiv = ref) } data-id={ControlUtils.getDataId(this.props.propertyId)}
						className={className}
					>
						<CodeMirror
							ref= { (ref) => (this.codeMirror = ref)}
							options={mirrorOptions}
							onChange={this.handleChange}
							onKeyDown={this.handleKeyDown}
							onBlur={this.handleBlur}
							editorDidMount={this.editorDidMount}
							value={this.props.value}
						/>
						<ValidationMessage state={this.props.state} messageInfo={messageInfo} inTable={this.props.tableControl} />
					</div>
				</div>
			</div>
		);
	}
}

ExpressionControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	controlItem: PropTypes.element,
	tableControl: PropTypes.bool,
	editorDidMount: PropTypes.func,
	builder: PropTypes.bool,
	validateLink: PropTypes.bool,
	rightFlyout: PropTypes.bool,
	selectionRange: PropTypes.array,
	onSelectionChange: PropTypes.func,
	onBlur: PropTypes.func,
	expressionLabel: PropTypes.oneOfType([
		PropTypes.object,
		PropTypes.string
	]),
	height: PropTypes.number, // height in px
	state: PropTypes.string, // pass in by redux
	value: PropTypes.string, // pass in by redux
	messageInfo: PropTypes.object // pass in by redux
};

ExpressionControl.defaultProps = {
	builder: true,
	validateLink: true
};

const mapStateToProps = (state, ownProps) => ({
	value: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(ExpressionControl);
