/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* eslint global-require: 0 */

import React from "react";
import PropTypes from "prop-types";
import { UnControlled as CodeMirror } from "react-codemirror2";
import Icon from "./../../../icons/icon.jsx";
import CarbonIcon from "carbon-components-react/lib/components/Icon";
import Link from "carbon-components-react/lib/components/Link";

import ValidationMessage from "./../../components/validation-message";
import WideFlyout from "./../../components/wide-flyout";
import PropertyUtils from "./../../util/property-utils";
import ExpressionBuilder from "./expression-builder/expression-builder.jsx";
import { MESSAGE_KEYS, MESSAGE_KEYS_DEFAULTS, CONDITION_MESSAGE_TYPE, DEFAULT_VALIDATION_MESSAGE } from "./../../constants/constants";
import ControlUtils from "./../../util/control-utils";
import { STATES } from "./../../constants/constants.js";


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
	require("./languages/CLEM");
	require("./languages/CLEM-hint");
}

const pxPerChar = 8.5;
const pxPerLine = 26;
const defaultCharPerLine = 30;
const maxLineHeight = 15 * pxPerLine; // 20 lines
const minLineHeight = 4 * pxPerLine; // 4 lines

export default class ExpressionControl extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showExpressionBuilder: false,
		};

		this.origHint = "";

		this.handleValidate = this.handleValidate.bind(this);
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
			// change the validate icon because something has been entered.
			if (this.props.controller.getExpressionValidate(this.props.propertyId.name)) {
				this.props.controller.updateExpressionValidate(this.props.propertyId.name, false);
				this.props.controller.updateErrorMessage(this.props.propertyId, DEFAULT_VALIDATION_MESSAGE);
			}
		};
	}

	// this is needed to ensure expression builder selection works.
	componentDidUpdate() {
		if (this.props.selectionRange && this.props.selectionRange.length > 0 && this.editor) {
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
		height = this.props.height ? this.props.height : height;
		this.editor.setSize(null, Math.max(Math.floor(height), minLineHeight));

		this.origHint = editor.getHelper({ line: 0, ch: 0 }, "hint");
		// this next line is a hack to overcome a Codemirror problem.  To support SparkSQL, a subset of SQL,
		// we need to register with Codemirror the language as the value of "text/x-hive". When Codemirror
		// registers the autocomplete addon it registers is as "sql" not the subset "text/x-hive"
		// This hack allows use to capture the "sql" autocomplete handler and subsitute our custom handler
		const language = (this.props.control.language === "text/x-hive") ? "sql" : this.props.control.language;
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
		this.initalValidateState = this.props.controller.getExpressionValidate(this.props.propertyId.name);
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
		this.props.controller.updateExpressionValidate(this.props.propertyId.name, this.initalValidateState);
		this.hideExpressionBuilder();
	}

	handleValidate() {
		this.props.controller.updateExpressionValidate(this.props.propertyId.name, true);
		this.props.controller.validateInput(this.props.propertyId);
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
			this.props.controller.updatePropertyValue(this.props.propertyId, newValue, true);
		}
	}

	_showBuilderButton() {
		// only show the button if there are function lists available and
		// not explicitly told not to by the this.props.builder
		const expressionInfo = this.props.controller.getExpressionInfo();
		return this.props.builder && this.props.rightFlyout && Object.keys(expressionInfo).length > 0;
	}

	render() {
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		const state = this.props.controller.getControlState(this.props.propertyId);
		let messageInfo = this.props.controller.getErrorMessage(this.props.propertyId);
		const messageType = (messageInfo) ? messageInfo.type : CONDITION_MESSAGE_TYPE.INFO;
		if (messageType === CONDITION_MESSAGE_TYPE.SUCCESS) {
			messageInfo = null;
		}

		const theme = (state === STATES.DISABLED) ? "disabled" : messageType;
		const reactIntl = this.props.controller.getReactIntl();

		const button = this._showBuilderButton() ? (
			<div className="properties-expression-button" disabled={state === STATES.DISABLED}>
				<button type="button" disabled={state === STATES.DISABLED} onClick={this.showExpressionBuilder} >
					<Icon disabled={state === STATES.DISABLED} type="builder" />
				</button>
			</div>)
			: <div />;

		let validateIcon = <div />;
		if (this.props.controller.getExpressionValidate(this.props.propertyId.name)) {
			const iconName = (messageType === CONDITION_MESSAGE_TYPE.SUCCESS || messageType === CONDITION_MESSAGE_TYPE.INFO)
				? "checkmark--glyph" : messageType + "--glyph";
			validateIcon = (<div className="icon validateIcon">
				<CarbonIcon className={ messageType}
					description=""
					name={iconName}
				/>
			</div>);
		}

		const validateLabel = PropertyUtils.formatMessage(reactIntl, MESSAGE_KEYS.EXPRESSION_VALIDATE_LABEL, MESSAGE_KEYS_DEFAULTS.EXPRESSION_VALIDATE_LABEL);
		const validateLink = (
			<div className="properties-expression-validate" disabled={state === STATES.DISABLED}>
				{validateIcon}
				<div className="validateLink">
					<Link onClick={this.handleValidate}>
						{validateLabel}
					</Link>
				</div>
			</div>);

		const mirrorOptions = {
			mode: this.props.control.language,
			placeholder: this.props.control.additionalText,
			theme: theme + " default",
			readOnly: (state === STATES.DISABLED) ? "nocursor" : false,
			extraKeys: { "Ctrl-Space": "autocomplete" },
			autoRefresh: true
		};
		const applyLabel = PropertyUtils.formatMessage(reactIntl, MESSAGE_KEYS.APPLYBUTTON_LABEL, MESSAGE_KEYS_DEFAULTS.APPLYBUTTON_LABEL);
		const rejectLabel = PropertyUtils.formatMessage(reactIntl, MESSAGE_KEYS.REJECTBUTTON_LABEL, MESSAGE_KEYS_DEFAULTS.REJECTBUTTON_LABEL);
		const expressonTitle = PropertyUtils.formatMessage(reactIntl, MESSAGE_KEYS.EXPRESSION_BUILDER_TITLE, MESSAGE_KEYS_DEFAULTS.EXPRESSION_BUILDER_TITLE);

		const flyout = (<WideFlyout
			cancelHandler={this.cancelExpressionBuilder}
			okHandler={this.hideExpressionBuilder}
			show={this.state.showExpressionBuilder}
			applyLabel={applyLabel}
			rejectLabel={rejectLabel}
			title={expressonTitle}
		>
			<div>
				<ExpressionBuilder
					control={this.props.control}
					controller={this.props.controller}
					propertyId={this.props.propertyId}
				/>
			</div>
		</WideFlyout>);

		const className = "properties-expression-editor " + messageType;
		return (
			<div className="properties-expression-editor-wrapper" >
				{flyout}
				<div className="properties-editor-container">
					<div className="properties-expression-link-container" >
						{button}
						{validateLink}
					</div>
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
							value={controlValue}
						/>
						<ValidationMessage state={state} messageInfo={messageInfo} inTable={this.props.tableControl} />
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
	tableControl: PropTypes.bool,
	editorDidMount: PropTypes.func,
	builder: PropTypes.bool,
	rightFlyout: PropTypes.bool,
	selectionRange: PropTypes.array,
	onSelectionChange: PropTypes.func,
	onBlur: PropTypes.func,
	height: PropTypes.number // height in px
};

ExpressionControl.defaultProps = {
	builder: true
};
