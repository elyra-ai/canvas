/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2016
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/

/* eslint complexity: ["error", 28] */
/* eslint max-depth: ["error", 6] */

import logger from "../../../utils/logger";
import React from "react";
import { ButtonToolbar, Panel } from "react-bootstrap";

import { Tabs } from "ap-components-react/dist/ap-components-react";

import { CONDITION_ERROR_MESSAGE } from "../constants/constants.js";
import ControlItem from "./control-item.jsx";
import TextfieldControl from "./textfield-control.jsx";
import ToggletextControl from "./toggletext-control.jsx";
import TextareaControl from "./textarea-control.jsx";
import ExpressionControl from "./expression-control.jsx";
import PasswordControl from "./password-control.jsx";
import NumberfieldControl from "./numberfield-control.jsx";
import CheckboxControl from "./checkbox-control.jsx";
import CheckboxsetControl from "./checkboxset-control.jsx";
import RadiosetControl from "./radioset-control.jsx";
import OneofselectControl from "./oneofselect-control.jsx";
import SomeofselectControl from "./someofselect-control.jsx";
import OneofcolumnsControl from "./oneofcolumns-control.jsx";
import SomeofcolumnsControl from "./someofcolumns-control.jsx";
import ColumnAllocatorControl from "./column-allocator-control.jsx";
import ColumnSelectControl from "./column-select-control.jsx";
import ColumnStructureAllocatorControl from "./column-structure-allocator-control.jsx";
import ColumnStructureTableControl from "./column-structure-table-control.jsx";
import StructureeditorControl from "./structureeditor-control.jsx";
import StructurelisteditorControl from "./structure-list-editor-control.jsx";
import FieldPicker from "./field-picker.jsx";
import ColumnAllocationPanel from "./../editor-panels/column-allocation-panel.jsx";
import SelectorPanel from "./../editor-panels/selector-panel.jsx";
import SubPanelButton from "./../editor-panels/sub-panel-button.jsx";
import UiConditions from "../ui-conditions/ui-conditions.js";
import UiConditionsParser from "../ui-conditions/ui-conditions-parser.js";

export default class EditorForm extends React.Component {

	static tabId(component, id, hash) {
		if (hash) {
			return "#tab-" + component + "-" + id;
		}
		return "tab-" + component + "-" + id;
	}

	constructor(props) {
		super(props);
		this.state = {
			formData: this.props.form,
			valuesTable: this.props.form.data.currentProperties,
			validateErrorMessage: [],
			visibleDefinition: [],
			enabledDefinitions: [],
			validationDefinitions: [],
			validationGroupDefinitions: [],
			// controlValidations: {},
			controlStates: {},
			selectedRows: {},
			showFieldPicker: false,
			fieldPickerControl: {},
			activeTabId: ""
		};

		this.sharedCtrlNames = [];

		this.getControlValue = this.getControlValue.bind(this);
		this.updateControlValue = this.updateControlValue.bind(this);
		this.updateControlValues = this.updateControlValues.bind(this);
		this.updateSelectedRows = this.updateSelectedRows.bind(this);

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.parseUiConditions = this.parseUiConditions.bind(this);

		this.getControlValues = this.getControlValues.bind(this);
		this.getControl = this.getControl.bind(this);
		this.genPanel = this.genPanel.bind(this);
		this.genUIContent = this.genUIContent.bind(this);
		this.genUIItem = this.genUIItem.bind(this);

		this.closeFieldPicker = this.closeFieldPicker.bind(this);
		this.openFieldPicker = this.openFieldPicker.bind(this);
		this.getFilteredDataset = this.getFilteredDataset.bind(this);
		this.generateSharedControlNames = this.generateSharedControlNames.bind(this);
		this.getSelectedRows = this.getSelectedRows.bind(this);
	}

	componentDidMount() {
		if (this.props.form.data.conditions) {
			this.parseUiConditions(this.props.form.data.conditions);
		}
	}

	getControl(propertyName) {
		return this.refs[propertyName];
	}

	/**
	 * Retrieves a filtered data model in which all fields that are already
	 * in use by other controls are already filtered out.
	 *
	 * @param skipControlName Name of control to skip when checking field controls
	 * @return Filtered dataset metadata with fields in use removed
	 */
	getFilteredDataset(skipControlName) {
		const data = this.state.formData.data.datasetMetadata;
		if (!this.sharedCtrlNames) {
			return data;
		}
		const filteredDataset = JSON.parse(JSON.stringify(data)); // deep copy

		let sharedDataModelPanel = false;
		for (let h = 0; h < this.sharedCtrlNames.length; h++) {
			if (skipControlName === this.sharedCtrlNames[h].controlName) {
				sharedDataModelPanel = true;
				break;
			}
		}

		if (sharedDataModelPanel) {
			const temp = [];
			for (let i = 0; i < this.sharedCtrlNames.length; i++) {
				const ctrlName = this.sharedCtrlNames[i].controlName;
				if (ctrlName !== skipControlName) {
					// only remove from the main list the values that are in other controls
					const values = this.state.valuesTable[ctrlName];
					for (let j = 0; j < values.length; j++) {
						temp.push(data.fields.filter(function(element) {
							return values[j].split(",")[0].indexOf(element.name) > -1;
						})[0]);
						// logger.info("Temp is: " + JSON.stringify(temp));
					}
				}
			}

			if (temp.length > 0) {
				for (let k = 0; k < temp.length; k++) {
					filteredDataset.fields = filteredDataset.fields.filter(function(element) {
						return element && temp[k] && element.name !== temp[k].name;
					});
					// logger.info("filteredData.fields is: " + JSON.stringify(filteredData.fields));
				}
			}
		}
		return filteredDataset;
	}

	getControlValue(controlId) {
		return this.state.valuesTable[controlId];
	}

	getControlValues() {
		var values = {};
		for (var ref in this.refs) {
			// Slightly hacky way of identifying non-control references with
			// 3 underscores...
			if (!(ref.startsWith("___"))) {
				// logger.info(this.refs[ref]);
				// logger.info(this.refs[ref].getControlValue());
				values[ref] = this.refs[ref].getControlValue();
			}
		}
		// logger.info(values);
		return values;
	}

	getSelectedRows(controlName) {
		if (!this.state.selectedRows[controlName]) {
			this.state.selectedRows[controlName] = [];
		}
		return this.state.selectedRows[controlName];
	}

	updateControlValue(controlId, controlValue) {
		const that = this;
		var values = this.state.valuesTable;
		values[controlId] = controlValue;
		this.setState({ valuesTable: values });
		setTimeout(() => {
			that.getControl(controlId).validateInput();
		}, 200);
	}

	updateControlValues() {
		var values = this.state.valuesTable;
		for (var ref in this.refs) {
			// Slightly hacky way of identifying non-control references with
			// 3 underscores...
			if (!(ref.startsWith("___"))) {
				values[ref] = this.refs[ref].getControlValue();
			}
		}
		this.setState({ valuesTable: values });
	}

	updateSelectedRows(controlName, selection) {
		const selectedRows = this.state.selectedRows;
		selectedRows[controlName] = selection;
		this.setState({ selectedRows: selectedRows });
	}

	genControl(control, idPrefix, controlValueAccessor, datasetMetadata) {
		const controlId = idPrefix + control.name;

		// List of available controls is defined in models/editor/Control.scala
		if (control.controlType === "textfield") {
			return (<TextfieldControl control={control}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				updateControlValue={this.updateControlValue}
				controlStates={this.state.controlStates}
			/>);
		} else if (control.controlType === "textarea") {
			return (<TextareaControl control={control}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				updateControlValue={this.updateControlValue}
				controlStates={this.state.controlStates}
			/>);
		} else if (control.controlType === "expression") {
			return (<ExpressionControl control={control}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				updateControlValue={this.updateControlValue}
				controlStates={this.state.controlStates}
			/>);
		} else if (control.controlType === "toggletext") {
			return (<ToggletextControl control={control}
				updateControlValue={this.updateControlValue}
				valueAccessor={controlValueAccessor}
				updateControlValue={this.updateControlValue}
				values={control.values}
				valueLabels={control.valueLabels}
				valueIcons={control.valueIcons}

			/>);
		} else if (control.controlType === "passwordfield") {
			return (<PasswordControl control={control}
				key={controlId}
				ref={controlId}
				updateControlValue={this.updateControlValue}
				valueAccessor={controlValueAccessor}
			/>);
		} else if (control.controlType === "numberfield") {
			return (<NumberfieldControl control={control}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				updateControlValue={this.updateControlValue}
				validationDefinitions={this.state.validationDefinitions}
				controlStates={this.state.controlStates}
			/>);
		} else if (control.controlType === "checkbox") {
			return (<CheckboxControl control={control}
				key={controlId}
				ref={controlId}
				updateControlValue={this.updateControlValue}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				controlStates={this.state.controlStates}
			/>);
		} else if (control.controlType === "checkboxset") {
			return (<CheckboxsetControl control={control}
				key={controlId}
				ref={controlId}
				updateControlValue={this.updateControlValue}
				valueAccessor={controlValueAccessor}
			/>);
		} else if (control.controlType === "radioset") {
			return (<RadiosetControl control={control}
				key={controlId}
				ref={controlId}
				updateControlValue={this.updateControlValue}
				valueAccessor={controlValueAccessor}
			/>);
		} else if (control.controlType === "oneofselect") {
			return (<OneofselectControl control={control}
				key={controlId}
				ref={controlId}
				updateControlValue={this.updateControlValue}
				valueAccessor={controlValueAccessor}
			/>);
		} else if (control.controlType === "someofselect") {
			return (<SomeofselectControl control={control}
				key={controlId}
				ref={controlId}
				updateControlValue={this.updateControlValue}
				valueAccessor={controlValueAccessor}
			/>);
		} else if (control.controlType === "oneofcolumns") {
			return (<OneofcolumnsControl control={control}
				dataModel={datasetMetadata}
				key={controlId}
				ref={controlId}
				updateControlValue={this.updateControlValue}
				valueAccessor={controlValueAccessor}
			/>);
		} else if (control.controlType === "someofcolumns") {
			return (<SomeofcolumnsControl control={control}
				dataModel={datasetMetadata}
				key={controlId}
				ref={controlId}
				updateControlValue={this.updateControlValue}
				valueAccessor={controlValueAccessor}
				openFieldPicker={this.openFieldPicker}
			/>);
		} else if (control.controlType === "allocatedcolumn") {
			// logger.info("allocatedcolumn");
			return (<ColumnAllocatorControl control={control}
				dataModel={datasetMetadata}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				updateControlValue={this.updateControlValue}
				availableFieldsAccessor={this.getFilteredDataset}
				controlStates={this.state.controlStates}
			/>);
		} else if (control.controlType === "allocatedcolumns") {
			// logger.info("allocatedcolumns");
			return (<ColumnAllocatorControl control={control}
				dataModel={datasetMetadata}
				multiColumn
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				controlStates={this.state.controlStates}
				updateControlValue={this.updateControlValue}
				selectedRows={this.getSelectedRows(control.name)}
			/>);
		} else if (control.controlType === "columnselect") {
			return (<ColumnSelectControl control={control}
				dataModel={datasetMetadata}
				multiColumn
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				controlStates={this.state.controlStates}
				openFieldPicker={this.openFieldPicker}
				updateControlValue={this.updateControlValue}
				updateSelectedRows={this.updateSelectedRows}
				selectedRows={this.getSelectedRows(control.name)}
			/>);
		} else if (control.controlType === "allocatedstructures") {
			// logger.info("allocatedstructures");
			return (<ColumnStructureAllocatorControl control={control}
				dataModel={datasetMetadata}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				updateControlValue={this.updateControlValue}
				validationDefinitions={this.state.validationDefinitions}
				controlStates={this.state.controlStates}
				updateSelectedRows={this.updateSelectedRows}
				selectedRows={this.getSelectedRows(control.name)}
				buildUIItem={this.genUIItem}
			/>);
		} else if (control.controlType === "structuretable") {
			return (<ColumnStructureTableControl control={control}
				dataModel={datasetMetadata}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				updateControlValue={this.updateControlValue}
				updateSelectedRows={this.updateSelectedRows}
				validationDefinitions={this.state.validationDefinitions}
				controlStates={this.state.controlStates}
				selectedRows={this.getSelectedRows(control.name)}
				buildUIItem={this.genUIItem}
				openFieldPicker={this.openFieldPicker}
			/>);
		} else if (control.controlType === "structureeditor") {
			// logger.info("structureeditor");
			return (<StructureeditorControl control={control}
				dataModel={datasetMetadata}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				updateControlValue={this.updateControlValue}
				updateSelectedRows={this.updateSelectedRows}
				selectedRows={this.getSelectedRows(control.name)}
				buildUIItem={this.genUIItem}
			/>);
		} else if (control.controlType === "structurelisteditor") {
			// logger.info("structurelisteditor");
			return (<StructurelisteditorControl control={control}
				dataModel={datasetMetadata}
				key={controlId} ref={controlId}
				valueAccessor={controlValueAccessor}
				updateControlValue={this.updateControlValue}
				updateSelectedRows={this.updateSelectedRows}
				selectedRows={this.getSelectedRows(control.name)}
				buildUIItem={this.genUIItem}
			/>);
		}
		return <h6 key={controlId}>{controlId}</h6>;
	}

	genControlItem(key, control, idPrefix, controlValueAccessor, datasetMetadata) {
		var stateStyle = {};
		if (this.state.controlStates[control.name] === "hidden") {
			stateStyle.visibility = "hidden";
		}
		var label = <span></span>;
		if (control.label && control.separateLabel) {
			if (control.required) {
				label = (<div><label className="control-label" style={stateStyle}>{control.label.text}</label>
									<span className="required-control-indicator">*</span></div>);
			} else {
				label = <label className="control-label" style={stateStyle}>{control.label.text}</label>;
			}
		}
		var controlObj = this.genControl(control, idPrefix, controlValueAccessor, datasetMetadata);
		var controlItem = <ControlItem key={key} label={label} control={controlObj} />;
		// logger.info(controlItem);
		return controlItem;
	}

	genPrimaryTabs(key, tabs, idPrefix, controlValueAccessor, datasetMetadata) {
		// logger.info("genPrimaryTabs");
		// logger.info(tabs);
		const tabContent = [];
		let initialTab = "";
		for (var i = 0; i < tabs.length; i++) {
			const tab = tabs[i];
			const panelItems = this.genUIItem(i, tab.content, idPrefix, controlValueAccessor, datasetMetadata);
			let additionalComponent = null;
			if (this.props.additionalComponents) {
				additionalComponent = this.props.additionalComponents[tab.group];
				// logger.info("TabGroup=" + tab.group);
				// logger.info(additionalComponent);
			}
			if (i === 0) {
				initialTab = "primary-tab." + tab.group;
			}

			tabContent.push(
				<Tabs.Panel
					id={"primary-tab." + tab.group}
					key={i}
					title={tab.text}
				>
				{panelItems}
				{additionalComponent}
				</Tabs.Panel>
			);
		}

		const that = this;
		return (
			<Tabs key={key}
				defaultActiveKey={0}
				animation={false}
				isTabActive={function active(id) {
					if (that.state.activeTabId === "") {
						return id === initialTab;
					}
					return id === that.state.activeTabId;
				}}
				onTabClickHandler={(e, id) => this.setState({ activeTabId: id })}
			>
			{tabContent}
			</Tabs>
		);
	}

	genSubTabs(key, tabs, idPrefix, controlValueAccessor, datasetMetadata) {
		// logger.info("genSubTabs");
		const subTabs = [];
		for (let i = 0; i < tabs.length; i++) {
			const tab = tabs[i];
			subTabs.push(
				<Tabs.Panel key={i} id={"sub-tab." + tab.group} title={tab.text}>{this.genUIItem(i, tab.content, idPrefix, controlValueAccessor, datasetMetadata)}</Tabs.Panel>
			);
		}

		return (
			<Tabs vertical animation={false}>
				{subTabs}
			</Tabs>
		);
	}

	genPanelSelector(key, tabs, idPrefix, controlValueAccessor, datasetMetadata, dependsOn) {
		// logger.info("genPanelSelector: dependsOn=" + dependsOn);
		const subPanels = {};
		for (let i = 0; i < tabs.length; i++) {
			const tab = tabs[i];
			// logger.info("Sub-panel: group=" + tab.group + ", title=" + tab.text);
			subPanels[tab.group] = <div className="control-panel" key={tab.group}>{this.genUIItem(i, tab.content, idPrefix, controlValueAccessor, datasetMetadata)}</div>;
		}

		return (
			<SelectorPanel id={"selector-panel." + dependsOn}
				key={key}
				controlAccessor={this.getControl}
				panels={subPanels}
				dependsOn={dependsOn}
			/>
		);
	}

	genUIContent(uiItems, idPrefix, controlValueAccessor, datasetMetadata) {
		// logger.info("genUIContent");
		var uiContent = [];
		for (var i = 0; i < uiItems.length; i++) {
			var uiItem = uiItems[i];
			// logger.info(uiItem);
			uiContent.push(this.genUIItem(i, uiItem, idPrefix, controlValueAccessor, datasetMetadata));
		}
		return uiContent;
	}

	genUIItem(key, uiItem, idPrefix, controlValueAccessor, datasetMetadata) {
		// logger.info("genUIItem");
		// logger.info(uiItem);

		if (uiItem.itemType === "control") {
			return this.genControlItem(key, uiItem.control, idPrefix, controlValueAccessor, datasetMetadata);
		} else if (uiItem.itemType === "additionalLink") {
			// logger.info ("Additional link");
			// logger.info(uiItem);
			var subPanel = this.genPanel(key, uiItem.panel, idPrefix, controlValueAccessor, datasetMetadata);
			return (<SubPanelButton id={"sub-panel-button." + key}
				label={uiItem.text}
				title={uiItem.secondaryText}
				panel={subPanel}
			/>);
		} else if (uiItem.itemType === "staticText") {
			return <div id={"static-text." + key}>{uiItem.text}</div>;
		} else if (uiItem.itemType === "hSeparator") {
			return <hr id={"h-separator." + key} />;
		} else if (uiItem.itemType === "panel") {
			return this.genPanel(key, uiItem.panel, idPrefix, controlValueAccessor, datasetMetadata);
		} else if (uiItem.itemType === "subTabs") {
			return this.genSubTabs(key, uiItem.tabs, idPrefix, controlValueAccessor, datasetMetadata);
		} else if (uiItem.itemType === "primaryTabs") {
			return this.genPrimaryTabs(key, uiItem.tabs, idPrefix, controlValueAccessor, datasetMetadata);
		} else if (uiItem.itemType === "panelSelector") {
			return this.genPanelSelector(key, uiItem.tabs, idPrefix, controlValueAccessor, datasetMetadata, uiItem.dependsOn);
		}
		return <div>Unknown: {uiItem.itemType}</div>;
	}

	generateSharedControlNames(panel) {
		if (!this.sharedCtrlNames || this.sharedCtrlNames.length === 0) {
			this.sharedCtrlNames = [];
			for (let i = 0; i < panel.uiItems.length; i++) {
				const controlName = panel.uiItems[i].control.name;
				this.sharedCtrlNames.push({
					"controlName": controlName
				});
			}
		}
	}

	genPanel(key, panel, idPrefix, controlValueAccessor, datasetMetadata) {
		// logger.info("genPanel");
		// logger.info(panel);
		const content = this.genUIContent(panel.uiItems, idPrefix, controlValueAccessor, datasetMetadata);
		const id = "panel." + key;
		var uiObject;
		if (panel.panelType === "columnAllocation") {
			this.generateSharedControlNames(panel);
			uiObject = (<ColumnAllocationPanel
				id={id}
				key={key}
				panel={panel}
				dataModel={datasetMetadata}
				controlAccessor={this.getControl}
			>
				{content}
			</ColumnAllocationPanel>);
		} else if (panel.panelType === "columnSelection") {
			this.generateSharedControlNames(panel);
			uiObject = (<div id={id}
				className="control-panel"
				key={key}
			>
				{content}
			</div>);
		} else {
			uiObject = (<div id={id}
				className="control-panel"
				key={key}
			>
				{content}
			</div>);
		}

		return uiObject;
	}

	handleSubmit(buttonId) {
		// logger.info(buttonId);
		this.props.submitMethod(buttonId, this.refs.form);
	}

	closeFieldPicker() {
		this.props.showPropertiesButtons(true);
		if (this.state.postPickCallback) {
			this.state.postPickCallback();
		}
		this.setState({
			fieldPickerControl: {},
			showFieldPicker: false,
			postPickCallback: null
		});
	}

	openFieldPicker(evt, postPickerCallback) {
		this.props.showPropertiesButtons(false);
		this.setState({
			fieldPickerControl: JSON.parse(evt.currentTarget.dataset.control),
			showFieldPicker: true,
			postPickCallback: postPickerCallback
		});
	}

	handleMouseLeave(evt) {
		var controlValues = {};
		var userInput = {};

		// visibleDefinition
		if (this.state.visibleDefinition.length > 0) {
			logger.info("validate visible definitions");
			controlValues = this.getControlValues();

			// convert the controlValues object structure to what UiConditions take
			userInput = {};
			for (var visKey in controlValues) {
				if (visKey) {
					userInput[visKey] = controlValues[visKey][0];
				}
			}

			for (let i = 0; i < this.state.visibleDefinition.length; i++) {
				var visDefinition = this.state.visibleDefinition[i];
				try {
					var visOutput = UiConditions.validateInput(visDefinition, userInput);

					var visTmp = this.state.controlStates;
					if (visOutput === true) { // control should be visible
						for (let j = 0; j < visDefinition.visible.paramNames.length; j++) {
							delete visTmp[visDefinition.visible.paramNames[j]];
						}
						this.setState({ controlStates: visTmp });
					} else { // control should be hidden
						for (let j = 0; j < visDefinition.visible.paramNames.length; j++) {
							visTmp[visDefinition.visible.paramNames[j]] = "hidden";
						}
						this.setState({ controlStates: visTmp });
					}
				} catch (error) {
					logger.info("Error thrown in validation: " + error);
				}
			}
			logger.info("visible: " + JSON.stringify(this.state.controlStates));
		}

		// enabledDefinitions
		if (this.state.enabledDefinitions.length > 0) {
			logger.info("validate enabled definitions");
			controlValues = this.getControlValues();

			// convert the controlValues object structure to what UiConditions take
			userInput = {};
			for (var enbKey in controlValues) {
				if (enbKey) {
					userInput[enbKey] = controlValues[enbKey][0];
				}
			}

			for (let i = 0; i < this.state.enabledDefinitions.length; i++) {
				var definition = this.state.enabledDefinitions[i];
				try {
					var enbOutput = UiConditions.validateInput(definition, userInput);

					var tmp = this.state.controlStates;
					if (enbOutput === true) { // control should be enabled
						for (let j = 0; j < definition.enabled.paramNames.length; j++) {
							if (tmp[definition.enabled.paramNames[j]] !== "hidden") {
								delete tmp[definition.enabled.paramNames[j]];
							}
						}
						this.setState({ controlStates: tmp });
					} else { // control should be disabled
						for (let j = 0; j < definition.enabled.paramNames.length; j++) {
							if (tmp[definition.enabled.paramNames[j]] !== "hidden") { // if control is hidden, no need to disable it
								tmp[definition.enabled.paramNames[j]] = "disabled";
							}
						}
						this.setState({ controlStates: tmp });
					}
				} catch (error) {
					logger.info("Error thrown in validation: " + error);
				}
			}
			logger.info("enable: " + JSON.stringify(this.state.controlStates));
		}

		// validationGroupDefinitions
		if (this.state.validationGroupDefinitions.length > 0) {
			logger.info("validate group definitions");
			var validateErrorMessage = [];
			controlValues = this.getControlValues();

			// convert the controlValues object structure to what UiConditions take
			userInput = {};
			for (var key in controlValues) {
				if (key) {
					userInput[key] = controlValues[key][0];
				}
			}

			for (let i = 0; i < this.state.validationGroupDefinitions.length; i++) {
				var groupDefinition = this.state.validationGroupDefinitions[i];
				var params = groupDefinition.params;
				var evaluate = false;
				for (let j = 0; j < params.length; j++) {
					if (typeof this.state.controlStates[params[j]] === "undefined") {
						evaluate = true;
					} else {
						evaluate = false;
					}
				}

				if (evaluate) {
					try {
						var output = UiConditions.validateInput(groupDefinition.definition, userInput);

						// var tmp = this.state.controlValidations;
						if (output === true) {
							// tmp["group_validations_"+i] = true;
							// this.setState({
							//   controlValidations : tmp
							// });
						} else {
							// tmp["group_validations_"+i] = false;
							validateErrorMessage[i] = output;
							// this.setState({
							//   controlValidations : tmp
							// });
						}
					} catch (error) {
						logger.info("Error thrown in validation: " + error);
					}
				}
			}
			this.setState({ validateErrorMessage: validateErrorMessage });
		}
	}

	parseUiConditions(uiConditions) {
		var visibleDefinition = [];
		var enabledDefinitions = [];
		var validationDefinitions = [];
		var validationGroupDefinitions = [];

		for (let i = 0; i < uiConditions.length; i++) {
			if (uiConditions[i].visible) {
				visibleDefinition.push(uiConditions[i]);
			} else if (uiConditions[i].enabled) {
				enabledDefinitions.push(uiConditions[i]);
			} else if (uiConditions[i].validation) {
				try {
					var controls = UiConditionsParser.parseInput(uiConditions[i].validation);
					if (typeof controls === "object") {
						var groupDef = {
							"params": controls,
							"definition": uiConditions[i]
						};
						validationGroupDefinitions.push(groupDef);
					} else { // single control
						validationDefinitions[controls] = uiConditions[i];
					}
				} catch (error) { // invalid
					logger.info("Error parsing ui conditions: " + error);
				}
			} else { // invalid
				logger.info("Invalid definition: " + JSON.stringify(uiConditions[i]));
			}
		}

		this.setState({
			visibleDefinition: visibleDefinition,
			enabledDefinitions: enabledDefinitions,
			validationDefinitions: validationDefinitions,
			validationGroupDefinitions: validationGroupDefinitions
		});
	}

	render() {
		var content = this.genUIContent(this.state.formData.uiItems, "", this.getControlValue, this.state.formData.data.datasetMetadata);

		if (this.state.showFieldPicker) {
			const currentControlValues = this.getControlValues();
			const filteredDataset = this.getFilteredDataset(this.state.fieldPickerControl.name);
			content = (<div id="field-picker-table">
				<FieldPicker
					key="field-picker-control"
					closeFieldPicker={this.closeFieldPicker}
					getControlValue={this.getControlValue}
					currentControlValues={currentControlValues}
					dataModel={filteredDataset}
					updateControlValue={this.updateControlValue}
					control={this.state.fieldPickerControl}
					updateSelectedRows={this.updateSelectedRows}
				/>
			</div>);
		}

		var formButtons = [];
		var errorMessage = (<div
			className="validation-error-message group-validation-error-message"
			style={{ height: CONDITION_ERROR_MESSAGE.HIDDEN }}
		/>);
		if (this.state.validateErrorMessage.length > 0) {
			var errorMessages = this.state.validateErrorMessage.map(function(message, ind) {
				return <p key={ind}>{message}</p>;
			});
			errorMessage = (
				<div className="validation-error-message group-validation-error-message"
					style={{ height: CONDITION_ERROR_MESSAGE.VISIBLE }}
				>
					<div id="editor-form-validation" className="form__validation" style={{ "display": "block" }} >
						<span className="form__validation--invalid">{errorMessages}</span>
					</div>
				</div>
			);
		}

		return (
			<div className="well">
				<form id={"form-" + this.props.form.componentId} className="form-horizontal" onMouseLeave={this.handleMouseLeave}>
					<div className="section--light">
						{content}
					</div>
					<div>
						<ButtonToolbar>{formButtons}</ButtonToolbar>
					</div>
					{errorMessage}
				</form>
			</div>
		);
	}
}

EditorForm.propTypes = {
	form: React.PropTypes.object,
	additionalComponents: React.PropTypes.object,
	submitMethod: React.PropTypes.func,
	showPropertiesButtons: React.PropTypes.func
};
