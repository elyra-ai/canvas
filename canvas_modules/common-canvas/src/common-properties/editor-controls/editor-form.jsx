/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* eslint complexity: ["error", 28] */
/* eslint max-depth: ["error", 9] */

import logger from "../../../utils/logger";
import React from "react";
import PropTypes from "prop-types";
import ButtonToolbar from "react-bootstrap/lib/ButtonToolbar";
import Tabs from "ap-components-react/dist/components/Tabs";
import { TOOL_TIP_DELAY } from "../constants/constants.js";
import PropertyUtil from "../util/property-utils.js";

import ReactTooltip from "react-tooltip";

import TextfieldControl from "./textfield-control.jsx";
import ReadonlyControl from "./readonly-control.jsx";
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
import FieldAllocatorControl from "./field-allocator-control.jsx";
import ColumnSelectControl from "./column-select-control.jsx";
import ColumnStructureTableControl from "./column-structure-table-control.jsx";
import StructureeditorControl from "./structureeditor-control.jsx";
import StructurelisteditorControl from "./structure-list-editor-control.jsx";

import SelectorPanel from "./../editor-panels/selector-panel.jsx";
import SummaryPanel from "./../editor-panels/summary-panel.jsx";
import CheckboxSelectionPanel from "../editor-panels/checkbox-selection-panel.jsx";
import WideFlyout from "../components/wide-flyout.jsx";

import ButtonAction from "../actions/button-action.jsx";

import SubPanelButton from "./../editor-panels/sub-panel-button.jsx";
import FieldPicker from "./field-picker.jsx";
import ControlItem from "./control-item.jsx";


import DownIcon from "../../../assets/images/down_enabled.svg";
import UpIcon from "../../../assets/images/up_enabled.svg";
import InfoIcon from "../../../assets/images/info.svg";

export default class EditorForm extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			selectedRows: {},
			showFieldPicker: false,
			fieldPickerControl: {},
			activeTabId: null
		};

		this.sharedCtrlInfo = [];

		this.updateSelectedRows = this.updateSelectedRows.bind(this);

		this.handleSubmit = this.handleSubmit.bind(this);

		this.getControl = this.getControl.bind(this);

		this.genPanel = this.genPanel.bind(this);
		this.genUIContent = this.genUIContent.bind(this);
		this.genUIItem = this.genUIItem.bind(this);

		this.closeFieldPicker = this.closeFieldPicker.bind(this);
		this.openFieldPicker = this.openFieldPicker.bind(this);
		this.getFilteredDataset = this.getFilteredDataset.bind(this);
		this.generateSharedControlNames = this.generateSharedControlNames.bind(this);
		this.getSelectedRows = this.getSelectedRows.bind(this);
		this.clearSelectedRows = this.clearSelectedRows.bind(this);

		this._showCategoryPanel = this._showCategoryPanel.bind(this);
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
		const data = this.props.controller.getDatasetMetadata();
		if (!this.sharedCtrlInfo || !skipControlName) {
			return data;
		}

		let filteredDataset = { fields: [] };
		try {

			filteredDataset = JSON.parse(JSON.stringify(data)); // deep copy
			let sharedCtrlNames = [];
			let sharedDataModelPanel = false;
			for (let h = 0; h < this.sharedCtrlInfo.length; h++) {
				for (let k = 0; k < this.sharedCtrlInfo[h].controlNames.length; k++) {
					if (skipControlName === this.sharedCtrlInfo[h].controlNames[k].controlName) {
						sharedDataModelPanel = true;
						sharedCtrlNames = this.sharedCtrlInfo[h].controlNames;
						break;
					}
				}
			}

			if (sharedDataModelPanel) {
				const temp = [];
				for (let i = 0; i < sharedCtrlNames.length; i++) {
					const ctrlName = sharedCtrlNames[i].controlName;
					if (ctrlName !== skipControlName) {
						// only remove from the main list the values that are in other controls
						const values = this.props.controller.getPropertyValue({ name: ctrlName });
						for (let j = 0; j < values.length; j++) {
							temp.push(data.fields.filter(function(element) {
								if (Array.isArray(values)) {
									if (Array.isArray(values[j])) {
										return values[j][0].split(",")[0].indexOf(element.name) > -1;
									}
									return values[j].split(",")[0].indexOf(element.name) > -1;
								}
								return values.split(",")[0].indexOf(element.name) > -1;
							})[0]);
							// logger.info("Temp is: " + JSON.stringify(temp));
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
			}
		} catch (error) {
			logger.warn("unable to parse json " + error);
		}
		return filteredDataset;
	}

	getSelectedRows(controlName) {
		if (!this.state.selectedRows[controlName]) {
			this.state.selectedRows[controlName] = [];
		}
		return this.state.selectedRows[controlName];
	}

	updateSelectedRows(controlName, selection) {
		const selectedRows = this.state.selectedRows;
		selectedRows[controlName] = selection;
		this.setState({ selectedRows: selectedRows });
	}

	clearSelectedRows() {
		this.setState({ selectedRows: {} });
	}

	genControl(control, propertyId) {
		// List of available controls is defined in models/editor/Control.scala
		let controlRef = propertyId.name;
		if (propertyId.row) {
			controlRef += "_" + propertyId.row;
			if (propertyId.col) {
				controlRef += "_" + propertyId.col;
			}
		}
		if (control.controlType === "textfield") {
			return (<TextfieldControl
				ref={controlRef}
				control={control}
				controller={this.props.controller}
				propertyId={propertyId}
			/>);
		} else if (control.controlType === "readonly") {
			return (<ReadonlyControl
				ref={controlRef}
				control={control}
				controller={this.props.controller}
				propertyId={propertyId}
			/>);
		} else if (control.controlType === "textarea") {
			return (<TextareaControl
				ref={controlRef}
				control={control}
				controller={this.props.controller}
				propertyId={propertyId}
			/>);
		} else if (control.controlType === "expression") {
			return (<ExpressionControl
				ref={controlRef}
				control={control}
				controller={this.props.controller}
				propertyId={propertyId}
			/>);
		} else if (control.controlType === "toggletext") {
			return (<ToggletextControl
				ref={controlRef}
				control={control}
				controller={this.props.controller}
				propertyId={propertyId}
				values={control.values}
				valueLabels={control.valueLabels}
				valueIcons={control.valueIcons}
			/>);
		} else if (control.controlType === "passwordfield") {
			return (<PasswordControl
				ref={controlRef}
				control={control}
				controller={this.props.controller}
				propertyId={propertyId}
			/>);
		} else if (control.controlType === "numberfield") {
			return (<NumberfieldControl
				ref={controlRef}
				control={control}
				controller={this.props.controller}
				propertyId={propertyId}
			/>);
		} else if (control.controlType === "checkbox") {
			return (<CheckboxControl
				ref={controlRef}
				control={control}
				propertyId={propertyId}
				controller={this.props.controller}
			/>);
		} else if (control.controlType === "checkboxset") {
			return (<CheckboxsetControl
				ref={controlRef}
				control={control}
				controller={this.props.controller}
				propertyId={propertyId}
			/>);
		} else if (control.controlType === "radioset") {
			return (<RadiosetControl
				ref={controlRef}
				control={control}
				controller={this.props.controller}
				propertyId={propertyId}
			/>);
		} else if (control.controlType === "oneofselect") {
			return (<OneofselectControl
				ref={controlRef}
				control={control}
				controller={this.props.controller}
				propertyId={propertyId}
			/>);
		} else if (control.controlType === "someofselect") {
			return (<SomeofselectControl
				ref={controlRef}
				control={control}
				controller={this.props.controller}
				propertyId={propertyId}
			/>);
		} else if (control.controlType === "oneofcolumns") {
			return (<OneofcolumnsControl
				ref={controlRef}
				control={control}
				controller={this.props.controller}
				propertyId={propertyId}
				dataModel={this.getFilteredDataset(propertyId.name)}
			/>);
		} else if (control.controlType === "someofcolumns") {
			return (<SomeofcolumnsControl
				ref={controlRef}
				control={control}
				controller={this.props.controller}
				propertyId={propertyId}
				dataModel={this.props.controller.getDatasetMetadata()}
			/>);
		} else if (control.controlType === "selectcolumn") {
			// TODO should use propertyID for filteredDataset
			return (<FieldAllocatorControl
				ref={controlRef}
				control={control}
				controller={this.props.controller}
				propertyId={propertyId}
				dataModel={this.getFilteredDataset(propertyId.name)}
			/>);
		} else if (control.controlType === "selectcolumns") {
			return (<ColumnSelectControl
				ref={controlRef}
				control={control}
				controller={this.props.controller}
				propertyId={propertyId}
				dataModel={this.props.controller.getDatasetMetadata()}
				openFieldPicker={this.openFieldPicker}
				updateSelectedRows={this.updateSelectedRows}
				selectedRows={this.getSelectedRows(control.name)}
			/>);
		} else if (control.controlType === "structuretable") {
			return (<ColumnStructureTableControl
				ref={controlRef}
				control={control}
				controller={this.props.controller}
				propertyId={propertyId}
				dataModel={this.props.controller.getDatasetMetadata()}
				updateSelectedRows={this.updateSelectedRows}
				selectedRows={this.getSelectedRows(control.name)}
				buildUIItem={this.genUIItem}
				openFieldPicker={this.openFieldPicker}
				customContainer={this.props.customContainer}
				rightFlyout={this.props.rightFlyout}
			/>);
		} else if (control.controlType === "structureeditor") {
			// logger.info("structureeditor");
			return (<StructureeditorControl
				ref={controlRef}
				control={control}
				controller={this.props.controller}
				propertyId={propertyId}
				updateSelectedRows={this.updateSelectedRows}
				selectedRows={this.getSelectedRows(control.name)}
				buildUIItem={this.genUIItem}
				rightFlyout={this.props.rightFlyout}
			/>);
		} else if (control.controlType === "structurelisteditor") {
			// logger.info("structurelisteditor");
			return (<StructurelisteditorControl
				ref={controlRef}
				control={control}
				controller={this.props.controller}
				propertyId={propertyId}
				updateSelectedRows={this.updateSelectedRows}
				selectedRows={this.getSelectedRows(control.name)}
				buildUIItem={this.genUIItem}
				customContainer={this.props.customContainer}
				rightFlyout={this.props.rightFlyout}
			/>);
		}
		return <h6 key={control.name}>{control.name}</h6>;
	}

	genControlItem(key, control, inPropertyId, indexof) {
		const propertyId = { name: control.name };
		// Used for subpanels in tables
		if (inPropertyId) {
			propertyId.name = inPropertyId.name;
			propertyId.row = inPropertyId.row;
			propertyId.col = indexof(control.name);
		}
		const stateStyle = {};
		let tooltipShow = true;
		const controlState = this.props.controller.getControlState(propertyId);
		if (controlState === "hidden") {
			stateStyle.display = "none";
			tooltipShow = false;
		} else if (controlState === "disabled") {
			stateStyle.color = "#D8D8D8";
			stateStyle.pointerEvents = "none";
			tooltipShow = false;
		}

		const that = this;
		function generateNumber() {
			const generator = control.label.numberGenerator;
			const min = generator.range && generator.range.min ? generator.range.min : 10000;
			const max = generator.range && generator.range.max ? generator.range.max : 99999;
			const newValue = Math.floor(Math.random() * (max - min + 1) + min);
			that.props.controller.updatePropertyValue(propertyId, newValue);
		}

		let label = <span />;
		if (control.label && control.separateLabel) {
			let description;
			let tooltip;
			if (control.description) {
				if (control.description.placement === "on_panel") {
					description = <div className="control-description" style={stateStyle}>{control.description.text}</div>;
				// only show tooltip when control enabled and visible
				} else if (tooltipShow) {
					tooltip = control.description.text; // default to tooltip
				}
			}
			let requiredIndicator;
			if (control.required) {
				requiredIndicator = <span className="required-control-indicator" style={stateStyle}>*</span>;
			}
			let numberGenerator;
			if (control.label.numberGenerator) {
				numberGenerator = (<label>{"\u00A0\u00A0"}<a className="number-generator" onClick={generateNumber} style={stateStyle}>
					{control.label.numberGenerator.label.default}
				</a></label>);
			}
			let hasFilter = false;
			if (control.subControls) {
				for (const subControl of control.subControls) {
					if (subControl.filterable) {
						hasFilter = true;
						break;
					}
				}
			}
			// structuretable labels w/o descriptions and filtering are created elsewhere
			const isStructureTable = control.controlType === "structuretable" || control.controlType === "structurelisteditor" ||
				control.controlType === "selectcolumns";
			if (!isStructureTable || description || hasFilter) {
				const className = "default-label-container";
				const tooltipId = "tooltip-label-" + control.name;
				label = (<div className={className}>
					<div className="properties-tooltips-container" data-tip={tooltip} data-for={tooltipId}>
						<label className="control-label" style={stateStyle} >{control.label.text}</label>
						{requiredIndicator}
						{numberGenerator}
						{description}
					</div>
					<ReactTooltip
						id={tooltipId}
						place="right"
						type="light"
						effect="solid"
						border
						className="properties-tooltips"
						delayShow={TOOL_TIP_DELAY}
					/>
				</div>);
			}
		}
		var controlObj = this.genControl(control, propertyId);
		var controlItem = <ControlItem key={key} label={label} control={controlObj} />;
		return controlItem;
	}

	_showCategoryPanel(panelid, categories) {
		let activeTab = panelid;
		if ((this.state.activeTabId === null && categories === 1) || this.state.activeTabId === panelid) {
			activeTab = "";
		}
		this.setState({ activeTabId: activeTab });
	}

	genPrimaryTabs(key, tabs, propertyId, indexof) {
		const tabContent = [];
		let initialTab = "";
		for (var i = 0; i < tabs.length; i++) {
			const tab = tabs[i];
			const panelItems = this.genUIItem(i, tab.content, propertyId, indexof);
			let additionalComponent = null;
			if (this.props.additionalComponents) {
				additionalComponent = this.props.additionalComponents[tab.group];
			}
			if (i === 0) {
				initialTab = "primary-tab." + tab.group;
			}

			if (this.props.rightFlyout) {
				let panelArrow = DownIcon;
				let panelItemsContainerClass = "closed";
				const styleObj = {};
				if ((tabs.length === 1 && this.state.activeTabId === null) || this.state.activeTabId === tab.text) {
					panelArrow = UpIcon;
					panelItemsContainerClass = "open";
					if (i === tabs.length - 1) {
						styleObj.borderBottom = "none";
					}
				}
				const panelItemsContainer = (<div className={"panel-container-" + panelItemsContainerClass + "-right-flyout-panel"} style={styleObj}>
					{panelItems}
				</div>);

				tabContent.push(
					<div key={i + "-" + key} className="category-title-container-right-flyout-panel">
						<a onClick={() => this._showCategoryPanel(tab.text, tabs.length)}
							id={"category-title-" + i + "-right-flyout-panel"}
							className="category-title-right-flyout-panel"
						>
							{tab.text.toUpperCase()}
							<img className="category-icon-right-flyout-panel" src={panelArrow}	/>
						</a>
						{panelItemsContainer}
						{additionalComponent}
					</div>
				);
			} else {
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
		}

		if (this.props.rightFlyout) {
			return (
				<div key={key} id="category-parent-container-right-flyout-panel">
					{tabContent}
				</div>
			);
		}

		const that = this;
		return (
			<Tabs key={key}
				defaultActiveKey={0}
				animation={false}
				isTabActive={function active(id) {
					if (that.state.activeTabId === "" || that.state.activeTabId === null) {
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

	genSubTabs(key, tabs, propertyId, indexof) {
		// logger.info("genSubTabs");
		const subTabs = [];
		for (let i = 0; i < tabs.length; i++) {
			const tab = tabs[i];
			const subPanelItems = this.genUIItem(i, tab.content, propertyId, indexof);
			if (this.props.rightFlyout) {

				const panelItemsContainer = (<div key={i + "-" + key} className="sub-panel-container-right-flyout-panel">
					{subPanelItems}
				</div>);

				subTabs.push(
					<div key={i + "-" + key} className="sub-category-items-container-right-flyout-panel">
						<h3 className="sub-category-title-right-flyout-panel">{tab.text}</h3>
						{panelItemsContainer}
					</div>
				);
			} else {
				subTabs.push(
					<Tabs.Panel
						id={"sub-tab." + tab.group}
						key={i}
						title={tab.text}
						className="sub-tab-parent-items-container"
					>
						{subPanelItems}
					</Tabs.Panel>
				);
			}
		}

		if (this.props.rightFlyout) {
			return (
				<div key={key} id="sub-category-parent-container-right-flyout-panel">
					{subTabs}
				</div>
			);
		}

		return (
			<div id={"sub-tab-container"}>
				<Tabs vertical animation={false}>
					{subTabs}
				</Tabs>
			</div>
		);
	}

	genPanelSelector(key, tabs, dependsOn, propertyId, indexof) {
		const subPanels = {};
		for (let i = 0; i < tabs.length; i++) {
			const tab = tabs[i];
			let className = "control-panel";
			if (tab.content && tab.content.itemType === "textPanel") {
				className = "text-panel";
			}
			subPanels[tab.group] = (
				<div className={className} key={tab.group + key}>
					{this.genUIItem(i, tab.content, propertyId, indexof)}
				</div>
			);
		}
		return (
			<SelectorPanel id={"selector-panel." + dependsOn}
				key={"selectorPanel" + key}
				panels={subPanels}
				dependsOn={dependsOn}
				controller={this.props.controller}
			/>
		);
	}

	genUIContent(uiItems, propertyId, indexof) {
		var uiContent = [];
		for (var i = 0; i < uiItems.length; i++) {
			uiContent.push(this.genUIItem(i, uiItems[i], propertyId, indexof));
		}
		return uiContent;
	}

	/*
	*  propertyId and indexOf only used for subpanel in tables
	*/
	genUIItem(key, uiItem, propertyId, indexof) {
		if (uiItem.itemType === "control") {
			return this.genControlItem(key, uiItem.control, propertyId, indexof);
		} else if (uiItem.itemType === "additionalLink") {
			var subPanel = this.genPanel(key, uiItem.panel, propertyId, indexof);
			return (<SubPanelButton id={"sub-panel-button." + key}
				label={uiItem.text}
				title={uiItem.secondaryText}
				panel={subPanel}
				rightFlyout={this.props.rightFlyout}
			/>);
		} else if (uiItem.itemType === "staticText") {
			let textClass = "static-text";
			let icon = <div />;
			if (uiItem.textType === "info") {
				icon = <div className="static-text-icon-container"><img className="static-text-icon" src={InfoIcon} /></div>;
				textClass = "static-text info";
			}
			const text = <div className={textClass}>{PropertyUtil.evaluateText(uiItem.text, this.props.controller)}</div>;
			return <div key={"static-text." + key} className="static-text-container">{icon}{text}</div>;
		} else if (uiItem.itemType === "hSeparator") {
			return <hr key={"h-separator." + key} className="h-separator" />;
		} else if (uiItem.itemType === "panel") {
			return this.genPanel(key, uiItem.panel, propertyId, indexof);
		} else if (uiItem.itemType === "subTabs") {
			return this.genSubTabs(key, uiItem.tabs, propertyId, indexof);
		} else if (uiItem.itemType === "primaryTabs") {
			return this.genPrimaryTabs(key, uiItem.tabs, propertyId, indexof);
		} else if (uiItem.itemType === "panelSelector") {
			return this.genPanelSelector(key, uiItem.tabs, uiItem.dependsOn, propertyId, indexof);
		} else if (uiItem.itemType === "checkboxSelector") {
			return this.genPanel(key, uiItem.panel, propertyId, indexof);
		} else if (uiItem.itemType === "customPanel") {
			return this.generateCustomPanel(uiItem.panel);
			// only generate summary panel for right side flyout
		} else if (uiItem.itemType === "summaryPanel") {
			return this.genPanel(key, uiItem.panel, propertyId, indexof);
		} else if (uiItem.itemType === "action") {
			return this.generateAction(key, uiItem.action);
		} else if (uiItem.itemType === "textPanel" && uiItem.panel) {
			const label = uiItem.panel.label ? (<div className="panel-label">{uiItem.panel.label.text}</div>) : (<div />);
			const description = uiItem.panel.description
				? (<div className="panel-description">{PropertyUtil.evaluateText(uiItem.panel.description.text, this.props.controller)}</div>)
				: (<div />);
			return (
				<div className="properties-text-panel" key={"text-panel-" + key}>
					{label}
					{description}
				</div>);
		}
		return <div>Unknown: {uiItem.itemType}</div>;
	}

	generateAction(key, action) {
		if (action) {
			if (action.actionType === "button") {
				return (
					<ButtonAction
						key={"action." + key}
						action={action}
						controller={this.props.controller}
						actionHandler={this.props.actionHandler}
					/>
				);
			}
		}
		return null;

	}

	generateCustomPanel(panel) {
		if (this.props.customPanels) {
			for (const custPanel of this.props.customPanels) {
				if (custPanel.id() === panel.id) {
					return new custPanel(panel.parameters, this.props.controller).renderPanel();
				}
			}
		}
		return <div>Panel Not Found: {panel.id}</div>;
	}

	generateSharedControlNames(panel) {
		for (let j = 0; j < this.sharedCtrlInfo.length; j++) {
			if (typeof this.sharedCtrlInfo[j].id !== "undefined" && this.sharedCtrlInfo[j].id === panel.id) {
				return;
			}
		}
		const sharedCtrlNames = [];
		for (let i = 0; i < panel.uiItems.length; i++) {
			const controlName = panel.uiItems[i].control.name;
			sharedCtrlNames.push({
				"controlName": controlName
			});
		}
		this.sharedCtrlInfo.push({
			"id": panel.id,
			"controlNames": sharedCtrlNames
		});
	}

	genPanel(key, panel, propertyId, indexof) {
		// logger.info("genPanel");
		// logger.info(panel);
		const content = this.genUIContent(panel.uiItems, propertyId, indexof);
		const id = "panel." + key;
		var uiObject;
		if (panel.panelType === "columnSelection") {
			this.generateSharedControlNames(panel);
			uiObject = (<div id={id}
				className="control-panel"
				key={key}
			>
				{content}
			</div>);
		} else if (panel.panelType === "checkboxPanel") {
			uiObject = (<CheckboxSelectionPanel
				id={id}
				key={key}
				panel={panel}
				controller={this.props.controller}
				controlAccessor={this.getControl}
			>
				{content}
			</CheckboxSelectionPanel>);
		} else if (panel.panelType === "summary") {
			//
			uiObject = content;
			if (this.props.rightFlyout) {
				uiObject = (
					<SummaryPanel
						key={id}
						ref={panel.id}
						controller={this.props.controller}
						label={panel.label}
						clearSelectedRows={this.clearSelectedRows}
						panelId={panel.id}
					>
						{content}
					</SummaryPanel>);
			}
		} else if (panel.panelType === "actionPanel") {
			uiObject = (
				<div className="action-panel" key={key} >
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
		this.setState({
			fieldPickerControl: {},
			showFieldPicker: false
		});
	}

	openFieldPicker(evt) {
		this.props.showPropertiesButtons(false);
		this.setState({
			fieldPickerControl: JSON.parse(evt.currentTarget.dataset.control),
			showFieldPicker: true
		});
	}

	fieldPicker() {
		const currentControlValues = this.props.controller.getPropertyValues();
		const filteredDataset = this.getFilteredDataset(this.state.fieldPickerControl.name);
		const form = this.props.controller.getForm();
		return (<div id="field-picker-table">
			<FieldPicker
				key="field-picker-control"
				controller={this.props.controller}
				closeFieldPicker={this.closeFieldPicker}
				currentControlValues={currentControlValues}
				dataModel={filteredDataset}
				control={this.state.fieldPickerControl}
				updateSelectedRows={this.updateSelectedRows}
				title={form.label}
				rightFlyout={this.props.rightFlyout}
			/>
		</div>);
	}

	render() {
		var content = this.genUIContent(this.props.controller.getUiItems());
		var wideFly = <div />;
		if (this.props.rightFlyout) {
			wideFly = (<WideFlyout showPropertiesButtons={false} show={this.state.showFieldPicker && this.props.rightFlyout}>
				{this.fieldPicker()}
			</WideFlyout>);
		} else if (this.state.showFieldPicker) {
			content = this.fieldPicker();
		}
		var formButtons = [];
		return (
			<div>
				<div className="well">
					<form className="form-horizontal">
						<div className="section--light">
							{content}
						</div>
						<div>
							<ButtonToolbar>{formButtons}</ButtonToolbar>
						</div>
					</form>
				</div>
				{wideFly}
			</div>
		);
	}
}

EditorForm.propTypes = {
	controller: PropTypes.object.isRequired,
	additionalComponents: PropTypes.object,
	submitMethod: PropTypes.func,
	showPropertiesButtons: PropTypes.func,
	customPanels: PropTypes.array,
	customContainer: PropTypes.bool,
	rightFlyout: PropTypes.bool,
	actionHandler: PropTypes.func
};
