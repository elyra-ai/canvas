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

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { setActiveTab } from "./../../actions";
import { Tabs, Tab } from "carbon-components-react";
import PropertyUtil from "./../../util/property-utils.js";
import { MESSAGE_KEYS, CARBON_ICONS, CONDITION_MESSAGE_TYPE } from "./../../constants/constants";
import isEmpty from "lodash/isEmpty";
import sortBy from "lodash/sortBy";
import cloneDeep from "lodash/cloneDeep";
import logger from "./../../../../utils/logger";
import classNames from "classnames";

import SelectorPanel from "./../../panels/selector";
import SummaryPanel from "./../../panels/summary";
import TwistyPanel from "./../../panels/twisty";
import SubPanelButton from "./../../panels/sub-panel/button.jsx";

import WideFlyout from "./../wide-flyout";
import FieldPicker from "./../field-picker";
import TextPanel from "./../../panels/text-panel";
import ActionPanel from "./../../panels/action-panel";

import ActionFactory from "./../../actions/action-factory.js";
import Icon from "./../../../icons/icon.jsx";

const ALERT_TAB_GROUP = "alertMsgs";

class EditorForm extends React.Component {

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

		this.messages = this._getGroupedMessages(props.messages);

		// initialize ControlFactory with correct values
		this.ControlFactory = props.controller.getControlFactory();
		this.ControlFactory.setFunctions(this.openFieldPicker, this.genUIItem);
		this.ControlFactory.setRightFlyout(props.rightFlyout);

		this.actionFactory = new ActionFactory(this.props.controller);

	}

	shouldComponentUpdate(nextProps, nextState) {
		if (!this.props.controller.isSummaryPanelShowing() && !this.props.controller.isSubPanelsShowing()) {
			// only update list of error messages when no summary panel or sub-panel is shown,
			// otherwise changes in the summary/sub panel might trigger a re-render and the
			// summary/sub panel to disappear because the alerts tab is added/removed
			this.messages = this._getGroupedMessages(nextProps.messages);
		}
		return true;
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

	_getGroupedMessages(messages) {
		// returns messages grouped by type, first errors, then warnings
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
		if (this.props.activeTab === panelId) {
			activeTab = "";
		}
		this.props.setActiveTab(activeTab);
	}

	_handleMessageClick(controlId, ev) {
		const control = this.props.controller.getControl(controlId);
		this.props.setActiveTab(control.parentCategoryId);
	}

	_modalTabsOnClick(tabId) {
		this.props.setActiveTab(tabId);
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
			// if only 1 tab don't show any tabs
			if (tabs.length === 1) {
				return (
					<div key={"cat." + key} className="properties-category">
						{panelItems}
						{additionalComponent}
					</div>
				);
			}
			if (this.props.rightFlyout) {
				let panelArrow = <Icon type={CARBON_ICONS.CHEVRONARROWS.DOWN} className="properties-category-caret-down" />;
				let categoryOpen = false;
				if (this.props.activeTab === tab.group) {
					panelArrow = <Icon type={CARBON_ICONS.CHEVRONARROWS.UP} className="properties-category-caret-up" />;
					categoryOpen = true;
				}
				tabContent.push(
					<div key={this._getContainerIndex(hasAlertsTab, i) + "-" + key} className="properties-category-container">
						<button type="button" onClick={this._showCategoryPanel.bind(this, tab.group)}
							className="properties-category-title"
						>
							{tab.text}{this._getMessageCountForCategory(tab)}
							{panelArrow}
						</button>
						<div className={classNames("properties-category-content", { "show": categoryOpen }) }>
							{panelItems}
							{additionalComponent}
						</div>
					</div>
				);
			} else {
				if (this.props.activeTab === tab.group) {
					modalSelected = i;
				}
				tabContent.push(
					<Tab
						key={this._getContainerIndex(hasAlertsTab, i) + "-" + key}
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
					className="properties-subtab"
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
		let textClass = "";
		let icon = null;
		let text = "";
		const propertyId = {};
		switch (uiItem.itemType) {
		case ("control"):
			propertyId.name = uiItem.control.name;
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
		case ("additionalLink"):
			var subPanel = this.genPanel(key, uiItem.panel, inPropertyId, indexof);
			return (<SubPanelButton key={"sub-panel-button." + key}
				label={uiItem.text}
				title={uiItem.secondaryText}
				panel={subPanel}
				controller={this.props.controller}
				rightFlyout={this.props.rightFlyout}
			/>);
		case ("staticText"):
			textClass = classNames("properties-static-text", uiItem.textType);
			icon = uiItem.textType === "info" ? <div><Icon type={CARBON_ICONS.INFORMATION} className="properties-static-text-icon-info" /></div> : null;
			text = <div className={textClass}>{PropertyUtil.evaluateText(uiItem.text, this.props.controller)}</div>;
			return <div key={"static-text." + key} className="properties-static-text-container">{icon}{text}</div>;
		case ("linkText"): // linkText used for Alerts tab. Only used internally
			textClass = classNames("properties-link-text-container", uiItem.textType);
			if (uiItem.textType === "warning") {
				icon = <Icon type={CONDITION_MESSAGE_TYPE.WARNING} />;
			} else if (uiItem.textType === "error") {
				icon = <Icon type={CONDITION_MESSAGE_TYPE.ERROR} />;
			}
			text = (
				<a className="properties-link-text" onClick={this._handleMessageClick.bind(this, uiItem.controlId)}>
					{PropertyUtil.evaluateText(uiItem.text, this.props.controller)}
				</a>);
			return <div key={"link-text." + key} className={textClass} >{icon}{text}</div>;
		case ("hSeparator"):
			return <hr key={"h-separator." + key} className="properties-h-separator" />;
		case ("panel"):
			return this.genPanel(key, uiItem.panel, inPropertyId, indexof);
		case ("subTabs"):
			return this.genSubTabs(key, uiItem.tabs, inPropertyId, indexof);
		case ("primaryTabs"):
			return this.genPrimaryTabs(key, uiItem.tabs, inPropertyId, indexof);
		case ("panelSelector"):
			return this.genPanelSelector(key, uiItem.tabs, uiItem.dependsOn, inPropertyId, indexof, uiItem.id);
		case ("checkboxSelector"):
			return this.genPanel(key, uiItem.panel, inPropertyId, indexof);
		case ("customPanel"):
			return this.generateCustomPanel(key, uiItem.panel);
			// only generate summary panel for right side flyout
		case ("action"):
			return this.actionFactory.generateAction(key, uiItem.action);
		case ("textPanel"):
			if (uiItem.panel) {
				return (<TextPanel key={"text-panel-" + key} panel={uiItem.panel} controller={this.props.controller} />);
			}
			return <div key={"unknown." + key}>Unknown: {uiItem.itemType}</div>;
		default:
			return <div key={"unknown." + key}>Unknown: {uiItem.itemType}</div>;
		}
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
						return null;
					}
				}
			}
		}
		return <div key={"custom." + key}>Panel Not Found: {panel.id}</div>;
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
		switch (panel.panelType) {
		case ("columnSelection"):
			this.generateSharedControlNames(panel);
			// needs to be ran after setting shared controls to get correct fields in shared controls
			content = this.genUIContent(panel.uiItems, propertyId, indexof);
			return (<div
				className="properties-control-panel"
				key={key}
			>
				{content}
			</div>);
		case ("summary"):
			if (this.props.rightFlyout) {
				return (
					<SummaryPanel
						key={"summary-panel-" + id}
						controller={this.props.controller}
						panel={panel}
					>
						{content}
					</SummaryPanel>);
			}
			return content;
		case ("actionPanel"):
			return (
				<ActionPanel key={"action-panel-" + key} controller={this.props.controller} panel={panel}>
					{content}
				</ActionPanel>);
		case ("twisty"):
			return (
				<TwistyPanel
					key={id}
					controller={this.props.controller}
					panel={panel}
				>
					{content}
				</TwistyPanel>);
		default:
			return (<div className="properties-control-panel" key={key} data-id={"properties-" + panel.id}>
				{content}
			</div>);
		}
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
		this.fieldPickerPropertyId = null;
		this.setState({
			showFieldPicker: false
		});
	}

	/**
	* Opens the field picker
	* @param propertyId of the control opening the field picker
	* @param callback function to invoke when closing the field picker
	*/
	openFieldPicker(propertyId, callback) {
		this.props.showPropertiesButtons(false);
		this.fieldPickerPropertyId = propertyId;
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
		if (this.fieldPickerPropertyId && this.fieldPickerPropertyId.name) {
			const currentControlValues = this.props.controller.getPropertyValue(this.fieldPickerPropertyId);
			// if in columnSelectionPanel, filter out fields that are in the other controls
			const fields = this.props.controller.getFilteredDatasetMetadata(this.fieldPickerPropertyId);

			// create a list of field names to be passed into the field picker
			const control = this.props.controller.getControl(this.fieldPickerPropertyId);
			let dmImage;
			const tableFieldIndex = PropertyUtil.getTableFieldIndex(control);
			const subControls = control.subControls;
			if (tableFieldIndex !== -1) {
				if (!subControls) {
					dmImage = control.dmImage;
				} else {
					dmImage = subControls[tableFieldIndex].dmImage;
				}
			}
			const formattedFieldsList = PropertyUtil.getFieldsFromControlValues(control, currentControlValues, fields);

			return (<div className="properties-fp-table">
				<FieldPicker
					key="field-picker-control"
					controller={this.props.controller}
					closeFieldPicker={this.closeFieldPicker}
					currentFields={formattedFieldsList}
					fields={fields}
					title={title}
					rightFlyout={this.props.rightFlyout}
					dmIcon={dmImage}
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
				MESSAGE_KEYS.ALERTS_TAB_TITLE),
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
		if (!isEmpty(this.messages) && uiItems[0].itemType === "primaryTabs" && uiItems[0].tabs && uiItems[0].tabs.length > 1) {
			// create a new copy for uiItems object so that alerts are not added multiple times
			uiItems = cloneDeep(uiItems);
			uiItems[0].tabs.unshift(this.genAlertsTab(this.messages)); // add alerts tab to the beginning of the tabs array
		}

		let content = this.genUIContent(uiItems);
		let wideFly = <div />;

		const form = this.props.controller.getForm();
		const title = PropertyUtil.formatMessage(this.props.controller.getReactIntl(),
			MESSAGE_KEYS.FIELDPICKER_SAVEBUTTON_LABEL) + " " + form.label;

		if (this.props.rightFlyout && this.state.showFieldPicker) {
			wideFly = (<WideFlyout
				showPropertiesButtons={false}
				show
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
	activeTab: PropTypes.string, // set by redux
	setActiveTab: PropTypes.func, // set by redux
	messages: PropTypes.array // set by redux
};

const mapStateToProps = (state, ownProps) => ({
	activeTab: state.componentMetadataReducer.activeTab,
	messages: ownProps.controller.getErrorMessages(true, true, true)
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	setActiveTab: (tabId) => {
		dispatch(setActiveTab(tabId));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(EditorForm);
