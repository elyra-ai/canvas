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
import ReactFileDownload from "react-file-download";
import { IntlProvider, FormattedMessage, addLocaleData, injectIntl, intlShape } from "react-intl";
import en from "react-intl/locale-data/en";
var i18nData = require("../intl/en.js");

import { CommonCanvas, ObjectModel, CommonProperties } from "common-canvas";

import Console from "./components/console.jsx";
import SidePanel from "./components/sidepanel.jsx";
import TestService from "./services/TestService";

import {
	BLANK_CANVAS,
	NONE,
	PALETTE_TOOLTIP,
	SIDE_PANEL_CANVAS,
	SIDE_PANEL_MODAL,
	D3_ENGINE,
	HALO_CONNECTION,
	CURVE_LINKS
} from "./constants/constants.js";

import listview32 from "../graphics/list-view_32.svg";
import addnew32 from "../graphics/add-new_32.svg";
import close32 from "../graphics/close_32.svg";
import play32 from "../graphics/play_32.svg";
import download32 from "../graphics/save_32.svg";
import createNew32 from "../graphics/create-new_32.svg";
import justify32 from "../graphics/justify_32.svg";
import template32 from "ibm-design-icons/dist/svg/object-based/template_32.svg";

const CANVAS_SIZE_LIMIT = 100000;

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			consoleout: [],
			consoleOpened: false,
			contextMenuInfo: {},
			internalObjectModel: true,
			modalPropertiesDialog: true,
			openSidepanelCanvas: false,
			openSidepanelModal: false,
			paletteNavEnabled: false,
			paletteOpened: false,
			propertiesInfo: {},
			propertiesJson: null,
			selectedPanel: null,
			selectedRenderingEngine: D3_ENGINE,
			selectedConnectionType: HALO_CONNECTION,
			selectedLinkType: CURVE_LINKS,
			showContextMenu: false,
			showPropertiesDialog: false
		};

		this.openConsole = this.openConsole.bind(this);
		this.log = this.log.bind(this);

		this.addNode = this.addNode.bind(this);
		this.delete = this.delete.bind(this);
		this.run = this.run.bind(this);
		this.download = this.download.bind(this);

		this.openPalette = this.openPalette.bind(this);
		this.closePalette = this.closePalette.bind(this);
		this.enableNavPalette = this.enableNavPalette.bind(this);
		this.setDiagramJSON = this.setDiagramJSON.bind(this);
		this.setPaletteJSON = this.setPaletteJSON.bind(this);
		this.setPropertiesJSON = this.setPropertiesJSON.bind(this);

		this.sidePanelCanvas = this.sidePanelCanvas.bind(this);
		this.sidePanelModal = this.sidePanelModal.bind(this);
		this.setLayoutDirection = this.setLayoutDirection.bind(this);
		this.setOneTimeLayoutDirection = this.setOneTimeLayoutDirection.bind(this);
		this.useInternalObjectModel = this.useInternalObjectModel.bind(this);
		this.useModalPropertiesDialog = this.useModalPropertiesDialog.bind(this);
		this.setRenderingEngine = this.setRenderingEngine.bind(this);
		this.setConnectionType = this.setConnectionType.bind(this);
		this.setLinkType = this.setLinkType.bind(this);

		// common-canvas
		this.contextMenuHandler = this.contextMenuHandler.bind(this);
		this.contextMenuActionHandler = this.contextMenuActionHandler.bind(this);
		this.editActionHandler = this.editActionHandler.bind(this);
		this.clickActionHandler = this.clickActionHandler.bind(this);
		this.decorationActionHandler = this.decorationActionHandler.bind(this);

		this.applyDiagramEdit = this.applyDiagramEdit.bind(this);
		this.applyPropertyChanges = this.applyPropertyChanges.bind(this);
		this.deleteObjectsActionHandler = this.deleteObjectsActionHandler.bind(this);
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
		var sessionData = {
			events: {},
			canvas: this.getCanvasIfNotTooBig()
		};
		TestService.postSessionData(sessionData);

		// this.sidePanelCanvas();
	}

	getLabelString(labelId, defaultLabel) {
		return this.props.intl.formatMessage({ id: labelId, defaultMessage: defaultLabel });
	}

	getLabel(labelId, defaultLabel) {
		return (<FormattedMessage id={ labelId } defaultMessage={ defaultLabel } />);
	}

	// Returns the canvas provided it is not bigger than the size limit characters.
	// If it is, returns empty string.  This is a workaround for the issue
	// where we start to get errors (Error: request entity too large) in the
	// test harness when the canvas is too big.
	getCanvasIfNotTooBig() {
		var canvas = ObjectModel.getCanvas();
		if (JSON.stringify(canvas).length > CANVAS_SIZE_LIMIT) {
			return "";
		}
		return canvas;
	}

	setDiagramJSON(canvasJson) {
		ObjectModel.setCanvas(BLANK_CANVAS);
		this.forceUpdate();
		ObjectModel.setCanvas(canvasJson);
		if (JSON.stringify(canvasJson) <= CANVAS_SIZE_LIMIT) { // Only send the Canvas if it is small enough.
			TestService.postCanvas(canvasJson);
		}
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
		ObjectModel.fixedAutoLayout(selectedLayout);
		this.log("Layout selected", selectedLayout);
	}

	setOneTimeLayoutDirection(selectedOneTimeLayout) {
		if (ObjectModel.fixedLayout === NONE) {
			ObjectModel.autoLayout(selectedOneTimeLayout);
			this.log("One Time Layout selected", selectedOneTimeLayout);
		}
	}

	setRenderingEngine(selectedEngine) {
		this.setState({ selectedRenderingEngine: selectedEngine });
		this.log("Rendering Engine selected", selectedEngine);
	}

	setConnectionType(selectedConnectionType) {
		this.setState({ selectedConnectionType: selectedConnectionType });
		this.log("Connection Type selected", selectedConnectionType);
	}

	setLinkType(selectedLinkType) {
		this.setState({ selectedLinkType: selectedLinkType });
		this.log("Link type selected", selectedLinkType);
	}

	sidePanelCanvas() {
		this.setState({
			openSidepanelCanvas: !this.state.openSidepanelCanvas,
			openSidepanelModal: false,
			selectedPanel: SIDE_PANEL_CANVAS
		});
	}

	sidePanelModal() {
		this.setState({
			openSidepanelModal: !this.state.openSidepanelModal,
			openSidepanelCanvas: false,
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
			var sessionData = {
				events: that.state.consoleout,
				canvas: that.getCanvasIfNotTooBig()
			};
			TestService.postSessionData(sessionData);
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

	download() {
		var canvas = JSON.stringify(ObjectModel.getCanvas(), null, 2);
		ReactFileDownload(canvas, "canvas.json");
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

	useModalPropertiesDialog(enabled) {
		this.setState({ modalPropertiesDialog: enabled });
		this.log("use modal properties dialog", enabled);
	}

	// common-canvas
	clickActionHandler(source) {
		this.log("clickActionHandler()", source);
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
		var data = {
			form: form,
			appData: appData
		};
		this.log("applyPropertyChanges()", data);
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
      { submenu: true, label: this.getLabelString("node-context.editMenu", "Edit"), menu: EDIT_SUB_MENU },
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
      { action: "selectAll", label: this.getLabel("canvas-context.selectAll", "Select All") },
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
			// weird code to get around eslint complexity error
			this.deleteObjectsActionHandler(source);
		} else if (action === "executeNode") {
			this.log("action: executeNode", source.targetObject.id);
		} else if (action === "previewNode") {
			this.log("action: previewNode", source.targetObject.id);
		} else if (action === "deploy") {
			this.log("action: deploy", source.targetObject.id);
		}
	}

	deleteObjectsActionHandler(source) {
		if (typeof source.targetObject.objectData !== "undefined") {
			this.log("action: deleteObjects", source.selectedObjectIds, source.targetObject.objectData.label);
		} else if (typeof source.targetObject.content !== "undefined") {
			this.log("action: deleteObjects", source.selectedObjectIds, source.targetObject.content);
		} else {
			this.log("action: deleteObjects", source.selectedObjectIds, "");
		}
	}

	decorationActionHandler(node, id) {
		this.log("decorationHandler()", id);
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
		var properties = this.state.propertiesJson;

		const propsInfo = {
			title: <FormattedMessage id={ "dialog.nodePropertiesTitle" } />,
			formData: properties.formData,
			propertyDef: properties,
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
						<li className="navbar-li" data-tip="download">
							<a onClick={this.download.bind(this) }>
								<Isvg id="action-bar-download"
									src={download32}
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
						<li className="navbar-li nav-divider action-bar-sidepanel"
							id="action-bar-sidepanel-canvas"	data-tip="Common Canvas"
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
			enableRenderingEngine: this.state.selectedRenderingEngine,
			enableConnectionType: this.state.selectedConnectionType,
			enableLinkType: this.state.selectedLinkType,
			enableInternalObjectModel: this.state.internalObjectModel,
			paletteTooltip: PALETTE_TOOLTIP
		};

		var commonCanvas = (<div id="canvas-container">
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
				useModalDialog={this.state.modalPropertiesDialog}
				applyLabel="Apply"
				rejectLabel="Reject"
			/>
		</div>);

		var mainView = (<div id="app-container">
			{navBar}
			<SidePanel
				selectedPanel={this.state.selectedPanel}
				enableNavPalette={this.enableNavPalette}
				internalObjectModel={this.state.internalObjectModel}
				modalPropertiesDialog={this.state.modalPropertiesDialog}
				openPropertiesEditorDialog={this.openPropertiesEditorDialog}
				closePropertiesEditorDialog={this.closePropertiesEditorDialog}
				openSidepanelCanvas={this.state.openSidepanelCanvas}
				openSidepanelModal={this.state.openSidepanelModal}
				setDiagramJSON={this.setDiagramJSON}
				setPaletteJSON={this.setPaletteJSON}
				setPropertiesJSON={this.setPropertiesJSON}
				setLayoutDirection={this.setLayoutDirection}
				setOneTimeLayoutDirection={this.setOneTimeLayoutDirection}
				showPropertiesDialog={this.state.showPropertiesDialog}
				useInternalObjectModel={this.useInternalObjectModel}
				useModalPropertiesDialog={this.useModalPropertiesDialog}
				setRenderingEngine={this.setRenderingEngine}
				setConnectionType={this.setConnectionType}
				setLinkType={this.setLinkType}
				log={this.log}
			/>
			<IntlProvider key="IntlProvider2" locale={ locale } messages={ messages }>
				{commonProperties}
			</IntlProvider>
			<IntlProvider key="IntlProvider" locale={ locale } messages={ messages }>
				{commonCanvas}
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

App.propTypes = {
	intl: intlShape.isRequired
};

export default injectIntl(App);
