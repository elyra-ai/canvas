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
			diagramJSON: {},
			paletteJSON: {},
			paletteNavEnabled: false,
			paletteOpened: false,
			openSidepanelForms: false,
			openSidepanelStyles: false,
			selectedPanel: null,
			selectedLinkTypeStyle: "STRAIGHT"
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
			<div id="canvas">
			</div>
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
