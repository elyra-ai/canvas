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
/* eslint max-len: ["error", 200] */

import React from "react";
import { Link } from "react-router-dom";
import { Dropdown, Button } from "carbon-components-react";
import FunctionList from "../constants/json/functionlist.json";
import {
	CONTAINERS_RIGHT_FLYOUT_PROPERTIES,
	CONTAINERS_RIGHT_FLYOUT_PROPERTIES_CONFIG,
	CONTAINERS_RIGHT_FLYOUT_PROPERTIES_INFO,
	CONTAINERS_RIGHT_FLYOUT_CANVAS,
	CONTROLS_PROPS_INFO,
	TABS_PROPS_INFO,
	SUBTABS_PROPS_INFO,
	PANELS_PROPS_INFO,
	PANEL_SELECTOR_PROPS_INFO,
	PANEL_SELECTOR_INSERT_PROPS_INFO,
	SUMMARY_PANEL_PROPS_INFO,
	TWISTY_PANEL_PROPS_INFO,
	COLUMNSELECTION_PROPS_INFO,
	TEXT_PANEL_PROPS_INFO,
	TEXTFIELD_PROPS_INFO,
	TEXTAREA_PROPS_INFO,
	PASSWORD_FIELD_PROPS_INFO,
	EXPRESSION_PROPS_INFO,
	READONLY_PROPS_INFO,
	NUMBERFIELD_PROPS_INFO,
	NUMBERFIELD_GENERATOR_PROPS_INFO,
	DATEFIELD_PROPS_INFO,
	TIMEFIELD_PROPS_INFO,
	SPINNER_PROPS_INFO,
	CHECKBOX_SINGLE_PROPS_INFO,
	CHECKBOX_SET_PROPS_INFO,
	RADIOSET_HORIZONTAL_PROPS_INFO,
	RADIOSET_VERTICAL_PROPS_INFO,
	ONEOFSELECT_PROPS_INFO,
	FORCED_RADIOSET_PROPS_INFO,
	SOMEOFSELECT_PROPS_INFO,
	FORCED_CHECKBOX_SET_PROPS_INFO,
	SELECTSCHEMA_PROPS_INFO,
	SELECTCOLUMN_PROPS_INFO,
	SELECTCOLUMN_MULTI_INPUT_PROPS_INFO,
	SELECTCOLUMNS_PROPS_INFO,
	SELECTCOLUMNS_MULTI_INPUT_PROPS_INFO,
	TOGGLETEXT_PROPS_INFO,
	TOGGLETEXTICONS_PROPS_INFO,
	STRUCTURETABLE_INLINE_TOGGLE_PROPS_INFO,
	STRUCTURETABLE_INLINE_TEXTFIELD_PROPS_INFO,
	STRUCTURETABLE_INLINE_DROPDOWN_PROPS_INFO,
	STRUCTURETABLE_SUBPANEL_TEXTFIELD_PROPS_INFO,
	STRUCTURETABLE_ONPANEL_EXPRESSION_PROPS_INFO,
	STRUCTURETABLE_ROW_SELECTION_PROPS_INFO,
	STRUCTURELISTEDITOR_PROPS_INFO,
	STRUCTURELISTEDITOR_ADDREMOVEROWS_PROPS_INFO,
	STRUCTURETABLE_MOVEABLE_PROPS_INFO,
	STRUCTURETABLE_SORTABLE_PROPS_INFO,
	STRUCTURETABLE_FILTERABLE_PROPS_INFO,
	SUMMARY_PROPS_INFO,
	STRUCTURETABLE_GENERATED_VALUES_PROPS_INFO,
	STRUCTURETABLE_GENERATED_VALUES_DEFAULT_PROPS_INFO,
	ACTION_PROPS_INFO,
	ACTION_IMAGE_PROPS_INFO
} from "../constants/properties-documentation-constants.js";
import { CommonProperties } from "common-canvas";

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
		this.setRightFlyoutState = this.setRightFlyoutState.bind(this);

		this.actionHandler = this.actionHandler.bind(this);
		this.controllerHandler = this.controllerHandler.bind(this);

		this.flyoutActionHandler = this.flyoutActionHandler.bind(this);
		this.flyoutControllerHandler = this.flyoutControllerHandler.bind(this);

		this.twistyActionHandler = this.twistyActionHandler.bind(this);
		this.twistyControllerHandler = this.twistyControllerHandler.bind(this);

	}

	componentDidMount() {
		// https://github.com/ReactTraining/react-router/issues/394
		window.location.hash = window.decodeURIComponent(window.location.hash);
		const scrollToAnchor = () => {
			if (window.location.hash === "#/properties") {
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
		location.href = `${"#/properties#" + obj.selectedItem.id}`;
		document.querySelector(`#${obj.selectedItem.id}`).scrollIntoView();
	}

	setRightFlyoutState(content) {
		this.setState({
			showRightFlyout: content !== this.state.rightFlyoutContent ||
				(content === this.state.rightFlyoutContent && !this.state.showRightFlyout),
			rightFlyoutContent: content
		});
	}
	controllerHandler(propertiesController) {
		this.propertiesController = propertiesController;
	}

	flyoutControllerHandler(propertiesController) {
		this.flyoutController = propertiesController;
	}

	twistyControllerHandler(propertiesController) {
		this.twistyPropertiesController = propertiesController;
	}

	actionHandler(actionId, appData, data) {
		if (actionId === "increment") {
			const propertyId = { name: data.parameter_ref };
			let value = this.propertiesController.getPropertyValue(propertyId);
			this.propertiesController.updatePropertyValue(propertyId, value += 1);
		}
		if (actionId === "decrement") {
			const propertyId = { name: data.parameter_ref };
			let value = this.propertiesController.getPropertyValue(propertyId);
			this.propertiesController.updatePropertyValue(propertyId, value -= 1);
		}
		if (actionId === "moon") {
			const propertyId = { name: data.parameter_ref };
			let value = this.propertiesController.getPropertyValue(propertyId);
			switch (value) {
			case "Full" :
				value = "Waning";
				break;
			case "Waning" :
				value = "New";
				break;
			case "New" :
				value = "Waxing";
				break;
			default:
				value = "Full";
			}
			this.propertiesController.updatePropertyValue(propertyId, value);
		}

	}

	twistyActionHandler(actionId, appData, data) {
		if (actionId === "increment") {
			const propertyId = { name: data.parameter_ref };
			let value = this.twistyPropertiesController.getPropertyValue(propertyId);
			this.twistyPropertiesController.updatePropertyValue(propertyId, value += 1);
		}
	}

	flyoutActionHandler(actionId, appData, data) {
		if (actionId === "increment") {
			const propertyId = { name: data.parameter_ref };
			let value = this.flyoutController.getPropertyValue(propertyId);
			this.flyoutController.updatePropertyValue(propertyId, value += 1);
		}
		if (actionId === "decrement") {
			const propertyId = { name: data.parameter_ref };
			let value = this.flyoutController.getPropertyValue(propertyId);
			this.flyoutController.updatePropertyValue(propertyId, value -= 1);
		}
		if (actionId === "moon") {
			const propertyId = { name: data.parameter_ref };
			let value = this.flyoutController.getPropertyValue(propertyId);
			switch (value) {
			case "Full" :
				value = "Waning";
				break;
			case "Waning" :
				value = "New";
				break;
			case "New" :
				value = "Waxing";
				break;
			default:
				value = "Full";
			}
			this.flyoutController.updatePropertyValue(propertyId, value);
		}

	}

	jsonReplacer(json, type, custom) {
		let jsonReplacer = [];
		switch (type) {
		case "all":
			jsonReplacer = null;
			break;
		case "panel":
			jsonReplacer = [
				"uihints",
				"id", "type", "parameter_refs", "depends_on_ref", "insert_panels",
				"label", "default",
				"group_info"
			];
			break;
		case "control":
			jsonReplacer = [
				"parameters",
				"id", "type", "role", "enum", "required", "default",
				"uihints",
				"parameter_info",
				"parameter_ref", "control", "label",
				"description",
				"language",
				"orientation"
			];
			break;
		case "datefield":
			jsonReplacer = [
				"current_parameters",
				"datefieldControlName",
				"parameters",
				"id", "type", "default",
				"uihints",
				"parameter_info",
				"parameter_ref", "label",
				"description",
				"date_format"
			];
			break;
		case "timefield":
			jsonReplacer = [
				"current_parameters",
				"timefieldControlName",
				"parameters",
				"id", "type", "default",
				"uihints",
				"parameter_info",
				"parameter_ref", "label",
				"description",
				"time_format"
			];
			break;
		case "controlData":
			jsonReplacer = [
				"parameters", "name", "type", "role", "enum", "required", "default",
				"uihints", "id", "parameter_info",
				"parameter_ref", "label", "description", "orientation", "language",
				"dataset_metadata", "fields", "name", "type", "metadata", "description", "measure", "modeling_role"
			];
			break;
		case "complex":
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
		const expressionInfoProps = EXPRESSION_PROPS_INFO;
		expressionInfoProps.expressionInfo = FunctionList;
		const dropMenu = (<div className="harness-properties-documentation-menu">
			<Dropdown
				id="harness-properties-documentation-menu-dropdown"
				label="Navigation"
				items={this.dropdownOptions([
					"Groups",
					"--controls",
					"--panels",
					"--tabs",
					"--subtabs",
					"--panelSelector",
					"--summaryPanel",
					"--twistyPanel",
					"--columnSelection",
					"--textPanel",
					"Controls",
					"--textfield",
					"--textarea",
					"--password",
					"--expression",
					"--readonly",
					"--numberfield",
					"--spinner",
					"--datefield",
					"--timefield",
					"--checkbox",
					"--checkboxset",
					"--radioset",
					"--oneofselect",
					"--someofselect",
					"--selectschema",
					"--selectcolumn",
					"--selectcolumns",
					"--toggletext",
					"Complex",
					"--structuretable",
					"--structurelisteditor",
					"--edit-style",
					"--moveable_rows",
					"--row_selection",
					"--add_remove_rows",
					"--sortable",
					"--filterable",
					"--summary",
					"--generatedValues",
					"Actions",
					"--button",
					"--image"

				])}
				type="inline"
				onChange={this.onMenuDropdownSelect}
				itemToString={(item) => (item ? item.text : "") }
			/>
		</div>);

		const navBar = (<div className="harness-properties-documentation-navbar-items">
			<nav>
				<ul className="harness-properties-documentation-navbar-items">
					<li className="harness-properties-documentation-navbar-li">
						<span id="harness-properties-documentation-title">WDP Common Properties Components</span>
					</li>
					<li className="harness-properties-documentation-navbar-li nav-divider">
						<a onClick={() => this.onMenuDropdownSelect({ selectedItem: { id: "Groups" } })}>Groups</a>
					</li>
					<li className="harness-properties-documentation-navbar-li">
						<a onClick={() => this.onMenuDropdownSelect({ selectedItem: { id: "Controls" } })}>Controls</a>
					</li>
					<li className="harness-properties-documentation-navbar-li">
						<a onClick={() => this.onMenuDropdownSelect({ selectedItem: { id: "Complex" } })}>Complex Types</a>
					</li>
					<li className="harness-properties-documentation-navbar-li">
						<a onClick={() => this.onMenuDropdownSelect({ selectedItem: { id: "Actions" } })}>Action Controls</a>
					</li>
				</ul>
				{dropMenu}
			</nav>
		</div>);

		const header = (<div id="main" className="harness-properties-documentation-section-header">
			<h1>WDP Common Properties Components</h1>
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
				<p>To create UIs based on the WDP Common Properties Components, a JSON adhering to the&nbsp;
					<a className="harness-properties-documentation-page-intro-link"
						href="https://github.ibm.com/NGP-TWC/wdp-pipeline-schemas/tree/master/common-canvas/parameter-defs"
					>Parameter Definition Schema</a> has to be provided. The JSON contains parameter definitions, uihints,
					dataset_metadata, etc. The data in these sections is used to generate the UI. Certain parameter types
					translate into specific controls. The control type can be overriden in the uihints section, which follows the&nbsp;
					<a className="harness-properties-documentation-page-intro-link"
						href="https://github.ibm.com/NGP-TWC/wdp-pipeline-schemas/blob/master/common-pipeline/operators/uihints-v1-schema.json"
					>UI Hints schema</a>. In addition, uihints are used to group UI controls.
				</p>
				<p>
					Documentation on how to write conditions for controls can be found <Link to="/conditions" target="_blank">here</Link>.
				</p>
			</div>
		</section>);

		const contentContainer = (<section id="Container" className="section properties-documentation-content-container-section">
			<h2 className="harness-properties-documentation-section-title">ContainerType</h2>
			<div className="harness-section-description">
				<p>The <span className="harness-highlight">containerType</span> property in CommonProperties allows you to specify which
					container the properties editor will rendered in. By default, a <span className="harness-highlight">Modal</span> dialog will be rendered.
					By specifying a <span className="harness-highlight">Custom</span> containerType, the properties editor will be rendered in
					a container that it will be enclosed in.
				</p>
				<p>For example, CommonCanvas provides an optional right-flyout div that may be used to display the properties editor.
					To use this, create a CommonProperties object with <span className="harness-highlight">containerType</span> set
					to <span className="harness-highlight">Custom</span> and <span className="harness-highlight">rightFlyout</span> set to true.
					Below is the minimum specifications to render CommonProperties. More options and details are listed in the&nbsp;
				<a className="harness-properties-documentation-page-intro-link"
					href={"https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/wiki/3.0-Common-properties-documentation-documentation" +
					"#using-commonproperties-documentation-in-commoncanvas-right-flyout-panel"}
				>
					Common Properties wiki
				</a>.
				</p>
				<pre className="harness-json-block">
					{CONTAINERS_RIGHT_FLYOUT_PROPERTIES}
				</pre>
				<p>where</p>
				<pre className="harness-json-block">
					{CONTAINERS_RIGHT_FLYOUT_PROPERTIES_CONFIG}
				</pre>
				<p>and the <span className="harness-highlight">propertiesInfo</span> contains the parameter definition as mentioned above.</p>
				<pre className="harness-json-block">
					{CONTAINERS_RIGHT_FLYOUT_PROPERTIES_INFO}
				</pre>
				<p>In the CommonCanvas object, pass the CommonProperties object into the <span className="harness-highlight">rightFlyoutContent</span>
					&nbsp;property.</p>
				<pre className="harness-json-block">
					{CONTAINERS_RIGHT_FLYOUT_CANVAS}
				</pre>
				<p>For more information with using CommonCanvas right-flyout for the properties editor, refer to the documentation in the&nbsp;
					<a className="harness-properties-documentation-page-intro-link"
						href={"https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/wiki/3.0-Common-properties-documentation-documentation" +
						"#using-commonproperties-documentation-in-commoncanvas-right-flyout-panel"}
					>
						Common Properties wiki
					</a>.
				</p>
			</div>
		</section>);

		const contentPanels = (<section id="Groups" className="section properties-documentation-content-panels-section">
			<h2 className="harness-properties-documentation-section-title">Groups</h2>
			<div className="harness-section-description">
				<p>Every parameter definition needs to have a <span className="harness-highlight">group_info</span> section
					to define how the UI elements are grouped. The <span className="harness-highlight">type</span> attribute
					and the nesting of the elements in the <span className="harness-highlight">group_info</span> array controls the
					type of the UI container.
				</p>
			</div>
			<div className="harness-properties-documentation-section-content">
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--controls" className="harness-section-subtitle">controls</h3>
					<p>With the default type <span className="harness-highlight">controls</span>,
						the children elements will be displayed in a vertical layout.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={CONTROLS_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(CONTROLS_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(CONTROLS_PROPS_INFO.parameterDef, "panel")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--panels" className="harness-section-subtitle">panels</h3>
					<p>To create a padded grouping of controls, use type <span className="harness-highlight">panels</span>.
						The default padding is set to 8px.</p>
					<div className="harness-section-row">
						<div className="harness-section-row">
							<div className="harness-section-column">
								<CommonProperties
									propertiesInfo={PANELS_PROPS_INFO}
									propertiesConfig={this.propertiesConfig}
								/>
								{this.renderRightFlyoutButton(PANELS_PROPS_INFO)}
							</div>
							<div className="harness-section-column harness-section-column-code">
								<pre className="harness-json-block">
									{this.jsonReplacer(PANELS_PROPS_INFO.parameterDef, "panel")}
								</pre>
							</div>
						</div>
					</div>
				</div>
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--tabs" className="harness-section-subtitle">tabs</h3>
					<p>Multiple objects in the <span className="harness-highlight">group_info</span> array will be rendered in separate tabs.
						Each object in the <span className="harness-highlight">group_info</span> array must have a
						unique <span className="harness-highlight">id</span>. To create sub tabs for nested group_info objects, see
						type <a className="harness-properties-documentation-page-intro-link" href="#/properties#--subtabs">subTabs</a>.</p>
					<div className="harness-section-row">
						<div className="harness-section-row">
							<div className="harness-section-column">
								<CommonProperties
									propertiesInfo={TABS_PROPS_INFO}
									propertiesConfig={this.propertiesConfig}
								/>
								{this.renderRightFlyoutButton(TABS_PROPS_INFO)}
							</div>
							<div className="harness-section-column harness-section-column-code">
								<pre className="harness-json-block">
									{this.jsonReplacer(TABS_PROPS_INFO.parameterDef, "panel")}
								</pre>
							</div>
						</div>
					</div>
				</div>
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--subtabs" className="harness-section-subtitle">subTabs</h3>
					<p>This is currently not supported in <span className="harness-highlight">Modal</span> dialogs.
						Please let us know in the issue if this is desired:&nbsp;
					<a className="harness-properties-documentation-page-intro-link"
						href={"https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/issues/2678"}
					>#2678</a>. Please view the following example in the flyout.
					</p>
					<p>To create vertical sub-tabs, set the <span className="harness-highlight">type</span> to <span className="harness-highlight">subTabs</span> and
						add a nested <span className="harness-highlight">group_info</span> array with the objects
						defining the grouping of the controls in the subtabs.</p>
					<div className="harness-section-row">
						<div className="harness-section-row">
							<div className="harness-section-column">
								<CommonProperties
									propertiesInfo={SUBTABS_PROPS_INFO}
									propertiesConfig={this.propertiesConfig}
								/>
								{this.renderRightFlyoutButton(SUBTABS_PROPS_INFO)}
							</div>
							<div className="harness-section-column harness-section-column-code">
								<pre className="harness-json-block">
									{this.jsonReplacer(SUBTABS_PROPS_INFO.parameterDef, "panel")}
								</pre>
							</div>
						</div>
					</div>
				</div>
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--panelSelector" className="harness-section-subtitle">panelSelector</h3>
					<p>To show panels based on the selection in
						a <a className="harness-properties-documentation-page-intro-link" href="#/properties#--radioset">radio set</a>,
						add a nested <span className="harness-highlight">group_info</span> object of
						type <span className="harness-highlight">panelSelector</span> and in there, add
						another <span className="harness-highlight">group_info</span> array with the sub-panels
						for each possible selection. The IDs of the panels in
						the <span className="harness-highlight">group_info</span> should match to the parameter
						values in the enum for the radio button set.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-row">
							<div className="harness-section-column">
								<CommonProperties
									propertiesInfo={PANEL_SELECTOR_PROPS_INFO}
									propertiesConfig={this.propertiesConfig}
								/>
								{this.renderRightFlyoutButton(PANEL_SELECTOR_PROPS_INFO)}
							</div>
							<div className="harness-section-column harness-section-column-code">
								<pre className="harness-json-block">
									{this.jsonReplacer(PANEL_SELECTOR_PROPS_INFO.parameterDef, "panel")}
								</pre>
							</div>
						</div>
					</div>
					<p>To show the panels inserted after each corresponding button in
						the <a className="harness-properties-documentation-page-intro-link" href="#/properties#--radioset">radio set</a>,
						add an <span className="harness-highlight">insert_panels</span> field to
						the <span className="harness-highlight">selectorPanel</span> and set
						it to <span className="harness-highlight">true</span>. Also, ensure
						the <span className="harness-highlight">orientation</span> field
						for the radio button parameter in <span className="harness-highlight">ui_hints.parameter_info</span> is
						set to <span className="harness-highlight">"vertical"</span>.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-row">
							<div className="harness-section-column">
								<CommonProperties
									propertiesInfo={PANEL_SELECTOR_INSERT_PROPS_INFO}
									propertiesConfig={this.propertiesConfig}
								/>
								{this.renderRightFlyoutButton(PANEL_SELECTOR_INSERT_PROPS_INFO)}
							</div>
							<div className="harness-section-column harness-section-column-code">
								<pre className="harness-json-block">
									{this.jsonReplacer(PANEL_SELECTOR_INSERT_PROPS_INFO.parameterDef, "panel")}
								</pre>
							</div>
						</div>
					</div>
				</div>
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--summaryPanel" className="harness-section-subtitle">summaryPanel</h3>
					<p>A panel that displays a link that opens a wide flyout with the specified controls and
						optionally a summary of column(s) from the control(s). The summary of columns to display is configured by setting
						the <a className="harness-properties-documentation-page-intro-link" href="#/properties#--summary">summary</a> attribute
						in the parameters of complex types control.
					</p>
					<p>The summaryPanel is only available in a right flyout container. As shown below, the control will
						display as is in a Modal container.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-row">
							<div className="harness-section-column">
								<CommonProperties
									propertiesInfo={SUMMARY_PANEL_PROPS_INFO}
									propertiesConfig={this.propertiesConfig}
								/>
								{this.renderRightFlyoutButton(SUMMARY_PANEL_PROPS_INFO)}
							</div>
							<div className="harness-section-column harness-section-column-code">
								<pre className="harness-json-block">
									{this.jsonReplacer(SUMMARY_PANEL_PROPS_INFO.parameterDef, "panel")}
								</pre>
							</div>
						</div>
					</div>
				</div>
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--twistyPanel" className="harness-section-subtitle">twistyPanel</h3>
					<p>A panel that displays a link that will drop down a panel with the specified controls.
					</p>
					<p>The <span className="harness-highlight">edit_style</span> value of <span className="harness-highlight">on_panel</span> is not
						supported with a control in a twistyPanel. </p>
					<div className="harness-section-row">
						<div className="harness-section-row">
							<div className="harness-section-column">
								<CommonProperties
									propertiesInfo={TWISTY_PANEL_PROPS_INFO}
									callbacks={{ actionHandler: this.twistyActionHandler, controllerHandler: this.twistyControllerHandler }}
									propertiesConfig={this.propertiesConfig}
								/>
								{this.renderRightFlyoutButton(TWISTY_PANEL_PROPS_INFO)}
							</div>
							<div className="harness-section-column harness-section-column-code">
								<pre className="harness-json-block">
									{this.jsonReplacer(TWISTY_PANEL_PROPS_INFO.parameterDef, "panel")}
								</pre>
							</div>
						</div>
					</div>
				</div>
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--columnSelection" className="harness-section-subtitle">columnSelection</h3>
					<p>To group multiple <a className="harness-properties-documentation-page-intro-link" href="#/properties#--selectcolumns">
							selectcolumns
					</a> controls, use type <span className="harness-highlight">columnSelection</span>. Having multiple controls in
						a <span className="harness-highlight">columnSelection</span> let the controls share a
						single input list of <span className="harness-highlight">dataset_metadata</span> fields.
						A field selected in the first <span className="harness-highlight">selectcolumns</span> control
						cannot be selected in the second control.</p>
					<div className="harness-section-row">
						<div className="harness-section-row">
							<div className="harness-section-column">
								<CommonProperties
									propertiesInfo={COLUMNSELECTION_PROPS_INFO}
									propertiesConfig={this.propertiesConfig}
								/>
								{this.renderRightFlyoutButton(COLUMNSELECTION_PROPS_INFO)}
							</div>
							<div className="harness-section-column harness-section-column-code">
								<pre className="harness-json-block">
									{this.jsonReplacer(COLUMNSELECTION_PROPS_INFO.parameterDef, "panel")}
								</pre>
							</div>
						</div>
					</div>
				</div>
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--textPanel" className="harness-section-subtitle">textPanel</h3>
					<p>Displays text not related to a parameter.  Can be used with a <span className="harness-highlight">panelSelector</span> to
						display different text values based on a control value.</p>
					<div className="harness-section-row">
						<div className="harness-section-row">
							<div className="harness-section-column">
								<CommonProperties
									propertiesInfo={TEXT_PANEL_PROPS_INFO}
									propertiesConfig={this.propertiesConfig}
								/>
								{this.renderRightFlyoutButton(TEXT_PANEL_PROPS_INFO)}
							</div>
							<div className="harness-section-column harness-section-column-code">
								<pre className="harness-json-block">
									{this.jsonReplacer(TEXT_PANEL_PROPS_INFO.parameterDef, "all")}
								</pre>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>);

		const contentControls = (<section id="Controls" className="section properties-documentation-content-controls-section">
			<h2 className="harness-properties-documentation-section-title">Controls</h2>
			<p className="harness-section-description">The following controls are supported in the Common Properties editor.
				The type of a control is determined by the <span className="harness-highlight">type</span> of a parameter.</p>
			<div className="harness-properties-documentation-section-content">
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--textfield" className="harness-section-subtitle">textfield</h3>
					<p>A single line editable text field is rendered for a parameter of <span className="harness-highlight">type</span> string.
						This is the default.</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={TEXTFIELD_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(TEXTFIELD_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(TEXTFIELD_PROPS_INFO.parameterDef, "control")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--textarea" className="harness-section-subtitle">textarea</h3>
					<p>A multi-line text area is rendered for a parameter of <span className="harness-highlight">type</span> string or array[string].</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={TEXTAREA_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(TEXTAREA_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(TEXTAREA_PROPS_INFO.parameterDef, "control")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--password" className="harness-section-subtitle">password</h3>
					<p>A masked single line text field is rendered for a parameter of <span className="harness-highlight">type</span> password.</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={PASSWORD_FIELD_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(PASSWORD_FIELD_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(PASSWORD_FIELD_PROPS_INFO.parameterDef, "control")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--expression" className="harness-section-subtitle">expression</h3>
					<p>An expression editing field is rendered for a parameter of <span className="harness-highlight">type</span> string
						and <span className="harness-highlight">role</span> expression.
						The expression field provides syntax highlighting and text auto completion based on language.
						Languages supported are <span className="harness-highlight">Spark SQL</span> and
					<span className="harness-highlight"> Modeler CLEM</span>. Press CTRL-SPACE to see the
						text auto completion feature.</p>
					<p>An expression builder is provided when the expression control is display in
						the <span className="harness-highlight"> Flyout</span>. The expression builder provides an easy to use interface for
						building expressions.  It is enabled by passing in the <span className="harness-highlight"> expressionInfo </span> field in the
					<span className="harness-highlight"> propertiesInfo </span> object for <span className="harness-highlight"> CommonProperties </span>.
							Press the <span className="harness-highlight"> "View in Flyout" </span> to see the expression builder button.
					</p>
					<p>Validation of expression field is performed when the <span className="harness-highlight"> Validate </span> link is clicked.
						The user of the expression control can provide syntax checking of the expression by implementing
						a custom condition operator that will get invoked when the <span className="harness-highlight"> Validate </span> link is clicked.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={expressionInfoProps}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(expressionInfoProps)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(expressionInfoProps.parameterDef, "control")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--readonly" className="harness-section-subtitle">readonly</h3>
					<p>A readonly field is rendered for a parameter of attribute <span className="harness-highlight">control </span>
					and value <span className="harness-highlight">readonly</span></p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={READONLY_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(READONLY_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(READONLY_PROPS_INFO.parameterDef, "control")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--numberfield" className="harness-section-subtitle">numberfield</h3>
					<p>A numeric text field is rendered for a parameter of <span className="harness-highlight">type</span> number.</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={NUMBERFIELD_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(NUMBERFIELD_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(NUMBERFIELD_PROPS_INFO.parameterDef, "control")}
							</pre>
						</div>
					</div>
					<p>Number fields can also optionally display a random number generator
						next to the control label by adding a <span className="harness-highlight">number_generator</span> attribute
						in the <span className="harness-highlight">parameter_info</span> section.</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={NUMBERFIELD_GENERATOR_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(NUMBERFIELD_GENERATOR_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(NUMBERFIELD_GENERATOR_PROPS_INFO.parameterDef, "custom",
									["uihints",
										"id", "type", "parameter_info",
										"number_generator",
										"default", "label", "resource_key", "range", "min", "max",
										"resources", "numberGenerator.label", "numberGenerator.desc"
									])}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--spinner" className="harness-section-subtitle">spinner</h3>
					<p>A spinner control is rendered for a parameter of <span className="harness-highlight">increment</span> number.</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={SPINNER_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(SPINNER_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(SPINNER_PROPS_INFO.parameterDef, "all")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--datefield" className="harness-section-subtitle">datefield</h3>
					<p>A date field is rendered for a parameter of <span className="harness-highlight">type</span> date.
							The current parameter should be provided as an 8601 format date. eg 2018-02-15. This is
							how dates are stored internally. Note that, with the ISO format, single digits are preceded by
							a 0. So 02 not 2 for Febrauary. The date_format field in the ui_hints can be used to
							specify what date format is required for display and entry of the date. The default is YYYY-M-D.
							This allows single digit month and day numbers for display and entry. Other dates formats can be
							derived from here:
					<a href="https://momentjs.com/docs/#/displaying/format/"> Moment.js docs </a>
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={DATEFIELD_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(DATEFIELD_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(DATEFIELD_PROPS_INFO.parameterDef, "datefield")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--timefield" className="harness-section-subtitle">timefield</h3>
					<p>A time field is rendered for a parameter of <span className="harness-highlight">type</span> time.
							The current parameter should be provided as an 8601 format time. eg 09:10:05Z. This is
							how times are stored internally. Note that, with the ISO format, single digits are
							preceded by a 0. So 09 not 9 for nine hours. The time_format field in the ui_hints can
							be used to specify what time format is required for display and entry of the time.
							The default is H:m:s which is 24 hour time (for hours) and no preceding zeros on digits.
							In the example below the default format has been overridden in the ui_hints to require
							preceding zeros for digits in displayed and eneterd time values. Other time formats can
							be derived from here:
					<a href="https://momentjs.com/docs/#/displaying/format/"> Moment.js docs </a>
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={TIMEFIELD_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(TIMEFIELD_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(TIMEFIELD_PROPS_INFO.parameterDef, "timefield")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--checkbox" className="harness-section-subtitle">checkbox</h3>
					<p>A checkbox control is rendered for a parameter of <span className="harness-highlight">type</span> boolean.
						The value in the <span className="harness-highlight">enum</span> array
						sets the label for the checkbox control.</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={CHECKBOX_SINGLE_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(CHECKBOX_SINGLE_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(CHECKBOX_SINGLE_PROPS_INFO.parameterDef, "control")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--checkboxset" className="harness-section-subtitle">checkboxset</h3>
					<p>For parameters of <span className="harness-highlight">type</span> array[string] with fewer than five elements,
						a checkboxset is rendered. For five or more elements,
						a <a className="harness-properties-documentation-page-intro-link" href="#/properties#--someofselect"> someofselect </a> control is rendered.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={CHECKBOX_SET_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(CHECKBOX_SET_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(CHECKBOX_SET_PROPS_INFO.parameterDef, "control")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--radioset" className="harness-section-subtitle">radioset</h3>
					<p> A radio set where a parameter value is selected from up to four options.
						For five or more options, a <a className="harness-properties-documentation-page-intro-link" href="#/properties#--oneofselect">
						oneofselect
					</a> control is rendered. Enums of <span className="harness-highlight">type</span> string and number (integer, double, long) are supported.
						If enum is not defined, a boolean radio set can be rendered by setting <span className="harness-highlight">type</span> to boolean.
						For type boolean and number, the control must be set to <span className="harness-highlight">radioset</span>.</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={RADIOSET_HORIZONTAL_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(RADIOSET_HORIZONTAL_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(RADIOSET_HORIZONTAL_PROPS_INFO.parameterDef, "control")}
							</pre>
						</div>
					</div>
					<p>The orientation of the radio buttons is controled by the <span className="harness-highlight">orientation</span> value
						in the parameter_info. If the attribute is not specified, the radio buttons will be layed out horizontally.</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={RADIOSET_VERTICAL_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(RADIOSET_VERTICAL_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(RADIOSET_VERTICAL_PROPS_INFO.parameterDef, "control")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--oneofselect" className="harness-section-subtitle">oneofselect</h3>
					<p>A dropdown list control is rendered for a parameter with an <span className="harness-highlight">enum</span> list
						with five or more elements. For fewer than five elements,
						a <a className="harness-properties-documentation-page-intro-link" href="#/properties#--radioset">radioset</a> control is rendered.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={ONEOFSELECT_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(ONEOFSELECT_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(ONEOFSELECT_PROPS_INFO.parameterDef, "control")}
							</pre>
						</div>
					</div>
					<p>A <a className="harness-properties-documentation-page-intro-link" href="#/properties#--oneofselect">
						oneofselect
					</a> control can be forced to render as a <a className="harness-properties-documentation-page-intro-link" href="#/properties#--radioset">
							radioset
					</a> by adding a <span className="harness-highlight">control</span> attribute set
						to <span className="harness-highlight">radioset</span>. Similarly, a <span className="harness-highlight">radioset</span> control can
						be forced to render as a <span className="harness-highlight">oneofselect</span>.</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={FORCED_RADIOSET_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(FORCED_RADIOSET_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(FORCED_RADIOSET_PROPS_INFO.parameterDef, "custom",
									["uihints", "parameter_info", "control", "orientation"])}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--someofselect" className="harness-section-subtitle">someofselect</h3>
					<p>A multi-selection control is rendered for a parameter with an <span className="harness-highlight">enum</span> list
						with five or more elements of <span className="harness-highlight">type</span> array[string].
						For fewer than five elements,
						a <a className="harness-properties-documentation-page-intro-link" href="#/properties#--checkboxset">checkboxset</a> control is rendered.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={SOMEOFSELECT_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(SOMEOFSELECT_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(SOMEOFSELECT_PROPS_INFO.parameterDef, "control")}
							</pre>
						</div>
					</div>
					<p>A <a className="harness-properties-documentation-page-intro-link" href="#/properties#--someofselect">
						someofselect
					</a> control can be forced to render as a <a className="harness-properties-documentation-page-intro-link"
						href="#/properties#--checkboxset"
					>checkboxset</a> by adding a <span className="harness-highlight">control</span> attribute set
						to <span className="harness-highlight">checkboxset</span>. Similarly, a <span className="harness-highlight">checkboxset</span> control
						can be forced to render as a <span className="harness-highlight">someofselect</span>.</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={FORCED_CHECKBOX_SET_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(FORCED_CHECKBOX_SET_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(FORCED_CHECKBOX_SET_PROPS_INFO.parameterDef, "custom",
									["uihints", "parameter_info", "control"])}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--selectschema" className="harness-section-subtitle">selectschema</h3>
					<p>A dropdown control that contains the available schemas in <span className="harness-highlight">dataset_metadata</span>.
						The <span className="harness-highlight">name</span> of the schema will be displayed if provided.
						If <span className="harness-highlight">name</span> is not provided, the index (zero-based) of the schema will
						be used instead. If multiple schemas have the same <span className="harness-highlight">name</span>, the index
						of the schema will be appended with an underscore.</p>
					<p>Specify the control type of the parameter to <span className="harness-highlight">selectschema</span> to use this control.</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={SELECTSCHEMA_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(SELECTSCHEMA_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(SELECTSCHEMA_PROPS_INFO.parameterDef, "custom",
									["current_parameters", "selectschemaList", "parameters",
										"uihints", "id", "parameter_info", "parameter_ref", "label", "default", "description", "control",
										"group_info", "type", "parameter_refs",
										"dataset_metadata", "name"])}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--selectcolumn" className="harness-section-subtitle">selectcolumn</h3>
					<p>A dropdown control that contains the available fields provided in the <span className="harness-highlight">dataset_metadata</span>.
						If there can be only a single input data link to the node using a selectColumn control, then the type of the parameter associated with the dropdown list
						must be of <span className="harness-highlight">type string</span> and
						the <span className="harness-highlight">role</span> must be set to <span className="harness-highlight">column</span>.</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={SELECTCOLUMN_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(SELECTCOLUMN_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(SELECTCOLUMN_PROPS_INFO.parameterDef, "all")}
							</pre>
						</div>
					</div>
					<p>If multiple input schemas are supported by a given node type, then the type of the parameter for the selectColumn control must be
						of <span className="harness-highlight">type object</span>, and the role must be set to <span className="harness-highlight">column</span>.
						The <span className="harness-highlight">selectcolumn</span> control will display all the fields from both schemas,
						and field names displayed in the UI will be prefixed with the schema name followed by a period.
					</p>
					<p>For nodes with one or more field parameters that are of type: object and role: column,
						field values in parameter sets are represented by objects instead of strings. Within these objects,
						there is a link_ref attribute that corresponds to the data link / data schema for the field,
						and a field_name attribute that corresponds to the field name within the dataset.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={SELECTCOLUMN_MULTI_INPUT_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(SELECTCOLUMN_MULTI_INPUT_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(SELECTCOLUMN_MULTI_INPUT_PROPS_INFO.parameterDef, "custom",
									["dataset_metadata", "name", "fields"])}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--selectcolumns" className="harness-section-subtitle">selectcolumns</h3>
					<p>A multi-select control for column selections. The type of the parameter associated with this control
						must be of <span className="harness-highlight">type</span> array[string] (for single input nodes) or array[object] (for multi-input nodes), and
						the <span className="harness-highlight">role</span> must be set to <span className="harness-highlight">column</span>.
						The <span className="harness-highlight">type</span> in <span className="harness-highlight">group_info</span> needs
						to be set to <a className="harness-properties-documentation-page-intro-link" href="#/properties#--columnSelection">columnSelection</a>.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={SELECTCOLUMNS_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(SELECTCOLUMNS_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(SELECTCOLUMNS_PROPS_INFO.parameterDef, "all")}
							</pre>
						</div>
					</div>
					<p>Similar to the <a className="harness-properties-documentation-page-intro-link" href="#/properties#--selectcolumn">
						selectcolumn</a> control above, if two or more datasets could be provided to a node type, then the operator
						definition for field parameters in that node should be declared as type object rather than string.
						The <span className="harness-highlight">selectcolumns</span> control
						will display all the fields from both schemas.
						Field names are prefixed with the schema name followed by a period.
						The field-picker will display an additional column that shows the schema where the field came from.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={SELECTCOLUMNS_MULTI_INPUT_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(SELECTCOLUMNS_MULTI_INPUT_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(SELECTCOLUMNS_MULTI_INPUT_PROPS_INFO.parameterDef, "custom",
									["dataset_metadata", "name", "fields"])}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--toggletext" className="harness-section-subtitle">toggletext</h3>
					<p>A two-state control with optional icons that can exist on its own or within table cells.
						The <span className="harness-highlight">control</span> must be set to <span className="harness-highlight">toggletext</span>.</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={TOGGLETEXT_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(TOGGLETEXT_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(TOGGLETEXT_PROPS_INFO.parameterDef, "control")}
							</pre>
						</div>
					</div>
					<p>Icons can be placed next to the <span className="harness-highlight">toggletext</span> by
						adding a <span className="harness-highlight">value_icons</span> array of two images, one for each
						corresponding enum options.</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={TOGGLETEXTICONS_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(TOGGLETEXTICONS_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(TOGGLETEXTICONS_PROPS_INFO.parameterDef, "custom",
									["uihints", "parameter_info", "value_icons"])}
							</pre>
						</div>
					</div>
				</div>
			</div>
		</section>);

		const contentComplex = (<section id="Complex" className="section properties-documentation-content-complex-section">
			<h2 className="harness-properties-documentation-section-title">Complex Types</h2>
			<div className="harness-section-description">
				<p>Complex types representing lists or maps of basic parameter types are supported
					via complex type controls. Controls can appear as rows in tables or standing on
					their own in panels. The following controls are supported for complex types:
				<ul className="harness-properties-documentation-list-indent">
					<li><a className="harness-properties-documentation-page-intro-link" href="#/properties#--textfield">textfield</a></li>
					<li><a className="harness-properties-documentation-page-intro-link" href="#/properties#--textarea">textarea</a></li>
					<li><a className="harness-properties-documentation-page-intro-link" href="#/properties#--readonly">readonly</a></li>
					<li><a className="harness-properties-documentation-page-intro-link" href="#/properties#--expression">expression</a></li>
					<li><a className="harness-properties-documentation-page-intro-link" href="#/properties#--toggletext">toggletext</a></li>
					<li><a className="harness-properties-documentation-page-intro-link" href="#/properties#--password">password</a></li>
					<li><a className="harness-properties-documentation-page-intro-link" href="#/properties#--numberfield">numberfield</a></li>
					<li><a className="harness-properties-documentation-page-intro-link" href="#/properties#--spinner">spinner</a></li>
					<li><a className="harness-properties-documentation-page-intro-link" href="#/properties#--datefield">datefield</a></li>
					<li><a className="harness-properties-documentation-page-intro-link" href="#/properties#--timefield">timefield</a></li>
					<li><a className="harness-properties-documentation-page-intro-link" href="#/properties#--checkbox">checkbox</a></li>
					<li><a className="harness-properties-documentation-page-intro-link" href="#/properties#--radioset">radioset</a></li>
					<li><a className="harness-properties-documentation-page-intro-link" href="#/properties#--oneofselect">oneofselect</a></li>
					<li><a className="harness-properties-documentation-page-intro-link" href="#/properties#--selectschema">selectschema</a></li>
				</ul>
				</p>
			</div>
			<div className="harness-properties-documentation-section-content">
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--structuretable" className="harness-section-subtitle">structuretable</h3>
					<p>A complex type table control for editing lists or maps of structures that with field names
						in the first column. The <span className="harness-highlight">type</span> in <span className="harness-highlight">group_info</span> needs
						to be set to <a className="harness-properties-documentation-page-intro-link" href="#/properties#--columnSelection">
						columnSelection</a>.
					</p>
					<p>If multiple input schemas are supported, similar to <a className="harness-properties-documentation-page-intro-link" href="#/properties#--selectcolumns">
						selectcolumn</a>, field names will be prefixed in the UI with the schema name followed by a decimal.
						Those same fields will be stored in parameter sets as compound objects with link_ref and field_name attributes.</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={STRUCTURETABLE_INLINE_TOGGLE_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(STRUCTURETABLE_INLINE_TOGGLE_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(STRUCTURETABLE_INLINE_TOGGLE_PROPS_INFO.parameterDef, "all")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--structurelisteditor" className="harness-section-subtitle">structurelisteditor</h3>
					<p>For lists of structures that are not field-oriented properties.
						This complex type control will be rendered if
						the <span className="harness-highlight">type</span> in <span className="harness-highlight">group_info</span> is
						not set, which will default to group
						type <a className="harness-properties-documentation-page-intro-link" href="#/properties#--controls">
						controls</a>.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={STRUCTURELISTEDITOR_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(STRUCTURELISTEDITOR_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(STRUCTURELISTEDITOR_PROPS_INFO.parameterDef, "all")}
							</pre>
						</div>
					</div>
				</div>
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--attributes">Attributes</h3>
					<p>The following attributes can be applied to complex_types controls.</p>
					<h4 id="--edit-style" className="harness-section-row-title section-subtitle">edit_style</h4>
					<p>When editing complex type values in tables, one can edit cell values inline, in a sub panel or in an area below the table.
						The <span className="harness-highlight">edit_style</span> attribute is set in
						the <span className="harness-highlight">parameters</span> object
						within <span className="harness-highlight">complex_type_info</span>.
						The available options
						are <span className="harness-highlight">inline</span> , <span className="harness-highlight">subpanel</span> or <span className="harness-highlight">
						on_panel</span>
					</p>
					<p><span className="harness-highlight">inline</span> will render controls inline within the table cells for editing values.
						The following example shows a <a className="harness-properties-documentation-page-intro-link" href="#/properties#--oneofselect">oneofselect</a> control
					&nbsp;<span className="harness-highlight">inline</span> with the structuretable rows.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={STRUCTURETABLE_INLINE_DROPDOWN_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(STRUCTURETABLE_INLINE_DROPDOWN_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(STRUCTURETABLE_INLINE_DROPDOWN_PROPS_INFO.parameterDef, "all")}
							</pre>
						</div>
					</div>
					<p>The following example shows a <a className="harness-properties-documentation-page-intro-link" href="#/properties#--textfield">
						textfield
					</a> control <span className="harness-highlight">inline</span> with the structuretable rows.</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={STRUCTURETABLE_INLINE_TEXTFIELD_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(STRUCTURETABLE_INLINE_TEXTFIELD_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(STRUCTURETABLE_INLINE_TEXTFIELD_PROPS_INFO.parameterDef, "all")}
							</pre>
						</div>
					</div>
					<p><span className="harness-highlight">subpanel</span> will render a button that will launch a small sub-dialog to edit cell values.
						Using the inline textfield example above, by changing the <span className="harness-highlight">edit_style</span> attribute
						from <span className="harness-highlight">inline</span> to <span className="harness-highlight">subpanel</span>, it will genereate a
						subcontrol button for users to edit the field in another panel.</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={STRUCTURETABLE_SUBPANEL_TEXTFIELD_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(STRUCTURETABLE_SUBPANEL_TEXTFIELD_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(STRUCTURETABLE_SUBPANEL_TEXTFIELD_PROPS_INFO.parameterDef, "all")}
							</pre>
						</div>
						<p>
							<span className="harness-highlight">on_panel</span> will allow editing of the cell value in a control below the table.
							The control will be created when the row is selected.
							The atribute <span className="harness-highlight">row_selection</span> must be
							set to <span className="harness-highlight">single</span> when using the value <span className="harness-highlight">on_panel</span>.
							There can only be one column in the table with the value of <span className="harness-highlight">on_panel</span>
						</p><p>The following example shows
							a <a className="harness-properties-documentation-page-intro-link" href="#/properties#--expression">expression</a>&nbsp;
							control with <span className="harness-highlight">on_panel</span> in the structuretable rows.
							If you select a row
							the <a className="harness-properties-documentation-page-intro-link" href="#/properties#--expression">
							expression</a> control will display below the table with the current value of
							the <span className="harness-highlight">Condition</span> cell for the selected row. Modify the value in
							the <a className="harness-properties-documentation-page-intro-link" href="#/properties#--expression">expression</a> control
							and it will change the value in the cell when focus is off
							the <a className="harness-properties-documentation-page-intro-link" href="#/properties#--expression">expression</a> control.
						</p>
						<div className="harness-section-row">
							<div className="harness-section-column">
								<CommonProperties
									propertiesInfo={STRUCTURETABLE_ONPANEL_EXPRESSION_PROPS_INFO}
									propertiesConfig={this.propertiesConfig}
								/>
								{this.renderRightFlyoutButton(STRUCTURETABLE_ONPANEL_EXPRESSION_PROPS_INFO)}
							</div>
							<div className="harness-section-column harness-section-column-code">
								<pre className="harness-json-block">
									{this.jsonReplacer(STRUCTURETABLE_ONPANEL_EXPRESSION_PROPS_INFO.parameterDef, "all")}
								</pre>
							</div>
						</div>
					</div>
					<h4 id="--moveable_rows" className="harness-section-row-title section-subtitle">moveable_rows</h4>
					<p><span className="harness-highlight">moveable_rows</span> is a boolean attribute that can be set
						in <span className="harness-highlight">complex_type_definition</span> sections.
						If set to true, it allows rows in the table to be moved up and down for reordering.</p>
					<p>Using the structure table inline oneofselect example above, adding
						the <span className="harness-highlight">moveable_rows</span> attribute will create the control with arrows
						on the right side of the table to allow reordering of the rows.</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={STRUCTURETABLE_MOVEABLE_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(STRUCTURETABLE_MOVEABLE_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(STRUCTURETABLE_MOVEABLE_PROPS_INFO.parameterDef, "custom",
									["uihints", "complex_type_info", "moveable_rows"])}
							</pre>
						</div>
					</div>
					<h4 id="--row_selection" className="harness-section-row-title section-subtitle">row_selection</h4>
					<p><span className="harness-highlight">row_selection</span> is a string attribute that can be set
						in <span className="harness-highlight">complex_type_definition</span> sections. Valid values
						for <span className="harness-highlight">row_selection</span> are <span className="harness-highlight">single</span><span> </span>
						or <span className="harness-highlight">multiple</span>.  If set to <span className="harness-highlight">single</span> then
						one and only one row may be selected at one time.</p>
					<p>In this example, the <span className="harness-highlight">row_selection</span> attribute
						is set <span className="harness-highlight">single</span>. Such that only one row will be selected at a time.</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={STRUCTURETABLE_ROW_SELECTION_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(STRUCTURETABLE_ROW_SELECTION_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(STRUCTURETABLE_ROW_SELECTION_PROPS_INFO.parameterDef, "custom",
									["uihints", "complex_type_info", "row_selection"])}
							</pre>
						</div>
					</div>
					<h4 id="--add_remove_rows" className="harness-section-row-title section-subtitle">add_remove_rows</h4>
					<p><span className="harness-highlight">add_remove_rows</span> is a boolean attribute that can be set
						in <span className="harness-highlight">complex_type_definition</span> sections.
						If set to true, it allows rows to be added and removed from a table through a pair of buttons
						on the top right of the table.  If set to false the buttons are not displayed and there is no way
					to add or remove rows from the table.</p>
					<p>In this example, the <span className="harness-highlight">add_remove_rows</span> attribute
						is set <span className="harness-highlight">false</span>.</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={STRUCTURELISTEDITOR_ADDREMOVEROWS_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(STRUCTURELISTEDITOR_ADDREMOVEROWS_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(STRUCTURELISTEDITOR_ADDREMOVEROWS_PROPS_INFO.parameterDef, "custom",
									["uihints", "complex_type_info", "add_remove_rows"])}
							</pre>
						</div>
					</div>
					<h4 id="--sortable" className="harness-section-row-title section-subtitle">sortable</h4>
					<p><span className="harness-highlight">sortable</span> is a boolean attribute that can be
						applied to table columns. When set within the <span className="harness-highlight">key_definition</span> or
						the <span className="harness-highlight">parameters</span> sections of a structure definition,
						those columns are sortable.</p>
					<p>Using the structure table inline oneofselect example above, adding
						the <span className="harness-highlight">sortable</span> attribute in
						the <span className="harness-highlight">key_definition</span> section will
						allow the Field column to be sortable. Adding
						the <span className="harness-highlight">sortable</span> attribute in
						the <span className="harness-highlight">parameters</span> section within
						the <span className="harness-highlight">complex_type_info</span> will
						allow the Type column to be sortable.</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={STRUCTURETABLE_SORTABLE_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(STRUCTURETABLE_SORTABLE_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(STRUCTURETABLE_SORTABLE_PROPS_INFO.parameterDef, "custom",
									["uihints", "complex_type_info", "key_definition", "sortable", "parameters"])}
							</pre>
						</div>
					</div>
					<h4 id="--filterable" className="harness-section-row-title section-subtitle">filterable</h4>
					<p><span className="harness-highlight">filterable</span> is a boolean attribute that can be
						applied to table columns. When set within the <span className="harness-highlight">key_definition</span> or
						the <span className="harness-highlight">parameters</span> sections of a structure definition,
						those columns can be filtered upon.</p>
					<p>Using the structure table inline oneofselect example above, adding
						the <span className="harness-highlight">filterable</span> attribute in
						the <span className="harness-highlight">key_definition</span> section will
						allow the columns to be filtered using a search bar. Since
						the <span className="harness-highlight">filterable</span> attribute was not added to
						the <span className="harness-highlight">parameters</span> section, the Type column
						will not be filterable.</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={STRUCTURETABLE_FILTERABLE_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(STRUCTURETABLE_FILTERABLE_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(STRUCTURETABLE_FILTERABLE_PROPS_INFO.parameterDef, "custom",
									["uihints", "complex_type_info", "key_definition", "filterable"])}
							</pre>
						</div>
					</div>
					<h4 id="--summary" className="harness-section-row-title section-subtitle">summary</h4>
					<p><span className="harness-highlight">summary</span> is a boolean attribute that can be
						applied to table columns. This can be set within the <span className="harness-highlight">key_definition</span> or
						the <span className="harness-highlight">parameters</span> sections of a structure definition.
						The <span className="harness-highlight">summary</span> attribute is only available in a right flyout container.
						As shown below, controls will display as is in a modal container.
					</p>
					<p>When <span className="harness-highlight">summary</span> set to true for a column and the control is within a&nbsp;
						<a className="harness-properties-documentation-page-intro-link" href="#/properties#--summaryPanel">summaryPanel</a>,
						the column will be shown in the summary table in the right flyout. There will also be a link above the summary
						that will open the controls in another wide flyout container for users to configure. The label for the link can be
						configured in the <span className="harness-highlight">group_info</span> section for
						the <span className="harness-highlight">summaryPanel</span>.
					</p>
					<p>Although non-complex type controls may be placed and configured in a&nbsp;
						<a className="harness-properties-documentation-page-intro-link" href="#/properties#--summaryPanel">summaryPanel</a>,
						the <span className="harness-highlight">summary</span> attribute does not apply to non-complex type controls.
						No summary will be shown for those controls.
					</p>
					<p>For summary tables with more than ten rows, a placeholder text will be shown instead. The text defaults
						to <span className="harness-highlight">More than ten fields...</span> This placeholder text can be configured through
						&nbsp;
					<a className="harness-properties-documentation-page-intro-link"
						href="https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/wiki/3.0-Common-Properties-documentation#internationalization-and-override-of-labels-in-commonproperties"
					>custom labels</a>.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={SUMMARY_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(SUMMARY_PROPS_INFO)}
						</div>
						<div id="harness-summary-section-column-code" className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(SUMMARY_PROPS_INFO.parameterDef, "all")}
							</pre>
						</div>
					</div><h4 id="--generatedValues" className="harness-section-row-title section-subtitle">generatedValues</h4>
					<p>Generates values for a column in
						a <a className="harness-properties-documentation-page-intro-link" href="#/properties#--readonly">readonly</a> parameter.
						Currently only the <span className="harness-highlight">index</span> operation is supported, which will auto-increment the integer
						column value starting at 1.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={STRUCTURETABLE_GENERATED_VALUES_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(STRUCTURETABLE_GENERATED_VALUES_PROPS_INFO)}
						</div>
						<div id="generated-values-harness-section-column-code" className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(STRUCTURETABLE_GENERATED_VALUES_PROPS_INFO.parameterDef, "all")}
							</pre>
						</div>
					</div>
					<p>Optionally, a <span className="harness-highlight">start_value</span> can be set to specify what value to increment
						from when the <span className="harness-highlight">operation</span> is <span className="harness-highlight">index</span>.
						If the <span className="harness-highlight">start_value</span> is not set, it will default to 1.
					</p>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={STRUCTURETABLE_GENERATED_VALUES_DEFAULT_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
							/>
							{this.renderRightFlyoutButton(STRUCTURETABLE_GENERATED_VALUES_DEFAULT_PROPS_INFO)}
						</div>
						<div id="generated-values-harness-section-column-code" className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(STRUCTURETABLE_GENERATED_VALUES_DEFAULT_PROPS_INFO.parameterDef, "custom",
									["uihints",
										"id", "type", "complex_type_info", "key_definition",
										"generated_values", "operation", "start_value", "control"
									])}
							</pre>
						</div>
					</div>
				</div>
			</div>
		</section>);

		const contentActions = (<section id="Actions" className="section properties-documentation-content-controls-section">
			<h2 className="harness-properties-documentation-section-title">Actions</h2>
			<p className="harness-section-description">Actions are used to callback to the consuming application to allow the
				application to perform a task. All actions call <span className="harness-highlight">actionHandler</span> and pass
			<span className="harness-highlight"> actionId, appData, and data</span> back to the application.
					The following actions are supported in the Common Properties editor.</p>
			<div className="harness-properties-documentation-section-content">
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--button" className="harness-section-subtitle">button</h3>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={ACTION_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
								callbacks={{ actionHandler: this.actionHandler, controllerHandler: this.controllerHandler }}
							/>
							{this.renderRightFlyoutButton(ACTION_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(ACTION_PROPS_INFO.parameterDef, "all")}
							</pre>
						</div>
					</div>
				</div>
			</div>
			<div className="harness-properties-documentation-section-content">
				<div className="harness-properties-documentation-panels-controls-component">
					<h3 id="--image" className="harness-section-subtitle">image</h3>
					<div className="harness-section-row">
						<div className="harness-section-column">
							<CommonProperties
								propertiesInfo={ACTION_IMAGE_PROPS_INFO}
								propertiesConfig={this.propertiesConfig}
								callbacks={{ actionHandler: this.actionHandler, controllerHandler: this.controllerHandler }}
							/>
							{this.renderRightFlyoutButton(ACTION_IMAGE_PROPS_INFO)}
						</div>
						<div className="harness-section-column harness-section-column-code">
							<pre className="harness-json-block">
								{this.jsonReplacer(ACTION_IMAGE_PROPS_INFO.parameterDef, "all")}
							</pre>
						</div>
					</div>
				</div>
			</div>
		</section>);

		const content = (<div className="harness-properties-documentation-content">
			{contentIntro}
			{contentContainer}
			{contentPanels}
			{contentControls}
			{contentComplex}
			{contentActions}
		</div>);

		let rightFlyoutWidth = "0px";
		let rightFlyout = (<div className="right-flyout-panel" style={{ width: rightFlyoutWidth }} />);
		if (this.state.showRightFlyout) {
			rightFlyoutWidth = "318px";
			rightFlyout = (<div className="right-flyout-panel" style={{ width: rightFlyoutWidth }}>
				<CommonProperties
					propertiesInfo={this.state.rightFlyoutContent}
					callbacks={{ actionHandler: this.flyoutActionHandler, controllerHandler: this.flyoutControllerHandler }}
					propertiesConfig={{ containerType: "Custom", rightFlyout: true, enableResize: false }}
				/>);
			</div>);
		}

		return (
			<div className="harness-properties-documentation-container">
				{navBar}
				<div className="harness-properties-documentation-container-main-content" style={{ width: "calc(100% - " + rightFlyoutWidth + " )" }}>
					{header}
					{content}
				</div>
				{rightFlyout}
			</div>
		);
	}
}

export default CommonPropertiesComponents;
