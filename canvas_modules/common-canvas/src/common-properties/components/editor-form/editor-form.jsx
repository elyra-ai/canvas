/*
 * Copyright 2017-2023 Elyra Authors
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
import { Tab, Tabs, TabList, TabPanel, Link, TabPanels, Accordion, AccordionItem } from "@carbon/react";
import * as PropertyUtil from "./../../util/property-utils";
import { MESSAGE_KEYS, CARBON_ICONS, CONDITION_MESSAGE_TYPE, STATES, CATEGORY_VIEW } from "./../../constants/constants";
import { cloneDeep, isEmpty, sortBy, get, filter } from "lodash";
import logger from "./../../../../utils/logger";
import classNames from "classnames";

import SelectorPanel from "./../../panels/selector";
import SummaryPanel from "./../../panels/summary";
import TwistyPanel from "./../../panels/twisty";
import SubPanelButton from "./../../panels/sub-panel/button";
import ColumnPanel from "./../../panels/column";
import ControlPanel from "./../../panels/control";
import Subtabs from "./../../panels/subtabs";

import WideFlyout from "./../wide-flyout";
import TearSheet from "../../panels/tearsheet";
import FieldPicker from "./../field-picker";
import TextPanel from "./../../panels/text-panel";
import ActionPanel from "./../../panels/action-panel";

import ActionFactory from "./../../actions/action-factory";
import Icon from "./../../../icons/icon";
import { ItemType } from "../../constants/form-constants";

const ALERT_TAB_GROUP = "alertMsgs";
class EditorForm extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			showFieldPicker: false
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

		this.FIRST_TEARSHEET_ID = null;
		this.TEARSHEETS = {};
		this.visibleTearsheet = null;
		this.defaultOpenTab = props.activeTab;
		this.alertOpenTab = null;
		this.scrollToAlert = false;
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

	componentDidUpdate(prevProps) {
		// Scroll to the selected accordion even when clicked from Alerts tab
		if (this.scrollToAlert || prevProps.activeTab !== this.props.activeTab) {
			const activeTabId = this.props.activeTab;
			const activeTabElement = document.getElementsByClassName(`${activeTabId}`);
			if (activeTabId && activeTabElement.length > 0) {
				activeTabElement[0].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
			}
			this.scrollToAlert = false;
		}
	}

	_getMessageCountForCategory(tab) {
		if (!this.props.showAlertsTab) {
			return null;
		}
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
		if (this.alertOpenTab === panelId) {
			this.alertOpenTab = null;
		}
		if (this.defaultOpenTab === panelId) {
			this.defaultOpenTab = null;
		}
		this.props.setActiveTab(activeTab);
	}

	_handleMessageClick(controlId, ev) {
		const control = this.props.controller.getControl(controlId);
		this.alertOpenTab = control.parentCategoryId;
		if (this.defaultOpenTab === this.alertOpenTab) {
			this.defaultOpenTab = null;
		}
		this.scrollToAlert = true;
		this.props.setActiveTab(control.parentCategoryId);
	}

	_modalTabsOnClick(tabId) {
		this.props.setActiveTab(tabId);
	}

	genPrimaryTabs(key, tabs, propertyId, indexof) {
		const tabContent = [];
		const tabContentAcc = [];
		const tabLists = [];
		const tabPanels = [];
		let hasAlertsTab = false;
		let modalSelected = 0;
		let hiddenTabs = 0;
		const nonTearsheetTabs = tabs.filter((t) => t.content.itemType !== ItemType.TEARSHEET);
		const tearsheetTabs = tabs.filter((t) => t.content.itemType === ItemType.TEARSHEET);
		const totalTabs = tearsheetTabs.concat(nonTearsheetTabs);
		const tabListAriaLabel = PropertyUtil.formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.EDITORFORM_TABLIST_LABEL);

		for (let i = 0; i < totalTabs.length; i++) {
			const tab = totalTabs[i];
			const tabState = this.props.controller.getPanelState({ name: tab.group });
			if (tabState === STATES.HIDDEN) {
				hiddenTabs++;
				continue;
			}
			if (i === 0 && tab.group === ALERT_TAB_GROUP) {
				hasAlertsTab = true;
			}
			const panelItems = this.genUIItem(this._getContainerIndex(hasAlertsTab, i), tab.content, propertyId, indexof);
			let additionalComponent = null;
			if (this.props.additionalComponents) {
				additionalComponent = this.props.additionalComponents[tab.group];
			}
			// if only 1 tab AND
			// if total non-tearsheet tabs is 1; don't show any tabs
			if (totalTabs.length === 1 && nonTearsheetTabs.length === 1) {
				return (
					<div key={"cat." + key} className="properties-single-category">
						{panelItems}
						{additionalComponent}
					</div>
				);
			}
			if (this.props.rightFlyout && this.props.categoryView !== CATEGORY_VIEW.TABS) {
				let categoryOpen = false;
				if (this.props.activeTab === tab.group) {
					categoryOpen = true;
				}
				if (tab.content.itemType !== ItemType.TEARSHEET && nonTearsheetTabs.length === 1) {
					tabContent.push(
						<div key={"cat." + key} className="properties-single-category">
							{panelItems}
							{additionalComponent}
						</div>
					);
				} else {
					tabContentAcc.push(
						<div key={this._getContainerIndex(hasAlertsTab, i) + "-" + key}
							className={classNames("properties-category-container", { "properties-hidden-container": tab.content.itemType === ItemType.TEARSHEET })}
						>
							<AccordionItem title={`${tab.text}${this._getMessageCountForCategory(tab) ? this._getMessageCountForCategory(tab) : ""}`}
								// Open Tab with Alert Message when from Alerts Tab or a open Default Tab
								open={ this.defaultOpenTab === tab.group || this.alertOpenTab === tab.group }
								onHeadingClick={this._showCategoryPanel.bind(this, tab.group)}
								className={`${classNames("properties-category-content",
									{ "show": categoryOpen }, tab.group)}`}
							>
								{panelItems}
								{additionalComponent}
							</AccordionItem>
						</div>
					);
				}
			} else {
				if (this.props.activeTab === tab.group) {
					modalSelected = i - hiddenTabs; // Adjust the Carbon Tabs index to accomodate hidden tabs
				}
				tabLists.push(
					<Tab
						key={tab.group}
						title={filter([tab.text, this._getMessageCountForCategory(tab)]).join("")}
						className={classNames({ "properties-hidden-container": tab.content.itemType === ItemType.TEARSHEET })}
						onClick={this._modalTabsOnClick.bind(this, tab.group)}
					>
						{filter([tab.text, this._getMessageCountForCategory(tab)]).join("")}
					</Tab>
				);

				tabPanels.push(
					<TabPanel key={tab.group} className={classNames("properties-primary-tab-panel",
						{ "tearsheet-container": this.props.controller.isTearsheetContainer() },
						{ "right-flyout-tabs-view": this.props.rightFlyout && this.props.categoryView === CATEGORY_VIEW.TABS })}
					>
						{panelItems}
						{additionalComponent}
					</TabPanel>
				);
			}
		}

		if (this.props.rightFlyout && this.props.categoryView !== CATEGORY_VIEW.TABS) {
			return (
				<React.Fragment key={"tabContent." + key} >
					{tabContent.length ? (<div key={"cat." + key} className="properties-categories">
						{tabContent}
					</div>) : null}
					{tabContentAcc.length ? (<Accordion size="lg">
						<div key={"cat." + key} className="properties-categories">
							{tabContentAcc}
						</div>
					</Accordion>) : null}
				</React.Fragment>
			);
		}
		return (
			<Tabs key={"tab." + key}
				selectedIndex={modalSelected}
			>
				<TabList className="properties-primaryTabs" aria-label={tabListAriaLabel}>
					{tabLists}
				</TabList>
				<TabPanels>
					{tabPanels}
				</TabPanels>
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

	genPanelSelector(key, tabs, dependsOn, propertyId, indexof, panelId, className) {
		const subPanels = this.generateAdditionalPanels(tabs, key, propertyId, indexof, false, className);
		return (
			<SelectorPanel
				key={"selectorPanel" + key}
				panels={subPanels}
				dependsOn={dependsOn}
				controller={this.props.controller}
			/>
		);
	}

	generateAdditionalPanels(tabs, key, propertyId, indexof, indent, groupClassName) {
		const subPanels = {};
		for (let i = 0; i < tabs.length; i++) {
			const tab = tabs[i];
			let className = "properties-control-panel";
			if (tab.content && tab.content.itemType === "textPanel") {
				className = "";
			}
			// Always show indentation when insert_panels set to true
			if (indent) {
				className += " properties-control-nested-panel";
			}
			subPanels[tab.group] = (
				<div className={classNames(className, groupClassName)} key={tab.group + key}>
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
	*  inPropertyId and indexOf only used for subpanel in tables
	*/
	genUIItem(key, uiItem, inPropertyId, indexof) {
		let textClass = "";
		let icon = null;
		let text = "";
		switch (uiItem.itemType) {
		case ("control"): {
			// If the uiItem has additonalPanels, this indicates that the uiItem is
			// a vertical radio button set followed by a SelectorPanel which has the
			// insert_panels boolean set to true.
			if (uiItem.additionalItems && uiItem.additionalItems.length > 0) {
				uiItem.control.additionalItems = uiItem.additionalItems;
				uiItem.control.optionalPanels =
					this.generateAdditionalPanels(uiItem.additionalItems, key, null, indexof, true);
			}

			const propertyId = { name: uiItem.control.name };

			// Used for subpanels in tables
			if (inPropertyId) {
				const parentPropertyId = cloneDeep(inPropertyId);
				// This control is the last child in parentPropertyId, need to update the child's col index
				this.props.controller.updateLastChildPropertyId(parentPropertyId, { col: indexof(uiItem.control.name) });
				return this.ControlFactory.createControlItem(uiItem.control, parentPropertyId);
			}

			return this.ControlFactory.createControlItem(uiItem.control, propertyId);
		}
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
				<Link className="properties-link-text" onClick={this._handleMessageClick.bind(this, uiItem.controlId)} >
					{PropertyUtil.evaluateText(uiItem.text, this.props.controller)}
				</Link>);
			return <div key={"link-text." + key} className={textClass} >{icon}{text}</div>;
		case ("hSeparator"):
			return <hr key={"h-separator." + key} className="properties-h-separator" />;
		case ("panel"):
		case ("tearsheet"):
			return this.genPanel(key, uiItem.panel, inPropertyId, indexof);
		case ("subTabs"):
			// All Subtabs will become a LeftNav if displayed inside a Tearsheet container
			return (<Subtabs key={"subtabs." + key}
				tabs={uiItem.tabs}
				className={uiItem.className}
				controller={this.props.controller}
				rightFlyout={this.props.rightFlyout}
				genUIItem={this.genUIItem}
				nestedPanel={uiItem.nestedPanel}
				leftnav={this.props.controller.isTearsheetContainer()}
			/>);
		case ("primaryTabs"):
			return this.genPrimaryTabs(key, uiItem.tabs, inPropertyId, indexof);
		case ("panelSelector"):
			return this.genPanelSelector(key, uiItem.tabs, uiItem.dependsOn, inPropertyId, indexof, uiItem.id, uiItem.className);
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
						return (
							<div
								className={classNames("properties-custom-panel", { "properties-control-nested-panel": get(panel, "nestedPanel", false) }) }
								key={"custom." + key}
							>
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
			return (<ControlPanel
				key={id}
				controller={this.props.controller}
				panel={panel}
			>
				{content}
			</ControlPanel>);
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
		case ("tearsheet"):
			this.TEARSHEETS[panel.id] = {
				panel: panel,
				title: panel.label,
				description: panel.description ? panel.description.text : null,
				content: content
			};
			if (this.props.controller.getActiveTearsheet() !== null) {
				this.visibleTearsheet = this.TEARSHEETS[this.props.controller.getActiveTearsheet()];
			} else {
				this.visibleTearsheet = null;
			}
			if (!this.FIRST_TEARSHEET_ID || this.FIRST_TEARSHEET_ID === panel.id) {
				this.FIRST_TEARSHEET_ID = panel.id;
				const onCloseCallback = () => {
					this.props.controller.clearActiveTearsheet();
				};
				return (
					<TearSheet
						open={this.props.controller.getActiveTearsheet() !== null}
						onCloseCallback={onCloseCallback}
						key={panel.id}
						tearsheet={this.visibleTearsheet}
					/>
				);
			}
			return null;
		case ("column"):
			return (
				<ColumnPanel
					key={id}
					controller={this.props.controller}
					panel={panel}
				>
					{content}
				</ColumnPanel>);
		default:
			return (<ControlPanel
				key={id}
				controller={this.props.controller}
				panel={panel}
			>
				{content}
			</ControlPanel>);
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
		if (this.props.showAlertsTab && !isEmpty(this.messages) && uiItems[0].itemType === "primaryTabs" && uiItems[0].tabs && uiItems[0].tabs.length > 1) {
			// create a new copy for uiItems object so that alerts are not added multiple times
			uiItems = cloneDeep(uiItems);
			uiItems[0].tabs.unshift(this.genAlertsTab(this.messages)); // add alerts tab to the beginning of the tabs array
		}

		let content = this.genUIContent(uiItems);
		let wideFly = <div />;
		let stackedTearsheet;

		const form = this.props.controller.getForm();
		const title = PropertyUtil.formatMessage(this.props.controller.getReactIntl(),
			MESSAGE_KEYS.FIELDPICKER_SAVEBUTTON_LABEL) + " " + form.label;

		if (this.state.showFieldPicker) {
			if (this.props.rightFlyout) {
				wideFly = (<WideFlyout
					showPropertiesButtons={false}
					show
					title={title}
					light={this.props.controller.getLight()}
				>
					{this.fieldPicker(title)}
				</WideFlyout>);
			} else if (this.props.controller.isTearsheetContainer()) {
				stackedTearsheet = (<TearSheet
					open
					stacked
					tearsheet={{
						title: title,
						content: this.fieldPicker()
					}}
				/>);
			} else {
				content = this.fieldPicker(title);
			}
		}

		return (
			<div className={classNames("properties-editor-form",
				{ "tearsheet-container": this.props.controller.isTearsheetContainer() },
				{ "right-flyout-tabs-view": this.props.rightFlyout && this.props.categoryView === CATEGORY_VIEW.TABS },
				{ "field-picker": this.state.showFieldPicker })}
			>
				{content}
				{wideFly}
				{stackedTearsheet}
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
	categoryView: PropTypes.oneOf([CATEGORY_VIEW.ACCORDIONS, CATEGORY_VIEW.TABS]),
	showAlertsTab: PropTypes.bool,
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
