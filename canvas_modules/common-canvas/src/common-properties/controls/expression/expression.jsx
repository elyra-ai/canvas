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

/* eslint global-require: 0 */

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Icon from "./../../../icons/icon.jsx";
import { Button } from "@carbon/react";
import classNames from "classnames";
import { isEqual, concat } from "lodash";
import ValidationMessage from "./../../components/validation-message";
import TearSheet from "../../panels/tearsheet/index.js";
import { formatMessage } from "./../../util/property-utils";
import ExpressionBuilder from "./expression-builder/expression-builder";
import { MESSAGE_KEYS, CONDITION_MESSAGE_TYPE, DEFAULT_VALIDATION_MESSAGE } from "./../../constants/constants";
import { Calculator } from "@carbon/react/icons";
import * as ControlUtils from "./../../util/control-utils";
import { STATES } from "./../../constants/constants";
import { get } from "lodash";
import ExpressionToggle from "./expression-toggle/expression-toggle";

import { keymap, placeholder } from "@codemirror/view";
import { defaultKeymap, indentWithTab, insertNewline } from "@codemirror/commands";
import { basicSetup, EditorView } from "codemirror";
import { Compartment } from "@codemirror/state";
import { tags } from "@lezer/highlight";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { python } from "@codemirror/lang-python";
import { sql } from "@codemirror/lang-sql";
import { javascript } from "@codemirror/lang-javascript";

import { getPythonHints } from "./languages/python-hint";
import { rLanguage } from "./languages/r-hint";
import { clem } from "./languages/CLEM-hint";

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
			validationInProgress: false,
			expressionEditorHeight: 0
		};
		this.editable = new Compartment; // eslint-disable-line new-parens
		this.editorRef = React.createRef();
		this.origHint = [];
		this.expressionInfo = this.props.controller.getExpressionInfo();
		this.handleValidate = this.handleValidate.bind(this);
		this.hasValidate = this.hasValidate.bind(this);
		this.cancelExpressionBuilder = this.cancelExpressionBuilder.bind(this);
		this.hideExpressionBuilder = this.hideExpressionBuilder.bind(this);
		this.showExpressionBuilder = this.showExpressionBuilder.bind(this);
		this.addonHints = this.addonHints.bind(this);
		this.getDatasetFields = this.getDatasetFields.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
		this.createCodeMirrorEditor = this.createCodeMirrorEditor.bind(this);
		this.events = this.events.bind(this);
		this.handleUpdate = this.handleUpdate.bind(this);
		this.setCodeMirrorEditable = this.setCodeMirrorEditable.bind(this);
		this.getCodemirrorState = this.getCodemirrorState.bind(this);
	}

	componentDidMount() {
		this.createCodeMirrorEditor();
	}

	// this is needed to ensure expression builder selection works.
	componentDidUpdate(prevProps) {
		// When code is edited in expression builder, reflect changes in expression flyout
		// Toggle editable mode in Codemirror editor
		if (!isEqual(prevProps.state, this.props.state)) {
			this.setCodeMirrorEditable(!(this.props.state === STATES.DISABLED) || !this.props.readOnly);
		}
		if (
			this.props.selectionRange &&
			this.props.selectionRange.length > 0 &&
			!isEqual(prevProps.selectionRange, this.props.selectionRange) &&
			this.editor
		) {
			this.props.selectionRange.forEach((selected) => {
				this.editor.dispatch({ selection: selected });
			});
			this.editor.focus();
		}
		if (!isEqual(prevProps.value, this.props.value)) {
			const selection = this.editor.state.selection.main;
			this.editor.dispatch({
				changes: {
					from: 0,
					to: this.getCodemirrorState()?.doc?.length,
					insert: this.props.value },
				selection: {
					anchor: selection.anchor,
					head: selection.head } });
		}
	}

	getCodemirrorState() {
		return this.editor?.viewState?.state;
	}

	// Set codemirror editor non-editable when disabled
	setCodeMirrorEditable(value) {
		this.editor.dispatch({
			effects: this.editable.reconfigure(EditorView.editable.of(value))
		});
	}

	// get the set of dataset field names
	getDatasetFields() {
		const results = [];
		const fields = this.props.controller.getDatasetMetadataFields();
		for (const field of fields) {
			results.push({ label: field.name, type: "variable" });
		}
		return results;
	}

	// Add the dataset field names to the autocomplete list
	addonHints(context) {
		const word = context.matchBefore(/\w*/);
		if (word.from === word.to && !context.explicit) {
			return null;
		}
		return {
			from: word.from,
			options: concat(this.origHint, this.getDatasetFields())
		};
	}

	createCodeMirrorEditor() {
		// set the default height, should be between 4 and 20 lines
		const controlWidth = (this.expressionEditorDiv) ? this.expressionEditorDiv.clientWidth : 0;
		const charPerLine = (controlWidth > 0) ? controlWidth / pxPerChar : defaultCharPerLine;
		// charlimit in the control sets the height within a min and max
		let height = (this.props.control.charLimit)
			? Math.min((this.props.control.charLimit / charPerLine) * pxPerLine, maxLineHeight) : minLineHeight;
		// let an explicit prop override the calculated height
		height = this.props.control.rows ? pxPerLine * this.props.control.rows : height;
		height = this.props.height ? this.props.height : height;
		this.setState({ expressionEditorHeight: Math.max(Math.floor(height), minLineHeight) });

		// this next line is a hack to overcome a Codemirror problem.  To support SparkSQL, a subset of SQL,
		// we need to register with Codemirror the language as the value of "text/x-hive". When Codemirror
		// registers the autocomplete addon it registers is as "sql" not the subset "text/x-hive"
		// This hack allows use to capture the "sql" autocomplete handler and subsitute our custom handler
		// Same has been done for Python and R
		let language = this.props.control.language;
		switch (this.props.control.language) {
		case "text/x-hive":
			language = sql();
			break;
		case "text/x-python":
			language = python();
			this.origHint = getPythonHints();
			break;
		case "text/x-rsrc":
			language = rLanguage(); // custom language
			break;
		case "javascript":
			language = javascript();
			break;
		default:
			language = clem(); // custom language
		}

		// Custom completions add to the language completions
		const customCompletions = language.language.data.of({
			autocomplete: this.addonHints
		});

		// Syntax highlighting
		const myHighlightStyle = HighlightStyle.define([
			{ tag: tags.keyword, class: "cm-keyword" },
			{ tag: tags.number, class: "cm-number" },
			{ tag: tags.definition(tags.name), class: "cm-def" },
			{ tag: tags.comment, class: "cm-comment" },
			{ tag: tags.variableName, class: "cm-variable" },
			{ tag: tags.punctuation, class: "cm-punctuation" },
			{ tag: tags.propertyName, class: "cm-property" },
			{ tag: tags.operator, class: "cm-operator" },
			{ tag: tags.string, class: "cm-string" },
			{ tag: tags.meta, class: "cm-meta" }
		]);

		this.editor = new EditorView({
			doc: this.props.value,
			extensions: [
				keymap.of([{ key: "Enter", run: insertNewline }, indentWithTab, defaultKeymap]), // This should be before basicSetup to insertNewLine on "Enter"
				customCompletions,
				syntaxHighlighting(myHighlightStyle),
				basicSetup,
				this.events(),
				language,
				placeholder(this.props.control.additionalText),
				this.handleUpdate(),
				this.editable.of(EditorView.editable.of(!(this.props.state === STATES.DISABLED || this.props.readOnly)))
			],
			parent: this.editorRef.current
		});

		// Set editor in the expression-builder
		if (this.props.editorDidMount) {
			this.props.editorDidMount(this.editor);
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
		});
	}

	hasValidate() {
		return typeof this.props.controller.getHandlers().validationHandler === "function";
	}

	// Event handlers for CM6
	events() {
		const that = this;
		const eventHandlers = EditorView.domEventHandlers({
			blur(evt, view) {
				that.handleBlur(view, evt);
			}
		});
		return eventHandlers;
	}

	handleBlur(editor, evt) {
		const cancelButtonClicked = evt && evt.relatedTarget && evt.relatedTarget.classList.contains("properties-cancel-button");
		if (this.props.onBlur && !cancelButtonClicked) {
			// this will ensure the expression builder can save values onBlur
			this.props.onBlur(editor, evt);
		} else {
			const newValue = editor?.viewState?.state?.doc.toString();
			// don't validate when opening the expression builder
			const skipValidate = evt && evt.relatedTarget && evt.relatedTarget.classList.contains("properties-expression-button");
			this.props.controller.updatePropertyValue(this.props.propertyId, newValue, skipValidate);
		}
	}

	handleUpdate() {
		const onUpdate = EditorView.updateListener.of((viewUpdate) => {
			if (viewUpdate.docChanged) {
				// this is needed when a single character is added into the expression builder because
				// entering chars does not go through onChange() in expression builder.
				// This is needed to adjust the selection position in code mirror.
				if (
					Array.isArray(viewUpdate.changedRanges) &&
					viewUpdate.changedRanges.length === 1 &&
					Math.abs(viewUpdate.changes.newLength - viewUpdate.changes.length) === 1 &&
					this.props.onSelectionChange
				) {
					const newPos = viewUpdate.changedRanges[0].toB;
					this.props.onSelectionChange([{ anchor: newPos, head: newPos }]);
				}
				if (this.state.validateIcon) {
					this.setState({
						validateIcon: null
					});
					this.props.controller.updateErrorMessage(this.props.propertyId, DEFAULT_VALIDATION_MESSAGE);
				}
			}
		});
		return onUpdate;
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

		const reactIntl = this.props.controller.getReactIntl();

		const button = this._showBuilderButton() ? (
			<Button kind="ghost" size="sm"
				className="properties-expression-button"
				disabled={this.props.state === STATES.DISABLED || this.props.readOnly}
				onClick={this.showExpressionBuilder}
				renderIcon={Calculator}
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
				<Button
					className="validateLink"
					kind="ghost"
					onClick={this.handleValidate}
					disabled={this.props.state === STATES.DISABLED || this.state.validationInProgress || this.props.readOnly}
				>
					{validateLabel}
				</Button>
				{validateIcon}
			</div>)
			: null;

		const applyLabel = formatMessage(reactIntl, MESSAGE_KEYS.APPLYBUTTON_LABEL);
		const rejectLabel = formatMessage(reactIntl, MESSAGE_KEYS.REJECTBUTTON_LABEL);
		const expressonTitle = formatMessage(reactIntl, MESSAGE_KEYS.EXPRESSION_BUILDER_TITLE);

		const expBuilder = (
			<div>
				<ExpressionBuilder
					control={this.props.control}
					controller={this.props.controller}
					propertyId={this.props.propertyId}
				/>
			</div>
		);

		const flyout = this.state.showExpressionBuilder ? (<TearSheet
			open
			onCloseCallback={this.cancelExpressionBuilder}
			okHandler={this.hideExpressionBuilder}
			cancelHandler={this.cancelExpressionBuilder}
			showPropertiesButtons
			applyLabel={applyLabel}
			rejectLabel={rejectLabel}
			tearsheet={{
				title: expressonTitle,
				content: expBuilder
			}}
		/>) : null;

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

		const codemirrorClassName = classNames(`elyra-CodeMirror ${messageType} ${this.props.state}`);

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
						<div className={codemirrorClassName} ref={this.editorRef} style={{ height: this.state.expressionEditorHeight, minHeight: minLineHeight }} />
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
	messageInfo: PropTypes.object, // pass in by redux
	readOnly: PropTypes.bool
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
