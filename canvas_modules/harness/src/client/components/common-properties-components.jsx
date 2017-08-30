/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint complexity: ["error", 13] */
/* eslint max-len: ["error", 150] */

import React from "react";
import { Dropdown } from "ap-components-react/dist/ap-components-react";
import {
	CONTROLS_PROPS_INFO,
	TABS_PROPS_INFO,
	SUBTABS_PROPS_INFO,
	PANELS_PROPS_INFO,
	PANEL_SELECTOR_PROPS_INFO,
	CHECKBOX_PANEL_PROPS_INFO,
	COLUMNSELECTION_PROPS_INFO,
	TEXTFIELD_PROPS_INFO,
	TEXTAREA_PROPS_INFO,
	PASSWORD_FIELD_PROPS_INFO,
	EXPRESSION_PROPS_INFO,
	NUMBERFIELD_PROPS_INFO,
	NUMBERFIELD_GENERATOR_PROPS_INFO,
	CHECKBOX_SINGLE_PROPS_INFO,
	CHECKBOX_SET_PROPS_INFO,
	RADIOSET_HORIZONTAL_PROPS_INFO,
	RADIOSET_VERTICAL_PROPS_INFO,
	ONEOFSELECT_PROPS_INFO,
	FORCED_RADIOSET_PROPS_INFO,
	SOMEOFSELECT_PROPS_INFO,
	FORCED_CHECKBOX_SET_PROPS_INFO,
	SELECTCOLUMN_PROPS_INFO,
	SELECTCOLUMNS_PROPS_INFO,
	TOGGLETEXT_PROPS_INFO,
	TOGGLETEXTICONS_PROPS_INFO,
	STRUCTURETABLE_INLINE_TOGGLE_PROPS_INFO,
	STRUCTURETABLE_INLINE_TEXTFIELD_PROPS_INFO,
	STRUCTURETABLE_INLINE_DROPDOWN_PROPS_INFO,
	STRUCTURETABLE_SUBPANEL_TEXTFIELD_PROPS_INFO,
	STRUCTURELISTEDITOR_PROPS_INFO,
	STRUCTURETABLE_MOVEABLE_PROPS_INFO,
	STRUCTURETABLE_SORTABLE_PROPS_INFO,
	STRUCTURETABLE_FILTERABLE_PROPS_INFO
} from "../constants/properties-constants.js";
import { CommonProperties } from "common-canvas";

class CommonPropertiesComponents extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};

		this.jsonReplacer = this.jsonReplacer.bind(this);
		this.onMenuDropdownSelect = this.onMenuDropdownSelect.bind(this);
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

	onMenuDropdownSelect(evt, obj) {
		location.href = `${"#/properties#" + obj.selected}`;
		document.querySelector(`#${obj.selected}`).scrollIntoView();
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
				"id", "type", "parameter_refs", "depends_on_ref",
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
				"orientation"
			];
			break;
		case "controlData":
			jsonReplacer = [
				"parameters", "name", "type", "role", "enum", "required", "default",
				"uihints", "id", "parameter_info",
				"parameter_ref", "label", "description", "orientation",
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

	render() {
		const dropMenu = (<div id="properties-menu" className="header__dropdown">
			<Dropdown
				name="Navigation"
				text="Navigation"
				options={[
					"Groups",
					"--controls",
					"--panels",
					"--tabs",
					"--subtabs",
					"--panelSelector",
					"--checkboxPanel",
					"--columnSelection",
					"Controls",
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
					"--toggletext",
					"Complex",
					"--structuretable",
					"--structurelisteditor",
					"--edit-style",
					"--moveable_rows",
					"--sortable",
					"--filterable"
				]}
				compact
				dark
				inline
				onSelect={this.onMenuDropdownSelect}
			/>
		</div>);

		const navBar = (<div id="properties-navbar">
			<nav id="properties-action-bar">
				<ul className="properties-navbar-items">
					<li className="properties-navbar-li">
						<a id="properties-title">WDP Common Properties Components</a>
					</li>
					<li className="properties-navbar-li nav-divider">
						<a className="properties-nav-link" href="#/properties#Groups">Groups</a>
					</li>
					<li className="properties-navbar-li">
						<a className="properties-nav-link" href="#/properties#Controls">Controls</a>
					</li>
					<li className="properties-navbar-li">
						<a className="properties-nav-link" href="#/properties#Complex">Complex Types</a>
					</li>
				</ul>
				{dropMenu}
			</nav>
		</div>);

		const header = (<div id="main" className="properties-section-header">
			<h1 className="properties-page-title">WDP Common Properties Components</h1>
			<a className="properties-page-link"
				href="https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/tree/master/canvas_modules/common-canvas"
				target="_blank"
			>
				Source Code
			</a>
		</div>);

		const contentIntro = (<section id="Intro" className="section properties-content-intro-section">
			<h2 className="properties-section-title">Introduction</h2>
			<div className="section-description">
				<p>To create UIs based on the WDP Common Properties Components, a JSON adhering to
					the <a className="properties-page-intro-link"
						href="https://github.ibm.com/NGP-TWC/wdp-pipeline-schemas/tree/master/common-canvas/parameter-defs"
					>Parameter Definition Schema</a> has to be provided. The JSON contains parameter definitions, uihints,
					dataset_metadata, etc. The data in these sections is used to generate the UI. Certain parameter types
					translate into specific controls. The control type can be overriden in the uihints section, which follows
					the <a className="properties-page-intro-link"
						href="https://github.ibm.com/NGP-TWC/wdp-pipeline-schemas/blob/master/common-pipeline/operators/uihints-v1-schema.json"
					>UI Hints schema
					</a>. In addition, uihints are used to group UI controls.
				</p>
			</div>
		</section>);

		const contentPanels = (<section id="Groups" className="section properties-content-panels-section">
			<h2 className="properties-section-title">Groups</h2>
			<div className="section-description">
				<p>Every parameter definition needs to have a <span className="highlight">group_info</span> section
					to define how the UI elements are grouped. The <span className="highlight">type</span> attribute
					and the nesting of the elements in the <span className="highlight">group_info</span> array controls the
					type of the UI container.
				</p>
			</div>
			<div className="properties-section-content">
				<div id="panels-controls-component">
					<h3 id="--controls" className="section-subtitle">controls</h3>
					<p>With the default type <span className="highlight">controls</span>,
						the children elements will be displayed in a vertical layout.
					</p>
					<div className="section-row">
						<div className="section-column">
							<CommonProperties
								showPropertiesDialog
								propertiesInfo={CONTROLS_PROPS_INFO}
								useModalDialog={false}
								useOwnContainer
							/>
						</div>
						<div className="section-column section-column-code">
							<pre className="json-block">
								{this.jsonReplacer(CONTROLS_PROPS_INFO.parameterDef, "panel")}
							</pre>
						</div>
					</div>
				</div>
				<div id="panels-controls-component">
					<h3 id="--panels" className="section-subtitle">panels</h3>
					<p>To create a padded grouping of controls, use type <span className="highlight">panels</span>.
						The default padding is set to 8px.</p>
					<div className="section-row">
						<div className="section-row">
							<div className="section-column">
								<CommonProperties
									showPropertiesDialog
									propertiesInfo={PANELS_PROPS_INFO}
									useModalDialog={false}
									useOwnContainer
								/>
							</div>
							<div className="section-column section-column-code">
								<pre className="json-block">
									{this.jsonReplacer(PANELS_PROPS_INFO.parameterDef, "panel")}
								</pre>
							</div>
						</div>
					</div>
				</div>
				<div id="panels-controls-component">
					<h3 id="--tabs" className="section-subtitle">tabs</h3>
					<p>Multiple objects in the <span className="highlight">group_info</span> array will be rendered in separate tabs.
						Each object in the <span className="highlight">group_info</span> array must have a
						unique <span className="highlight">id</span>. To create sub tabs for nested group_info objects, see
						type <a className="properties-page-intro-link" href="#/properties#--subtabs">subTabs</a>.</p>
					<div className="section-row">
						<div className="section-row">
							<div className="section-column">
								<CommonProperties
									showPropertiesDialog
									propertiesInfo={TABS_PROPS_INFO}
									useModalDialog={false}
									useOwnContainer
								/>
							</div>
							<div className="section-column section-column-code">
								<pre className="json-block">
									{this.jsonReplacer(TABS_PROPS_INFO.parameterDef, "panel")}
								</pre>
							</div>
						</div>
					</div>
				</div>
				<div id="panels-controls-component">
					<h3 id="--subtabs" className="section-subtitle">subTabs</h3>
					<p>To create vertical sub-tabs, set the <span className="highlight">type</span> to <span className="highlight">subTabs</span> and
						add a nested <span className="highlight">group_info</span> array with the objects
						defining the grouping of the controls in the subtabs.</p>
					<div className="section-row">
						<div className="section-row">
							<div className="section-column">
								<CommonProperties
									showPropertiesDialog
									propertiesInfo={SUBTABS_PROPS_INFO}
									useModalDialog={false}
									useOwnContainer
								/>
							</div>
							<div className="section-column section-column-code">
								<pre className="json-block">
									{this.jsonReplacer(SUBTABS_PROPS_INFO.parameterDef, "panel")}
								</pre>
							</div>
						</div>
					</div>
				</div>
				<div id="panels-controls-component">
					<h3 id="--panelSelector" className="section-subtitle">panelSelector</h3>
					<p>To show panels based on the selection in
						a <a className="properties-page-intro-link" href="#/properties#--radioset">radio set
						</a>,
						add a nested <span className="highlight">group_info</span> object of
						type <span className="highlight">panelSelector</span> and in there, add
						another <span className="highlight">group_info</span> array with the sub-panels
						for each possible selection.</p>
					<div className="section-row">
						<div className="section-row">
							<div className="section-column">
								<CommonProperties
									showPropertiesDialog
									propertiesInfo={PANEL_SELECTOR_PROPS_INFO}
									useModalDialog={false}
									useOwnContainer
								/>
							</div>
							<div className="section-column section-column-code">
								<pre className="json-block">
									{this.jsonReplacer(PANEL_SELECTOR_PROPS_INFO.parameterDef, "panel")}
								</pre>
							</div>
						</div>
					</div>
				</div>
				<div id="panels-controls-component">
					<h3 id="--checkboxPanel" className="section-subtitle">checkboxPanel</h3>
					<p>A panel with a controlling checkbox that enables child controls when selected
						and disables child controls when deselected.</p>
					<div className="section-row">
						<div className="section-row">
							<div className="section-column">
								<CommonProperties
									showPropertiesDialog
									propertiesInfo={CHECKBOX_PANEL_PROPS_INFO}
									useModalDialog={false}
									useOwnContainer
								/>
							</div>
							<div className="section-column section-column-code">
								<pre className="json-block">
									{this.jsonReplacer(CHECKBOX_PANEL_PROPS_INFO.parameterDef, "panel")}
								</pre>
							</div>
						</div>
					</div>
				</div>
				<div id="panels-controls-component">
					<h3 id="--columnSelection" className="section-subtitle">columnSelection</h3>
					<p>To group multiple <a className="properties-page-intro-link" href="#/properties#--selectcolumns">
							selectcolumns
					</a> controls, use type <span className="highlight">columnSelection</span>. Having multiple controls in
						a <span className="highlight">columnSelection</span> let the controls share a
						single input list of <span className="highlight">dataset_metadata</span> fields.
						A field selected in the first <span className="highlight">selectcolumns</span> control
						cannot be selected in the second control.</p>
					<div className="section-row">
						<div className="section-row">
							<div className="section-column">
								<CommonProperties
									showPropertiesDialog
									propertiesInfo={COLUMNSELECTION_PROPS_INFO}
									useModalDialog={false}
									useOwnContainer
								/>
							</div>
							<div className="section-column section-column-code">
								<pre className="json-block">
									{this.jsonReplacer(COLUMNSELECTION_PROPS_INFO.parameterDef, "panel")}
								</pre>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>);

		const contentControls = (<section id="Controls" className="section properties-content-controls-section">
			<h2 className="properties-section-title">Controls</h2>
			<p className="section-description">The following controls are supported in the Common Properties editor.
				The type of a control is determined by the <span className="highlight">type</span> of a parameter.</p>
			<div className="properties-section-content">
				<div id="panels-controls-component">
					<h3 id="--textfield" className="section-subtitle">textfield</h3>
					<p>A single line editable text field is rendered for a parameter of <span className="highlight">type</span> string.
						This is the default.</p>
					<div className="section-row">
						<div className="section-column">
							<CommonProperties
								showPropertiesDialog
								propertiesInfo={TEXTFIELD_PROPS_INFO}
								useModalDialog={false}
								useOwnContainer
							/>
						</div>
						<div className="section-column section-column-code">
							<pre className="json-block">
								{this.jsonReplacer(TEXTFIELD_PROPS_INFO.parameterDef, "control")}
							</pre>
						</div>
					</div>
				</div>
				<div id="panels-controls-component">
					<h3 id="--textarea" className="section-subtitle">textarea</h3>
					<p>A multi-line text area is rendered for a parameter of <span className="highlight">type</span> array[string].</p>
					<div className="section-row">
						<div className="section-column">
							<CommonProperties
								showPropertiesDialog
								propertiesInfo={TEXTAREA_PROPS_INFO}
								useModalDialog={false}
								useOwnContainer
							/>
						</div>
						<div className="section-column section-column-code">
							<pre className="json-block">
								{this.jsonReplacer(TEXTAREA_PROPS_INFO.parameterDef, "control")}
							</pre>
						</div>
					</div>
				</div>
				<div id="panels-controls-component">
					<h3 id="--password" className="section-subtitle">password</h3>
					<p>A masked single line text field is rendered for a parameter of <span className="highlight">type</span> password.</p>
					<div className="section-row">
						<div className="section-column">
							<CommonProperties
								showPropertiesDialog
								propertiesInfo={PASSWORD_FIELD_PROPS_INFO}
								useModalDialog={false}
								useOwnContainer
							/>
						</div>
						<div className="section-column section-column-code">
							<pre className="json-block">
								{this.jsonReplacer(PASSWORD_FIELD_PROPS_INFO.parameterDef, "control")}
							</pre>
						</div>
					</div>
				</div>
				<div id="panels-controls-component">
					<h3 id="--expression" className="section-subtitle">expression</h3>
					<p>An expression editing field is rendered for a parameter of <span className="highlight">type</span> string
						and <span className="highlight">role</span> expression.
						Currently the expression field has the same behavior as a textarea.</p>
					<div className="section-row">
						<div className="section-column">
							<CommonProperties
								showPropertiesDialog
								propertiesInfo={EXPRESSION_PROPS_INFO}
								useModalDialog={false}
								useOwnContainer
							/>
						</div>
						<div className="section-column section-column-code">
							<pre className="json-block">
								{this.jsonReplacer(EXPRESSION_PROPS_INFO.parameterDef, "control")}
							</pre>
						</div>
					</div>
				</div>
				<div id="panels-controls-component">
					<h3 id="--numberfield" className="section-subtitle">numberfield</h3>
					<p>A numeric text field is rendered for a parameter of <span className="highlight">type</span> integer.</p>
					<div className="section-row">
						<div className="section-column">
							<CommonProperties
								showPropertiesDialog
								propertiesInfo={NUMBERFIELD_PROPS_INFO}
								useModalDialog={false}
								useOwnContainer
							/>
						</div>
						<div className="section-column section-column-code">
							<pre className="json-block">
								{this.jsonReplacer(NUMBERFIELD_PROPS_INFO.parameterDef, "control")}
							</pre>
						</div>
					</div>
					<p>Number fields can also optionally display a random number generator
						next to the control label by adding a <span className="highlight">number_generator</span> attribute
						in the <span className="highlight">parameter_info</span> section.</p>
					<div className="section-row">
						<div className="section-column">
							<CommonProperties
								showPropertiesDialog
								propertiesInfo={NUMBERFIELD_GENERATOR_PROPS_INFO}
								useModalDialog={false}
								useOwnContainer
							/>
						</div>
						<div className="section-column section-column-code">
							<pre className="json-block">
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
				<div id="panels-controls-component">
					<h3 id="--checkbox" className="section-subtitle">checkbox</h3>
					<p>A checkbox control is rendered for a parameter of <span className="highlight">type</span> boolean.
						The value in the <span className="highlight">enum</span> array
						sets the label for the checkbox control.</p>
					<div className="section-row">
						<div className="section-column">
							<CommonProperties
								showPropertiesDialog
								propertiesInfo={CHECKBOX_SINGLE_PROPS_INFO}
								useModalDialog={false}
								useOwnContainer
							/>
						</div>
						<div className="section-column section-column-code">
							<pre className="json-block">
								{this.jsonReplacer(CHECKBOX_SINGLE_PROPS_INFO.parameterDef, "control")}
							</pre>
						</div>
					</div>
				</div>
				<div id="panels-controls-component">
					<h3 id="--checkboxset" className="section-subtitle">checkboxset</h3>
					<p>For parameters of <span className="highlight">type</span> array[string] with fewer than five elements,
						a checkboxset is rendered. For five or more elements,
						a <a className="properties-page-intro-link" href="#/properties#--someofselect">
								someofselect
						</a> control is rendered.</p>
					<div className="section-row">
						<div className="section-column">
							<CommonProperties
								showPropertiesDialog
								propertiesInfo={CHECKBOX_SET_PROPS_INFO}
								useModalDialog={false}
								useOwnContainer
							/>
						</div>
						<div className="section-column section-column-code">
							<pre className="json-block">
								{this.jsonReplacer(CHECKBOX_SET_PROPS_INFO.parameterDef, "control")}
							</pre>
						</div>
					</div>
				</div>
				<div id="panels-controls-component">
					<h3 id="--radioset" className="section-subtitle">radioset</h3>
					<p> A radio set where a parameter value is selected from up to four options.
						For five or more options, a <a className="properties-page-intro-link" href="#/properties#--oneofselect">
						oneofselect
						</a> control is rendered.</p>
					<div className="section-row">
						<div className="section-column">
							<CommonProperties
								showPropertiesDialog
								propertiesInfo={RADIOSET_HORIZONTAL_PROPS_INFO}
								useModalDialog={false}
								useOwnContainer
							/>
						</div>
						<div className="section-column section-column-code">
							<pre className="json-block">
								{this.jsonReplacer(RADIOSET_HORIZONTAL_PROPS_INFO.parameterDef, "control")}
							</pre>
						</div>
					</div>
					<p>The orientation of the radio buttons is controled by the <span className="highlight">orientation</span> value
						in the parameter_info. If the attribute is not specified, the radio buttons will be layed out horizontally.</p>
					<div className="section-row">
						<div className="section-column">
							<CommonProperties
								showPropertiesDialog
								propertiesInfo={RADIOSET_VERTICAL_PROPS_INFO}
								useModalDialog={false}
								useOwnContainer
							/>
						</div>
						<div className="section-column section-column-code">
							<pre className="json-block">
								{this.jsonReplacer(RADIOSET_VERTICAL_PROPS_INFO.parameterDef, "custom",
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
				<div id="panels-controls-component">
					<h3 id="--oneofselect" className="section-subtitle">oneofselect</h3>
					<p>A dropdown list control is rendered for a parameter with an <span className="highlight">enum</span> list
						with five or more elements. For fewer than five elements,
						a <a className="properties-page-intro-link" href="#/properties#--radioset">
						radioset
						</a> control is rendered.</p>
					<div className="section-row">
						<div className="section-column">
							<CommonProperties
								showPropertiesDialog
								propertiesInfo={ONEOFSELECT_PROPS_INFO}
								useModalDialog={false}
								useOwnContainer
							/>
						</div>
						<div className="section-column section-column-code">
							<pre className="json-block">
								{this.jsonReplacer(ONEOFSELECT_PROPS_INFO.parameterDef, "control")}
							</pre>
						</div>
					</div>
					<p>A <a className="properties-page-intro-link" href="#/properties#--oneofselect">
						oneofselect
					</a> control can be forced to render as a <a className="properties-page-intro-link" href="#/properties#--radioset">
							radioset
					</a> by adding a <span className="highlight">control</span> attribute set
						to <span className="highlight">radioset</span>. Similarly, a <span className="highlight">radioset</span> control can
						be forced to render as a <span className="highlight">oneofselect</span>.</p>
					<div className="section-row">
						<div className="section-column">
							<CommonProperties
								showPropertiesDialog
								propertiesInfo={FORCED_RADIOSET_PROPS_INFO}
								useModalDialog={false}
								useOwnContainer
							/>
						</div>
						<div className="section-column section-column-code">
							<pre className="json-block">
								{this.jsonReplacer(FORCED_RADIOSET_PROPS_INFO.parameterDef, "custom",
									["uihints", "parameter_info", "control", "orientation"])}
							</pre>
						</div>
					</div>
				</div>
				<div id="panels-controls-component">
					<h3 id="--someofselect" className="section-subtitle">someofselect</h3>
					<p>A multi-selection control is rendered for a parameter with an <span className="highlight">enum</span> list
						with five or more elements of <span className="highlight">type</span> array[string].
						For fewer than five elements,
						a <a className="properties-page-intro-link" href="#/properties#--checkboxset">
						checkboxset
						</a> control is rendered.</p>
					<div className="section-row">
						<div className="section-column">
							<CommonProperties
								showPropertiesDialog
								propertiesInfo={SOMEOFSELECT_PROPS_INFO}
								useModalDialog={false}
								useOwnContainer
							/>
						</div>
						<div className="section-column section-column-code">
							<pre className="json-block">
								{this.jsonReplacer(SOMEOFSELECT_PROPS_INFO.parameterDef, "control")}
							</pre>
						</div>
					</div>
					<p>A <a className="properties-page-intro-link" href="#/properties#--someofselect">
						someofselect
					</a> control can be forced to render as a <a className="properties-page-intro-link" href="#/properties#--checkboxset">
							checkboxset
					</a> by adding a <span className="highlight">control</span> attribute set
						to <span className="highlight">checkboxset</span>. Similarly, a <span className="highlight">checkboxset</span> control
						can be forced to render as a <span className="highlight">someofselect</span>.</p>
					<div className="section-row">
						<div className="section-column">
							<CommonProperties
								showPropertiesDialog
								propertiesInfo={FORCED_CHECKBOX_SET_PROPS_INFO}
								useModalDialog={false}
								useOwnContainer
							/>
						</div>
						<div className="section-column section-column-code">
							<pre className="json-block">
								{this.jsonReplacer(FORCED_CHECKBOX_SET_PROPS_INFO.parameterDef, "custom",
									["uihints", "parameter_info", "control"])}
							</pre>
						</div>
					</div>
				</div>
				<div id="panels-controls-component">
					<h3 id="--selectcolumn" className="section-subtitle">selectcolumn</h3>
					<p>A dropdown control that contains the available fields provided in <span className="highlight">dataset_metadata</span>.
						The type of the parameter associated with the dropdown list must be of <span className="highlight">type</span> string
						and the <span className="highlight">role</span> must be set to column.</p>
					<div className="section-row">
						<div className="section-column">
							<CommonProperties
								showPropertiesDialog
								propertiesInfo={SELECTCOLUMN_PROPS_INFO}
								useModalDialog={false}
								useOwnContainer
							/>
						</div>
						<div className="section-column section-column-code">
							<pre className="json-block">
								{this.jsonReplacer(SELECTCOLUMN_PROPS_INFO.parameterDef, "all")}
							</pre>
						</div>
					</div>
				</div>
				<div id="panels-controls-component">
					<h3 id="--selectcolumns" className="section-subtitle">selectcolumns</h3>
					<p>A multi-select control for column selections. The type of the parameter associated with this control
						must be of <span className="highlight">type</span> array[string] and
						the <span className="highlight">role</span> must be set to <span className="highlight">column</span>.
						The <span className="highlight">type</span> in <span className="highlight">group_info</span> needs
						to be set to <a className="properties-page-intro-link" href="#/properties#--columnSelection">
							columnSelection
						</a>.</p>
					<div className="section-row">
						<div className="section-column">
							<CommonProperties
								showPropertiesDialog
								propertiesInfo={SELECTCOLUMNS_PROPS_INFO}
								useModalDialog={false}
								useOwnContainer
							/>
						</div>
						<div className="section-column section-column-code">
							<pre className="json-block">
								{this.jsonReplacer(SELECTCOLUMNS_PROPS_INFO.parameterDef, "all")}
							</pre>
						</div>
					</div>
				</div>
				<div id="panels-controls-component">
					<h3 id="--toggletext" className="section-subtitle">toggletext</h3>
					<p>A two-state control with optional icons that can exist on its own or within table cells.
						The <span className="highlight">control</span> must be set to <span className="highlight">toggletext</span>.</p>
					<div className="section-row">
						<div className="section-column">
							<CommonProperties
								showPropertiesDialog
								propertiesInfo={TOGGLETEXT_PROPS_INFO}
								useModalDialog={false}
								useOwnContainer
							/>
						</div>
						<div className="section-column section-column-code">
							<pre className="json-block">
								{this.jsonReplacer(TOGGLETEXT_PROPS_INFO.parameterDef, "control")}
							</pre>
						</div>
					</div>
					<p>Icons can be placed next to the <span className="highlight">toggletext</span> by
						adding a <span className="highlight">value_icons</span> array of two images, one for each
						corresponding enum options.</p>
					<div className="section-row">
						<div className="section-column">
							<CommonProperties
								showPropertiesDialog
								propertiesInfo={TOGGLETEXTICONS_PROPS_INFO}
								useModalDialog={false}
								useOwnContainer
							/>
						</div>
						<div className="section-column section-column-code">
							<pre className="json-block">
								{this.jsonReplacer(TOGGLETEXTICONS_PROPS_INFO.parameterDef, "custom",
									["uihints", "parameter_info", "value_icons"])}
							</pre>
						</div>
					</div>
				</div>
			</div>
		</section>);

		const contentComplex = (<section id="Complex" className="section properties-content-complex-section">
			<h2 className="properties-section-title">Complex Types</h2>
			<div className="section-description">
				<p>Complex types representing lists or maps of basic parameter types are supported
					via complex type controls. Controls can appear as rows in tables or standing on
					their own in panels. The following controls are supported for complex types:&nbsp;
					<span className="highlight">toggletext</span>, <span className="highlight">oneofselect</span>,&nbsp;
					<span className="highlight">enum</span>, and <span className="highlight">textfield</span></p>
			</div>
			<div className="properties-section-content">
				<div id="panels-controls-component">
					<h3 id="--structuretable" className="section-subtitle">structuretable</h3>
					<p>A complex type table control for editing lists or maps of structures that with field names
						in the first column. The <span className="highlight">type</span> in <span className="highlight">group_info</span> needs
						to be set to <a className="properties-page-intro-link" href="#/properties#--columnSelection">
							columnSelection
						</a>.</p>
					<div className="section-row">
						<div className="section-column">
							<CommonProperties
								showPropertiesDialog
								propertiesInfo={STRUCTURETABLE_INLINE_TOGGLE_PROPS_INFO}
								useModalDialog={false}
								useOwnContainer
							/>
						</div>
						<div className="section-column section-column-code">
							<pre className="json-block">
								{this.jsonReplacer(STRUCTURETABLE_INLINE_TOGGLE_PROPS_INFO.parameterDef, "all")}
							</pre>
						</div>
					</div>
				</div>
				<div id="panels-controls-component">
					<h3 id="--structurelisteditor" className="section-subtitle">structurelisteditor</h3>
					<p>For lists or maps of structures that are not field-oriented properties.
						This complex type control will be rendered if
						the <span className="highlight">type</span> in <span className="highlight">group_info</span> is
						not set, which will default to group type <a className="properties-page-intro-link" href="#/properties#--controls">
							controls
						</a>.</p>
					<div className="section-row">
						<div className="section-column">
							<CommonProperties
								showPropertiesDialog
								propertiesInfo={STRUCTURELISTEDITOR_PROPS_INFO}
								useModalDialog={false}
								useOwnContainer
							/>
						</div>
						<div className="section-column section-column-code">
							<pre className="json-block">
								{this.jsonReplacer(STRUCTURELISTEDITOR_PROPS_INFO.parameterDef, "all")}
							</pre>
						</div>
					</div>
				</div>
				<div id="panels-controls-component">
					<h3 id="--attributes">Attributes</h3>
					<p>The following attributes can be applied to complex_types controls.</p>
					<h4 id="--edit-style" className="section-row-title section-subtitle">edit_style</h4>
					<p>When editing complex type values in tables, one can either edit cell values inline or in a sub panel.
						The <span className="highlight">edit_style</span> attribute is set in
						the <span className="highlight">parameters</span> object
						within <span className="highlight">complex_type_info</span>. The available options
						are <span className="highlight">inline</span> and <span className="highlight">subpanel</span>.
					</p>
					<p><span className="highlight">inline</span> will render controls inline within the table cells for editing values.
						The following example shows a <a className="properties-page-intro-link" href="#/properties#--oneofselect">
							oneofselect
						</a> control <span className="highlight">inline</span> with the structuretable rows.</p>
					<div className="section-row">
						<div className="section-column">
							<CommonProperties
								showPropertiesDialog
								propertiesInfo={STRUCTURETABLE_INLINE_DROPDOWN_PROPS_INFO}
								useModalDialog={false}
								useOwnContainer
							/>
						</div>
						<div className="section-column section-column-code">
							<pre className="json-block">
								{this.jsonReplacer(STRUCTURETABLE_INLINE_DROPDOWN_PROPS_INFO.parameterDef, "all")}
							</pre>
						</div>
					</div>
					<p>The following example shows a <a className="properties-page-intro-link" href="#/properties#--textfield">
						textfield
					</a> control <span className="highlight">inline</span> with the structuretable rows.</p>
					<div className="section-row">
						<div className="section-column">
							<CommonProperties
								showPropertiesDialog
								propertiesInfo={STRUCTURETABLE_INLINE_TEXTFIELD_PROPS_INFO}
								useModalDialog={false}
								useOwnContainer
							/>
						</div>
						<div className="section-column section-column-code">
							<pre className="json-block">
								{this.jsonReplacer(STRUCTURETABLE_INLINE_TEXTFIELD_PROPS_INFO.parameterDef, "all")}
							</pre>
						</div>
					</div>
					<p><span className="highlight">subpanel</span> will render a button that will launch a small sub-dialog to edit cell values.
						Using the inline textfield example above, by changing the <span className="highlight">edit_style</span> attribute
						from <span className="highlight">inline</span> to <span className="highlight">subpanel</span>, it will genereate a
						subcontrol button for users to edit the field in another panel.</p>
					<div className="section-row">
						<div className="section-column">
							<CommonProperties
								showPropertiesDialog
								propertiesInfo={STRUCTURETABLE_SUBPANEL_TEXTFIELD_PROPS_INFO}
								useModalDialog={false}
								useOwnContainer
							/>
						</div>
						<div className="section-column section-column-code">
							<pre className="json-block">
								{this.jsonReplacer(STRUCTURETABLE_SUBPANEL_TEXTFIELD_PROPS_INFO.parameterDef, "all")}
							</pre>
						</div>
					</div>
					<h4 id="--moveable_rows" className="section-row-title section-subtitle">moveable_rows</h4>
					<p><span className="highlight">moveable_rows</span> is a boolean attribute that can be set
						in <span className="highlight">complex_type_definition</span> sections.
						If set to true, it allows rows in the table to be moved up and down for reordering.</p>
					<p>Using the structure table inline oneofselect example above, adding
						the <span className="highlight">moveable_rows</span> attribute will create the control with arrows
						on the right side of the table to allow reordering of the rows.</p>
					<div className="section-row">
						<div className="section-column">
							<CommonProperties
								showPropertiesDialog
								propertiesInfo={STRUCTURETABLE_MOVEABLE_PROPS_INFO}
								useModalDialog={false}
								useOwnContainer
							/>
						</div>
						<div className="section-column section-column-code">
							<pre className="json-block">
								{this.jsonReplacer(STRUCTURETABLE_MOVEABLE_PROPS_INFO.parameterDef, "custom",
									["uihints", "complex_type_info", "moveable_rows"])}
							</pre>
						</div>
					</div>
					<h4 id="--sortable" className="section-row-title section-subtitle">sortable</h4>
					<p><span className="highlight">sortable</span> is a boolean attribute that can be
						applied to table columns. When set within the <span className="highlight">key_definition</span> or
						the <span className="highlight">parameters</span> sections of a structure definition,
						those columns are sortable.</p>
					<p>Using the structure table inline oneofselect example above, adding
						the <span className="highlight">sortable</span> attribute in
						the <span className="highlight">key_definition</span> section will
						allow the Field column to be sortable. Adding
						the <span className="highlight">sortable</span> attribute in
						the <span className="highlight">parameters</span> section within
						the <span className="highlight">complex_type_info</span> will
						allow the Type column to be sortable.</p>
					<div className="section-row">
						<div className="section-column">
							<CommonProperties
								showPropertiesDialog
								propertiesInfo={STRUCTURETABLE_SORTABLE_PROPS_INFO}
								useModalDialog={false}
								useOwnContainer
							/>
						</div>
						<div className="section-column section-column-code">
							<pre className="json-block">
								{this.jsonReplacer(STRUCTURETABLE_SORTABLE_PROPS_INFO.parameterDef, "custom",
									["uihints", "complex_type_info", "key_definition", "sortable", "parameters"])}
							</pre>
						</div>
					</div>
					<h4 id="--filterable" className="section-row-title section-subtitle">filterable</h4>
					<p><span className="highlight">filterable</span> is a boolean attribute that can be
						applied to table columns. When set within the <span className="highlight">key_definition</span> or
						the <span className="highlight">parameters</span> sections of a structure definition,
						those columns can be filtered upon.</p>
					<p>Using the structure table inline oneofselect example above, adding
						the <span className="highlight">filterable</span> attribute in
						the <span className="highlight">key_definition</span> section will
						allow the columns to be filtered using a search bar. Since
						the <span className="highlight">filterable</span> attribute was not added to
						the <span className="highlight">parameters</span> section, the Type column
						will not be filterable.</p>
					<div className="section-row">
						<div className="section-column">
							<CommonProperties
								showPropertiesDialog
								propertiesInfo={STRUCTURETABLE_FILTERABLE_PROPS_INFO}
								useModalDialog={false}
								useOwnContainer
							/>
						</div>
						<div className="section-column section-column-code">
							<pre className="json-block">
								{this.jsonReplacer(STRUCTURETABLE_FILTERABLE_PROPS_INFO.parameterDef, "custom",
									["uihints", "complex_type_info", "key_definition", "filterable"])}
							</pre>
						</div>
					</div>
				</div>
			</div>
		</section>);

		const content = (<div id="properties-content">
			{contentIntro}
			{contentPanels}
			{contentControls}
			{contentComplex}
		</div>);

		return (
			<div id="properties-container">
				{navBar}
				{header}
				{content}
			</div>
		);
	}
}

export default CommonPropertiesComponents;
