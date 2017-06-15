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
import ColumnStructureAllocatorControl from "./column-structure-allocator-control.jsx";
import StructureeditorControl from "./structureeditor-control.jsx";
import StructurelisteditorControl from "./structure-list-editor-control.jsx";
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
			selectedRows: []
		};

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
	}

	componentDidMount() {
		if (this.props.form.conditions) {
			this.parseUiConditions();
		}
	}

	getControl(propertyName) {
		return this.refs[propertyName];
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


	updateControlValue(controlId, controlValue) {
		var values = this.state.valuesTable;
		values[controlId] = controlValue;
		this.setState({ valuesTable: values });
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

	updateSelectedRows(selection) {
		this.setState({ selectedRows: selection });
	}

	genControl(control, idPrefix, controlValueAccessor, inputDataModel) {
		const controlId = idPrefix + control.name;

		// List of available controls is defined in models/editor/Control.scala
		if (control.controlType === "textfield") {
			return (<TextfieldControl control={control}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				controlStates={this.state.controlStates}
			/>);
		} else if (control.controlType === "textarea") {
			return (<TextareaControl control={control}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				controlStates={this.state.controlStates}
			/>);
		} else if (control.controlType === "expression") {
			return (<ExpressionControl control={control}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				controlStates={this.state.controlStates}
			/>);
		} else if (control.controlType === "passwordfield") {
			return (<PasswordControl control={control}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
			/>);
		} else if (control.controlType === "numberfield") {
			return (<NumberfieldControl control={control}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				controlStates={this.state.controlStates}
			/>);
		} else if (control.controlType === "checkbox") {
			return (<CheckboxControl control={control}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				controlStates={this.state.controlStates}
			/>);
		} else if (control.controlType === "checkboxset") {
			return (<CheckboxsetControl control={control}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
			/>);
		} else if (control.controlType === "radioset") {
			return (<RadiosetControl control={control}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
			/>);
		} else if (control.controlType === "oneofselect") {
			return (<OneofselectControl control={control}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
			/>);
		} else if (control.controlType === "someofselect") {
			return (<SomeofselectControl control={control}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
			/>);
		} else if (control.controlType === "oneofcolumns") {
			return (<OneofcolumnsControl control={control}
				dataModel={inputDataModel}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
			/>);
		} else if (control.controlType === "someofcolumns") {
			return (<SomeofcolumnsControl control={control}
				dataModel={inputDataModel}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
			/>);
		} else if (control.controlType === "allocatedcolumn") {
			// logger.info("allocatedcolumn");
			return (<ColumnAllocatorControl control={control}
				dataModel={inputDataModel}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				controlStates={this.state.controlStates}
			/>);
		} else if (control.controlType === "allocatedcolumns") {
			// logger.info("allocatedcolumns");
			return (<ColumnAllocatorControl control={control}
				dataModel={inputDataModel}
				multiColumn
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				controlStates={this.state.controlStates}
			/>);
		} else if (control.controlType === "allocatedstructures") {
			// logger.info("allocatedstructures");
			return (<ColumnStructureAllocatorControl control={control}
				dataModel={inputDataModel}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				updateControlValue={this.updateControlValue}
				updateSelectedRows={this.updateSelectedRows}
				selectedRows={this.state.selectedRows}
				buildUIItem={this.genUIItem}
			/>);
		} else if (control.controlType === "structureeditor") {
			// logger.info("structureeditor");
			return (<StructureeditorControl control={control}
				dataModel={inputDataModel}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				updateControlValue={this.updateControlValue}
				updateSelectedRows={this.updateSelectedRows}
				selectedRows={this.state.selectedRows}
				buildUIItem={this.genUIItem}
			/>);
		} else if (control.controlType === "structurelisteditor") {
			// logger.info("structurelisteditor");
			return (<StructurelisteditorControl control={control}
				dataModel={inputDataModel}
				key={controlId} ref={controlId}
				valueAccessor={controlValueAccessor}
				updateControlValue={this.updateControlValue}
				updateSelectedRows={this.updateSelectedRows}
				selectedRows={this.state.selectedRows}
				buildUIItem={this.genUIItem}
			/>);
		}
		return <h6 key={controlId}>{controlId}</h6>;
	}

	genControlItem(key, control, idPrefix, controlValueAccessor, inputDataModel) {
		// logger.info("genControlItem");

		var stateStyle = {};
		if (this.state.controlStates[control.name] === "hidden") {
			stateStyle.visibility = "hidden";
		}

		var label = <span></span>;
		if (control.label && control.separateLabel) {
			label = <label className="control-label" style={stateStyle}>{control.label.text}</label>;
		}
		var controlObj = this.genControl(control, idPrefix, controlValueAccessor, inputDataModel);
		var controlItem = <ControlItem key={key} label={label} control={controlObj} />;
		// logger.info(controlItem);
		return controlItem;
	}

	genPrimaryTabs(key, tabs, idPrefix, controlValueAccessor, inputDataModel) {
		// logger.info("genPrimaryTabs");
		// logger.info(tabs);
		const tabContent = [];
		for (var i = 0; i < tabs.length; i++) {
			const tab = tabs[i];
			const panelItems = this.genUIItem(i, tab.content, idPrefix, controlValueAccessor, inputDataModel);
			let additionalComponent = null;
			if (this.props.additionalComponents) {
				additionalComponent = this.props.additionalComponents[tab.group];
				// logger.info("TabGroup=" + tab.group);
				// logger.info(additionalComponent);
			}
			tabContent.push(
				<Tabs.Panel id={"primary-tab." + tab.group} key={i} title={tab.text}>{panelItems}{additionalComponent}</Tabs.Panel>
			);
		}

		return (
			<Tabs key={key} defaultActiveKey={0} animation={false}>{tabContent}</Tabs>
		);
	}

	genSubTabs(key, tabs, idPrefix, controlValueAccessor, inputDataModel) {
		// logger.info("genSubTabs");
		const subTabs = [];
		for (let i = 0; i < tabs.length; i++) {
			const tab = tabs[i];
			subTabs.push(
				<Tabs.Panel key={i} id={"sub-tab." + tab.group} title={tab.text}>{this.genUIItem(i, tab.content, idPrefix, controlValueAccessor, inputDataModel)}</Tabs.Panel>
			);
		}

		return (
			<Tabs vertical animation={false}>
				{subTabs}
			</Tabs>
		);
	}

	genPanelSelector(key, tabs, idPrefix, controlValueAccessor, inputDataModel, dependsOn) {
		// logger.info("genPanelSelector: dependsOn=" + dependsOn);
		const subPanels = {};
		for (let i = 0; i < tabs.length; i++) {
			const tab = tabs[i];
			// logger.info("Sub-panel: group=" + tab.group + ", title=" + tab.text);
			subPanels[tab.group] = <div className="control-panel" key={tab.group}>{this.genUIItem(i, tab.content, idPrefix, controlValueAccessor, inputDataModel)}</div>;
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

	genUIContent(uiItems, idPrefix, controlValueAccessor, inputDataModel) {
		// logger.info("genUIContent");
		var uiContent = [];
		for (var i = 0; i < uiItems.length; i++) {
			var uiItem = uiItems[i];
			// logger.info(uiItem);
			uiContent.push(this.genUIItem(i, uiItem, idPrefix, controlValueAccessor, inputDataModel));
		}
		return uiContent;
	}

	genUIItem(key, uiItem, idPrefix, controlValueAccessor, inputDataModel) {
		// logger.info("genUIItem");
		// logger.info(uiItem);

		if (uiItem.itemType === "control") {
			return this.genControlItem(key, uiItem.control, idPrefix, controlValueAccessor, inputDataModel);
		} else if (uiItem.itemType === "additionalLink") {
			// logger.info ("Additional link");
			// logger.info(uiItem);
			var subPanel = this.genPanel(key, uiItem.panel, idPrefix, controlValueAccessor, inputDataModel);
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
			return this.genPanel(key, uiItem.panel, idPrefix, controlValueAccessor, inputDataModel);
		} else if (uiItem.itemType === "subTabs") {
			return this.genSubTabs(key, uiItem.tabs, idPrefix, controlValueAccessor, inputDataModel);
		} else if (uiItem.itemType === "primaryTabs") {
			return this.genPrimaryTabs(key, uiItem.tabs, idPrefix, controlValueAccessor, inputDataModel);
		} else if (uiItem.itemType === "panelSelector") {
			return this.genPanelSelector(key, uiItem.tabs, idPrefix, controlValueAccessor, inputDataModel, uiItem.dependsOn);
		}
		return <div>Unknown: {uiItem.itemType}</div>;
	}

	genPanel(key, panel, idPrefix, controlValueAccessor, inputDataModel) {
		// logger.info("genPanel");
		// logger.info(panel);
		const content = this.genUIContent(panel.uiItems, idPrefix, controlValueAccessor, inputDataModel);
		const id = "panel." + key;
		var uiObject;
		if (panel.panelType === "columnAllocation") {
			uiObject = (<ColumnAllocationPanel
				id={id}
				key={key}
				panel={panel}
				dataModel={inputDataModel}
				controlAccessor={this.getControl}
			>
				{content}
			</ColumnAllocationPanel>);
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

	parseUiConditions() {
		var uiConditions = this.props.form.conditions;
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
		var content = this.genUIContent(this.state.formData.uiItems, "", this.getControlValue, this.state.formData.data.inputDataModel);

		var formButtons = [];

		/*
    // Ignore the server-supplied buttons for now.
    for (var i=0;i < this.state.formData.buttons.length;i++) {
      var button = this.state.formData.buttons[i];
      var style = "default";
      if (button.isPrimary) {
        style = "primary";
      }

      var buttonInput = <Button key={"form-button-" + button.id} onClick={this.handleSubmit.bind(null, button.id)} bsStyle={style}>{button.text}</Button>
      formButtons.push(buttonInput);
    }
    */
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
	submitMethod: React.PropTypes.func
};
