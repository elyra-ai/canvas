/*
 * Copyright 2017-2020 IBM Corporation
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
/* eslint complexity: ["error", 13] */
/* eslint max-len: ["error", 250] */

import React from "react";
import { Link } from "react-router-dom";
import { Dropdown, Button } from "carbon-components-react";
import {
	TEXTFIELD_ERROR_PROPS_INFO,
	TEXTFIELD_WARNING_PROPS_INFO,
	TEXTFIELD_COLNOTEXISTS_PROPS_INFO,
	TEXTAREA_ERROR_PROPS_INFO,
	TEXTAREA_WARNING_PROPS_INFO,
	PASSWORD_FIELD_ERROR_PROPS_INFO,
	EXPRESSION_ERROR_PROPS_INFO,
	EXPRESSION_WARNING_PROPS_INFO,
	NUMBERFIELD_ERROR_PROPS_INFO,
	NUMBERFIELD_GENERATOR_WARNING_PROPS_INFO,
	CHECKBOX_SINGLE_ERROR_PROPS_INFO,
	CHECKBOX_SET_ERROR_PROPS_INFO,
	CHECKBOX_SET_WARNING_PROPS_INFO,
	RADIOSET_HORIZONTAL_ERROR_PROPS_INFO,
	RADIOSET_VERTICAL_WARNING_PROPS_INFO,
	ONEOFSELECT_ERROR_PROPS_INFO,
	SOMEOFSELECT_ERROR_PROPS_INFO,
	SELECTCOLUMN_ERROR_PROPS_INFO,
	SELECTCOLUMNS_ERROR_PROPS_INFO,
	STRUCTURETABLE_ERROR_PROPS_INFO,
	STRUCTURETABLE_COLNOTEXISTS_PROPS_INFO,
	STRUCTURELISTEDITOR_ERROR_PROPS_INFO,
	STRUCTURELISTEDITOR_WARNING_PROPS_INFO,
	STRING_GROUP_ERROR_PROPS_INFO,
	STRING_GROUP_WARNING_PROPS_INFO,
	NUMBER_GROUP_ERROR_PROPS_INFO,
	VISIBLE_GROUP_PROPS_INFO,
	ENABLED_GROUP_PROPS_INFO,
	ENUM_FILTER_INFO,
	FILTER_INFO,
	PANELS_PROPS_INFO,
	PANELS_FLYOUT_PROPS_INFO,
	TEXT_PANEL_PROPS_INFO,
	TEXT_PANEL_FLYOUT_PROPS_INFO,
	PANEL_SELECTOR_PROPS_INFO,
	PANEL_SELECTOR_FLYOUT_PROPS_INFO,
	COLUMNSELECTION_PROPS_INFO,
	COLUMNSELECTION_FLYOUT_PROPS_INFO,
	SUMMARY_PANEL_PROPS_INFO,
	SUMMARY_PANEL_FLYOUT_PROPS_INFO,
	TWISTY_PANEL_PROPS_INFO,
	TWISTY_PANEL_FLYOUT_PROPS_INFO
} from "../constants/conditions-documentation-constants.js";
import { CommonProperties } from "common-canvas";
import { Table } from "reactable";

class CommonPropertiesComponents extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showRightFlyout: false,
			rightFlyoutContent: null
		};
		this.propertiesConfig = { containerType: "Custom" };
		this.jsonReplacer = this.jsonReplacer.bind(this);
		this.onMenuDropdownSelect = this.onMenuDropdownSelect.bind(this);
	}

	componentDidMount() {
		// https://github.com/ReactTraining/react-router/issues/394
		window.location.hash = window.decodeURIComponent(window.location.hash);
		const scrollToAnchor = () => {
			if (window.location.hash === "#/conditions") {
				window.scrollTo(0, 0);
			} else {
				const hashParts = window.location.hash.split("#");
				if (hashParts.length > 2) {
					const hash = hashParts.slice(-1)[0];
					document.querySelector(`#${hash}`).scrollIntoView();
				}
			}
		};
		window.onhashchange = scrollToAnchor;
		window.scrollTo(0, 0);
	}

	onMenuDropdownSelect(obj) {
		location.href = `${"#/conditions#" + obj.selectedItem.id}`;
		document.querySelector(`#${obj.selectedItem.id}`).scrollIntoView();
	}

	setRightFlyoutState(content) {
		this.setState({
			showRightFlyout: content !== this.state.rightFlyoutContent ||
				(content === this.state.rightFlyoutContent && !this.state.showRightFlyout),
			rightFlyoutContent: content
		});
	}

	jsonReplacer(json, type, custom) {
		let jsonReplacer = [];
		switch (type) {
		case "all":
			jsonReplacer = null;
			break;
		case "conditions":
			jsonReplacer = [
				"conditions", "validation", "enabled", "visible",
				"fail_message", "type", "message", "default", "resource_key", "focus_parameter_ref",
				"evaluate", "and", "or", "condition",
				"parameter_ref", "op", "parameter_2_ref", "value"
			];
			break;
		case "conditions_dataset":
			jsonReplacer = [
				"conditions", "validation", "enabled", "visible",
				"fail_message", "type", "message", "default", "resource_key", "focus_parameter_ref",
				"evaluate", "and", "or", "condition",
				"parameter_ref", "op", "parameter_2_ref", "value",
				"dataset_metadata", "fields", "name", "type", "metadata", "description", "measure", "modeling_role"
			];
			break;
		case "conditions_parameters":
			jsonReplacer = [
				"parameters",
				"id", "type", "role", "enum", "required", "default",
				"conditions", "validation", "enabled", "visible",
				"fail_message", "type", "message", "default", "resource_key", "focus_parameter_ref",
				"evaluate", "and", "or", "condition",
				"parameter_ref", "op", "parameter_2_ref", "value"
			];
			break;
		case "conditions_dataset_parameters":
			jsonReplacer = [
				"parameters",
				"id", "type", "role", "enum", "required", "default",
				"conditions", "validation", "enabled", "visible",
				"fail_message", "type", "message", "default", "resource_key", "focus_parameter_ref",
				"evaluate", "and", "or", "condition",
				"parameter_ref", "op", "parameter_2_ref", "value",
				"dataset_metadata", "fields", "name", "type", "metadata", "description", "measure", "modeling_role"
			];
			break;
		case "conditions_panels":
			jsonReplacer = [
				"conditions", "validation", "enabled", "visible", "parameter_refs", "group_refs",
				"fail_message", "type", "message", "default", "resource_key", "focus_parameter_ref",
				"evaluate", "and", "or", "condition",
				"parameter_ref", "op", "parameter_2_ref", "value"
			];
			break;
		case "custom":
			if (Array.isArray(custom)) {
				jsonReplacer = custom;
			}
			break;
		default:
		}

		return JSON.stringify(json, jsonReplacer, 2);
	}

	dropdownOptions(inOptions) {
		const options = [];
		for (const option of inOptions) {
			options.push({ id: option, text: option });
		}
		return options;
	}

	renderRightFlyoutButton(content) {
		let buttonText = "View in Flyout";
		if (this.state.showRightFlyout && content === this.state.rightFlyoutContent) {
			buttonText = "Close Flyout";
		}
		const openFlyoutButton = (<Button
			className="harness-properties-documentation-show-flyout-button"
			type="button"
			size="small"
			kind="secondary"
			onClick={() => this.setRightFlyoutState(content)}
		>
			{buttonText}
		</Button>);

		return openFlyoutButton;
	}

	render() {
		const dropMenu = (<div className="harness-conditions-documentation-menu">
			<Dropdown
				id="harness-conditions-documentation-menu-dropdown"
				label="Navigation"
				items={this.dropdownOptions([
					"Conditions",
					"SingleConditions",
					"--textfield",
					"--textarea",
					"--password",
					"--expression",
					"--numberfield",
					"--checkbox",
					"--checkboxset",
					"--radioset",
					"--oneofselect",
					"--someofselect",
					"--selectcolumn",
					"--selectcolumns",
					"--structuretable",
					"--structurelisteditor",
					"GroupConditions",
					"--visible",
					"--enabled",
					"--filteredEnum",
					"--filter",
					"PanelConditions",
					"--panels",
					"--textPanel",
					"--panelSelector",
					"--columnSelection",
					"--summaryPanel",
					"--twistyPanel"
				])}
				type="inline"
				onChange={this.onMenuDropdownSelect}
				itemToString={(item) => item.text }
			/>
		</div>);

		const navBar = (<div className="harness-properties-documentation-navbar-items">
			<nav>
				<ul className="harness-properties-documentation-navbar-items">
					<li className="harness-properties-documentation-navbar-li">
						<a id="harness-conditions-documentation-title">WDP Common Properties Conditions</a>
					</li>
					<li className="harness-properties-documentation-navbar-li nav-divider">
						<a onClick={() => this.onMenuDropdownSelect({ selectedItem: { id: "Conditions" } })}>Conditions</a>
					</li>
					<li className="harness-properties-documentation-navbar-li">
						<a onClick={() => this.onMenuDropdownSelect({ selectedItem: { id: "SingleConditions" } })}>Single Conditions</a>
					</li>
					<li className="harness-properties-documentation-navbar-li">
						<a onClick={() => this.onMenuDropdownSelect({ selectedItem: { id: "GroupConditions" } })}>Group Conditions</a>
					</li>
					<li className="harness-properties-documentation-navbar-li">
						<a onClick={() => this.onMenuDropdownSelect({ selectedItem: { id: "PanelConditions" } })}>Panel Conditions</a>
					</li>
				</ul>
				{dropMenu}
			</nav>
		</div>);

		const header = (<div id="main" className="harness-properties-documentation-section-header">
			<h1>WDP Common Properties Conditions</h1>
			<a className="harness-properties-documentation-page-link"
				href="https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/tree/master/canvas_modules/common-canvas"
				target="_blank"
			>
				Source Code
			</a>
		</div>);

		const contentIntro = (<section id="Intro">
			<h2 className="harness-properties-documentation-section-title">Introduction</h2>
			<div className="harness-section-description">
				<p>Conditions define a set of specifications for evaluating parameter values.
					The specifications support complex interdependency checking such as relationships
					between multiple parameters (i.e. valid values for parameter 1 depend upon the value of parameter 2).
					To create a condition for a control, create a JSON that adheres to the&nbsp;
				<a className="harness-properties-documentation-page-intro-link"
					href="https://github.ibm.com/NGP-TWC/wdp-pipeline-schemas/blob/master/common-pipeline/operators/conditions-documentation-v1-schema.json"
				>Conditions schema</a>, and add it to the conditions array in the parameter definition&nbsp;
				<a className="harness-properties-documentation-page-intro-link" href="https://github.ibm.com/NGP-TWC/wdp-pipeline-schemas/blob/master/common-canvas/parameter-defs/parameter-defs-v1-schema.json">
					parameter definition</a> JSON.
				</p>
				<p>
					Documentation on how to write Common Properties controls can be found <Link to="/properties" target="_blank">here</Link>.
				</p>
			</div>
		</section>);

		const tableConditionsHeader = [
			{ key: "Control", label: <div>Control<br /></div> },
			{ key: "empty", label: <div>isEmpty/<br />isNotEmpty</div> },
			{ key: "greaterLessThan", label: <div>greaterThan/<br />lessThan</div> },
			{ key: "equals", label: <div>equals/<br />notEquals</div> },
			{ key: "matches", label: <div>matches/<br />notMatches</div> },
			{ key: "contains", label: <div>contains/<br />notContains</div> },
			{ key: "colNotExists", label: <div>colNotExists</div> },
			{ key: "isDateTime", label: <div>isDateTime</div> },
			{ key: "dmTypeEquals", label: <div>dmTypeEquals</div> },
			{ key: "dmTypeNotEquals", label: <div>dmTypeNotEquals</div> },
			{ key: "dmMeasurementEquals", label: <div>dmMeasurementEquals</div> },
			{ key: "dmMeasurementNotEquals", label: <div>dmMeasurementNotEquals</div> },
			{ key: "dmRoleEquals", label: <div>dmMeasurementEquals</div> },
			{ key: "dmRoleNotEquals", label: <div>dmMeasurementNotEquals</div> }
		];

		const tableConditionsData = [
			{ Control: "checkbox (boolean)", empty: "no", greaterLessThan: "no", equals: "yes", contains: "no", matches: "no", colNotExists: "no", isDateTime: "no", dmTypeEquals: "no", dmTypeNotEquals: "no",
				dmMeasurementEquals: "no", dmMeasurementNotEquals: "no", dmRoleEquals: "no", dmRoleNotEquals: "no" },
			{ Control: "checkboxset ([string])", empty: "yes", greaterLessThan: "no", equals: "yes", contains: "yes", matches: "no", colNotExists: "no", isDateTime: "no", dmTypeEquals: "no", dmTypeNotEquals: "no",
				dmMeasurementEquals: "no", dmMeasurementNotEquals: "no", dmRoleEquals: "no", dmRoleNotEquals: "no" },
			{ Control: "expression (string)", empty: "yes", greaterLessThan: "no", equals: "yes", contains: "yes", matches: "yes", colNotExists: "no", isDateTime: "no", dmTypeEquals: "no", dmTypeNotEquals: "no",
				dmMeasurementEquals: "no", dmMeasurementNotEquals: "no", dmRoleEquals: "no", dmRoleNotEquals: "no" },
			{ Control: "numberfield (number)", empty: "yes", greaterLessThan: "yes", equals: "yes", contains: "no", matches: "no", colNotExists: "no", isDateTime: "no", dmTypeEquals: "no", dmTypeNotEquals: "no",
				dmMeasurementEquals: "no", dmMeasurementNotEquals: "no", dmRoleEquals: "no", dmRoleNotEquals: "no" },
			{ Control: "oneofselect (string)", empty: "yes", greaterLessThan: "no", equals: "yes", contains: "yes", matches: "yes", colNotExists: "no", isDateTime: "no", dmTypeEquals: "no", dmTypeNotEquals: "no",
				dmMeasurementEquals: "no", dmMeasurementNotEquals: "no", dmRoleEquals: "no", dmRoleNotEquals: "no" },
			{ Control: "timeField (time)", empty: "yes", greaterLessThan: "no", equals: "yes", contains: "yes", matches: "no", colNotExists: "no", isDateTime: "yes", dmTypeEquals: "no", dmTypeNotEquals: "no",
				dmMeasurementEquals: "no", dmMeasurementNotEquals: "no", dmRoleEquals: "no", dmRoleNotEquals: "no" },
			{ Control: "dateField (date)", empty: "yes", greaterLessThan: "no", equals: "yes", contains: "yes", matches: "no", colNotExists: "no", isDateTime: "yes", dmTypeEquals: "no", dmTypeNotEquals: "no",
				dmMeasurementEquals: "no", dmMeasurementNotEquals: "no", dmRoleEquals: "no", dmRoleNotEquals: "no" },
			{ Control: "password (string)", empty: "yes", greaterLessThan: "no", equals: "no", contains: "no", matches: "yes", colNotExists: "no", isDateTime: "no", dmTypeEquals: "no", dmTypeNotEquals: "no",
				dmMeasurementEquals: "no", dmMeasurementNotEquals: "no", dmRoleEquals: "no", dmRoleNotEquals: "no" },
			{ Control: "radioset (boolean|number|string)", empty: "yes", greaterLessThan: "no", equals: "yes", contains: "yes", matches: "no", colNotExists: "no", isDateTime: "no", dmTypeEquals: "no", dmTypeNotEquals: "no",
				dmMeasurementEquals: "no", dmMeasurementNotEquals: "no", dmRoleEquals: "no", dmRoleNotEquals: "no" },
			{ Control: "selectcolumn (string)", empty: "yes", greaterLessThan: "no", equals: "yes", contains: "yes", matches: "yes", colNotExists: "no", isDateTime: "no", dmTypeEquals: "yes", dmTypeNotEquals: "yes",
				dmMeasurementEquals: "yes", dmMeasurementNotEquals: "yes", dmRoleEquals: "yes", dmRoleNotEquals: "yes" },
			{ Control: "selectcolumns  ([string])", empty: "yes", greaterLessThan: "no", equals: "yes", contains: "yes", matches: "no", colNotExists: "no", isDateTime: "no", dmTypeEquals: "yes", dmTypeNotEquals: "yes",
				dmMeasurementEquals: "yes", dmMeasurementNotEquals: "yes", dmRoleEquals: "yes", dmRoleNotEquals: "yes" },
			{ Control: "someofselect ([string])", empty: "yes", greaterLessThan: "no", equals: "yes", contains: "yes", matches: "no", colNotExists: "no", isDateTime: "no", dmTypeEquals: "no", dmTypeNotEquals: "no",
				dmMeasurementEquals: "no", dmMeasurementNotEquals: "no", dmRoleEquals: "no", dmRoleNotEquals: "no" },
			{ Control: "textarea (string/[string])", empty: "yes", greaterLessThan: "no", equals: "yes", contains: "yes", matches: "no", colNotExists: "no", isDateTime: "no", dmTypeEquals: "no", dmTypeNotEquals: "no",
				dmMeasurementEquals: "no", dmMeasurementNotEquals: "no", dmRoleEquals: "no", dmRoleNotEquals: "no" },
			{ Control: "textfield (string)", empty: "yes", greaterLessThan: "no", equals: "yes", contains: "yes", matches: "yes", colNotExists: "yes", isDateTime: "no", dmTypeEquals: "no", dmTypeNotEquals: "no",
				dmMeasurementEquals: "no", dmMeasurementNotEquals: "no", dmRoleEquals: "no", dmRoleNotEquals: "no" },
			{ Control: "structure-list-editor ([[string]])", empty: "yes", greaterLessThan: "no", equals: "no", contains: "no", matches: "no", colNotExists: "no", isDateTime: "no", dmTypeEquals: "no", dmTypeNotEquals: "no",
				dmMeasurementEquals: "no", dmMeasurementNotEquals: "no", dmRoleEquals: "no", dmRoleNotEquals: "no" },
			{ Control: "structuretable ([[primitive]])", empty: "yes", greaterLessThan: "no", equals: "no", contains: "no", matches: "no", colNotExists: "no", isDateTime: "no", dmTypeEquals: "no", dmTypeNotEquals: "no",
				dmMeasurementEquals: "no", dmMeasurementNotEquals: "no", dmRoleEquals: "no", dmRoleNotEquals: "no" }
		];

		const tableConditionsDataTypeHeader = [
			{ key: "Conditions", label: "Conditions" },
			{ key: "boolean", label: "boolean" },
			{ key: "string", label: "string" },
			{ key: "number", label: "number" },
			{ key: "date_time", label: "date/time" },
			{ key: "stringArray", label: "[string]" },
			{ key: "doubleArray", label: "[[primitive]]" }
		];

		const tableConditionsDataTypeData = [
			{ Conditions: "isEmpty/isNotEmpty", boolean: "yes", string: "yes", number: "yes", date_time: "yes", stringArray: "yes", doubleArray: "yes" },
			{ Conditions: "greaterThan/lessThan", boolean: "no", string: "yes", number: "yes", date_time: "no", stringArray: "no", doubleArray: "no" },
			{ Conditions: "equals/notEquals", boolean: "yes", string: "yes", number: "yes", date_time: "yes", stringArray: "yes", doubleArray: "no" },
			{ Conditions: "matches/notMatches", boolean: "no", string: "yes", number: "no", date_time: "no", stringArray: "no", doubleArray: "no" },
			{ Conditions: "contains/notContains", boolean: "no", string: "yes", number: "no", date_time: "yes", stringArray: "yes", doubleArray: "no" },
			{ Conditions: "colNotExists", boolean: "no", string: "yes", number: "no", date_time: "no", stringArray: "no", doubleArray: "no" },
			{ Conditions: "isDateTime", boolean: "no", string: "no", number: "no", date_time: "yes", stringArray: "no", doubleArray: "no" },
			{ Conditions: "dmTypeEquals/dmTypeNotEquals", boolean: "no", string: "yes", number: "no", date_time: "no", stringArray: "yes", doubleArray: "no" },
			{ Conditions: "dmMeasurementEquals/dmMeasurementNotEquals", boolean: "no", string: "yes", number: "no", date_time: "no", stringArray: "yes", doubleArray: "no" },
			{ Conditions: "dmRoleEquals/dmRoleNotEquals", boolean: "no", string: "yes", number: "no", date_time: "no", stringArray: "yes", doubleArray: "no" }

		];

		const contentConditions = (<section id="Conditions" className="section conditions-documentation-content-overview-section">
			<h2 className="harness-properties-documentation-section-title">Conditions</h2>
			<div className="harness-section-description">
				<p>There are five types of condition:</p>
				<ul>
					<li>visible: Hide controls if evaluates to false.</li>
					<li>enabled: Disable controls if evaluates to false.</li>
					<li>validation: The fail_message is displayed upon validation failure.</li>
					<li>filter: Filters fields from datarecord-metadata.</li>
					<li>enum_filter: Conditionally sets enumeration values.</li>
				</ul>
			</div>
			<div className="harness-section-description">
				<p>Validations for conditions are triggered after a user modifies the value of a control. No errors or warnings
					will be shown when the controls are first presented to the user.
				<br />
					All <span className="harness-highlight">visible</span> conditions will be evaluated first, followed by&nbsp;
				<span className="harness-highlight">enabled</span> and <span className="harness-highlight">validation</span> conditions.
					Within each category, conditions will be evaluated in the order in which they are passed into the conditions array.
					If there are multiple conditions for a control, empty or null checks should come before other conditions
					for that control. If a control has both single and group conditions, group conditions should be placed
					before single conditions in the array.
				<br />
					A condition fails if it evaluates to false. For validations, an error or warning will be shown to indicate that the
					user input did not pass the test. <br /> Below is a table that describes which conditions each control supports.
				</p>
				<div className="harness-conditions-documentation-control-table-container" id="conditions-documentation-conditions-supported-table">
					<Table className="table harness-conditions-documentation-control-table"
						sortable={["Control"]}
						columns={tableConditionsHeader}
						data={tableConditionsData}
					/>
				</div>
				<p>Another way of understanding the above table is by looking at the data type that a
					control handles and map it to the supported conditions.
				</p>
				<div className="harness-conditions-documentation-control-table-container">
					<Table className="table harness-conditions-documentation-control-table"
						sortable={["Conditions"]}
						columns={tableConditionsDataTypeHeader}
						data={tableConditionsDataTypeData}
					/>
				</div>
				<p>Ensure the condition is accurate by verifying that the data type of the control is the same as the data type of the value.
					A textfield control of type string cannot be compared to a value of type number.
				</p>
				<p>The <span className="harness-highlight">isDateTime</span> operator is a special case operator. It is used to
					validate the format of a <span className="harness-highlight">date</span> or <span className="harness-highlight">time</span> control.  A validation
					definition using the <span className="harness-highlight">isDateTime</span> operator is automatically generated
					for a <span className="harness-highlight">date</span> and <span className="harness-highlight">time</span> control.
				</p>
				<p>The <span className="harness-highlight">matches/noMatches</span> operator will compare a string value against a regular expression. The string value
				is in the first parameter value.  The second value or parameter is a regular expression string.  The regular expression string should not be bracketed
				with "/".  For example, a regular expression to match a string that starts with the character "g" should be specified as <span className="harness-highlight">"^g"</span>.
				</p>
			</div>
		</section>);

		const contentSingleConditions = (<section id="SingleConditions" className="section conditions-documentation-content-single-section">
			<h2 className="harness-properties-documentation-section-title">Single Conditions</h2>
			<div className="harness-section-description">
				<p>Single conditions validate the user's input from one control.
					Only the <span className="harness-highlight">validation</span> condition type is supported in single conditions.
				</p>
			</div>
			<div className="harness-properties-documentation-section-content">
				<div className="harness-conditions-documentation-panels-controls-component">
					<h3 id="--textfield" className="harness-section-subtitle">textfield</h3>
					<p>A text field control is of type <span className="harness-highlight">string</span>, which supports all the
						conditions except for <span className="harness-highlight">greaterThan</span> and <span className="harness-highlight">lessThan</span>.
						The following is an example of a <span className="harness-highlight">validation</span> condition that checks if the user input
						contains a single or double quote.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={TEXTFIELD_ERROR_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							<p>Below is an example of a textfield control that has a condition
								of <span className="harness-highlight">type: warning</span> instead of <span className="harness-highlight">error</span>.
							</p>
							<CommonProperties
								propertiesInfo={TEXTFIELD_WARNING_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(TEXTFIELD_ERROR_PROPS_INFO.parameterDef, "conditions")}
							</pre>
						</div>
					</div>
					<p>The <span className="harness-highlight">colNotExists</span> condition will validate the user's input against
						the list of column names that are specified in the dataset_metadata. If the name already exists, the
						test fails and the <span className="harness-highlight">fail_message</span> will be displayed.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={TEXTFIELD_COLNOTEXISTS_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(TEXTFIELD_COLNOTEXISTS_PROPS_INFO.parameterDef, "conditions_dataset")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-conditions-documentation-panels-controls-component">
					<h3 id="--textarea" className="harness-section-subtitle">textarea</h3>
					<p>Since the textarea control is of type <span className="harness-highlight">[string]</span>,
						the <span className="harness-highlight">equals</span> and <span className="harness-highlight">notEquals</span> conditions
						compare the entire array as is. The order, value, and data type of the elements in the array will need to
						match the user's input exactly.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={TEXTAREA_ERROR_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(TEXTAREA_ERROR_PROPS_INFO.parameterDef, "conditions")}
							</pre>
						</div>
					</div>
					<p>The below example of a <span className="harness-highlight">isNotEmpty</span> condition, which can also be accomplished
						using the <span className="harness-highlight">notEquals</span> condition with <span className="harness-highlight">value</span> [].
						Evaluate will return false for both conditions if the text area is empty.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={TEXTAREA_WARNING_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(TEXTAREA_WARNING_PROPS_INFO.parameterDef, "conditions")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-conditions-documentation-panels-controls-component">
					<h3 id="--password" className="harness-section-subtitle">password</h3>
					<p>Although a passwordfield control is of type <span className="harness-highlight">string</span>, it only supports
						the conditions <span className="harness-highlight">isEmpty</span> and <span className="harness-highlight">isNotEmpty</span>.
						If non-supported conditions are specified for this control, a warning will be thrown in the console and the
						condition check will be ignored.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={PASSWORD_FIELD_ERROR_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(PASSWORD_FIELD_ERROR_PROPS_INFO.parameterDef, "conditions")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-conditions-documentation-panels-controls-component">
					<h3 id="--expression" className="harness-section-subtitle">expression</h3>
					<p>An expression control is of type <span className="harness-highlight">string</span> that can span
						multiple lines, represented by a newline character (\n) in the string returned.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={EXPRESSION_ERROR_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							<p>Below is an example of a expression control that will show a warning if the input
								field fails the <span className="harness-highlight">isNotEmpty</span> condition.
							</p>
							<CommonProperties
								propertiesInfo={EXPRESSION_WARNING_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
						</div>
						<div id="harness-expression-section-column-code" className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(EXPRESSION_ERROR_PROPS_INFO.parameterDef, "conditions")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-conditions-documentation-panels-controls-component">
					<h3 id="--numberfield" className="harness-section-subtitle">numberfield</h3>
					<p>A numberfield control is of type <span className="harness-highlight">number</span>. The following example
						shows a nested condition.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={NUMBERFIELD_ERROR_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(NUMBERFIELD_ERROR_PROPS_INFO.parameterDef, "conditions")}
							</pre>
						</div>
					</div>
					<p>If a numberfield control is empty, it will return <span className="harness-highlight">null</span>.
						The <span className="harness-highlight">isEmpty</span> and <span className="harness-highlight">isNotEmpty</span> conditions
						for a numberfield control will be compared to <span className="harness-highlight">null</span>. Similarly,
						using <span className="harness-highlight">equals</span> condition to check for <span className="harness-highlight">null</span> will
						also have the same result.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={NUMBERFIELD_GENERATOR_WARNING_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(NUMBERFIELD_GENERATOR_WARNING_PROPS_INFO.parameterDef, "conditions")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-conditions-documentation-panels-controls-component">
					<h3 id="--checkbox" className="harness-section-subtitle">checkbox</h3>
					<p>A checkbox control is of type <span className="harness-highlight">boolean</span>.
						To check whether it’s checked &nbsp;
					<span className="harness-highlight">equals/notEquals</span> can be used.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={CHECKBOX_SINGLE_ERROR_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(CHECKBOX_SINGLE_ERROR_PROPS_INFO.parameterDef, "conditions")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-conditions-documentation-panels-controls-component">
					<h3 id="--checkboxset" className="harness-section-subtitle">checkboxset</h3>
					<p>The checkboxset control is of type <span className="harness-highlight">[string]</span>.
						The below example will show an error if both integer and string are selected. This can be
						achieved by using the <span className="harness-highlight">notContains</span> condition in
						an array of <span className="harness-highlight">or</span> conditions.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={CHECKBOX_SET_ERROR_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(CHECKBOX_SET_ERROR_PROPS_INFO.parameterDef, "conditions")}
							</pre>
						</div>
					</div>
					<p>The below example shows a warning for the same check as above where the condition
						fails if both integer and string are selected. Instead of using <span className="harness-highlight">notContains</span>,
						the same can be acheived using <span className="harness-highlight">notEquals</span>. Note that the order
						of the elements in the <span className="harness-highlight">value</span> array matters and must match the order selected in the UI.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={CHECKBOX_SET_WARNING_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(CHECKBOX_SET_WARNING_PROPS_INFO.parameterDef, "conditions")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-conditions-documentation-panels-controls-component">
					<h3 id="--radioset" className="harness-section-subtitle">radioset</h3>
					<p> A radio set is of type <span className="harness-highlight">string</span>.
						The <span className="harness-highlight">equals</span> and <span className="harness-highlight">notEquals</span> conditions
						will compare the string to the exact value given. The below example will show an error if the first
						option <span className="harness-highlight">red</span> is selected.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={RADIOSET_HORIZONTAL_ERROR_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(RADIOSET_HORIZONTAL_ERROR_PROPS_INFO.parameterDef, "conditions")}
							</pre>
						</div>
					</div>
					<p>Using the <span className="harness-highlight">contains</span> or <span className="harness-highlight">notContains</span> condition
						on a <span className="harness-highlight">string</span> will check if the user's input contain the substring of the given value.
						The below example will show a warning if either options <span className="harness-highlight">red</span> or <span className="harness-highlight">red-orange</span> is selected.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={RADIOSET_VERTICAL_WARNING_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(RADIOSET_VERTICAL_WARNING_PROPS_INFO.parameterDef, "conditions",
									["uihints", "default", "id",
										"parameter_info",
										"parameter_ref", "label",
										"description",
										"orientation"
									])}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-conditions-documentation-panels-controls-component">
					<h3 id="--oneofselect" className="harness-section-subtitle">oneofselect</h3>
					<p>The oneofselect control is of type <span className="harness-highlight">string</span>.
						Conditions for oneofselect are very similar to a <a className="harness-properties-documentation-page-intro-link" href="#/conditions#--radioset">
						radioset</a> control. When the radioset control does not have a default value, the control
						will show a <span className="harness-highlight">Select...</span> option. With no default value,
						a <span className="harness-highlight">isNotEmpty</span> condition can be used to verify an option is selected.
						To show the error message in the example, click on the dropdown twice to open and close.
						Once a value is selected, the oneofselect can’t be unset again and will always be not empty.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={ONEOFSELECT_ERROR_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(ONEOFSELECT_ERROR_PROPS_INFO.parameterDef, "conditions")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-conditions-documentation-panels-controls-component">
					<h3 id="--someofselect" className="harness-section-subtitle">someofselect</h3>
					<p>A someofselect control is of type <span className="harness-highlight">[string]</span>.
						The below example will show an error if no values are selected.
						To unselect an item, press Ctrl/Cmd and click on the item.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={SOMEOFSELECT_ERROR_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(SOMEOFSELECT_ERROR_PROPS_INFO.parameterDef, "conditions")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-conditions-documentation-panels-controls-component">
					<h3 id="--selectcolumn" className="harness-section-subtitle">selectcolumn</h3>
					<p>A selectcolumn control is of type <span className="harness-highlight">string</span>. The conditions supported
						for this control are the same as <a className="harness-properties-documentation-page-intro-link" href="#/conditions#--oneofselect">
						oneofselect</a>. The difference is that the <span className="harness-highlight">value</span> the conditions compared to
						must be defined in the <span className="harness-highlight">dataset_metadata</span>.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={SELECTCOLUMN_ERROR_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(SELECTCOLUMN_ERROR_PROPS_INFO.parameterDef, "conditions_dataset")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-conditions-documentation-panels-controls-component">
					<h3 id="--selectcolumns" className="harness-section-subtitle">selectcolumns</h3>
					<p>Similar to the <a className="harness-properties-documentation-page-intro-link" href="#/conditions#--someofselect">
						someofselect</a> control, the selectcolumns control is also of type <span className="harness-highlight">[string]</span>.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={SELECTCOLUMNS_ERROR_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(SELECTCOLUMNS_ERROR_PROPS_INFO.parameterDef, "conditions")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-conditions-documentation-panels-controls-component">
					<h3 id="--structuretable" className="harness-section-subtitle">structuretable</h3>
					<p>A structuretable is a complex type control of type <span className="harness-highlight">[[primitive]]</span>.
						Tables support the <span className="harness-highlight">isEmpty</span> and <span className="harness-highlight">isNotEmpty</span> conditions.
						Other conditions are evaluated at the cell level.
						Refer to the <a className="harness-properties-documentation-page-intro-link" href="#/conditions#conditions-documentation-conditions-supported-table">table</a> above
						on what conditions each control supports.
					<br />
						The following is an example illustrating the use of these conditions in a structuretable. The structure table
						will display an error if no rows are selected.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={STRUCTURETABLE_ERROR_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							<p>Noticed that in the subpanel, a warning will be shown when a number outside of the range 0 and 130 is entered.
								Subpanel conditions are supported and are defined at the table cell level.
							</p>
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(STRUCTURETABLE_ERROR_PROPS_INFO.parameterDef, "conditions")}
							</pre>
						</div>
					</div>
					<p>This next example illustrate how to use the <span className="harness-highlight">colNotExists</span> condition in a structuretable control.
						The complex type control must be of type <span className="harness-highlight">map[]</span> instead of <span className="harness-highlight">array[]</span>.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={STRUCTURETABLE_COLNOTEXISTS_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							<p>In a map, the <span className="harness-highlight">key</span> field will be compared to the user's input for a <span className="harness-highlight">colNotExists</span>.
								If the user's input is the same as the <span className="harness-highlight">key</span> field, no error or warning will be shown. If the user's
								input is not the same as the <span className="harness-highlight">key</span> field and a field in the dataset_metadata already contains the same value,
								an error or warning will be thrown.
							</p>
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(STRUCTURETABLE_COLNOTEXISTS_PROPS_INFO.parameterDef, "conditions_dataset_parameters")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-conditions-documentation-panels-controls-component">
					<h3 id="--structurelisteditor" className="harness-section-subtitle">structurelisteditor</h3>
					<p>The structurelisteditor control is of type <span className="harness-highlight">[[string]]</span>.
						Although this is a complex type control, the <span className="harness-highlight">colNotExists</span> and&nbsp;
					<span className="harness-highlight">cellNotEmpty</span> conditions are not supported for this control because
						structurelisteditor does not support map structures. Other supported conditions for this control behave
						the same as a <a className="harness-properties-documentation-page-intro-link" href="#/conditions#--structuretable">structuretable</a> control.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={STRUCTURELISTEDITOR_ERROR_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(STRUCTURELISTEDITOR_ERROR_PROPS_INFO.parameterDef, "conditions")}
							</pre>
						</div>
					</div>
					<p>The following example shows a warning when the table is empty. There are also subpanel conditions
						to verify the name field <span className="harness-highlight">isNotEmpty</span> and the description field
						does <span className="harness-highlight">notContains</span> &lt; and &gt;.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={STRUCTURELISTEDITOR_WARNING_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(STRUCTURELISTEDITOR_WARNING_PROPS_INFO.parameterDef, "conditions")}
							</pre>
						</div>
					</div>
				</div>
			</div>
		</section>);

		const contentGroupConditions = (<section id="GroupConditions" className="section conditions-documentation-content-group-section">
			<h2 className="harness-properties-documentation-section-title">Group Conditions</h2>
			<div className="harness-section-description">
				<p>Group conditions validate the user's input from two controls. The following conditions are supported in group validations:
					<ul>
						<li>greaterThan/lessThan</li>
						<li>equals/notEquals</li>
						<li>contains/notContains</li>
					</ul>
					The condition will be evaluated if both
					controls are the same data type. For example, a textfield control will not be able to validate against a numberfield control.
					If a group condition fails, the same <span className="harness-highlight">fail_message</span> will be shown on the control value
					in the <span className="harness-highlight">focus_parameter_ref</span> field.
					&nbsp;
					If the missing input is from the <span className="harness-highlight">parameter_ref</span> control, an internal error will be shown.
					If the missing input is from the <span className="harness-highlight">parameter_2_ref</span> control, an internal warning will be shown.
				</p>
				<p>
					To reiterate, all <span className="harness-highlight">visible</span> conditions will be evaluated first, followed by&nbsp;
					<span className="harness-highlight">enabled</span> and <span className="harness-highlight">validation</span> conditions.
					Within each category, conditions will be evaluated in the order in which they are passed into the conditions array.
					If there are multiple conditions for a control, empty or null checks should come before other conditions for that control.
					If a control has both single and group conditions, group conditions should be placed before single conditions in the array.
				</p>
			</div>
			<div className="harness-properties-documentation-section-content">
				<div className="harness-conditions-documentation-panels-controls-component">
					<h3 id="--group_validation_conditions" className="harness-section-subtitle">Validation Conditions</h3>
					<p>The following example shows a group condition for two textfield controls. If the value from both controls
						are equal, an error will be shown. Notice the different error and warning
						messages shown if either field is empty.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={STRING_GROUP_ERROR_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(STRING_GROUP_ERROR_PROPS_INFO.parameterDef, "conditions")}
							</pre>
						</div>
					</div>
					<p>In this next example, a warning will be shown if the First Name field is empty or Last Name field contains the First Name.</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={STRING_GROUP_WARNING_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(STRING_GROUP_WARNING_PROPS_INFO.parameterDef, "conditions")}
							</pre>
						</div>
					</div>
					<p>The example below will show an error if the lower limit number is equal or greater than the upper limit.</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={NUMBER_GROUP_ERROR_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(NUMBER_GROUP_ERROR_PROPS_INFO.parameterDef, "conditions")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-conditions-documentation-panels-controls-component">
					<h3 id="--visible" className="harness-section-subtitle">Visible Conditions</h3>
					<p>Up until now, all the examples shown are using <span className="harness-highlight">validation</span> condition type.
						With <span className="harness-highlight">visible</span> conditions, the value of a control can be used to
						determine if other controls should be visible or not. Use <span className="harness-highlight">action_refs</span> to
						determine the visibility of action buttons or images.<br />
						The following example will show hidden controls by checking the "Advanced options" checkbox.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={VISIBLE_GROUP_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(VISIBLE_GROUP_PROPS_INFO.parameterDef, "custom", [
									"conditions", "visible",
									"parameter_refs", "textfieldControlName2", "radiosetColor",
									"evaluate", "and", "or", "condition",
									"parameter_ref", "op", "parameter_2_ref", "value"
								])}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-conditions-documentation-panels-controls-component">
					<h3 id="--enabled" className="harness-section-subtitle">Enabled Conditions</h3>
					<p>Similar to <a className="harness-properties-documentation-page-intro-link" href="#/conditions#--visible">
						visible</a> conditions, the <span className="harness-highlight">enabled</span> condition will disable and enable
						controls.  Use <span className="harness-highlight">action_refs</span> to
						determine the enablement of action buttons or images.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={ENABLED_GROUP_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(ENABLED_GROUP_PROPS_INFO.parameterDef, "custom", [
									"conditions", "enabled",
									"parameter_refs", "textfieldControlName2", "radiosetColor",
									"evaluate", "and", "or", "condition",
									"parameter_ref", "op", "parameter_2_ref", "value"
								])}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-conditions-documentation-panels-controls-component">
					<h3 id="--filteredEnum" className="harness-section-subtitle">Filtered Enumeration Conditions</h3>
					<p>The <span className="harness-highlight">enum_filter</span> condition operates upon controls
						whose parameter is backed by an enumerated list of options. This includes radiosets
						and droplist controls. When the condition is true, enum_filter conditions allow authors
						to dynamically filter the available enumeration options based upon the state of other parameters.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={ENUM_FILTER_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(ENUM_FILTER_INFO.parameterDef, "custom", [
									"conditions", "enum_filter", "target",
									"parameter_ref", "radioset_filtered", "values",
									"red", "yellow", "green",
									"evaluate", "and", "or", "condition",
									"parameter_ref", "op", "value"
								])}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-conditions-documentation-panels-controls-component">
					<h3 id="--filter" className="harness-section-subtitle">Filter Conditions</h3>
					<p>The <span className="harness-highlight">filter</span> condition operates upon controls
						whose parameter is backed by a schema(s). The filter will determine which values are
						included in the dropdown or field picker.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={FILTER_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(FILTER_INFO.parameterDef, "custom", [
									"conditions", "filter", "parameter_ref", "evaluate", "and", "or", "condition",
									"parameter_ref", "op", "value"
								])}
							</pre>
						</div>
					</div>
				</div>
			</div>
		</section>);

		const contentPanelConditions = (<section id="PanelConditions" className="section conditions-documentation-content-panel-section">
			<h2 className="harness-properties-documentation-section-title">Panel Conditions</h2>
			<div className="harness-section-description">
				<p><span className="harness-highlight">visible</span> and <span className="harness-highlight">enabled</span> conditions are support in panels.
					Panel conditions are evaluated against parameters and not panels.
				</p>
			</div>
			<div className="harness-properties-documentation-section-content">
				<div className="harness-conditions-documentation-panels-controls-component">
					<h3 id="--panels" className="harness-section-subtitle">Panels</h3>
					<p>Controls and panels can be nested within panels. To disable or hide a panel and all of its
						children panels and controls, set a condition on the group <span className="harness-highlight">id</span> in <span className="harness-highlight">group_refs</span>.
						The following example shows how to disable or hide a panel at different nested levels.
					</p>
					<p>Limitation: Combinations of disabling or hiding nested panels may have unexpected results if nested more than two levels deep.</p>
					<p>The disable and hide checkboxes also have conditions to disable the other since only one of these conditions
						may be set on a panel at a time.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={PANELS_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(PANELS_FLYOUT_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(PANELS_PROPS_INFO.parameterDef, "conditions_panels")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-conditions-documentation-panels-controls-component">
					<h3 id="--textPanel" className="harness-section-subtitle">TextPanels</h3>
					<p>Disabled text panels will be grayed out.</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={TEXT_PANEL_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(TEXT_PANEL_FLYOUT_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(TEXT_PANEL_PROPS_INFO.parameterDef, "conditions_panels")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-conditions-documentation-panels-controls-component">
					<h3 id="--panelSelector" className="harness-section-subtitle">PanelSelector</h3>
					<p>PanelSelector conditions will disable or hide the selector control as well
						as the panels that are shown. The example below shows how to apply a condition on
						both group_refs and parameter_refs.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={PANEL_SELECTOR_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(PANEL_SELECTOR_FLYOUT_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(PANEL_SELECTOR_PROPS_INFO.parameterDef, "conditions_panels")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-conditions-documentation-panels-controls-component">
					<h3 id="--columnSelection" className="harness-section-subtitle">ColumnSelection</h3>
					<p>All controls under the columnSelection panel will be disabled or hidden.</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={COLUMNSELECTION_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(COLUMNSELECTION_FLYOUT_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(COLUMNSELECTION_PROPS_INFO.parameterDef, "conditions_panels")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-conditions-documentation-panels-controls-component">
					<h3 id="--summaryPanel" className="harness-section-subtitle">SummaryPanel</h3>
					<p>In a modal dialog, all controls under the summaryPanel panel will be disabled or hidden.
						In a flyout, the summary link will be disabled and the summary tables will not be shown.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={SUMMARY_PANEL_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(SUMMARY_PANEL_FLYOUT_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(SUMMARY_PANEL_PROPS_INFO.parameterDef, "conditions_panels")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-conditions-documentation-panels-controls-component">
					<h3 id="--twistyPanel" className="harness-section-subtitle">TwistyPanel</h3>
					<p>A twistyPanel will be disabled or hidden in its current state, whether the twisty panel is opened or closed.</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={TWISTY_PANEL_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(TWISTY_PANEL_FLYOUT_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(TWISTY_PANEL_PROPS_INFO.parameterDef, "conditions_panels")}
							</pre>
						</div>
					</div>
				</div>
			</div>
		</section>);

		const content = (<div className="harness-conditions-documentation-content">
			{contentIntro}
			{contentConditions}
			{contentSingleConditions}
			{contentGroupConditions}
			{contentPanelConditions}
		</div>);

		let rightFlyoutWidth = "0px";
		let rightFlyout = (<div className="right-flyout-panel" style={{ width: rightFlyoutWidth }} />);
		if (this.state.showRightFlyout) {
			rightFlyoutWidth = "318px";
			rightFlyout = (<div className="right-flyout-panel" style={{ width: rightFlyoutWidth }}>
				<CommonProperties
					propertiesInfo={this.state.rightFlyoutContent}
					propertiesConfig={{ containerType: "Custom", rightFlyout: true }}
				/>);
			</div>);
		}

		return (
			<div className="harness-conditions-documentation-container">
				{navBar}
				<div className="harness-conditions-documentation-container-main-content" style={{ width: "calc(100% - " + rightFlyoutWidth + " )" }}>
					{header}
					{content}
				</div>
				{rightFlyout}
			</div>
		);
	}
}

export default CommonPropertiesComponents;
