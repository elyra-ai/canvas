/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* eslint complexity: ["error", 28] */

import React from "react";
import PropTypes from "prop-types";
import Tabs from "carbon-components-react/lib/components/Tabs";
import Tab from "carbon-components-react/lib/components/Tab";
import PropertyUtil from "./../../util/property-utils.js";
import { MESSAGE_KEYS, MESSAGE_KEYS_DEFAULTS, STATES } from "./../../constants/constants";
import isEmpty from "lodash/isEmpty";
import sortBy from "lodash/sortBy";
import logger from "./../../../../utils/logger";
import classNames from "classnames";

import SelectorPanel from "./../../panels/selector";
import SummaryPanel from "./../../panels/summary";
import TwistyPanel from "./../../panels/twisty";
import SubPanelButton from "./../../panels/sub-panel/button.jsx";

import WideFlyout from "./../wide-flyout";
import FieldPicker from "./../field-picker";

import ButtonAction from "./../../actions/button";

import Icon from "./../../../icons/icon.jsx";

const ALERT_TAB_GROUP = "alertMsgs";

export default class EditorForm extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			showFieldPicker: false,
			activeSubTabs: {} // map since there can be more than 1 subtab
		};

		this.genPanel = this.genPanel.bind(this);
		this.genUIContent = this.genUIContent.bind(this);
		this.genUIItem = this.genUIItem.bind(this);
		this._getGroupedMessages = this._getGroupedMessages.bind(this);

		this.closeFieldPicker = this.closeFieldPicker.bind(this);
		this.openFieldPicker = this.openFieldPicker.bind(this);
		this.generateSharedControlNames = this.generateSharedControlNames.bind(this);

		this.messages = this._getGroupedMessages();

		// initialize ControlFactory with correct values
		this.ControlFactory = props.controller.getControlFactory();
		this.ControlFactory.setFunctions(this.openFieldPicker, this.genUIItem);
		this.ControlFactory.setRightFlyout(props.rightFlyout);
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (!this.props.controller.isSummaryPanelShowing() && !this.props.controller.isSubPanelsShowing()) {
			// only update list of error messages when no summary panel or sub-panel is shown,
			// otherwise changes in the summary/sub panel might trigger a re-render and the
			// summary/sub panel to disappear because the alerts tab is added/removed
			this.messages = this._getGroupedMessages();
		}
		return true;
	}

	getControl(propertyName) {
		return this.refs[propertyName];
	}

	_getMessageCountForCategory(tab) {
		if (tab.group === ALERT_TAB_GROUP) {
			return " (" + this.messages.length + ")";
		}
		let result = 0;
		this.messages.forEach((msg) => {
			const ctrl = this.props.controller.getControl({ "name": msg.id_ref });
			if (ctrl && ctrl.parentCategoryId === tab.group) {
				result++;
			}
		});
		return result > 0 ? " (" + result + ")" : null;
	}

	_getGroupedMessages() {
		// returns messages grouped by type, first errors, then warnings
		const messages = this.props.controller.getErrorMessages(true, true, true);
		if (!isEmpty(messages)) {
			return sortBy(messages, ["type"]);
		}
		return [];
	}

	_getTabId(tab) {
		return tab.group;
	}

	_showCategoryPanel(panelId) {
		let activeTab = panelId;
		if (this.props.controller.getActiveTab() === panelId) {
			activeTab = "";
		}
		this.props.controller.setActiveTab(activeTab);
	}

	_handleMessageClick(controlId, ev) {
		const control = this.props.controller.getControl(controlId);
		this.props.controller.setActiveTab(control.parentCategoryId);
	}

	_modalTabsOnClick(tabId) {
		this.props.controller.setActiveTab(tabId);
	}

	_subTabsOnClick(groupId, subTabId) {
		const activeSubTabs = this.state.activeSubTabs;
		activeSubTabs[groupId] = subTabId;
		this.setState({ activeSubTabs: activeSubTabs });
	}

	genPrimaryTabs(key, tabs, propertyId, indexof) {
		const tabContent = [];
		let hasAlertsTab = false;
		let modalSelected = 0;
		for (var i = 0; i < tabs.length; i++) {
			const tab = tabs[i];
			if (i === 0 && tab.group === ALERT_TAB_GROUP) {
				hasAlertsTab = true;
			}
			const panelItems = this.genUIItem(this._getContainerIndex(hasAlertsTab, i), tab.content, propertyId, indexof);
			let additionalComponent = null;
			if (this.props.additionalComponents) {
				additionalComponent = this.props.additionalComponents[tab.group];
			}
			if (this.props.rightFlyout) {
				let panelArrow = <Icon type="downCaret" />;
				let categoryOpen = false;
				if (this.props.controller.getActiveTab() === tab.group) {
					panelArrow = <Icon type="upCaret" />;
					categoryOpen = true;
				}
				const panelItemsContainer = (<div className={classNames("properties-category-content", { "show": categoryOpen }) }>
					{panelItems}
				</div>);

				tabContent.push(
					<div key={this._getContainerIndex(hasAlertsTab, i) + "-" + key} className="properties-category-container">
						<button type="button" onClick={this._showCategoryPanel.bind(this, tab.group)}
							className="properties-category-title"
						>
							{tab.text.toUpperCase()}{this._getMessageCountForCategory(tab)}
							{panelArrow}
						</button>
						{panelItemsContainer}
						{additionalComponent}
					</div>
				);
			} else {
				if (this.props.controller.getActiveTab() === tab.group) {
					modalSelected = i;
				}
				tabContent.push(
					<Tab
						key={i}
						tabIndex={i}
						label={tab.text}
						onClick={this._modalTabsOnClick.bind(this, tab.group)}
					>
						{panelItems}
						{additionalComponent}
					</Tab>
				);
			}
		}

		if (this.props.rightFlyout) {
			return (
				<div key={"cat." + key} className="properties-categories">
					{tabContent}
				</div>
			);
		}
		return (
			<Tabs key={"tab." + key} className="properties-primaryTabs" selected={modalSelected}>
				{tabContent}
			</Tabs>
		);
	}

	_getContainerIndex(hasAlertsTab, index) {
		// need to ensure that when alert tab is rendered, the existing tabs get the same id
		// otherwise re-render will cause controls to lose focus
		if (hasAlertsTab && index === 0) {
			return "alerts";
		}
		if (hasAlertsTab) {
			return index - 1;
		}
		return index;
	}

	genSubTabs(key, tabs, propertyId, indexof) {
		// logger.info("genSubTabs");
		const subTabs = [];
		let activeSubTab = 0;
		// generate id for group of tabs
		let tabGroupId = "subtab";
		for (const tab of tabs) {
			tabGroupId += "." + tab.group;
		}
		for (let i = 0; i < tabs.length; i++) {
			const tab = tabs[i];
			const subPanelItems = this.genUIItem(i, tab.content, propertyId, indexof);
			if (tab.content.panel.id === this.state.activeSubTabs[tabGroupId]) {
				activeSubTab = i;
			}
			subTabs.push(
				<Tab
					key={"subtabs.tab." + key + "." + i}
					tabIndex={i}
					label={tab.text}
					onClick={this._subTabsOnClick.bind(this, tabGroupId, tab.group)}
				>
					{subPanelItems}
				</Tab>
			);
		}
		return (
			<div key={"subtabs.div." + key} className={classNames("properties-sub-tab-container", { vertical: !this.props.rightFlyout })}>
				<Tabs key={"subtabs.tabs." + key} className="properties-subtabs" selected={activeSubTab}>
					{subTabs}
				</Tabs>
			</div>
		);
	}

	genPanelSelector(key, tabs, dependsOn, propertyId, indexof, panelId) {
		const subPanels = this.generateAdditionalPanels(tabs, key, propertyId, indexof, false);
		return (
			<SelectorPanel
				key={"selectorPanel" + key}
				panels={subPanels}
				dependsOn={dependsOn}
				controller={this.props.controller}
			/>
		);
	}

	generateAdditionalPanels(tabs, key, propertyId, indexof, indent) {
		const subPanels = {};
		for (let i = 0; i < tabs.length; i++) {
			const tab = tabs[i];
			let className = "properties-control-panel";
			if (tab.content && tab.content.itemType === "textPanel") {
				className = "";
			}
			if (indent) {
				className += " properties-control-panel";
			}
			subPanels[tab.group] = (
				<div className={className} key={tab.group + key}>
					{this.genUIItem(i, tab.content, propertyId, indexof)}
				</div>
			);
		}

		return subPanels;
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
	genUIItem(key, uiItem, inPropertyId, indexof) {
		if (uiItem.itemType === "control") {
			const propertyId = { name: uiItem.control.name };
			// Used for subpanels in tables
			if (inPropertyId) {
				propertyId.name = inPropertyId.name;
				propertyId.row = inPropertyId.row;
				propertyId.col = indexof(uiItem.control.name);
			}
			// If the uiItem has additonalPanels, this indicates that the uiItem is
			// a vertical radio button set followed by a SelectorPanel which has the
			// insert_panels boolean set to true.
			if (uiItem.additionalItems && uiItem.additionalItems.length > 0) {
				uiItem.control.additionalItems = uiItem.additionalItems;
				uiItem.control.optionalPanels =
					this.generateAdditionalPanels(uiItem.additionalItems, key, null, indexof, true);
			}
			return this.ControlFactory.createControlItem(uiItem.control, propertyId);
		} else if (uiItem.itemType === "additionalLink") {
			var subPanel = this.genPanel(key, uiItem.panel, inPropertyId, indexof);
			return (<SubPanelButton key={"sub-panel-button." + key}
				label={uiItem.text}
				title={uiItem.secondaryText}
				panel={subPanel}
				controller={this.props.controller}
				rightFlyout={this.props.rightFlyout}
			/>);
		} else if (uiItem.itemType === "staticText") {
			const textClass = classNames("properties-static-text", uiItem.textType);
			const icon = uiItem.textType === "info" ? <div><Icon type="info" /></div> : null;
			const text = <div className={textClass}>{PropertyUtil.evaluateText(uiItem.text, this.props.controller)}</div>;
			return <div key={"static-text." + key} className="properties-static-text-container">{icon}{text}</div>;
		} else if (uiItem.itemType === "linkText") { // linkText used for Alerts tab. Only used internally
			const textClass = classNames("properties-link-text-container", uiItem.textType);
			let icon = null;
			if (uiItem.textType === "warning" || uiItem.textType === "error") {
				icon = <div><Icon type="circle" /></div>;
			}
			const text = (
				<a className="properties-link-text" onClick={this._handleMessageClick.bind(this, uiItem.controlId)}>
					{PropertyUtil.evaluateText(uiItem.text, this.props.controller)}
				</a>);
			return <div key={"link-text." + key} className={textClass} >{icon}{text}</div>;
		} else if (uiItem.itemType === "hSeparator") {
			return <hr key={"h-separator." + key} className="properties-h-separator" />;
		} else if (uiItem.itemType === "panel") {
			return this.genPanel(key, uiItem.panel, inPropertyId, indexof);
		} else if (uiItem.itemType === "subTabs") {
			return this.genSubTabs(key, uiItem.tabs, inPropertyId, indexof);
		} else if (uiItem.itemType === "primaryTabs") {
			return this.genPrimaryTabs(key, uiItem.tabs, inPropertyId, indexof);
		} else if (uiItem.itemType === "panelSelector") {
			return this.genPanelSelector(key, uiItem.tabs, uiItem.dependsOn, inPropertyId, indexof, uiItem.id);
		} else if (uiItem.itemType === "checkboxSelector") {
			return this.genPanel(key, uiItem.panel, inPropertyId, indexof);
		} else if (uiItem.itemType === "customPanel") {
			return this.generateCustomPanel(key, uiItem.panel);
			// only generate summary panel for right side flyout
		} else if (uiItem.itemType === "action") {
			return this.generateAction(key, uiItem.action);
		} else if (uiItem.itemType === "textPanel" && uiItem.panel) {
			return this.generateTextPanel(key, uiItem.panel);
		}
		return <div key={"unknown." + key}>Unknown: {uiItem.itemType}</div>;
	}

	generateTextPanel(key, panel) {
		const panelState = this.props.controller.getPanelState({ name: panel.id });
		const label = panel.label ? (<div className="panel-label">{panel.label.text}</div>) : null;
		const description = panel.description
			? (<div className="panel-description">{PropertyUtil.evaluateText(panel.description.text, this.props.controller)}</div>)
			: null;
		return (
			<div className={classNames("properties-text-panel", { "hide": panelState === STATES.HIDDEN })}
				disabled={panelState === STATES.DISABLED}
				key={"text-panel-" + key}
			>
				{label}
				{description}
			</div>);
	}

	generateAction(key, action) {
		if (action) {
			if (action.actionType === "button") {
				return (
					<ButtonAction
						key={"action." + key}
						action={action}
						controller={this.props.controller}
					/>
				);
			}
		}
		return null;

	}

	generateCustomPanel(key, panel) {
		if (this.props.customPanels) {
			for (const custPanel of this.props.customPanels) {
				if (custPanel.id() === panel.id) {
					try {
						return (<div key={"custom." + key}>
							{new custPanel(panel.parameters, this.props.controller, panel.data).renderPanel()}
						</div>);
					} catch (error) {
						logger.warn("Error thrown creating custom panel: " + error);
						return (<div />);
					}
				}
			}
		}
		return <div>Panel Not Found: {panel.id}</div>;
	}

	generateSharedControlNames(panel) {
		for (const info of this.props.controller.getSharedCtrlInfo()) {
			if (typeof info.id !== "undefined" && info.id === panel.id) {
				return;
			}
		}
		const sharedCtrlNames = [];
		for (const panelItem of panel.uiItems) {
			// only push uiItems with controls.  Some uiItems are for display only and shouldn't be added.
			if (panelItem.control && panelItem.control.name) {
				const controlName = panelItem.control.name;
				sharedCtrlNames.push({
					"controlName": controlName
				});
			}
		}
		this.props.controller.addSharedControls(panel.id, sharedCtrlNames);
	}

	genPanel(key, panel, propertyId, indexof) {
		let content = this.genUIContent(panel.uiItems, propertyId, indexof);
		const id = "panel." + key;
		let uiObject;
		if (panel.panelType === "columnSelection") {
			this.generateSharedControlNames(panel);
			// needs to be ran after setting shared controls to get correct fields in shared controls
			content = this.genUIContent(panel.uiItems, propertyId, indexof);
			uiObject = (<div
				className="properties-control-panel"
				key={key}
			>
				{content}
			</div>);
		} else if (panel.panelType === "summary") {
			uiObject = content;
			if (this.props.rightFlyout) {
				uiObject = (
					<SummaryPanel
						key={id}
						ref={panel.id}
						controller={this.props.controller}
						label={panel.label}
						panelId={panel.id}
					>
						{content}
					</SummaryPanel>);
			}
		} else if (panel.panelType === "actionPanel") {
			const panelState = this.props.controller.getPanelState({ name: panel.id });
			uiObject = (
				<div className={classNames("properties-action-panel", { "hide": panelState === STATES.HIDDEN })}
					key={"action-panel-" + key}
					data-id={"properties-" + panel.id}
					disabled={panelState === STATES.DISABLED}
				>
					{content}
				</div>);
		} else if (panel.panelType === "twisty") {
			uiObject = (
				<TwistyPanel
					key={id}
					ref={panel.id}
					controller={this.props.controller}
					label={panel.label}
					panelId={panel.id}
				>
					{content}
				</TwistyPanel>);
		} else {
			uiObject = (<div className="properties-control-panel" key={key} data-id={"properties-" + panel.id}>
				{content}
			</div>);
		}
		return uiObject;
	}

	/**
	* Close the field picker and invoke callback function
	* @param newSelectedFields all fields selected, includes newSelections
	* @param newSelections the newly selected rows
	*/
	closeFieldPicker(newSelectedFields, newSelections) {
		if (this.closeFieldPickerCallback) {
			this.closeFieldPickerCallback(newSelectedFields, newSelections);
			this.closeFieldPickerCallback = null;
		}
		this.props.showPropertiesButtons(true);
		this.fieldPickerControl = null;
		this.setState({
			showFieldPicker: false
		});
	}

	/**
	* Opens the field picker
	* @param control the control opening the field picker
	* @param callback function to invoke when closing the field picker
	*/
	openFieldPicker(control, callback) {
		this.props.showPropertiesButtons(false);
		this.fieldPickerControl = control;
		this.closeFieldPickerCallback = callback;
		this.setState({
			showFieldPicker: true
		});
	}

	/**
	* Renders the field picker with the control's current selected values and fields
	* @param title string to display as the field picker's title
	*/
	fieldPicker(title) {
		if (this.fieldPickerControl && this.fieldPickerControl.name) {
			const controlName = this.fieldPickerControl.name;
			const currentControlValues = this.props.controller.getPropertyValue({ name: controlName });
			// if in columnSelectionPanel, filter out fields that are in the other controls
			const fields = this.props.controller.getFilteredDatasetMetadata({ name: controlName });
			// create a list of field names to be passed into the field picker
			const formattedFieldsList = PropertyUtil.getFieldsFromControlValues(this.fieldPickerControl, currentControlValues, fields);

			return (<div className="properties-fp-table">
				<FieldPicker
					key="field-picker-control"
					controller={this.props.controller}
					closeFieldPicker={this.closeFieldPicker}
					currentFields={formattedFieldsList}
					fields={fields}
					title={title}
					rightFlyout={this.props.rightFlyout}
				/>
			</div>);
		}
		return <div />;
	}

	genAlertsTab(messages) {
		const msgUIItems = messages.map((msg) => (
			{
				"itemType": "linkText",
				"text": msg.text,
				"textType": msg.type,
				"controlId": { "name": msg.id_ref }
			}));

		return {
			"text": PropertyUtil.formatMessage(
				this.props.controller.getReactIntl(),
				MESSAGE_KEYS.ALERTS_TAB_TITLE,
				MESSAGE_KEYS_DEFAULTS.ALERTS_TAB_TITLE),
			"group": ALERT_TAB_GROUP,
			"content":
				{ "itemType": "panel",
					"panel": {
						"id": "alerts-panel",
						"panelType": "general",
						"uiItems": msgUIItems
					}
				}
		};
	}

	render() {
		let uiItems = this.props.controller.getUiItems();
		if (!isEmpty(this.messages) && uiItems[0].itemType === "primaryTabs") {
			// create a new copy for uiItems object so that alerts are not added multiple times
			uiItems = JSON.parse(JSON.stringify(this.props.controller.getUiItems()));
			uiItems[0].tabs.unshift(this.genAlertsTab(this.messages)); // add alerts tab to the beginning of the tabs array
		}

		let content = this.genUIContent(uiItems);
		let wideFly = <div />;

		const form = this.props.controller.getForm();
		const title = PropertyUtil.formatMessage(this.props.controller.getReactIntl(),
			MESSAGE_KEYS.FIELDPICKER_SAVEBUTTON_LABEL, MESSAGE_KEYS_DEFAULTS.FIELDPICKER_SAVEBUTTON_LABEL) + " " + form.label;

		if (this.props.rightFlyout) {
			const showFlyoutPicker = this.state.showFieldPicker && this.props.rightFlyout;
			wideFly = (<WideFlyout
				showPropertiesButtons={false}
				show={showFlyoutPicker}
				title={title}
			>
				{this.fieldPicker(title)}
			</WideFlyout>);
		} else if (this.state.showFieldPicker) {
			content = this.fieldPicker(title);
		}

		return (
			<div className="properties-editor-form">
				{content}
				{wideFly}
			</div>
		);
	}
}

EditorForm.propTypes = {
	controller: PropTypes.object.isRequired,
	additionalComponents: PropTypes.object,
	showPropertiesButtons: PropTypes.func,
	customPanels: PropTypes.array,
	rightFlyout: PropTypes.bool,
};
