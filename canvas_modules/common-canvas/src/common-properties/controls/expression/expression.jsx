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
import ValidationMessage from "./../../components/validation-message";
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

		this.origHint = "";
		this.cursor = { line: 0, ch: 0 };

		this.handleChange = this.handleChange.bind(this);
		this.editorDidMount = this.editorDidMount.bind(this);

		this.addonHints = this.addonHints.bind(this);
		this.getDatasetFields = this.getDatasetFields.bind(this);
	}

	componentDidMount() {
		// set the default height, should be between 4 and 20 lines
		const controlWidth = (this.expressionEditorDiv) ? this.expressionEditorDiv.clientWidth : 0;
		const charPerLine = (controlWidth > 0) ? controlWidth / pxPerChar : defaultCharPerLine;
		const height = (this.props.control.charLimit)
			? Math.min((this.props.control.charLimit / charPerLine) * pxPerLine, maxLineHeight) : minLineHeight;
		this.editor.setSize(null, Math.max(Math.floor(height), minLineHeight));

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
		this.origHint = editor.getHelper({ line: 0, ch: 0 }, "hint");
		// this next line is a hack to overcome a Codemirror problem.  To support SparkSQL, a subset of SQL,
		// we need to register with Codemirror the language as the value of "text/x-hive". When Codemirror
		// registers the autocomplete addon it registers is as "sql" not the subset "text/x-hive"
		// This hack allows use to capture the "sql" autocomplete handler and subsitute our custom handler
		const language = (this.props.control.language === "text/x-hive") ? "sql" : this.props.control.language;
		if (cm) {
			cm.registerHelper("hint", language, this.addonHints);
		}
	}

	handleChange(editor, data, value) {
		this.cursor = editor.getCursor();
		this.props.controller.updatePropertyValue(this.props.propertyId, value);
	}

	render() {
		var controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		const state = this.props.controller.getControlState(this.props.propertyId);
		const messageInfo = this.props.controller.getErrorMessage(this.props.propertyId);
		const messageType = (messageInfo) ? messageInfo.type : "info";

		const theme = (state === STATES.DISABLED) ? "disabled" : messageType;

		const mirrorOptions = {
			mode: this.props.control.language,
			placeholder: this.props.control.additionalText,
			theme: theme + " default",
			readOnly: (state === STATES.DISABLED) ? "nocursor" : false,
			extraKeys: { "Ctrl-Space": "autocomplete" },
			autoRefresh: true
		};

		const className = "properties-expression-editor " + messageType;
		return (
			<div ref={ (ref) => (this.expressionEditorDiv = ref) } data-id={ControlUtils.getDataId(this.props.propertyId)}
				className={className}
			>
				<CodeMirror
					ref= { (ref) => (this.codeMirror = ref)}
					options={mirrorOptions}
					onChange={this.handleChange}
					editorDidMount={this.editorDidMount}
					value={controlValue}
					cursor={this.cursor}
				/>
				<ValidationMessage state={state} messageInfo={messageInfo} inTable={this.props.tableControl} />
			</div>

		);
	}
}

ExpressionControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	tableControl: PropTypes.bool
};
