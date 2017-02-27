/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint complexity: ["error", 12] */

import React from "react";
import Isvg from "react-inlinesvg";
import ReactTooltip from "react-tooltip";
import { IntlProvider, FormattedMessage, addLocaleData } from "react-intl";
import en from "react-intl/locale-data/en";
var i18nData = require("../intl/en.js");

// import CommonCanvas from "../../../common-canvas/src/common-canvas.jsx";
import CommonCanvas from "@wdp/common-canvas";
import "../styles/App.css";

import Console from "./components/console.jsx";
import SidePanel from "./components/sidepanel.jsx";

import {
	SIDE_PANEL_FORMS,
	SIDE_PANEL_STYLES
} from "./constants/constants.js";
const listview32 = require("../graphics/list-view_32.svg");
const addnew32 = require("../graphics/add-new_32.svg");
const close32 = require("../graphics/close_32.svg");
const play32 = require("../graphics/play_32.svg");
const createNew32 = require("../graphics/create-new_32.svg");
const edit32 = require("../graphics/edit_32.svg");
const justify32 = require("../graphics/justify_32.svg");

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			consoleout: [],
			consoleOpened: false,
			diagramJSON: null,
			paletteJSON: null,
			paletteNavEnabled: false,
			paletteOpened: false,
			openSidepanelForms: false,
			openSidepanelStyles: false,
			selectedPanel: null,
			selectedLinkTypeStyle: "STRAIGHT",
			initialSelection: null,
			showContextMenu: false,
			contextMenuInfo: {}
		};

		this.openConsole = this.openConsole.bind(this);
		this.log = this.log.bind(this);

		this.addNode = this.addNode.bind(this);
		this.delete = this.delete.bind(this);
		this.run = this.run.bind(this);

		this.openPalette = this.openPalette.bind(this);
		this.closePalette = this.closePalette.bind(this);
		this.enableNavPalette = this.enableNavPalette.bind(this);
		this.setPaletteJSON = this.setPaletteJSON.bind(this);
		this.setDiagramJSON = this.setDiagramJSON.bind(this);

		this.sidePanelForms = this.sidePanelForms.bind(this);
		this.sidePanelStyles = this.sidePanelStyles.bind(this);
		this.setLinkTypeStyle = this.setLinkTypeStyle.bind(this);

		// required by common-canvas
		this.contextMenuHandler = this.contextMenuHandler.bind(this);
		this.contextMenuActionHandler = this.contextMenuActionHandler.bind(this);
		this.editDiagramHandler = this.editDiagramHandler.bind(this);
		this.clickHandler = this.clickHandler.bind(this);
		this.decorationActionHandler = this.decorationActionHandler.bind(this);

		this.applyDiagramEdit = this.applyDiagramEdit.bind(this);
		this.nodeEditHandler = this.nodeEditHandler.bind(this);
		this.refreshContent = this.refreshContent.bind(this);
	}

	componentDidMount() {
		addLocaleData(en);
	}

	getLabel(labelId, defaultLabel) {
		return <FormattedMessage id={ labelId } defaultMessage={ defaultLabel } />;
	}

	getTimestamp() {
		return new Date().toLocaleString() + ": ";
	}

	setPaletteJSON(paletteJson) {
		this.setState({ paletteJSON: paletteJson });
		this.log("set paletteJSON: " + JSON.stringify(paletteJson));
	}

	setDiagramJSON(diagramJson) {
		this.setState({ diagramJSON: diagramJson });
		this.log("set diagramJSON: " + JSON.stringify(diagramJson));
	}

	setLinkTypeStyle(selectedLink) {
		this.setState({ selectedLinkTypeStyle: selectedLink });
		this.log("Link type style selected: " + selectedLink);
	}

	sidePanelForms() {
		this.setState({
			openSidepanelForms: !this.state.openSidepanelForms,
			openSidepanelStyles: false,
			selectedPanel: SIDE_PANEL_FORMS
		});
		this.log("openSidepanelForms() clicked " + !this.state.openSidepanelForms);
	}

	sidePanelStyles() {
		this.setState({
			openSidepanelStyles: !this.state.openSidepanelStyles,
			openSidepanelForms: false,
			selectedPanel: SIDE_PANEL_STYLES
		});
		this.log("sidePanelStyles() clicked " + !this.state.openSidepanelStyles);
	}

	log(text) {
		this.setState({
			consoleout: this.state.consoleout.concat(this.getTimestamp() + text)
		});
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

	// required by common-canvas
	clickHandler(source) {
		this.log("clickHandler()");
		if (source.clickType === "DOUBLE_CLICK" && source.objectType === "node") {
			this.nodeEditHandler(source.id);
		}
	}

	nodeEditHandler(nodeId) {
		this.log("nodeEditHandler() " + nodeId);
	}

	applyDiagramEdit(data, options) {
		this.log("applyDiagramEdit() " + data.editType);
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
				} else {
					menuDefinition = NODE_CONTEXT_MENU;
				}
			}
		} else if (source.type === "comment") {
			if (source.selectedObjectIds) {
				menuDefinition = COMMENT_CONTEXT_MENU;
			}
		}

		let contextMenuInfo = null;

		if (menuDefinition) {
			contextMenuInfo = {
				source: source,
				menuDefinition: menuDefinition
			};
		}
		return contextMenuInfo;
	}

	editDiagramHandler(data) {
		this.log("editDiagramHandler()");
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
			this.log("action: deleteLink");
		} else if (action === "editNode") {
			this.log("action: editNode");
		} else if (action === "viewModel") {
			this.log("action: viewModel");
		} else if (action === "disconnectNode") {
			this.log("action: disconnectNode");
		} else if (action === "createSuperNode") {
			this.log("action: createSuperNode");
		} else if (action === "expandSuperNode") {
			this.log("action: expandSuperNode");
		} else if (action === "deleteObjects") {
			this.log("action: deleteObjects");
		} else if (action === "executeNode") {
			this.log("action: executeNode");
		} else if (action === "previewNode") {
			this.log("action: previewNode");
		}
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

	render() {
		var paletteClass = "palette-" + this.state.paletteNavEnabled;

		var locale = "en";
		var messages = i18nData.messages;

		var navBar = (<div id="app-navbar">
			<div className="navbar">
				<nav id="action-bar">
					<ul className="navbar">
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
						<li className="navbar-li" id="action-bar-sidepanel-styles" data-tip="open side panel: styles">
							<a onClick={this.sidePanelStyles.bind(this) }>
								<Isvg id="action-bar-panel-styles"
									src={edit32}
								/>
							</a>
						</li>
						<li className="navbar-li nav-divider"
							id="action-bar-sidepanel"
							data-tip="open side panel: forms"
						>
							<a onClick={this.sidePanelForms.bind(this) }>
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
			enableAutoLayout: "none",
			useObjectModel: false,
			paletteTooltip: "Click to show node palette"
		};

		let commonCanvas = <div id="canvas"></div>;
		if (this.state.diagramJSON !== null) {
			commonCanvas = (<div id="canvas">
				<CommonCanvas
					diagram={this.state.diagramJSON}
					initialSelection={this.state.initialSelection}
					paletteJSON={this.state.paletteJSON}
					contextMenuHandler={this.contextMenuHandler}
					contextMenuActionHandler= {this.contextMenuActionHandler}
					editDiagramHandler= {this.editDiagramHandler}
					clickHandler= {this.clickHandler}
					decorationActionHandler= {this.decorationActionHandler}
					config={commonCanvasConfig}
				/>
			</div>);
		}

		var mainView = (<div id="app-container">
			{navBar}
			<SidePanel
				selectedPanel={this.state.selectedPanel}
				enableNavPalette={this.enableNavPalette}
				openSidepanelForms={this.state.openSidepanelForms}
				openSidepanelStyles={this.state.openSidepanelStyles}
				setDiagramJSON={this.setDiagramJSON}
				setPaletteJSON={this.setPaletteJSON}
				setLinkTypeStyle={this.setLinkTypeStyle}
				selectedLinkTypeStyle={this.state.selectedLinkTypeStyle}
				log={this.log}
			/>
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

export default App;
