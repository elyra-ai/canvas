/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import Isvg from "react-inlinesvg";
import ReactTooltip from "react-tooltip";

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
			paletteJSON: {},
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
		this.openContextMenu = this.openContextMenu.bind(this);
		this.closeContextMenu = this.closeContextMenu.bind(this);
		this.contextMenuAction = this.contextMenuAction.bind(this);
		this.editDiagramHandler = this.editDiagramHandler.bind(this);
		this.nodeEditHandler = this.nodeEditHandler.bind(this);
		this.refreshContent = this.refreshContent.bind(this);
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
	nodeEditHandler(nodeId) {
		this.log("nodeEditHandler()");
	}

	openContextMenu(source) {
		const NODE_CONTEXT_MENU = [
				{ action: "editNode", label: this.getLabel("node-context.editNode", "Open") },
				{ action: "disconnectNode", label: this.getLabel("node-context.disconnectNode", "Disconnect") },
				{ action: "previewNode", label: this.getLabel("node-context.previewNode", "Preview") },
				{ divider: true },
				{ action: "createSuperNode", label: this.getLabel("node-context.createSuperNode", "Create supernode") },
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
				{ action: "deleteObjects", label: this.getLabel("node-context.deleteNode", "Delete") },
				{ divider: true },
				{ action: "executeNode", label: this.getLabel("node-context.executeNode", "Execute") }
		];

		const MULTI_SELECT_CONTEXT_MENU = [
				{ action: "disconnectNode", label: this.getLabel("node-context.disconnectNode", "Disconnect") },
				{ divider: true },
				{ action: "createSuperNode", label: this.getLabel("node-context.createSuperNode", "Create supernode") },
				{ divider: true },
				{ action: "deleteObjects", label: this.getLabel("node-context.deleteNode", "Delete") }
		];

		const CANVAS_CONTEXT_MENU = [
				{ action: "CC_selectAll", label: this.getLabel("canvas-context.selectAll", "Select All") },
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
			menuDefinition = CANVAS_CONTEXT_MENU;

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

		if (menuDefinition) {
			const contextMenuInfo = {
				source: source,
				menuDefinition: menuDefinition
			};

			this.setState({ showContextMenu: true, contextMenuInfo: contextMenuInfo });
		}
	}

	closeContextMenu() {
		this.setState({ showContextMenu: false, contextMenuInfo: {} });
	}

	editDiagramHandler(data) {
		this.log("editDiagramHandler() aka applyDiagramEdit");
	}

	contextMenuAction(action, source) {
		if (action === "streamProperties") {
			this.toolbarHandler("streamProperties");
		} else if (action === "deleteLink") {
			this.applyDiagramEdit({
				editType: "deleteLinks",
				links: [source.id]
			});
		} else if (action === "editNode") {
			this.nodeEditHandler(source.targetObject.id);
		} else if (action === "viewModel") {
			this.viewModelHandler(source.targetObject.id);
		} else if (action === "disconnectNode") {
			this.applyDiagramEdit({
				editType: "disconnectNodes",
				nodes: source.selectedObjectIds
			});
		} else if (action === "createSuperNode") {
			this.applyDiagramEdit({
				editType: "createSuperNode",
				nodes: source.selectedObjectIds
			});
		} else if (action === "expandSuperNode") {
			this.applyDiagramEdit({
				editType: "expandSuperNode",
				nodes: [source.targetObject.id]
			});
		} else if (action === "deleteObjects") {
			this.applyDiagramEdit({
				editType: "deleteObjects",
				nodes: source.selectedObjectIds
			});
		} else if (action === "executeNode") {
			this.execute({
				streamId: this.state.streamId,
				diagramId: this.state.diagramId,
				nodeIds: [source.targetObject.id]
			});
		} else if (action === "previewNode") {
			this.execute({
				streamId: this.state.streamId,
				diagramId: this.state.diagramId,
				nodeIds: [source.targetObject.id],
				action: "preview"
			});
		}
		this.log("contextMenuAction()");
	}

	refreshContent(streamId, diagramId) {
		this.log("refreshContent()");
	}

	render() {
		var paletteClass = "palette-" + this.state.paletteNavEnabled;

		var navBar = (<div id="app-navbar">
			<div className="navbar">
				<nav id="action-bar">
					<ul className="navbar">
						<li className="navbar-li">
							<a id="title">Canvas Testbed</a>
						</li>
						<li className="navbar-li nav-divider" data-tip="console">
							<a onClick={this.openConsole.bind(this)}>
								<Isvg id="action-bar-console"
									src={listview32}
								/>
							</a>
						</li>
						<li className="navbar-li nav-divider" data-tip="add node">
							<a onClick={this.addNode.bind(this)}>
								<Isvg id="action-bar-add"
									src={addnew32}
								/>
							</a>
						</li>
						<li className="navbar-li" data-tip="delete">
							<a onClick={this.delete.bind(this)}>
								<Isvg id="action-bar-delete"
									src={close32}
								/>
							</a>
						</li>
						<li className="navbar-li" data-tip="run">
							<a onClick={this.run.bind(this)}>
								<Isvg id="action-bar-run"
									src={play32}
								/>
							</a>
						</li>
						<li className="navbar-li nav-divider" id={paletteClass} data-tip="palette">
							<a onClick={this.openPalette.bind(this)}>
								<Isvg id="action-bar-palette"
									src={createNew32}
								/>
							</a>
						</li>
						<li className="navbar-li" id="action-bar-sidepanel-styles" data-tip="open side panel: styles">
							<a onClick={this.sidePanelStyles.bind(this)}>
								<Isvg id="action-bar-panel-styles"
									src={edit32}
								/>
							</a>
						</li>
						<li className="navbar-li nav-divider"
							id="action-bar-sidepanel"
							data-tip="open side panel: forms"
						>
							<a onClick={this.sidePanelForms.bind(this)}>
								<Isvg id="action-bar-panel"
									src={justify32}
								/>
							</a>
						</li>
					</ul>
				</nav>
			</div>
		</div>);

		let commonCanvas = <div id="canvas"></div>;
		if (this.state.diagramJSON !== null) {
			commonCanvas = (<div id="canvas">
				<CommonCanvas
					stream={this.state.diagramJSON}
					initialSelection={this.state.initialSelection}
					paletteJSON={this.state.paletteJSON}
					showContextMenu={this.state.showContextMenu}
					contextMenuInfo={this.state.contextMenuInfo}
					openContextMenu= {this.openContextMenu}
					closeContextMenu= {this.closeContextMenu}
					contextMenuAction= {this.contextMenuAction}
					editDiagramHandler= {this.editDiagramHandler}
					nodeEditHandler= {this.nodeEditHandler}
					supernodeZoomInHandler= {this.refreshContent}
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
			{commonCanvas}
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
