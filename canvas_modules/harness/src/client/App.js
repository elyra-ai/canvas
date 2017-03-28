/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint complexity: ["error", 13] */

import React from "react";
import Isvg from "react-inlinesvg";
import ReactTooltip from "react-tooltip";
import { IntlProvider, FormattedMessage, addLocaleData } from "react-intl";
import en from "react-intl/locale-data/en";
var i18nData = require("../intl/en.js");

import { CommonCanvas, ObjectModel } from "@wdp/common-canvas";
import { CommonProperties } from "@wdp/common-properties";

import Console from "./components/console.jsx";
import SidePanel from "./components/sidepanel.jsx";
import TestService from "./services/TestService";

import {
	BLANK_CANVAS,
	NONE,
	PALETTE_TOOLTIP,
	SIDE_PANEL_CANVAS,
	SIDE_PANEL_STYLES,
	SIDE_PANEL_MODAL,
	STRAIGHT,
	PROPERTIESINFO
} from "./constants/constants.js";

import listview32 from "../graphics/list-view_32.svg";
import addnew32 from "../graphics/add-new_32.svg";
import close32 from "../graphics/close_32.svg";
import play32 from "../graphics/play_32.svg";
import createNew32 from "../graphics/create-new_32.svg";
import edit32 from "../graphics/edit_32.svg";
import justify32 from "../graphics/justify_32.svg";
import template32 from "ibm-design-icons/dist/svg/object-based/template_32.svg";


class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			consoleout: [],
			consoleOpened: false,
			contextMenuInfo: {},
			internalObjectModel: true,
			openSidepanelCanvas: false,
			openSidepanelStyles: false,
			openSidepanelModal: false,
			paletteNavEnabled: false,
			paletteOpened: false,
			propertiesInfo: {},
			propertiesJson: null,
			selectedPanel: null,
			selectedLinkTypeStyle: STRAIGHT,
			selectedLayoutDirection: NONE,
			showContextMenu: false,
			showPropertiesDialog: false
		};

		this.openConsole = this.openConsole.bind(this);
		this.log = this.log.bind(this);

		this.addNode = this.addNode.bind(this);
		this.delete = this.delete.bind(this);
		this.run = this.run.bind(this);

		this.openPalette = this.openPalette.bind(this);
		this.closePalette = this.closePalette.bind(this);
		this.enableNavPalette = this.enableNavPalette.bind(this);
		this.setDiagramJSON = this.setDiagramJSON.bind(this);
		this.setPaletteJSON = this.setPaletteJSON.bind(this);
		this.setPropertiesJSON = this.setPropertiesJSON.bind(this);

		this.sidePanelCanvas = this.sidePanelCanvas.bind(this);
		this.sidePanelStyles = this.sidePanelStyles.bind(this);
		this.sidePanelModal = this.sidePanelModal.bind(this);
		this.setLinkTypeStyle = this.setLinkTypeStyle.bind(this);
		this.setLayoutDirection = this.setLayoutDirection.bind(this);
		this.useInternalObjectModel = this.useInternalObjectModel.bind(this);

		// common-canvas
		this.contextMenuHandler = this.contextMenuHandler.bind(this);
		this.contextMenuActionHandler = this.contextMenuActionHandler.bind(this);
		this.editActionHandler = this.editActionHandler.bind(this);
		this.clickActionHandler = this.clickActionHandler.bind(this);
		this.decorationActionHandler = this.decorationActionHandler.bind(this);

		this.applyDiagramEdit = this.applyDiagramEdit.bind(this);
		this.applyPropertyChanges = this.applyPropertyChanges.bind(this);
		this.nodeEditHandler = this.nodeEditHandler.bind(this);
		this.refreshContent = this.refreshContent.bind(this);

		// common-properties
		this.openPropertiesEditorDialog = this.openPropertiesEditorDialog.bind(this);
		this.closePropertiesEditorDialog = this.closePropertiesEditorDialog.bind(this);

		ObjectModel.setCanvas(BLANK_CANVAS);
		ObjectModel.setPaletteData({});
	}

	componentDidMount() {
		addLocaleData(en);
		var canvas = ObjectModel.getCanvas();
		TestService.postCanvas(canvas);
	}

	getLabel(labelId, defaultLabel) {
		return <FormattedMessage id={ labelId } defaultMessage={ defaultLabel } />;
	}

	setDiagramJSON(diagramJson) {
		ObjectModel.setCanvas(diagramJson);
		this.log("Canvas diagram set");
	}

	setPaletteJSON(paletteJson) {
		ObjectModel.setPaletteData(paletteJson);
		this.log("Palette set");
	}

	setPropertiesJSON(propertiesJson) {
		this.setState({ propertiesJson: propertiesJson });
		this.openPropertiesEditorDialog();
		this.log("Properties set");
	}

	setLayoutDirection(selectedLayout) {
		this.setState({ selectedLayoutDirection: selectedLayout });
		this.log("Layout selected", selectedLayout);
	}

	setLinkTypeStyle(selectedLink) {
		this.setState({ selectedLinkTypeStyle: selectedLink });
		this.log("Link type style selected", selectedLink);
	}

	sidePanelCanvas() {
		this.setState({
			openSidepanelCanvas: !this.state.openSidepanelCanvas,
			openSidepanelStyles: false,
			openSidepanelModal: false,
			selectedPanel: SIDE_PANEL_CANVAS
		});
	}

	sidePanelStyles() {
		this.setState({
			openSidepanelStyles: !this.state.openSidepanelStyles,
			openSidepanelCanvas: false,
			openSidepanelModal: false,
			selectedPanel: SIDE_PANEL_STYLES
		});
	}

	sidePanelModal() {
		this.setState({
			openSidepanelModal: !this.state.openSidepanelModal,
			openSidepanelCanvas: false,
			openSidepanelStyles: false,
			selectedPanel: SIDE_PANEL_MODAL
		});
	}

	log(evt, data, content) {
		var event = {
			"timestamp": new Date().toLocaleString(),
			"event": evt,
			"data": data,
			"content": content
		};
		var that = this;
		this.setState({
			consoleout: this.state.consoleout.concat(event)
		}, function() {
			TestService.postEventLog(that.state.consoleout);
		});
		var objDiv = document.getElementById("app-console");
		objDiv.scrollTop = objDiv.scrollHeight;
	}

	openConsole() {
		this.setState({ consoleOpened: !this.state.consoleOpened });
	}

	addNode() {
		this.log("addNode() clicked");
	}

	delete() {
		this.log("delete() clicked");
	}

	run() {
		this.log("run() clicked");
	}

	openPalette() {
		if (this.state.paletteNavEnabled) {
			this.log("opening palette");
			this.setState({ paletteOpened: true });
		}
	}

	closePalette() {
		this.setState({ paletteOpened: false });
	}

	enableNavPalette(enabled) {
		this.setState({ paletteNavEnabled: enabled });
		// this.log("palette in nav bar enabled: " + enabled);
	}

	useInternalObjectModel(enabled) {
		this.setState({ internalObjectModel: enabled });
		this.log("use internal object model", enabled);
	}

	postCanvas() {
		var canvas = ObjectModel.getCanvas();
		TestService.postCanvas(canvas);
	}

	// common-canvas
	clickActionHandler(source) {
		this.log("clickActionHandler()");
		if (source.clickType === "DOUBLE_CLICK" && source.objectType === "node") {
			this.nodeEditHandler(source.id);
		}
	}

	nodeEditHandler(nodeId) {
		this.log("nodeEditHandler()", nodeId);
		this.openPropertiesEditorDialog();
	}

	applyDiagramEdit(data, options) {
		this.log("applyDiagramEdit()", data.editType);
	}

	applyPropertyChanges(form, appData) {
		this.log("applyPropertyChanges()", appData);
	}

	contextMenuHandler(source) {
		const EDIT_SUB_MENU = [
			{ action: "cutSelection", label: this.getLabel("edit-context.cutSelection", "Cut") },
      { action: "copySelection", label: this.getLabel("edit-context.copySelection", "Copy") }
		];

		const NODE_CONTEXT_MENU = [
      { action: "editNode", label: this.getLabel("node-context.editNode", "Open") },
      { action: "disconnectNode", label: this.getLabel("node-context.disconnectNode", "Disconnect") },
      { action: "previewNode", label: this.getLabel("node-context.previewNode", "Preview") },
			{ divider: true },
      { action: "createSuperNode", label: this.getLabel("node-context.createSuperNode", "Create supernode") },
      { divider: true },
      { submenu: true, label: this.getLabel("node-context.editMenu", "Edit"), menu: EDIT_SUB_MENU },
      { divider: true },
      { action: "deleteObjects", label: this.getLabel("node-context.deleteNode", "Delete") },
      { divider: true },
      { action: "executeNode", label: this.getLabel("node-context.executeNode", "Execute") }
		];

		const APPLY_MODEL_NODE_CONTEXT_MENU = [
      { action: "editNode", label: this.getLabel("node-context.editNode", "Open") },
      { action: "viewModel", label: this.getLabel("node-context.viewModel", "View Model") },
      { action: "disconnectNode", label: this.getLabel("node-context.disconnectNode", "Disconnect") },
      { action: "previewNode", label: this.getLabel("node-context.previewNode", "Preview") },
      { divider: true },
      { action: "createSuperNode", label: this.getLabel("node-context.createSuperNode", "Create supernode") },
      { divider: true },
      { submenu: true, label: this.getLabel("node-context.editMenu", "Edit"), menu: EDIT_SUB_MENU },
      { divider: true },
      { action: "deleteObjects", label: this.getLabel("node-context.deleteNode", "Delete") },
      { divider: true },
      { action: "executeNode", label: this.getLabel("node-context.executeNode", "Execute") }
		];

		const SUPER_NODE_CONTEXT_MENU = [
      { action: "editNode", label: this.getLabel("node-context.editNode", "Open") },
      { action: "disconnectNode", label: this.getLabel("node-context.disconnectNode", "Disconnect") },
      { divider: true },
      { action: "createSuperNode", label: this.getLabel("node-context.createSuperNode", "Create supernode") },
      { action: "expandSuperNode", label: this.getLabel("node-context.expandSuperNode", "Expand supernode") },
      { divider: true },
      { submenu: true, label: this.getLabel("node-context.editMenu", "Edit"), menu: EDIT_SUB_MENU },
      { divider: true },
      { action: "deleteObjects", label: this.getLabel("node-context.deleteNode", "Delete") },
      { divider: true },
      { action: "executeNode", label: this.getLabel("node-context.executeNode", "Execute") }
		];

		const MULTI_SELECT_CONTEXT_MENU = [
      { action: "disconnectNode", label: this.getLabel("node-context.disconnectNode", "Disconnect") },
      { divider: true },
      { action: "createSuperNode", label: this.getLabel("node-context.createSuperNode", "Create supernode") },
      { divider: true },
      { submenu: true, label: this.getLabel("node-context.editMenu", "Edit"), menu: EDIT_SUB_MENU },
      { divider: true },
      { action: "deleteObjects", label: this.getLabel("node-context.deleteNode", "Delete") }
		];

		const EMPTY_CLIPBOARD_CANVAS_CONTEXT_MENU = [
      { action: "addComment", label: this.getLabel("canvas-context.addComment", "New comment") },
      { action: "CC_selectAll", label: this.getLabel("canvas-context.selectAll", "Select All") },
      { divider: true },
      { action: "cutSelection", label: this.getLabel("edit-context.cutSelection", "Cut") },
      { action: "copySelection", label: this.getLabel("edit-context.copySelection", "Copy") },
      { divider: true },
      { action: "streamProperties", label: this.getLabel("canvas-context.streamProperties", "Options") }
		];

		const LINK_CONTEXT_MENU = [
      { action: "deleteLink", label: this.getLabel("link-context.deleteLink", "Delete") }
		];

		const COMMENT_CONTEXT_MENU = [
      { action: "deleteObjects", label: this.getLabel("comment-context.deleteComment", "Delete") }
		];

		const DEPLOY_CONTEXT_MENU = [
			{ action: "editNode", label: this.getLabel("node-context.editNode", "Open") },
			{ action: "disconnectNode", label: this.getLabel("node-context.disconnectNode", "Disconnect") },
			{ action: "previewNode", label: this.getLabel("node-context.previewNode", "Preview") },
			{ divider: true },
			{ action: "createSuperNode", label: this.getLabel("node-context.createSuperNode", "Create supernode") },
			{ divider: true },
			{ submenu: true, label: this.getLabel("node-context.editMenu", "Edit"), menu: EDIT_SUB_MENU },
			{ divider: true },
			{ action: "deleteObjects", label: this.getLabel("node-context.deleteNode", "Delete") },
			{ divider: true },
			{ action: "deploy", label: this.getLabel("node-context.deploy", "Deploy") },
			{ divider: true },
			{ action: "executeNode", label: this.getLabel("node-context.executeNode", "Execute") }
		];

		let menuDefinition = null;
		if (source.type === "canvas") {
			menuDefinition = EMPTY_CLIPBOARD_CANVAS_CONTEXT_MENU;
		} else if (source.type === "link") {
			menuDefinition = LINK_CONTEXT_MENU;
		} else if (source.type === "node") {
			if (source.selectedObjectIds) {
				if (source.selectedObjectIds.length > 1) {
					menuDefinition = MULTI_SELECT_CONTEXT_MENU;
				} else if (source.targetObject.containsModel === true) {
					menuDefinition = APPLY_MODEL_NODE_CONTEXT_MENU;
				} else if (source.targetObject.subDiagramId) {
					menuDefinition = SUPER_NODE_CONTEXT_MENU;
				} else if (source.targetObject &&
					source.targetObject.userData &&
					source.targetObject.userData.deployable &&
					(source.targetObject.userData.deployable === true)) {
					menuDefinition = DEPLOY_CONTEXT_MENU;
				} else {
					menuDefinition = NODE_CONTEXT_MENU;
				}
			}
		} else if (source.type === "comment") {
			if (source.selectedObjectIds) {
				menuDefinition = COMMENT_CONTEXT_MENU;
			}
		}

		return menuDefinition;
	}

	editActionHandler(data) {
		var type = "";
		if (data.nodeTypeId) {
			type = data.nodeTypeId;
		} else if (data.nodes) {
			type = data.nodes[0];
		}

		if (data.targetNodes) {
			type += " to " + data.targetNodes[0];
		}

		this.log("editActionHandler() " + data.editType, type, data.label);
		this.postCanvas();
	}

	contextMenuActionHandler(action, source) {
		if (action === "streamProperties") {
			this.log("action: streamProperties");
		} else if (action === "addComment") {
			this.applyDiagramEdit({
				editType: "createComment",
				label: " ",
				nodes: source.selectedObjectIds,
				offsetX: source.mousePos.x,
				offsetY: source.mousePos.y,
				width: 0,
				height: 0
			});
		} else if (action === "deleteLink") {
			this.log("action: deleteLink", source.id);
		} else if (action === "editNode") {
			this.log("action: editNode", source.targetObject.id);
		} else if (action === "viewModel") {
			this.log("action: viewModel", source.targetObject.id);
		} else if (action === "disconnectNode") {
			this.log("action: disconnectNode", source.selectedObjectIds, source.targetObject.objectData.label);
		} else if (action === "createSuperNode") {
			this.log("action: createSuperNode", source.selectedObjectIds, source.targetObject.objectData.label);
		} else if (action === "expandSuperNode") {
			this.log("action: expandSuperNode", source.targetObject.id);
		} else if (action === "deleteObjects") {
      if (source.targetObject.objectData === undefined) {
        this.log("action: deleteObjects", source.selectedObjectIds, source.targetObject.content);
      } else {
        this.log("action: deleteObjects", source.selectedObjectIds, source.targetObject.objectData.label);
      }
		} else if (action === "executeNode") {
			this.log("action: executeNode", source.targetObject.id);
		} else if (action === "previewNode") {
			this.log("action: previewNode", source.targetObject.id);
		} else if (action === "deploy") {
			this.log("action: deploy", source.targetObject.id);
		}
		this.postCanvas();
	}

	decorationActionHandler(node, id) {
		this.log("decorationHandler()");
		if (id === "supernodeZoomIn") {
			this.refreshContent("this.state.stream.id", "node.subDiagramId");
		}
	}

	decorationHandler(node) {
		var decorators = [];

		if (node.subDiagramId) {
			decorators.push({
				className: "supernode-zoom-in",
				position: "top-left",
				actionHandler: this.decorationAction.bind(this, node, "supernodeZoomIn") });
		}

		if (node.cacheState !== "disabled") {
			decorators.push({
				className: "cache-" + node.cacheState,
				position: "top-right" });
		}
		return decorators;
	}

	refreshContent(streamId, diagramId) {
		this.log("refreshContent()");
	}

	// common-properties
	openPropertiesEditorDialog() {
		// set test data if none provided
		var properties = this.state.propertiesJson;
		if (properties === null) {
			properties = PROPERTIESINFO;
		}

		const propsInfo = {
			title: <FormattedMessage id={ "dialog.nodePropertiesTitle" } />,
			formData: properties.formData,
			appData: properties.appData,
			applyPropertyChanges: this.applyPropertyChanges,
			closePropertiesDialog: this.closePropertiesEditorDialog,
			additionalComponents: properties.additionalComponents
		};
		this.setState({ showPropertiesDialog: true, propertiesInfo: propsInfo });
	}

	closePropertiesEditorDialog() {
		this.setState({ showPropertiesDialog: false, propertiesInfo: {} });
	}

	render() {
		var paletteClass = "palette-" + this.state.paletteNavEnabled;

		var locale = "en";
		var messages = i18nData.messages;

		var navBar = (<div id="app-navbar">
			<div className="app-navbar">
				<nav id="action-bar">
					<ul className="app-navbar-items">
						<li className="navbar-li">
							<a id="title">Canvas Testbed</a>
						</li>
						<li className="navbar-li nav-divider" data-tip="console">
							<a onClick={this.openConsole.bind(this) }>
								<Isvg id="action-bar-console"
									src={listview32}
								/>
							</a>
						</li>
						<li className="navbar-li nav-divider" data-tip="add node">
							<a onClick={this.addNode.bind(this) }>
								<Isvg id="action-bar-add"
									src={ addnew32}
								/>
							</a>
						</li>
						<li className="navbar-li" data-tip="delete">
							<a onClick={this.delete.bind(this) }>
								<Isvg id="action-bar-delete"
									src={close32}
								/>
							</a>
						</li>
						<li className="navbar-li" data-tip="run">
							<a onClick={this.run.bind(this) }>
								<Isvg id="action-bar-run"
									src={play32}
								/>
							</a>
						</li>
						<li className="navbar-li nav-divider" id={paletteClass} data-tip="palette">
							<a onClick={this.openPalette.bind(this) }>
								<Isvg id="action-bar-palette"
									src={createNew32}
								/>
							</a>
						</li>
						<li className="navbar-li action-bar-sidepanel"
							id="action-bar-sidepanel-modal" data-tip="Common Properties Modal"
						>
							<a onClick={this.sidePanelModal.bind(this) }>
								<Isvg id="action-bar-panel-modal"
									src={template32}
								/>
							</a>
						</li>
						<li className="navbar-li action-bar-sidepanel"
							id="action-bar-sidepanel-styles" data-tip="Common Canvas Styles"
						>
							<a onClick={this.sidePanelStyles.bind(this) }>
								<Isvg id="action-bar-panel-styles"
									src={edit32}
								/>
							</a>
						</li>
						<li className="navbar-li nav-divider action-bar-sidepanel"
							id="action-bar-sidepanel"	data-tip="Common Canvas"
						>
							<a onClick={this.sidePanelCanvas.bind(this) }>
								<Isvg id="action-bar-panel"
									src={justify32}
								/>
							</a>
						</li>
					</ul>
				</nav>
			</div>
		</div>);

		var commonCanvasConfig = {
			enablePalette: this.state.paletteNavEnabled, // true if palette json submitted
			enableAutoLayout: this.state.selectedLayoutDirection,
			enableInternalObjectModel: this.state.internalObjectModel,
			paletteTooltip: PALETTE_TOOLTIP
		};

		var commonCanvas = (<div id="canvas">
			<CommonCanvas
				config={commonCanvasConfig}
				contextMenuHandler={this.contextMenuHandler}
				contextMenuActionHandler= {this.contextMenuActionHandler}
				editActionHandler= {this.editActionHandler}
				clickActionHandler= {this.clickActionHandler}
				decorationActionHandler= {this.decorationActionHandler}
			/>
		</div>);

		var commonProperties = (<div id="common-properties">
			<CommonProperties
				showPropertiesDialog={this.state.showPropertiesDialog}
				propertiesInfo={this.state.propertiesInfo}
			/>
		</div>);

		var mainView = (<div id="app-container">
			{navBar}
			<SidePanel
				selectedPanel={this.state.selectedPanel}
				enableNavPalette={this.enableNavPalette}
				internalObjectModel={this.state.internalObjectModel}
				openPropertiesEditorDialog={this.openPropertiesEditorDialog}
				closePropertiesEditorDialog={this.closePropertiesEditorDialog}
				openSidepanelCanvas={this.state.openSidepanelCanvas}
				openSidepanelStyles={this.state.openSidepanelStyles}
				openSidepanelModal={this.state.openSidepanelModal}
				setDiagramJSON={this.setDiagramJSON}
				setPaletteJSON={this.setPaletteJSON}
				setPropertiesJSON={this.setPropertiesJSON}
				setLayoutDirection={this.setLayoutDirection}
				selectedLayoutDirection={this.state.selectedLayoutDirection}
				setLinkTypeStyle={this.setLinkTypeStyle}
				selectedLinkTypeStyle={this.state.selectedLinkTypeStyle}
				showPropertiesDialog={this.state.showPropertiesDialog}
				useInternalObjectModel={this.useInternalObjectModel}
				log={this.log}
			/>
			<IntlProvider key="IntlProvider" locale={ locale } messages={ messages }>
				{commonCanvas}
			</IntlProvider>
			<IntlProvider key="IntlProvider2" locale={ locale } messages={ messages }>
				{commonProperties}
			</IntlProvider>
			<Console
				consoleOpened={this.state.consoleOpened}
				logs={this.state.consoleout}
			/>
			<ReactTooltip place="bottom" effect="solid" />
		</div>);

		return (
			<div>{mainView}</div>
		);
	}
}

export default App;
