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

import React from "react";
import PropTypes from "prop-types";
import Tabs from "ap-components-react/dist/components/Tabs";
import PropertyUtil from "../util/property-utils.js";
import { MESSAGE_KEYS, MESSAGE_KEYS_DEFAULTS } from "../constants/constants";
import logger from "../../../utils/logger";

import SelectorPanel from "./../editor-panels/selector-panel.jsx";
import SummaryPanel from "./../editor-panels/summary-panel.jsx";
import CheckboxSelectionPanel from "../editor-panels/checkbox-selection-panel.jsx";
import WideFlyout from "../components/wide-flyout.jsx";

import ButtonAction from "../actions/button-action.jsx";

import SubPanelButton from "./../editor-panels/sub-panel-button.jsx";
import FieldPicker from "./field-picker.jsx";

import { injectIntl, intlShape } from "react-intl";


import DownIcon from "../../../assets/images/down_enabled.svg";
import UpIcon from "../../../assets/images/up_enabled.svg";
import InfoIcon from "../../../assets/images/info.svg";

class EditorForm extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			showFieldPicker: false,
			fieldPickerControl: {},
			activeTabId: null
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.getControl = this.getControl.bind(this);

		this.genPanel = this.genPanel.bind(this);
		this.genUIContent = this.genUIContent.bind(this);
		this.genUIItem = this.genUIItem.bind(this);

		this.closeFieldPicker = this.closeFieldPicker.bind(this);
		this.openFieldPicker = this.openFieldPicker.bind(this);
		this.generateSharedControlNames = this.generateSharedControlNames.bind(this);

		this._showCategoryPanel = this._showCategoryPanel.bind(this);

		// initialize ControlFactory with correct values
		this.ControlFactory = props.controller.getControlFactory();
		this.ControlFactory.setFunctions(this.openFieldPicker, this.genUIItem);
		this.ControlFactory.setRightFlyout(props.rightFlyout);
	}

	getControl(propertyName) {
		return this.refs[propertyName];
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
	genUIItem(key, uiItem, inPropertyId, indexof) {
		if (uiItem.itemType === "control") {
			const propertyId = { name: uiItem.control.name };
			// Used for subpanels in tables
			if (inPropertyId) {
				propertyId.name = inPropertyId.name;
				propertyId.row = inPropertyId.row;
				propertyId.col = indexof(uiItem.control.name);
			}
			return this.ControlFactory.createControlItem(uiItem.control, propertyId);
		} else if (uiItem.itemType === "additionalLink") {
			var subPanel = this.genPanel(key, uiItem.panel, inPropertyId, indexof);
			return (<SubPanelButton id={"sub-panel-button." + key}
				label={uiItem.text}
				title={uiItem.secondaryText}
				panel={subPanel}
				controller={this.props.controller}
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
			return this.genPanel(key, uiItem.panel, inPropertyId, indexof);
		} else if (uiItem.itemType === "subTabs") {
			return this.genSubTabs(key, uiItem.tabs, inPropertyId, indexof);
		} else if (uiItem.itemType === "primaryTabs") {
			return this.genPrimaryTabs(key, uiItem.tabs, inPropertyId, indexof);
		} else if (uiItem.itemType === "panelSelector") {
			return this.genPanelSelector(key, uiItem.tabs, uiItem.dependsOn, inPropertyId, indexof);
		} else if (uiItem.itemType === "checkboxSelector") {
			return this.genPanel(key, uiItem.panel, inPropertyId, indexof);
		} else if (uiItem.itemType === "customPanel") {
			return this.generateCustomPanel(key, uiItem.panel);
			// only generate summary panel for right side flyout
		} else if (uiItem.itemType === "summaryPanel") {
			return this.genPanel(key, uiItem.panel, inPropertyId, indexof);
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

	openFieldPicker(control) {
		this.props.showPropertiesButtons(false);
		this.setState({
			fieldPickerControl: control,
			showFieldPicker: true
		});
	}

	fieldPicker(title) {
		const currentControlValues = this.props.controller.getPropertyValues();
		const propertyId = { name: this.state.fieldPickerControl.name };
		const filteredDataset = this.props.controller.getFilteredDatasetMetadata(propertyId);

		return (<div id="field-picker-table">
			<FieldPicker
				key="field-picker-control"
				controller={this.props.controller}
				closeFieldPicker={this.closeFieldPicker}
				currentControlValues={currentControlValues}
				dataModel={filteredDataset}
				control={this.state.fieldPickerControl}
				title={title}
				rightFlyout={this.props.rightFlyout}
			/>
		</div>);
	}

	render() {
		var content = this.genUIContent(this.props.controller.getUiItems());
		var wideFly = <div />;

		const form = this.props.controller.getForm();
		const title = PropertyUtil.formatMessage(this.props.intl,
			MESSAGE_KEYS.FIELDPICKER_SAVEBUTTON_LABEL, MESSAGE_KEYS_DEFAULTS.FIELDPICKER_SAVEBUTTON_LABEL) + " " + form.label;

		if (this.props.rightFlyout) {
			wideFly = (<WideFlyout
				showPropertiesButtons={false}
				show={this.state.showFieldPicker && this.props.rightFlyout}
				title={title}
			>
				{this.fieldPicker(title)}
			</WideFlyout>);
		} else if (this.state.showFieldPicker) {
			content = this.fieldPicker(title);
		}

		return (
			<div>
				<div className="well">
					<form className="form-horizontal">
						<div className="section--light">
							{content}
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
	rightFlyout: PropTypes.bool,
	intl: intlShape,
	actionHandler: PropTypes.func
};

export default injectIntl(EditorForm);
